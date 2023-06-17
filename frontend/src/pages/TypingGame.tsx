import React, { useEffect, useState } from 'react';
import MyContext from '../context/myContext';
import { useNavigate } from 'react-router-dom';

let paragraph = `Breakfast, often dubbed the most important meal of the day, fuels the body after a night's rest. Consuming a balanced breakfast with proteins, grains, and fruits enhances concentration and stamina. It also curbs overeating later, aiding weight management. Prioritizing breakfast promotes a healthy lifestyle and contributes to overall well-being.`

function TypingGame() {
    let { username, roomName, isJoined, onlineUsersMap } = React.useContext(MyContext);
    const navigate = useNavigate();
    let [text, setText] = useState('');
    let [error, setError] = useState(false);
    let [finished, setFinished] = useState(false);
    let [progressBarVal, setProgressBarVal] = useState(0);

    useEffect(() => {
        console.log("useEffect typingGame:")
        if (!isJoined)
            navigate('/');
    }, []);

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

    const handleClick = () => {
        const randomNumber = Math.floor(Math.random() * 101);
        setProgressBarVal(randomNumber)
    }

    return (
        <div className='flex flex-col items-center w-[100vw] h-[100vh]'>
            <div className='p-4'>
                <h1 className='font-press-start text-6xl'>Typing game</h1>
            </div>
            <div className='flex w-[100%] h-[100%]'>
                <div className='w-[20vw] p-4'>
                    <h2 className="text-xl font-orbitron text-center text-fuchsia-500 mb-4">{`Players Online (${roomName})`}</h2>
                    <ul className='font-orbitron list-disc list-inside space-y-2 bg-white p-4 shadow-lg rounded-lg'>
                        <li className="flex justify-between text-xs font-semibold text-gray-700">
                            <span className="text-gray-700">{`${username} (self)`}</span>
                            <span className="text-green-500">{ }</span>
                        </li>
                        {
                            Object.keys(onlineUsersMap).map((key) => (
                                <li className="flex justify-between text-xs font-semibold text-gray-700" key={key}>
                                    <span className="text-gray-700">{onlineUsersMap[key].username}</span>
                                    <span className="text-green-500">{onlineUsersMap[key].status}</span>
                                </li>
                            ))
                        }
                    </ul>
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
                    <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={handleClick}>
                        I'm Ready!
                    </button>
                </div>
                <div className='w-[20vw]'>
                    <NamesAndProgressContainer arr={[{ name: 'tony', value: 10 }, { name: "dragon", value: 20 }]} />
                </div>
            </div>

        </div>
    );
}

const ProgressBar = ({ value, name }: any) => {
    return (
        <div className="relative w-full h-4 bg-gray-300 rounded overflow-hidden">
            <div
                className={`h-full bg-blue-500 transition-all duration-1000 ease-out`}
                style={{ width: `${value}%` }}
            ></div>
            <span className="absolute inset-0 flex items-center justify-center text-gray-700 font-orbitron text-xs font-semibold">{name}</span>
        </div>
    );
};

const NamesAndProgressContainer = ({ arr }: any) => {
    console.log(arr);
    return (
        <div className='space-y-2 bg-white p-4 shadow-lg rounded-lg w-[90%] max-h-full'>
            {
                arr.map((item: any) =>
                    <ProgressBar key={item.name} name={item.name} value={item.value} />
                )
            }
        </div>);
}


export default TypingGame;