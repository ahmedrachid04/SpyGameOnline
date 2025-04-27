import React, { useEffect, useState } from 'react';
import socket from '../services/socket';

const RoleRevealPage = ({ setPage }) => {
  const [roleInfo, setRoleInfo] = useState(null);

  useEffect(() => {
    socket.once('role_info', (data) => {
      console.log("Received role_info event (ONCE):", data);
      setRoleInfo(data);
    });

    socket.on('game_phase', ({ phase }) => {
      if (phase === "ask-answer") {
        setPage("ask-answer");
      }
    });

    return () => {
      socket.off('game_phase');
    };
  }, [setPage]);

  if (!roleInfo) return <div>Loading your secret info...</div>;

  return (
    <div style={{ textAlign: 'center', marginTop: "50px" }}>
      <h1>🕵️ Your Role</h1>
      {roleInfo.isOut ? (
        <h2 style={{ color: "red" }}>❌ You are OUT of topic!</h2>
      ) : (
        <h2 style={{ color: "green" }}>
          ✅ Your subject is: <br /> <u>{roleInfo.subject}</u>
        </h2>
      )}
      <p>Waiting for others...</p>
    </div>
  );
};

export default RoleRevealPage;
// This component is responsible for displaying the role information to the players after they have chosen a topic.