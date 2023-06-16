import { Dispatch, SetStateAction, MutableRefObject } from "react";
import { Socket } from "socket.io-client";

export interface Message {
  username: string;
  text ?: string;
  isOnline ?: boolean;
  status ?: 'READY' | 'WAITING';
  peerId ?: string;
}

export interface PeerConnectionInfo {
  isInitiator: boolean;
  peerId: string;
}

export interface PeerSignalingData {
  peerId: string;
  answer?: RTCSessionDescriptionInit;
  candidate?: object;
  offer?: RTCSessionDescriptionInit
}

export interface PeerConnectionsMap {
  [key: string]: RTCPeerConnection;
}

export interface PeerChannelsMap {
  [key: string]: RTCDataChannel;
}

export interface MyContextType {
  socket: Socket | null;
  setSocket: Dispatch<any>;
  roomName: string;
  setRoomName: Dispatch<SetStateAction<string>>;
  username: string;
  setUsername: Dispatch<SetStateAction<string>>;
  isJoined: boolean;
  messages : Message[];
  setMessages : Dispatch<SetStateAction<Message[]>>;
  setIsJoined: Dispatch<SetStateAction<boolean>>;
  peerConnectionRef: MutableRefObject<PeerConnectionsMap>;
  dataChannelRef: MutableRefObject<PeerChannelsMap>;
}