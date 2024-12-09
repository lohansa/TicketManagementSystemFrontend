import React, { useState, useEffect } from 'react';
import './App.css';
import { initializeWebSocket, sendWebSocketMessage } from './socketClient';

function App() {
  const [logs, setLogs] = useState([]); // Store logs from WebSocket
  const [socket, setSocket] = useState(null); // Track WebSocket instance


  // Placeholder for WebSocket connection
  useEffect(() => {
    const socket = new WebSocket('ws://localhost:4000'); // Replace with your server URL

    socket.onmessage = (event) => {
      setLogs((prevLogs) => [...prevLogs, event.data]);
    };

    return () => socket.close();
  }, []);

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    // Collect form data
    const formData = new FormData(e.target);
    const payload = {
      username: formData.get('username'),
      email: formData.get('email'),
      password: formData.get('password'),
      isVendor: formData.get('isVendor') === 'on', // Convert checkbox to boolean
    };

    try {
      const response = await fetch('http://localhost:8080/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        alert(`User registered successfully! UID: ${data.uid}`);
      } else if (response.status === 400) {
        alert('Could not register user due to data error.');
      } else if (response.status === 500) {
        alert('Could not register due to a server error.');
      }
    } catch (error) {
      console.error('Error during registration:', error);
      alert('An unexpected error occurred.');
    }
  };

  const handleSimulationSubmit = (e) => {
    e.preventDefault();

    setLogs([]); // Clear logs

    // Collect form data
    const formData = new FormData(e.target);
    const numTickets = formData.get('totalTickets');
    const releaseRate = formData.get('releaseRate');
    const retrievalRate = formData.get('retrievalRate');
    const ticketCapacity = formData.get('maxCapacity');

    // Construct the START command
    const command = `START ${numTickets} ${releaseRate} ${retrievalRate} ${ticketCapacity}`;

    // Check if WebSocket is already open
    if (socket && socket.readyState === WebSocket.OPEN) {
      sendWebSocketMessage(command); // Send the command directly
    } else {
      // Establish WebSocket connection if not already connected
      const newSocket = initializeWebSocket('ws://localhost:8080/ws', (message) => {
        setLogs((prevLogs) => [...prevLogs, message]); // Log messages from the server
      });

      setSocket(newSocket); // Save the WebSocket instance

      // Send START command when the socket opens
      newSocket.onopen = () => {
        sendWebSocketMessage(command);
      };
    }
  };

  return (
    <div className="App">
      <h1>Online Ticket Management Simulator</h1>

      {/* Registration Form */}
      <section className="form-section">
        <h2>Register User</h2>
        <form onSubmit={handleRegisterSubmit} className="register-form">
          <div>
            <label>Email: </label>
            <input type="email" name="email" required />
          </div>
          <div>
            <label>Password: </label>
            <input type="password" name="password" required />
          </div>
          <div>
            <label>Username: </label>
            <input type="text" name="username" required />
          </div>
          <div>
            <label>
              <input type="checkbox" name="isVendor" />
              Is Vendor
            </label>
          </div>
          <button type="submit">Register User</button>
        </form>
      </section>

      {/* Simulation Settings Form */}
      <section className="form-section">
        <h2>Start Simulation</h2>
        <form onSubmit={handleSimulationSubmit} className="simulation-form">
          <div>
            <label>Total Number of Tickets: </label>
            <input type="number" name="totalTickets" min="1" required />
          </div>
          <div>
            <label>Ticket Release Rate (per second): </label>
            <input type="number" name="releaseRate" min="1" required />
          </div>
          <div>
            <label>Customer Retrieval Rate (per second): </label>
            <input type="number" name="retrievalRate" min="1" required />
          </div>
          <div>
            <label>Maximum Ticket Capacity: </label>
            <input type="number" name="maxCapacity" min="1" required />
          </div>
          <button type="submit">Start Simulation</button>
        </form>
      </section>

      {/* Logs Panel */}
      <section className="logs-section">
        <h2>Simulation Logs</h2>
        <textarea
          readOnly
          value={logs.join('\n')}
          className="logs-box"
        ></textarea>
      </section>
    </div>
  );
}

export default App;
