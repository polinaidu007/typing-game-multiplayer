import React, { Dispatch, SetStateAction, useContext, useEffect, useRef, useState } from 'react';
import MyContext from '../context/myContext';
import { useNavigate } from 'react-router-dom';
import { ProgressBarsContainerProps, ProgressItem } from '../interfaces/all.interface';
import { gameTimeLimit } from '../constants/constants';


function TypingGame() {
    let { username, roomName, isJoined, onlineUsersMap, gameStartsInCountDown, setGameStartsInCountDown, 
        progressMap, startGame, setStartGame, isReady, setIsReady, isReadyRef,
        startCountdown, setStartCountdown, gameCountDown, sendMessageToAllConnections,
        setGameCountDown, startGameRef, startCountDownRef, startGlobalCountdown, paragraph, gameFinished, setGameFinished, gameCompletionTime, setGameCompletionTime } = React.useContext(MyContext);
    const navigate = useNavigate();
    let [text, setText] = useState('');
    let [error, setError] = useState(false);
    let [finished, setFinished] = useState(false);
    // let [isReady, setIsReady] = useState(false);
    // let [startCountdown, setStartCountdown] = useState(false);
    // let [startGame, setStartGame] = useState(false);
    let [percentageCompleted, setPercentageCompleted] = useState(0);
    let [showStats, setShowStats] = useState(false);
    const errKeysTypedCount = useRef(0);
    // let [gameCountdown, setGameCountDown] = useState(240);

    useEffect(() => {
        console.log("useEffect typingGame:")
        if (!isJoined)
            navigate('/');
    }, []);

    useEffect(() => {
        let lastIdx = text.length - 1;

        if (startGame && text && paragraph[lastIdx] !== text[lastIdx])
            errKeysTypedCount.current++;

        if (startGame && text && paragraph[lastIdx] !== text[lastIdx])
            setError(true);

        else if(startGame) {
            setError(false);
            broadcastProgressInfo()
            if (paragraph.length === text.length)
                setGameFinished(true);
        }
    }, [text])

    useEffect(() => {
        checkIfEveryonesReady();
    }, [JSON.stringify(onlineUsersMap), isReady])
    
    useEffect(()=>{
        startGameRef.current = startGame;
    }, [startGame])

    useEffect(()=>{
        startCountDownRef.current = startCountdown
    }, [startCountdown])

    useEffect(()=>{
        isReadyRef.current = isReady
    },[isReady])

    useEffect(()=>{
        if(gameCompletionTime > 0)
            setShowStats(true);
    }, [gameCompletionTime]);



    const checkIfEveryonesReady = () => {
        if (!isReady || startCountdown || startGame || gameFinished)
            return;
        if (Object.keys(onlineUsersMap).length) {
            console.log(onlineUsersMap)
            for (let peerId in onlineUsersMap) {
                if (onlineUsersMap[peerId].status === 'WAITING')
                    return;
            }
            setStartCountdown(true);
        }
    }

    const broadcastProgressInfo = () => {
        let progressValue = (text.length / paragraph.length) * 100;
        setPercentageCompleted(progressValue);
        sendMessageToAllConnections({ username, info: 'PROGRESS', progressStats: { percentageCompleted: progressValue } });
    }

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
        // const randomNumber = Math.floor(Math.random() * 101);
        // setProgressBarVal(randomNumber);
        console.log('clicked')
        setIsReady(true);
        sendMessageToAllConnections({ status: 'READY', username, info: 'STATUS' })
    }

    


    const handleInitialTimerEnd = () => {
        setStartGame(true);
        setStartCountdown(false);
        startGlobalCountdown();
    }

    const onGameFinish = (time: number) => {
        setStartGame(false);
        setGameCompletionTime(time / 1000);
        sendMessageToAllConnections({ username, info: 'PROGRESS', progressStats: { timeTakenToComplete: time/1000 } });
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
                            <span className={isReady ? `text-green-500` : `text-red-500`}>{isReady ? 'READY' : 'WAITING'}</span>
                        </li>
                        {
                            Object.keys(onlineUsersMap).map((key) => (
                                <li className="flex justify-between text-xs font-semibold text-gray-700" key={key}>
                                    <span className="text-gray-700">{onlineUsersMap[key].username}</span>
                                    <span className={onlineUsersMap[key].status === 'READY' ? `text-green-500` : `text-red-500`}>{onlineUsersMap[key].status}</span>
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
                            disabled={gameFinished}
                            onChange={handleChange}
                            onKeyDown={handleKeyDown}
                        />
                    </div>

                    <span className='text-red-500 h-3 font-semibold'>{error && `You mistyped the last letter. Correct it to continue.`}</span>
                    <span className='text-green-500 h-3 font-semibold mb-4'>{gameFinished && `Congrats! You've completed in ${gameCompletionTime} seconds.`}</span>
                    {!startGame && <button
                        className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${isReady ? 'disabled:opacity-50 cursor-not-allowed' : ''}`}
                        disabled={isReady}
                        onClick={handleClick}
                    >
                        I'm Ready!
                    </button>}
                    {startCountdown && (<CountdownTimer onTimerEnd={handleInitialTimerEnd} stop={false}  text='Game starts in: ' countdown={gameStartsInCountDown} setCountdown={setGameStartsInCountDown}/>)}
                    {startGame && <CountdownTimer onTimerEnd={onGameFinish} stop={gameFinished} countdown={gameCountDown} setCountdown={setGameCountDown} text='Countdown: ' />}
                    {showStats && <StatsSummary timeTaken={gameCompletionTime} textLen={paragraph.length} errKeysTypedCount={errKeysTypedCount.current}/>}
                </div>
                <div className='w-[20vw]'>
                    {startGame && <ProgressBarsContainer dictionary={progressMap} username={username} percentageCompleted={percentageCompleted} />}
                </div>
            </div>

        </div>
    );
}

const ProgressBar: React.FC<ProgressItem> = ({ percentageCompleted, username }) => {
    return (
        <div className="relative w-full h-4 bg-gray-300 rounded overflow-hidden">
            <div
                className={`h-full bg-blue-500 transition-all duration-1000 ease-out`}
                style={{ width: `${percentageCompleted}%` }}
            ></div>
            <span className="absolute inset-0 flex items-center justify-center text-gray-700 font-orbitron text-xs font-semibold">{username}</span>
        </div>
    );
};

const ProgressBarsContainer: React.FC<ProgressBarsContainerProps> = ({ dictionary, username, percentageCompleted }) => {
    console.log(dictionary);
    return (
        <div className='space-y-2 bg-white p-4 shadow-lg rounded-lg w-[90%] max-h-full'>
            <ProgressBar username={`${username} (self)`} percentageCompleted={percentageCompleted} />
            {
                Object.keys(dictionary).map((key) =>
                    <ProgressBar key={key} username={dictionary[key].username} percentageCompleted={dictionary[key].percentageCompleted} />
                )
            }
        </div>);
}

const CountdownTimer = ({ stop, onTimerEnd, text = '', countdown, setCountdown }: { stop: boolean; onTimerEnd: (elapsedTime: number) => void, text?: string, countdown : number, setCountdown : Dispatch<SetStateAction<number>>}) => {
    console.log('rerendering countdownTimer....')
    const startTime = useRef(Date.now());
    const countDownTime = useRef(countdown);
    let {gameTimeMidJoinRef} = useContext(MyContext);

    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;
        if (stop || countdown <= 0) {
            const elapsedTime = Date.now() - startTime.current;
            onTimerEnd(elapsedTime + ((gameTimeLimit - gameTimeMidJoinRef.current)*1000));
        } else if (countdown > 0) {
            timer = setTimeout(() => {
                setCountdown((prevCountdown) =>{
                    let diff = Date.now() - startTime.current
                    return Math.floor(countDownTime.current - (diff/1000))
                });
            }, 1000);

        }
        return () => clearTimeout(timer);

    }, [countdown, stop]);

    return (
        <div className="bg-gray-200 p-2 rounded mt-3">
            {countdown === 0 ? (
                <span className="text-red-500">Time is up!</span>
            ) : (
                <span className="text-gray-700">{text}{countdown}</span>
            )}
        </div>
    );
};

const StatsSummary = ({ timeTaken, textLen, errKeysTypedCount }: { timeTaken: number, textLen: number, errKeysTypedCount: number}) => {
    let { progressMap } = React.useContext(MyContext);
    let [rank, setRank] = useState(0);
    let [wpm, setWpm] = useState(0);
    let [accuracy, setAccuracy] = useState(0);

    useEffect(()=>{
        setRank(calculateRank());
        setWpm(calculateWpm(textLen));
        setAccuracy(calculateAccuracy());
    },[]);

    const calculateWpm = (textLen : number) : number => {
        return Math.floor((textLen / 5) / (timeTaken / 60));
    }

    const calculateRank = () : number => {
        let currRank = 1;
        Object.keys(progressMap).map((key) => {
            if (progressMap[key]?.timeTakenToComplete ?? gameTimeLimit < timeTaken)
                currRank++;
        });
        return currRank;
    }

    const calculateAccuracy = () : number => {
        return Math.floor((100 - (errKeysTypedCount / (textLen + errKeysTypedCount) * 100)));
    }
    
    return (
        <div className='flex w-[80%] justify-evenly'>
            <StatItem name='wpm' val={`${wpm}`} />
            <StatItem name='rank' val={`${rank}`} />
            <StatItem name='accuracy' val={`${accuracy}%`} />
            <StatItem name='time' val={`${Math.ceil(timeTaken)}s`} />
        </div>
    )
}

const StatItem = ({ name, val }: { name: string, val: string }) => {
    return (
        <div className='flex flex-col items-center'>
            <span className='text-gray-500 font-orbitron text-sm font-semibold'>{name}:</span>
            <span className='text-[#E2B714] font-orbitron text-5xl font-bold'>{val}</span>
        </div>
    )
}



export default TypingGame;