import React, { MutableRefObject, useEffect } from "react";
import { useState, useRef } from "react";
import MyContext from "./myContext";
import { Message, MyContextType, PeerChannelsMap, PeerConnectionInfo, PeerConnectionsMap, PeerIdProgressMap, PeerIdUsersMap, PeerSignalingData } from "../interfaces/all.interface";
import { gameTimeLimit } from "../constants/constants";
import { newSocket } from "../socket";
import { Socket } from "socket.io-client";

function MyContextProvider({ children }: any) {
    console.log('rendering MyContextProvider:')
    // State values
    const socketRef = useRef<Socket>(newSocket);
    const [roomName, setRoomName] = useState('');
    const [username, setUsername] = useState('');
    const [isJoined, setIsJoined] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const peerConnectionRef = useRef<PeerConnectionsMap>({});
    const dataChannelRef = useRef<PeerChannelsMap>({});
    let [onlineUsersMap, setOnlineUsersMap] = useState<PeerIdUsersMap>({});
    const [progressMap, setProgressMap] = useState<PeerIdProgressMap>({});
    let [isReady, setIsReady] = useState(false);
    let [startGame, setStartGame] = useState(false);
    const isReadyRef = useRef(false);
    let [paragraph, setParagraph] = useState('');
    let [percentageCompleted, setPercentageCompleted] = useState(0);
    const usernameRef = React.useRef('');

    React.useEffect(() => {
        console.log('MyContextProvider:')
    }, []);

    React.useEffect(() => {
        socketRef.current?.on('signal', handleSignal);
        socketRef.current?.on('joined', handleJoined);
        socketRef.current?.on('user-left', handleUserLeft);
        socketRef.current?.on('paragraph-res', handleParagraphRes);

        return () => {
            socketRef.current?.off('signal', handleSignal);
            socketRef.current?.off('joined', handleJoined);
            socketRef.current?.off('user-left', handleUserLeft);
            socketRef.current?.off('paragraph-res', handleParagraphRes);
        };
    }, [socketRef.current])

    const handleSignal = (data: PeerSignalingData) => {
        console.log('onSignal')
        handleSignalingData(data);
    }
    const handleJoined = async (obj: PeerConnectionInfo) => {
        console.log('on joined', obj)
        createConnection(obj);
    }
    const handleUserLeft = (data: any) => {
        console.log('User left:', data);
        for (let peerId in peerConnectionRef.current.keys) {
            peerConnectionRef.current[peerId]?.close();

        }
        peerConnectionRef.current = {};
    }
    const handleParagraphRes = ({ paragraph }: { paragraph: string }) => {
        console.log('paragraph response', paragraph);
        setParagraph(paragraph);
    }

    const handleJoinRoom = async () => {
        socketRef.current.emit('join-room', roomName);
    }

    const setupDataChannel = (peerId: string) => {
        const dataChannel = dataChannelRef.current[peerId];
        dataChannel.onopen = () => {
            console.log('Data Channel is open');
            announceInitialInfo(peerId);
        };
        dataChannel.onmessage = (event) => {
            console.log("New msg:", event.data);
            let message: Message = JSON.parse(event.data);
            switch (message?.info) {
                case 'STATUS':
                    setOnlineUsersMap((prevData) => ({
                        ...prevData,
                        [peerId]: {
                            username: message.username,
                            status: message.status ?? 'WAITING'
                        }
                    }));
                    break;
                case 'PROGRESS':
                    // Handle the 'PROGRESS' case
                    setProgressMap((prevData) => ({
                        ...prevData,
                        [peerId]: {
                            username: message.username,
                            percentageCompleted: message?.progressStats?.percentageCompleted,
                            timeTakenToComplete: message?.progressStats?.timeTakenToComplete
                        }
                    }));
                    break;
                default:
                    // Handle other cases or do nothing
                    setMessages((prevMessages) => [...prevMessages, message]);
                    break;
            }

        };
    };

    function announceInitialInfo(peerId: string) {
        if (dataChannelRef.current) {
            const messageData: Message = { username: usernameRef.current, info: 'STATUS', peerId, status: isReadyRef.current ? 'READY' : 'WAITING' }
            if (dataChannelRef.current[peerId].readyState === 'open') {
                dataChannelRef.current[peerId].send(JSON.stringify(messageData));
            }
            else {
                console.warn('Data channel is not open');
            }
        }
    }

    const createConnection = async ({ isInitiator, peerId }: PeerConnectionInfo) => {
        // Other RTCPeerConnection setup (ICE handling, etc) here...

        const configuration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
        const peerConnection = new RTCPeerConnection(configuration);
        peerConnectionRef.current[peerId] = peerConnection;
        console.log("After populating peerConnecionRef", Object.keys(peerConnectionRef.current));

        peerConnection.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
            if (event.candidate) {
                socketRef.current?.emit('signal', { peerId, candidate: event.candidate });
            }
        };

        peerConnection.oniceconnectionstatechange = () => {
            switch (peerConnection.iceConnectionState) {
                case 'disconnected':
                    console.log('The user has disconnected.', Object.keys(peerConnectionRef.current), Object.keys(dataChannelRef.current));

                    dataChannelRef.current[peerId]?.close();

                    peerConnectionRef.current[peerId]?.close();

                    delete dataChannelRef.current[peerId];
                    delete peerConnectionRef.current[peerId];
                    setOnlineUsersMap((prevData) => {
                        const newData = { ...prevData };
                        delete newData[peerId];
                        return newData;
                    });
                    setProgressMap((prevData) => {
                        const newData = { ...prevData };
                        delete newData[peerId];
                        return newData;
                    });


                    // Handle the disconnection
                    break;
                case 'failed':
                    console.log('The connection has failed.');
                    // Handle the connection failure
                    break;
                case 'closed':
                    console.log('The connection has been closed.');
                    // Handle the connection closing
                    break;
                case 'connected':
                    console.log('WebRTC connection established');
                    break;
            }
        };

        // If this is the initiating peer, create the data channel
        if (isInitiator) {
            dataChannelRef.current[peerId] = peerConnectionRef.current[peerId].createDataChannel('chat');
            console.log("After populating dataChannelRef", Object.keys(dataChannelRef.current));
            setupDataChannel(peerId);
            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);
            console.log('Initiating offer', { peerId })
            socketRef.current?.emit('signal', { peerId, offer });
            console.log('Offer Initiated')
        }
        else {
            // For the non-initiating peer, listen for the data channel
            peerConnectionRef.current[peerId].ondatachannel = (event) => {
                dataChannelRef.current[peerId] = event.channel;
                console.log("After populating dataChannelRef", Object.keys(dataChannelRef.current));
                setupDataChannel(peerId);
            };
        }

    }

    const handleSignalingData = async (data: PeerSignalingData) => {
        if (!peerConnectionRef.current || !socketRef.current) {
            return;
        }

        if (data.offer) {
            await peerConnectionRef.current[data.peerId].setRemoteDescription(new RTCSessionDescription(data.offer));
            const answer = await peerConnectionRef.current[data.peerId].createAnswer();
            await peerConnectionRef.current[data.peerId].setLocalDescription(answer);
            console.log("offer accepted. creating answer");
            socketRef.current.emit('signal', { peerId: data.peerId, answer });
            console.log("offer accepted. created answer");
        } else if (data.answer) {
            console.log('acceptting answer');
            await peerConnectionRef.current[data.peerId].setRemoteDescription(new RTCSessionDescription(data.answer));
            console.log('answer accepted');
        } else if (data.candidate) {
            try {
                await peerConnectionRef.current[data.peerId].addIceCandidate(new RTCIceCandidate(data.candidate));
            } catch (e) {
                console.error('Error adding received ice candidate', e);
            }
        }
    };

    const sendMessageToAllConnections = (message: Message) => {
        if (dataChannelRef.current) {
            const messageData = JSON.stringify(message);
            for (let peerId in dataChannelRef.current) {
                if (dataChannelRef.current[peerId].readyState === 'open') {
                    dataChannelRef.current[peerId].send(messageData);
                }
                else {
                    console.warn('Data channel is not open');
                }
            }
        }
    };

    const closeSocketConnection = () => {
        socketRef.current?.close();
    }

    // Define the context value
    const contextValue : MyContextType = {
        // socket,
        // setSocket,
        roomName,
        setRoomName,
        username,
        setUsername,
        isJoined,
        setIsJoined,
        messages,
        setMessages,
        peerConnectionRef,
        dataChannelRef,
        onlineUsersMap,
        setOnlineUsersMap,
        progressMap,
        setProgressMap,
        isReady,
        setIsReady,
        startGame,
        setStartGame,
        isReadyRef,
        sendMessageToAllConnections,
        paragraph,
        setParagraph,
        usernameRef,
        handleJoinRoom,
        closeSocketConnection,
        percentageCompleted,
        setPercentageCompleted
    };


    return (
        <MyContext.Provider value={contextValue}>
            {children}
        </MyContext.Provider>
    )
};

export default MyContextProvider;

