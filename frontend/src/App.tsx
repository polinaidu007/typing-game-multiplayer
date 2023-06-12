import { Socket } from 'socket.io-client';
import { newSocket } from './socket';
import React, { useState, useEffect, useRef } from 'react';

interface Message {
  username: string;
  text: string;
}

interface PeerConnectionInfo {
  isInitiator: boolean;
  peerId: string;
}

interface PeerSignalingData {
  peerId: string;
  answer?: RTCSessionDescriptionInit;
  candidate?: object;
  offer?: RTCSessionDescriptionInit
}

interface PeerConnectionsMap {
  [key: string]: RTCPeerConnection;
}

interface PeerChannelsMap {
  [key: string]: RTCDataChannel;
}

const App: React.FC = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [roomName, setRoomName] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [isJoined, setIsJoined] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const peerConnectionRef = useRef<PeerConnectionsMap>({});
  const dataChannelRef = useRef<PeerChannelsMap>({});

  useEffect(() => {
    console.log('useEffect');
    setSocket(newSocket);
    // return () => { socket.close(); }
  }, []);

  useEffect(() => {
    socket?.on('signal', (data: PeerSignalingData) => {
      console.log('onSignal')
      handleSignalingData(data);
    });

    socket?.on('joined', async (obj: PeerConnectionInfo) => {
      console.log('on joined', obj)
      createConnection(obj);
    });

    socket?.on('user-left', (data: any) => {
      console.log('User left:', data);
      for (let peerId in peerConnectionRef.current.keys) {
        peerConnectionRef.current[peerId].close();
      }
      peerConnectionRef.current = {};
    });
  }, [socket])

  const onClickJoinRoom = async () => {
    if (socket && roomName && username) {
      socket.emit('join-room', roomName);
      setIsJoined(true);
    };
  }

  const setupDataChannel = (dataChannel: RTCDataChannel) => {
    dataChannel.onopen = () => {
      console.log('Data Channel is open');
    };

    dataChannel.onmessage = (event) => {
      setMessages((prevMessages) => [...prevMessages, JSON.parse(event.data)]);
    };
  };

  const createConnection = async ({ isInitiator, peerId }: PeerConnectionInfo) => {
    // Other RTCPeerConnection setup (ICE handling, etc) here...

    const configuration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
    const peerConnection = new RTCPeerConnection(configuration);
    peerConnectionRef.current[peerId] = peerConnection;
    // peerConnectionRef.current = peerConnection;

    peerConnection.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
      if (event.candidate) {
        socket?.emit('signal', { peerId, candidate: event.candidate });
      }
    };

    // If this is the initiating peer, create the data channel
    if (isInitiator) {
      dataChannelRef.current[peerId] = peerConnectionRef.current[peerId].createDataChannel('chat');
      setupDataChannel(dataChannelRef.current[peerId]);
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      console.log('Initiating offer', { peerId })
      socket?.emit('signal', { peerId, offer });
      console.log('Offer Initiated')
    }
    else {
      // For the non-initiating peer, listen for the data channel
      peerConnectionRef.current[peerId].ondatachannel = (event) => {
        dataChannelRef.current[peerId] = event.channel;
        setupDataChannel(dataChannelRef.current[peerId]);
      };
    }

  }

  const handleSignalingData = async (data: PeerSignalingData) => {
    if (!peerConnectionRef.current || !socket) {
      return;
    }

    if (data.offer) {
      await peerConnectionRef.current[data.peerId].setRemoteDescription(new RTCSessionDescription(data.offer));
      const answer = await peerConnectionRef.current[data.peerId].createAnswer();
      await peerConnectionRef.current[data.peerId].setLocalDescription(answer);
      console.log("offer accepted. creating answer");
      socket.emit('signal', { peerId: data.peerId, answer });
      console.log("offer accepted. created answer");
    } else if (data.answer) {
      console.log('acceptting answer');
      await peerConnectionRef.current[data.peerId].setRemoteDescription(new RTCSessionDescription(data.answer));
      console.log('answer accepted');
    } else if (data.candidate) {
      try {
        await peerConnectionRef.current[data.peerId].addIceCandidate(new RTCIceCandidate(data.candidate));
      } catch (e) {
        console.error('Error adding received ice candidate', e);
      }
    }
  };

  const handleSendMessage = () => {
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
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      {isJoined ? (
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
      ) : (
        <div>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
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
      )}
    </div>
  );
};

export default App;
