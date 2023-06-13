import React, { useEffect } from "react";
import { useState, useRef } from "react";
import MyContext from "./myContext";
import { Message } from "../interfaces/all.interface";

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
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const peerConnectionRef = useRef({});
    const dataChannelRef = useRef({});

    // Define the context value
    const contextValue = {
        socket,
        setSocket,
        roomName,
        setRoomName,
        username,
        setUsername,
        isJoined,
        setIsJoined,
        message,
        setMessage,
        messages,
        setMessages,
        peerConnectionRef,
        dataChannelRef
    };


    return (
        <MyContext.Provider value={contextValue}>
            {children}
        </MyContext.Provider>
    )
};

export default MyContextProvider;

