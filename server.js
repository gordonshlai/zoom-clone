const express = require("express");
const app = express();
const server = require("http").Server(app); // create a server so that we can use it with Socket.io
const io = require("socket.io")(server); // creates a express server and pass it to Socket.io
const { v4: uuidV4 } = require("uuid"); // this library generates a random hex number

app.set("view engine", "ejs"); // use ejs to render our views
app.use(express.static("public")); // put all our js and css in 'public folder

/**
 * We use the home page to be a chat room
 */
app.get("/", (req, res) => {
  res.redirect(`/${uuidV4()}`); // generate a random hex number as the roomId
});

app.get("/:room", (req, res) => {
  res.render("room", { roomId: req.params.room });
});

/**
 * This is going to run everytime when someone connects to our webpage
 */
io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId) => {
    socket.join(roomId); // subscribe socket to the roomId

    // send a message to everyone in the room other than ourself that a user has joined the room
    socket.broadcast.to(roomId).emit("user-connected", userId);
  });
});

/**
 * The video chat does not communicate with the server, instead it directly communicate with the
 * person's computer. The server is purely jsut for setting up our rooms.
 */
server.listen(13000, () => console.log("Server listening on port 13000"));
