// client/src/services/socket.js

import { io } from "socket.io-client";

const socket = io("https://middos-spy-game.onrender.com"); //port dyal server dyal node.js

export default socket;
