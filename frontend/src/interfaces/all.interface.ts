import { Dispatch, SetStateAction, MutableRefObject } from "react";
import { Socket } from "socket.io-client";

export interface Message {
  username: string;
  info ?: 'ONLINE' | 'PROGRESS' | 'STATUS';
  text ?: string;
  status ?: 'READY' | 'WAITING';
  peerId ?: string;
  progressStats ?: {
    percentageCompleted ?: number;
    timeTakenToComplete ?: number;
  }
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
type PeerIdUsersMap = {
  [key: string]: Required<Pick<Message, 'username' | 'status'>>;
};

export type PeerIdProgressMap = {
  [key: string]: ProgressItem;
};

export interface ProgressItem {
    username : string;
    percentageCompleted ?: number;
    timeTakenToComplete ?: number
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
  onlineUsersMap: PeerIdUsersMap;
  setOnlineUsersMap : Dispatch<SetStateAction<PeerIdUsersMap>>;
  progressMap: PeerIdProgressMap;
  setProgressMap : Dispatch<SetStateAction<PeerIdProgressMap>>;
}

type OnTimeChangeCallback = (time: number) => void;

export interface TimerProps {
  stop: boolean;
  onTimeChange: OnTimeChangeCallback;
}

export interface ProgressBarsContainerProps {
    dictionary : PeerIdProgressMap;
    username : string, 
    percentageCompleted : number
}