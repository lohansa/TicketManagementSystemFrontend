// websocketClient.js
let socket = null;

export const initializeWebSocket = (url, onMessageCallback) => {
  if (!socket || socket.readyState === WebSocket.CLOSED) {
    socket = new WebSocket(url);

    socket.onopen = () => {
      console.log('WebSocket connection established.');
    };

    socket.onmessage = (event) => {
      if (onMessageCallback) {
        onMessageCallback(event.data); // Pass data to the callback
      }
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    socket.onclose = () => {
      console.log('WebSocket connection closed.');
    };
  }
  return socket;
};

export const sendWebSocketMessage = (message) => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(message);
  } else {
    console.error('WebSocket is not open. Unable to send message:', message);
  }
};
