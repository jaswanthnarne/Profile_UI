import { io } from 'socket.io-client';

const socketUrl = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL.replace('/api', '') 
  : (import.meta.env.PROD ? window.location.origin : 'http://localhost:5000');

// Socket.io does not work on Vercel Serverless Functions due to its ephemeral, stateless nature.
// We will automatically use a mock socket in production if the backend URL contains 'vercel.app'
// to prevent continuous connection attempts, 400 Bad Request logs, and CORS issues.
const isVercelBackend = socketUrl.includes('vercel.app');
const disableSocket = isVercelBackend || import.meta.env.VITE_DISABLE_SOCKET === 'true';

let socketInstance;

if (disableSocket) {
  console.log('🔌 Socket.io connections are disabled for Vercel/production environment. Using mock socket.');
  socketInstance = {
    on: () => {},
    off: () => {},
    emit: () => {},
    connect: () => {},
    disconnect: () => {},
    connected: false,
  };
} else {
  socketInstance = io(socketUrl, {
    autoConnect: true,
    reconnection: true,
  });
}

export const socket = socketInstance;
export default socket;

