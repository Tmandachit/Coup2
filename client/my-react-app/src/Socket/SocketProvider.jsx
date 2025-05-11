import { useEffect } from 'react';
import PropTypes from 'prop-types';
import SocketContext from './SocketContext';
import socket from './socket';

const SocketProvider = ({ children } = {}) => {
  useEffect(() => {
    // Connect the socket when the provider mounts
    socket.connect();

    // Log the socket connection status
    socket.on('connect', () => {
      console.log('Socket connected:', socket.id); // Logs the socket connection ID when successful
    });

    // Handle connection errors
    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err); // Logs errors if the connection fails
    });

    return () => {
      // Disconnect the socket when the provider unmounts
      socket.disconnect();
      console.log('Socket disconnected');
    };
  }, []); // Empty dependency array ensures this runs only once when the provider mounts

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

SocketProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default SocketProvider;