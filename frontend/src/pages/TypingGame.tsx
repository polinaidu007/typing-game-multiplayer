import React, { useContext, useEffect, useRef, useState } from 'react';
import MyContext from '../context/myContext';
import { useNavigate } from 'react-router-dom';
import { Message } from '../interfaces/all.interface';

let paragraph = `Breakfast, often dubbed the most important meal of the day, fuels the body after a night's rest. Consuming a balanced breakfast with proteins, grains, and fruits enhances concentration and stamina. It also curbs overeating later, aiding weight management. Prioritizing breakfast promotes a healthy lifestyle and contributes to overall well-being.`

function TypingGame() {
    // let [startTimer, setStartTimer] = useState(false);
    // let [isReady, setIsReady] = useState(false);
    let { username, roomName, dataChannelRef, messages, setMessages, isJoined } = React.useContext(MyContext);
    const navigate = useNavigate();
    let [text, setText] = useState('');
    let [error, setError] = useState(false);
    let [finished, setFinished] = useState(false);
    let [onlineList, setOnlinelist] = useState<Required<Pick<Message, 'username' | 'status'>>[]>([]);



    useEffect(() => {
        console.log("useEffect typingGame:")
        if (!isJoined)
            navigate('/');
        // let arr: Required<Pick<Message, 'username' | 'status'>>[] = [];
        // messages.map((item) => {
        //     if (item.username !== username && item.isOnline)
        //         arr.push({ username: item.username, status: item.status ? item.status : 'WAITING' });
        // })
        // setOnlinelist(arr);
    }, []);

    useEffect(() => {
        console.log('useEffect typingGame [messages]:');
        if (messages.length) {
            let obj = messages[messages.length - 1];
            if (obj.isOnline)
                setOnlinelist((prev) => [...prev, { status: obj.status ? obj.status : 'WAITING', username: obj.username }]);
            else if (obj.isOnline === false)
                setOnlinelist((prev) =>
                    prev.filter((item) => item.username !== obj.username)
                );
        }
    }, [messages]);

    useEffect(() => {
        let lastIdx = text.length - 1;
        if (text && paragraph[lastIdx] !== text[lastIdx])
            setError(true);
        else {
            setError(false);
            if (paragraph.length === text.length)
                setFinished(true);
        }
    }, [text])

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setText(event.target.value);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        // Check if the key is not Backspace
        if (!error)
            return;
        if (event.key !== "Backspace") {
            event.preventDefault(); // Prevent input
        }
    };

    return (
        <div className='flex flex-col items-center w-[100vw] h-[100vh]'>
            <div className='p-4'>
                <h1 className='text-6xl'>Typing game</h1>
            </div>
            <div className='flex items-center w-[100%] h-[100%]'>
                <div className='w-[20vw]'>
                    <ul>
                        {
                            onlineList.map((item) => (
                                <li key={item.username}><span>{`${item.username}   ${item.status}`}</span></li>
                            ))
                        }
                    </ul>
                </div>
                <div className='w-[60vw] flex flex-col items-center '>
                    <div className='w-[80%] border border-gray-300 p-4 m-2'>
                        {paragraph}
                    </div>
                    <div className='w-[80%] border border-gray-300 p-4 m-2'>
                        <textarea placeholder='start typing...' className='w-full h-80 focus:outline-none'
                            value={text}
                            disabled={finished}
                            onChange={handleChange}
                            onKeyDown={handleKeyDown}
                        />
                    </div>
                    {error && <span className='text-red-900'>You mistyped the last letter. Correct it to continue.</span>}
                    {finished && <span className='text-green-600'>Congrats.</span>}
                </div>
                <div className='w-[20vh]'>

                </div>
            </div>

        </div>
    );
}

export default TypingGame;