// client/src/components/VotingPage.js

import React, { useEffect, useState } from 'react';
import socket from '../services/socket';

const VotingPage = ({ roomCode, playerName, setPage }) => {
  const [players, setPlayers] = useState([]);
  const [voted, setVoted] = useState(false);

  useEffect(() => {
    socket.on('room_update', (roomData) => {
      setPlayers(roomData.players);
    });

    socket.on('voting_result', ({ correctSpyName, mostVotedName, scores }) => {
      alert(`Voting Results:\nMost Voted: ${mostVotedName}\nActual Spy: ${correctSpyName}`);
      setPage("spy-guess"); // Move to Spy Guess phase after voting
    });

    return () => {
      socket.off('room_update');
      socket.off('voting_result');
    };
  }, [setPage]);

  const submitVote = (votedForId) => {
    socket.emit('submit_vote', { roomCode, votedFor: votedForId }, (response) => {
      if (response.success) {
        setVoted(true);
      }
    });
  };

  return (
    <div style={{ textAlign: 'center', marginTop: "50px" }}>
      <h1>🗳️ Vote for the Spy!</h1>

      {voted ? (
        <h2>✅ Vote submitted. Waiting for others...</h2>
      ) : (
        <ul style={{ listStyleType: "none", marginTop: "20px" }}>
          {players
            .filter(p => p.name !== playerName) // Can't vote for yourself
            .map((p) => (
              <li key={p.id}>
                <button
                  onClick={() => submitVote(p.id)}
                  style={{
                    padding: "10px",
                    margin: "10px",
                    backgroundColor: "#fab1a0",
                    borderRadius: "15px",
                    fontSize: "18px",
                    cursor: "pointer",
                  }}
                >
                  {p.name}
                </button>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
};

export default VotingPage;
