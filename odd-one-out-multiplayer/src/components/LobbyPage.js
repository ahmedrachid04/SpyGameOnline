// client/src/components/LobbyPage.js

import React, { useEffect, useState } from 'react';
import socket from '../services/socket';

const LobbyPage = ({ roomCode, isHost, setPage }) => {
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    socket.on('room_update', (roomData) => {
      setPlayers(roomData.players);
    });

    socket.on('game_phase', ({ phase }) => {
      if (phase === "topic_selection") {
        setPage("topic");
      }
    });

    return () => {
      socket.off('room_update');
      socket.off('game_phase');
    };
  }, [setPage]);

  const startGame = () => {
    socket.emit('start_game', { roomCode });
  };

  return (
    <div style={{ textAlign: 'center', marginTop: "50px" }}>
      <h1>🛋️ Lobby - Room Code: {roomCode}</h1>
      <h2>Players:</h2>
      <ul style={{ listStyleType: "none" }}>
        {players.map((p) => (
          <li key={p.id} style={{ fontSize: "18px", marginBottom: "10px" }}>
            {p.name} {p.isHost ? "👑 (Host)" : ""}
          </li>
        ))}
      </ul>

      {isHost && (
        <button style={{ padding: "12px", marginTop: "30px", borderRadius: "15px", backgroundColor: "#55efc4", fontSize: "18px" }}
          onClick={startGame}>
          🚀 Start Game
        </button>
      )}
    </div>
  );
};

export default LobbyPage;
