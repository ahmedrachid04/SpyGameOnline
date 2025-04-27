// client/src/components/LeaderboardPage.js

import React, { useEffect, useState } from 'react';
import socket from '../services/socket';

const LeaderboardPage = ({ roomCode, setPage, setChosenTopic }) => {
  const [scores, setScores] = useState({});

  useEffect(() => {
    socket.on('spy_guess_result', ({ scores }) => {
      setScores(scores);
    });
  
    socket.on('update_scores', ({ scores }) => {
      setScores(scores);
    });
  
    // NEW: Request the scores when page loads
    socket.emit('request_scores', { roomCode });
  
    return () => {
      socket.off('spy_guess_result');
      socket.off('update_scores');
    };
  }, [roomCode]);
  

  const startNewGame = () => {
    // Emit a special "reset_game" event (we'll add it in backend next)
    socket.emit('reset_game', { roomCode });

    setPage("topic"); // Go back to topic selection
    setChosenTopic(""); // Reset chosen topic
  };

  return (
    <div style={{ textAlign: 'center', marginTop: "50px" }}>
      <h1>🏆 Final Leaderboard 🏆</h1>
      <ul style={{ listStyleType: "none", marginTop: "20px" }}>
        {Object.entries(scores).sort((a, b) => b[1] - a[1]).map(([name, score], index) => (
          <li key={name} style={{ fontSize: "22px", marginBottom: "10px" }}>
            {index === 0 ? "🥇 " : index === 1 ? "🥈 " : index === 2 ? "🥉 " : ""}
            {name}: {score} pts
          </li>
        ))}
      </ul>

      <button
        onClick={startNewGame}
        style={{
          marginTop: "30px",
          padding: "12px",
          borderRadius: "15px",
          backgroundColor: "#55efc4",
          fontSize: "18px",
          cursor: "pointer"
        }}
      >
        🔄 Start New Game
      </button>
    </div>
  );
};

export default LeaderboardPage;
