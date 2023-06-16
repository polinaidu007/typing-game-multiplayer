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
                <h1 className='font-press-start text-6xl'>Typing game</h1>
            </div>
            <div className='flex w-[100%] h-[100%]'>
                <div className='w-[20vw] p-4'>
                    {
                        onlineList.length ?
                            (
                                <>
                                    <h2 className="text-xl font-orbitron text-center text-fuchsia-500 mb-4">Players Online</h2>
                                    <ul className='font-orbitron list-disc list-inside space-y-2 bg-white p-4 shadow-lg rounded-lg'>
                                        {
                                            onlineList.map((item) => (
                                                <li className="flex justify-between text-xs font-semibold text-gray-700" key={item.username}>
                                                    <span className="text-gray-700">{item.username}</span>
                                                    <span className="text-green-500">{item.status}</span>
                                                </li>
                                            ))
                                        }
                                    </ul></>) : 'Waiting for others to join'
                    }

                </div>
                <div className='w-[60vw] flex flex-col items-center '>
                    <div className='font-space-mono w-[80%] border border-gray-300 p-4 m-2'>
                        {
                            text.length === 0 ?
                                <span className="">
                                    {paragraph}
                                </span>
                                :
                                <>
                                    <span className="text-gray-400">
                                        {paragraph.slice(0, text.length - 1)}
                                    </span>
                                    <span className={paragraph[text.length - 1] !== text.slice(-1) ? "text-red-400" : "text-gray-400"}>
                                        {paragraph.slice(text.length - 1, text.length)}
                                    </span>
                                    <span className="">
                                        {paragraph.slice(text.length)}
                                    </span>
                                </>
                        }
                    </div>
                    <div className='w-[80%] border border-gray-300 p-4 m-2'>
                        <textarea placeholder='start typing...' className='font-space-mono w-full h-60 focus:outline-none'
                            value={text}
                            disabled={finished}
                            onChange={handleChange}
                            onKeyDown={handleKeyDown}
                        />
                    </div>
                    <span className='text-red-500 h-3 font-semibold'>{error && `You mistyped the last letter. Correct it to continue.`}</span>
                    <span className='text-green-500 h-3 font-semibold'>{finished && `Congrats.`}</span>
                    <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                        I'm Ready!
                    </button>
                </div>
                <div className='w-[20vh]'>

                </div>
            </div>

        </div>
    );
}

export default TypingGame;