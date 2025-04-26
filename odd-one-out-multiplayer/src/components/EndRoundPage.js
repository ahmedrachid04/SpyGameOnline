// client/src/components/EndRoundPage.js

import React, { useEffect, useState } from 'react';
import socket from '../services/socket';

const EndRoundPage = ({ roomCode, isHost, setPage, setChosenTopic }) => {
  const [scores, setScores] = useState({});

  useEffect(() => {
    socket.on('spy_guess_result', ({ scores }) => {
      setScores(scores);
    });

    return () => {
      socket.off('spy_guess_result');
    };
  }, []);

  const startNewRound = () => {
    setChosenTopic(""); // Reset chosen topic
    socket.emit('start_game', { roomCode }); // Move back to topic selection
  };

  const showLeaderboard = () => {
    setPage("leaderboard");
  };

  return (
    <div style={{ textAlign: 'center', marginTop: "50px" }}>
      <h1>✅ Round Finished!</h1>
      <h2>🏆 Current Scores:</h2>
      <ul style={{ listStyleType: "none", marginTop: "20px" }}>
        {Object.entries(scores).sort((a, b) => b[1] - a[1]).map(([name, score]) => (
          <li key={name} style={{ fontSize: "20px", marginBottom: "10px" }}>
            {name}: {score} pts
          </li>
        ))}
      </ul>

      {isHost && (
        <div style={{ marginTop: "30px" }}>
          <button
            onClick={startNewRound}
            style={{
              margin: "10px",
              padding: "12px",
              borderRadius: "15px",
              backgroundColor: "#74b9ff",
              fontSize: "18px",
              cursor: "pointer"
            }}
          >
            🔄 Start New Round
          </button>

          <button
            onClick={showLeaderboard}
            style={{
              margin: "10px",
              padding: "12px",
              borderRadius: "15px",
              backgroundColor: "#fd79a8",
              fontSize: "18px",
              cursor: "pointer"
            }}
          >
            🏆 See Leaderboard
          </button>
        </div>
      )}

      {!isHost && (
        <p>Waiting for host to decide...</p>
      )}
    </div>
  );
};

export default EndRoundPage;
