import * as React from 'react';
import MyContext from '../context/myContext';
import { PeerSignalingData, PeerConnectionInfo, Message } from '../interfaces/all.interface';
import { newSocket } from '../socket';
import {
    useNavigate,
} from 'react-router-dom'

function JoinRoom() {
    console.log('rendering JoinRoom:')
    let { username, setUsername,
        socket, setSocket,
        roomName, setRoomName,
        setIsJoined,
        setMessages,
        peerConnectionRef, dataChannelRef, setOnlineUsersMap, setProgressMap, startGame, startCountdown, 
        gameEndsInCountdownRef, gameStartsInCountDown, isReady, setStartGame, 
        setGameCountDown, setIsReady, isReadyRef,setGameStartsInCountDown, setStartCountdown, 
        sendMessageToAllConnections,startGameRef, startCountDownRef  } = React.useContext(MyContext);
    const navigate = useNavigate();
    const usernameRef = React.useRef('');

    React.useEffect(() => {
        console.log('JoinRoom:');
        setSocket(newSocket);
        // return () => { socket.close(); }
        // return () => {
        //     console.log(`unmounting...`, Object.keys(dataChannelRef.current), Object.keys(dataChannelRef.current))
        //     for (let peerId in dataChannelRef.current)
        //         dataChannelRef.current[peerId]?.close();

        //     for (let peerId in peerConnectionRef.current)
        //         peerConnectionRef.current[peerId]?.close();


        //     // Optionally, send a message to other peers to inform them of the disconnection
        // };
    }, []);

    React.useEffect(() => {
        socket?.on('signal', (data: PeerSignalingData) => {
            console.log('onSignal')
            handleSignalingData(data);
        });

        socket?.on('joined', async (obj: PeerConnectionInfo) => {
            console.log('on joined', obj)
            createConnection(obj);
        });

        socket?.on('user-left', (data: any) => {
            console.log('User left:', data);
            for (let peerId in peerConnectionRef.current.keys) {
                peerConnectionRef.current[peerId]?.close();

            }
            peerConnectionRef.current = {};
        });
    }, [socket])

    const onClickJoinRoom = async () => {
        if (socket && roomName && username) {
            socket.emit('join-room', roomName);
            setIsJoined(true);
            navigate('/typing-game')
        };
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
                case 'ONLINE':
                    setOnlineUsersMap((prevData) => ({
                        ...prevData,
                        [peerId]: {
                            username: message.username,
                            status: message.status ?? 'WAITING'
                        }
                    }));
                    if(!startGameRef && !startCountDownRef.current && message?.initialInfo?.gameStartsIn){
                        setIsReady(true);
                        setGameStartsInCountDown(message.initialInfo.gameStartsIn-1);
                        setStartCountdown(true);
                        sendMessageToAllConnections({username : usernameRef.current, info : 'STATUS', status : 'READY'})
                    }
                    else if(!startGameRef.current && message?.initialInfo?.gameTimeLeft){
                        setIsReady(true);
                        setGameCountDown(message?.initialInfo.gameTimeLeft-1);
                        setStartGame(true);
                        sendMessageToAllConnections({username : usernameRef.current, info : 'STATUS', status : 'READY'})
                    }
                    break;
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
            const obj: Message = { username: usernameRef.current, info: 'ONLINE', peerId, status : isReadyRef.current ? 'READY' : 'WAITING' }
            let temp : Partial<Message> = {};
            if(startGameRef.current){
                temp.initialInfo = {};
                temp.initialInfo.gameTimeLeft = gameEndsInCountdownRef.current
                Object.assign(obj, temp);
            }
            else if(startCountDownRef.current){
                temp.initialInfo = {};
                temp.initialInfo.gameStartsIn = gameStartsInCountDown;
                Object.assign(obj, temp);
            }
            const messageData = JSON.stringify(obj);
            if (dataChannelRef.current[peerId].readyState === 'open') {
                dataChannelRef.current[peerId].send(messageData);
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
                socket?.emit('signal', { peerId, candidate: event.candidate });
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
            socket?.emit('signal', { peerId, offer });
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
        if (!peerConnectionRef.current || !socket) {
            return;
        }

        if (data.offer) {
            await peerConnectionRef.current[data.peerId].setRemoteDescription(new RTCSessionDescription(data.offer));
            const answer = await peerConnectionRef.current[data.peerId].createAnswer();
            await peerConnectionRef.current[data.peerId].setLocalDescription(answer);
            console.log("offer accepted. creating answer");
            socket.emit('signal', { peerId: data.peerId, answer });
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

    const onChangeUsername: React.ChangeEventHandler<HTMLInputElement> = (e) => {
        setUsername(e.target.value);
        usernameRef.current = e.target.value;
    }

    return (
        <div>
            <input
                type="text"
                value={username}
                onChange={onChangeUsername}
                placeholder="Enter username"
            />
            <input
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="Enter room name"
            />
            <button onClick={onClickJoinRoom}>Join Room</button>
        </div>
    );
}

export default JoinRoom;