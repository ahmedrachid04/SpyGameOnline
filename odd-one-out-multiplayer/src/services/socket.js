// client/src/services/socket.js

import { io } from "socket.io-client";

const socket = io("https://middos-spy-game.onrender.com"); //url dyal back dyal nodejs

export default socket;
