import React, { useEffect } from 'react';
import JoinRoom from './pages/JoinRoom';
import Chat from './pages/Chat';
import MyContextProvider from './context/MyContextProvider';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';


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
        </Routes>
      </Router>
    </MyContextProvider>
  );
};

export default App;
