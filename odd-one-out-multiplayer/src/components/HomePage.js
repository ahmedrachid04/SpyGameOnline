// client/src/components/HomePage.js

import React, { useState } from 'react';
import socket from '../services/socket';

const HomePage = ({ setPage, setRoomCode, setPlayerName, setIsHost }) => {
  const [inputName, setInputName] = useState("");
  const [inputRoomCode, setInputRoomCode] = useState("");

  const handleCreateRoom = () => {
    if (!inputName) return alert("Please enter your name!");
    socket.emit('create_room', { playerName: inputName }, ({ roomCode }) => {
      setPlayerName(inputName);
      setRoomCode(roomCode);
      setIsHost(true);
      setPage("lobby");
    });
  };

  const handleJoinRoom = () => {
    if (!inputName || !inputRoomCode) return alert("Enter your name and room code!");
    socket.emit('join_room', { playerName: inputName, roomCode: inputRoomCode }, (response) => {
      if (response.error) {
        alert(response.error);
      } else {
        setPlayerName(inputName);
        setRoomCode(inputRoomCode.toUpperCase());
        setIsHost(false);
        setPage("lobby");
      }
    });
  };

  return (
    <div style={{ textAlign: 'center', marginTop: "100px" }}>
      <h1>🎈 Odd One Out Party 🎈</h1>
      <input
        placeholder="Enter your name"
        value={inputName}
        onChange={(e) => setInputName(e.target.value)}
        style={{ padding: "10px", margin: "10px", borderRadius: "10px" }}
      /><br />

      <button onClick={handleCreateRoom} style={{ margin: "10px", padding: "10px", borderRadius: "10px", backgroundColor: "#00cec9", color: "white", fontWeight: "bold" }}>
        Create Room
      </button>

      <h3>OR</h3>

      <input
        placeholder="Enter room code"
        value={inputRoomCode}
        onChange={(e) => setInputRoomCode(e.target.value)}
        style={{ padding: "10px", margin: "10px", borderRadius: "10px" }}
      /><br />

      <button onClick={handleJoinRoom} style={{ margin: "10px", padding: "10px", borderRadius: "10px", backgroundColor: "#fd79a8", color: "white", fontWeight: "bold" }}>
        Join Room
      </button>
    </div>
  );
};

export default HomePage;
