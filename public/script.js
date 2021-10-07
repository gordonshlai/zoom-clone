const socket = io("/"); // socket will connect to our root path

/**
 * Create a server that generates userIds, so that users can connect to other peers
 * on the network via the peer server
 */
const myPeer = new Peer(undefined, {
  host: "/",
  port: "3001",
});

/**
 * as soon as we are connected to the peer server and get back an ID, run the callback
 */
myPeer.on("open", (id) => {
  socket.emit("join-room", ROOM_ID, id); // send an event to our server
});

socket.on("user-connected", (userId) => {
  console.log("user connected: " + userId);
});
