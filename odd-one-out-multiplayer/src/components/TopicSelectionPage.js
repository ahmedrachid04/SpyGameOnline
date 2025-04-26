import React from 'react';
import socket from '../services/socket';
import { topics } from '../data/topics';

const TopicSelectionPage = ({ roomCode, isHost, setPage, setChosenTopic }) => {
  const handleChooseTopic = (topic) => {
    socket.emit('choose_topic', { roomCode, topic }, (response) => {
      if (response.error) {
        alert(response.error);
      } else {
        setChosenTopic(topic); // ✅ NOW OK
        // Topic chosen, wait for role reveal
      }
    });
  };

  return (
    <div style={{ textAlign: 'center', marginTop: "50px" }}>
      <h1>🎯 Choose a Topic</h1>
      {Object.keys(topics).map((topic) => (
        <button
          key={topic}
          style={{
            margin: "10px",
            padding: "10px",
            borderRadius: "10px",
            backgroundColor: "#74b9ff",
            fontSize: "18px",
            cursor: "pointer"
          }}
          onClick={() => handleChooseTopic(topic)}
          disabled={!isHost}
        >
          {topic}
        </button>
      ))}
      {!isHost && <p>Waiting for host to choose a topic...</p>}
    </div>
  );
};

export default TopicSelectionPage;
