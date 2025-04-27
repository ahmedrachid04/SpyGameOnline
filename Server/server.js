// server/server.js

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { topics } = require('./topics'); 

// Basic Setup
const app = express();
app.use(cors());
app.use(express.json()); // 🚀 Allow JSON body parsing

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: true
  }
});

// Room memory storage
const rooms = {}; // Format: { roomCode: { players: [{id, name, isHost}], phase: "lobby" } }

// Helper to generate room codes
const generateRoomCode = () => {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += letters[Math.floor(Math.random() * letters.length)];
  }
  return code;
};

// Socket.io connection
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Host creates a new room
  socket.on('create_room', ({ playerName }, callback) => {
    let roomCode = generateRoomCode();
    rooms[roomCode] = {
      players: [{ id: socket.id, name: playerName, isHost: true }],
      phase: "lobby",
    };
    socket.join(roomCode);
    console.log(`Room ${roomCode} created by ${playerName}`);
    callback({ roomCode });
    io.to(roomCode).emit('room_update', rooms[roomCode]);
  });

  // Player joins existing room
  socket.on('join_room', ({ playerName, roomCode }, callback) => {
    roomCode = roomCode.toUpperCase();

    if (!rooms[roomCode]) {
      return callback({ error: "Room does not exist." });
    }

    if (rooms[roomCode].players.length >= 15) {
      return callback({ error: "Room is full (Max 15 players)." });
    }

    rooms[roomCode].players.push({ id: socket.id, name: playerName, isHost: false });
    socket.join(roomCode);
    console.log(`${playerName} joined room ${roomCode}`);
    callback({ success: true });
    io.to(roomCode).emit('room_update', rooms[roomCode]);
  });

  // Player disconnects
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);

    for (const roomCode in rooms) {
      const playerIndex = rooms[roomCode].players.findIndex(p => p.id === socket.id);

      if (playerIndex !== -1) {
        const wasHost = rooms[roomCode].players[playerIndex].isHost;
        rooms[roomCode].players.splice(playerIndex, 1);

        if (wasHost && rooms[roomCode].players.length > 0) {
          rooms[roomCode].players[0].isHost = true;
          console.log(`Host left. Promoted ${rooms[roomCode].players[0].name} as new host`);
        }

        if (rooms[roomCode].players.length === 0) {
          delete rooms[roomCode];
          console.log(`Room ${roomCode} deleted (empty)`);
        } else {
          io.to(roomCode).emit('room_update', rooms[roomCode]);
        }

        break;
      }
    }
  });

  // Host starts the game
  socket.on('start_game', ({ roomCode }) => {
    if (!rooms[roomCode]) return;
    rooms[roomCode].phase = "topic_selection";
    io.to(roomCode).emit('game_phase', { phase: "topic_selection" });
  });
  
  // Host chooses a topic
  socket.on('choose_topic', ({ roomCode, topic }, callback) => {
    if (!rooms[roomCode]) return;

    const availableSubjects = topics[topic];
    if (!availableSubjects) return callback({ error: "Invalid topic!" });

    const chosenSubject = availableSubjects[Math.floor(Math.random() * availableSubjects.length)];
    const players = rooms[roomCode].players;
    const outPlayer = players[Math.floor(Math.random() * players.length)];

    rooms[roomCode].chosenTopic = topic;
    rooms[roomCode].subject = chosenSubject;
    rooms[roomCode].outPlayer = outPlayer.id;
    rooms[roomCode].phase = "role_reveal";

    console.log(`Topic chosen: ${topic}, Subject: ${chosenSubject}, Spy: ${outPlayer.name}`);

    players.forEach(p => {
        console.log(`Sending role_info to ${p.name} (ID: ${p.id})`);
      if (p.id === outPlayer.id) {
        io.to(p.id).emit('role_info', { isOut: true });
      } else {
        io.to(p.id).emit('role_info', { isOut: false, subject: chosenSubject });
      }
    });

    io.to(roomCode).emit('game_phase', { phase: "role_reveal" });
    callback({ success: true });
    setTimeout(() => {
        if (rooms[roomCode]) {
          rooms[roomCode].phase = "ask-answer";
          io.to(roomCode).emit('game_phase', { phase: "ask-answer" });
          console.log(`Moved room ${roomCode} to ask-answer phase`);
        }
      }, 5000); // 5 seconds delay after role reveal
  });

  socket.on('request_role_info', ({ roomCode }) => {
    const room = rooms[roomCode];
    if (!room) return;
  
    const player = room.players.find(p => p.id === socket.id);
    if (!player) return;
  
    const isOut = room.outPlayer === socket.id;
    const subject = room.subject;
  
    if (isOut) {
      io.to(socket.id).emit('role_info', { isOut: true });
    } else {
      io.to(socket.id).emit('role_info', { isOut: false, subject });
    }
  });

  // Players request next random pair
  socket.on('next_pair', ({ roomCode }) => {
    if (!rooms[roomCode]) return;

    const players = rooms[roomCode].players;
    if (players.length < 2) return;

    let p1 = players[Math.floor(Math.random() * players.length)];
    let p2 = players.filter(player => player.id !== p1.id)[Math.floor(Math.random() * (players.length - 1))];

    io.to(roomCode).emit('new_pair', { asker: p1.name, answerer: p2.name });
  });

  // Host starts the voting phase
  socket.on('start_voting', ({ roomCode }) => {
    if (!rooms[roomCode]) return;
  
    rooms[roomCode].phase = "voting";
  
    io.to(roomCode).emit('game_phase', { phase: "voting" });
    io.to(roomCode).emit('room_update', rooms[roomCode]);
  });
  

  // Store votes
  socket.on('submit_vote', ({ roomCode, votedFor }, callback) => {
    if (!rooms[roomCode]) return;

    if (!rooms[roomCode].votes) {
      rooms[roomCode].votes = {};
    }

    rooms[roomCode].votes[socket.id] = votedFor;

    const totalVotes = Object.keys(rooms[roomCode].votes).length;
    const totalPlayers = rooms[roomCode].players.length;

    console.log(`Vote received: ${socket.id} -> ${votedFor}`);

    if (totalVotes === totalPlayers) {
      calculateVoting(roomCode);
    }

    callback({ success: true });
  });

  function calculateVoting(roomCode) {
    const room = rooms[roomCode];
    const voteCounts = {};

    Object.values(room.votes).forEach(v => {
      voteCounts[v] = (voteCounts[v] || 0) + 1;
    });

    let mostVoted = Object.keys(voteCounts).reduce((a, b) => voteCounts[a] > voteCounts[b] ? a : b, null);
    let correctSpyId = room.outPlayer;

    const correctSpyName = room.players.find(p => p.id === correctSpyId)?.name;
    const mostVotedName = room.players.find(p => p.id === mostVoted)?.name;

    const newScores = {};
    room.players.forEach(p => {
      newScores[p.name] = p.score || 0;
    });

    if (mostVoted === correctSpyId) {
      Object.keys(room.votes).forEach(voterId => {
        if (room.votes[voterId] === correctSpyId) {
          const voterName = room.players.find(p => p.id === voterId)?.name;
          newScores[voterName] += 10;
        }
      });
    } else {
      const spyName = room.players.find(p => p.id === correctSpyId)?.name;
      newScores[spyName] += 5;
    }

    room.scores = newScores;
    room.phase = "spy-guess";
    room.votes = {};

    io.to(roomCode).emit('voting_result', {
      correctSpyName,
      mostVotedName,
      scores: newScores,
    });
  }

  // Spy submits their guess
  socket.on('spy_guess', ({ roomCode, guess }, callback) => {
    if (!rooms[roomCode]) return;

    const room = rooms[roomCode];
    const correctSubject = room.subject;
    const spyId = room.outPlayer;

    if (!room.scores) {
      room.scores = {};
      room.players.forEach(p => room.scores[p.name] = 0);
    }

    const spyName = room.players.find(p => p.id === spyId)?.name;

    if (guess === correctSubject) {
      room.scores[spyName] += 15;
    }

    room.phase = "end_round";

    io.to(roomCode).emit('spy_guess_result', {
      correct: guess === correctSubject,
      correctSubject: correctSubject,
      scores: room.scores
    });

    callback({ success: true });
  });

  socket.on('request_room_info', ({ roomCode }) => {
    if (!rooms[roomCode]) return;
    io.to(socket.id).emit('room_update', rooms[roomCode]);
  });
  
  // Reset scores for a new game
  socket.on('reset_game', ({ roomCode }) => {
    if (!rooms[roomCode]) return;

    rooms[roomCode].players.forEach(p => {
      p.score = 0;
    });

    rooms[roomCode].phase = "lobby";
    delete rooms[roomCode].subject;
    delete rooms[roomCode].outPlayer;
    delete rooms[roomCode].scores;
    delete rooms[roomCode].votes;

    io.to(roomCode).emit('room_update', rooms[roomCode]);
  });
});

// Server start
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
// End of server/server.js