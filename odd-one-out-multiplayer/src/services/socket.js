// client/src/services/socket.js

import { io } from "socket.io-client";

const socket = io("http://localhost:5000"); //port dyal server dyal node.js

export default socket;
