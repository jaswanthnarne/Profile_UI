import { io } from 'socket.io-client';

const socketUrl = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL.replace('/api', '') 
  : (import.meta.env.PROD ? window.location.origin : 'http://localhost:5000');

export const socket = io(socketUrl, {
  autoConnect: true,
  reconnection: true,
});

export default socket;
