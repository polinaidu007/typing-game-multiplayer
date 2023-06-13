import * as React from 'react';
import MyContext from '../context/myContext';
import {
    useNavigate,
} from 'react-router-dom'


function Chat() {
    console.log('rendering Chat:')
    let { isJoined } = React.useContext(MyContext);
    const navigate = useNavigate();

    let { username, roomName, dataChannelRef, messages, setMessages } = React.useContext(MyContext);
    let [message, setMessage] = React.useState('');

    React.useEffect(() => {
        console.log("Chat:")
        if (!isJoined)
            navigate('/');
    }, [isJoined])

    const handleSendMessage = () => {
        console.log(dataChannelRef.current);
        if (dataChannelRef.current && message) {
            const messageData = JSON.stringify({ username, text: message });
            for (let peerId in dataChannelRef.current) {
                if (dataChannelRef.current[peerId].readyState === 'open') {
                    dataChannelRef.current[peerId].send(messageData);
                }
                else {
                    console.warn('Data channel is not open');
                }
            }
            setMessages((prevMessages) => [...prevMessages, { username, text: message }]);
            setMessage('');
        }
    };

    return (
        <div>
            <h2>Welcome {username}, you've joined room: {roomName}</h2>
            <div>
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message..."
                />
                <button onClick={handleSendMessage}>Send</button>
            </div>
            <div style={{ marginTop: '20px' }}>
                {messages.map((msg, index) => (
                    <div key={index} style={{ textAlign: msg.username === username ? 'right' : 'left' }}>
                        <b>{msg.username}:</b> {msg.text}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Chat;