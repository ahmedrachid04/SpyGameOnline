// client/src/components/SpyGuessPage.js

import React, { useEffect, useState } from 'react';
import socket from '../services/socket';
import { topics } from '../data/topics'; // You already have this

const SpyGuessPage = ({ roomCode, setPage, chosenTopic }) => {
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    if (topics[chosenTopic]) {
      setSubjects(topics[chosenTopic]);
    }

    socket.on('spy_guess_result', ({ correct, correctSubject, scores }) => {
      if (correct) {
        alert(`✅ Correct! The subject was "${correctSubject}". You gained +15 points!`);
      } else {
        alert(`❌ Wrong! The subject was "${correctSubject}". No points gained.`);
      }
      setPage("end-round");
    });

    return () => {
      socket.off('spy_guess_result');
    };
  }, [chosenTopic, setPage]);

  const submitGuess = (subject) => {
    socket.emit('spy_guess', { roomCode, guess: subject }, (response) => {
      if (!response.success) {
        alert("Something went wrong submitting your guess.");
      }
    });
  };

  return (
    <div style={{ textAlign: 'center', marginTop: "50px" }}>
      <h1>🎯 Guess the Subject!</h1>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", marginTop: "20px" }}>
        {subjects.map((subj) => (
          <button
            key={subj}
            onClick={() => submitGuess(subj)}
            style={{
              margin: "10px",
              padding: "12px",
              backgroundColor: "#ffeaa7",
              borderRadius: "15px",
              fontSize: "16px",
              cursor: "pointer"
            }}
          >
            {subj}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SpyGuessPage;
