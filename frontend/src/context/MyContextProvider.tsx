import React, { MutableRefObject, useEffect } from "react";
import { useState, useRef } from "react";
import MyContext from "./myContext";
import { Message, MyContextType, PeerChannelsMap, PeerIdProgressMap } from "../interfaces/all.interface";

function MyContextProvider({ children }: any) {
    console.log('rendering MyContextProvider:')
    useEffect(() => {
        console.log('MyContextProvider:')
    }, [])
    // State values
    const [socket, setSocket] = useState(null);
    const [roomName, setRoomName] = useState('');
    const [username, setUsername] = useState('');
    const [isJoined, setIsJoined] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const peerConnectionRef = useRef({});
    const dataChannelRef = useRef<PeerChannelsMap>({});
    let [onlineUsersMap, setOnlineUsersMap] = useState({});
    const [progressMap, setProgressMap] = useState<PeerIdProgressMap>({});
    const gameEndsInCountdownRef = useRef(240);
    let [isReady, setIsReady] = useState(false);
    let [startGame, setStartGame] = useState(false);
    let [gameStartsInCountDown, setGameStartsInCountDown] = useState(5);
    let [startCountdown, setStartCountdown] = useState(false);
    let [gameCountDown, setGameCountDown] = useState(240);
    const startGameRef = useRef(false);
    const startCountDownRef = useRef(false);
    const isReadyRef = useRef(false);

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

    // Define the context value
    const contextValue : MyContextType = {
        socket,
        setSocket,
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
        gameEndsInCountdownRef,
        isReady,
        setIsReady,
        startGame,
        setStartGame,
        gameStartsInCountDown,
        setGameStartsInCountDown,
        startCountdown,
        setStartCountdown,
        gameCountDown,
        setGameCountDown,
        startGameRef,
        startCountDownRef,
        isReadyRef,
        sendMessageToAllConnections
    };


    return (
        <MyContext.Provider value={contextValue}>
            {children}
        </MyContext.Provider>
    )
};

export default MyContextProvider;

