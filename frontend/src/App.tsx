import React, { useEffect } from 'react';
import JoinRoom from './pages/JoinRoom';
import Chat from './pages/Chat';
import MyContextProvider from './context/MyContextProvider';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TypingGame from './pages/TypingGame';


const App: React.FC = () => {
  console.log('rendering AppComponent:')
  useEffect(() => {
    console.log('AppComponent:')
  }, []);

  return (
    <MyContextProvider>
      <Router>
        <Routes>
          <Route path='/' element={<JoinRoom />} />
          <Route path='/chat' element={<Chat />} />
          <Route path='/typing-game' element={<TypingGame />} />
        </Routes>
      </Router>
    </MyContextProvider>
  );
};

export default App;
