import { useContext } from 'react';
import SocketContext from './SocketContext';

const useSocket = () => {
  const socket = useContext(SocketContext);
  if (!socket) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return socket;
};

export default useSocket;
