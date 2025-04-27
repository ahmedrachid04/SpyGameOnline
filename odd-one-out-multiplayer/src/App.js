// client/src/App.js

import React, { useState } from 'react';
import HomePage from './components/HomePage';
import LobbyPage from './components/LobbyPage';
import TopicSelectionPage from './components/TopicSelectionPage';
import RoleRevealPage from './components/RoleRevealPage';
import AskAnswerPage from './components/AskAnswerPage';
import VotingPage from './components/VotingPage';
import SpyGuessPage from './components/SpyGuessPage';
import EndRoundPage from './components/EndRoundPage';
import LeaderboardPage from './components/LeaderboardPage';

function App() {
  const [page, setPage] = useState("home");
  const [roomCode, setRoomCode] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [isHost, setIsHost] = useState(false);
  const [chosenTopic, setChosenTopic] = useState("");
  const [isSpy, setIsSpy] = useState(false);


  return (
    <div>
      {page === "home" && (
        <HomePage
          setPage={setPage}
          setRoomCode={setRoomCode}
          setPlayerName={setPlayerName}
          setIsHost={setIsHost}
        />
      )}
      {page === "lobby" && (
        <LobbyPage
          roomCode={roomCode}
          playerName={playerName}
          isHost={isHost}
          setPage={setPage}
        />
      )}
      {page === "topic" && (
        <TopicSelectionPage
          roomCode={roomCode}
          isHost={isHost}
          setPage={setPage}
          setChosenTopic={setChosenTopic}
        />
      )}
      {page === "role-reveal" && (
        <RoleRevealPage
          setPage={setPage}
          roomCode={roomCode}
          setIsSpy={setIsSpy}
        />
      )}
      {page === "ask-answer" && (
        <AskAnswerPage
        roomCode={roomCode}
        isHost={isHost}
        setPage={setPage}
        />
        )}
        {page === "voting" && (
          <VotingPage
          roomCode={roomCode}
          playerName={playerName}
          setPage={setPage}
          isSpy={isSpy}
          />
          )}
          {page === "spy-guess" && (
            <SpyGuessPage
            roomCode={roomCode}
            setPage={setPage}
            chosenTopic={chosenTopic}
            />
            )}
            {page === "end-round" && (
  <EndRoundPage
    roomCode={roomCode}
    isHost={isHost}
    setPage={setPage}
    setChosenTopic={setChosenTopic}
  />
  )}
  {page === "leaderboard" && (
  <LeaderboardPage
    roomCode={roomCode}
    setPage={setPage}
    setChosenTopic={setChosenTopic}
  />
)}

    </div>
    
  );
}

export default App;
