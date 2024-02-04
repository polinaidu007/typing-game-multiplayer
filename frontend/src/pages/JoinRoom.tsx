import * as React from 'react';
import MyContext from '../context/myContext';
import {
    useNavigate,
} from 'react-router-dom'

function JoinRoom() {
    console.log('rendering JoinRoom:')
    let { username, setUsername,
        roomName, setRoomName, usernameRef, handleJoinRoom, setIsJoined } = React.useContext(MyContext);
    const navigate = useNavigate();
    

    React.useEffect(() => {
        console.log('JoinRoom:');
    }, []);

    const onChangeUsername: React.ChangeEventHandler<HTMLInputElement> = (e) => {
        setUsername(e.target.value);
        usernameRef.current = e.target.value;
    }

    const onClickJoinRoom = async () => {
        if (roomName && username) {
            setIsJoined(true);
            navigate('/typing-game');
            handleJoinRoom();
        };
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