// client/src/components/AskAnswerPage.js

import React, { useEffect, useState } from 'react';
import socket from '../services/socket';

const AskAnswerPage = ({ roomCode, isHost, setPage }) => {
  const [asker, setAsker] = useState("");
  const [answerer, setAnswerer] = useState("");

  useEffect(() => {
    socket.emit('next_pair', { roomCode });

    socket.on('new_pair', ({ asker, answerer }) => {
      setAsker(asker);
      setAnswerer(answerer);
    });

    socket.on('game_phase', ({ phase }) => {
      if (phase === "voting") {
        setPage("voting");
      }
    });

    return () => {
      socket.off('new_pair');
      socket.off('game_phase');
    };
  }, [roomCode, setPage]);

  const requestNextPair = () => {
    socket.emit('next_pair', { roomCode });
  };

  const requestStartVoting = () => {
    socket.emit('start_voting', { roomCode });
  };

  return (
    <div style={{ textAlign: 'center', marginTop: "50px" }}>
      <h1>❓ Ask & Answer</h1>
      {asker && answerer ? (
        <h2><strong>{asker}</strong> asks a question to <strong>{answerer}</strong>!</h2>
      ) : (
        <p>Loading next question...</p>
      )}

      <button
        onClick={requestNextPair}
        style={{
          marginTop: "20px",
          padding: "12px",
          backgroundColor: "#74b9ff",
          borderRadius: "15px",
          fontSize: "18px",
          cursor: "pointer"
        }}
      >
        🔄 Next Pair
      </button>

      {isHost && (
        <div style={{ marginTop: "30px" }}>
          <button
            onClick={requestStartVoting}
            style={{
              padding: "12px",
              backgroundColor: "#fd79a8",
              borderRadius: "15px",
              fontSize: "18px",
              cursor: "pointer"
            }}
          >
            🗳️ Start Voting
          </button>
        </div>
      )}
    </div>
  );
};

export default AskAnswerPage;
