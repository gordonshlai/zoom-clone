const socket = io("/"); // socket will connect to our root path
const videoGrid = document.getElementById("video-grid");

/**
 * Create a server that generates userIds, so that users can connect to other peers
 * on the network via the peer server
 */
const myPeer = new Peer(undefined, {
  host: "/",
  port: "13001",
});
const myVideo = document.createElement("video");
myVideo.muted = true; // mute our own video for ourself. (doesn't mute us for other people)

const peers = {}; // to keep track of who is in the room

// use video and audio
navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    // Set up our own video stream
    addVideoStream(myVideo, stream);

    // When we receive a call from someone
    myPeer.on("call", (call) => {
      // we answer the call and send them our current stream
      call.answer(stream);

      const video = document.createElement("video");
      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
    });

    // Allow ourself to be connected to by other users
    socket.on("user-connected", (userId) => {
      connectToNewUser(userId, stream);
    });
  });

// Remove the video element immediately when the user leaves the room
socket.on("user-disconnected", (userId) => {
  peers?.[userId]?.close();
});

/**
 * as soon as we are connected to the peer server and get back an ID, run the callback
 */
myPeer.on("open", (id) => {
  socket.emit("join-room", ROOM_ID, id); // send an event to our server
});

function connectToNewUser(userId, stream) {
  // call the user that we give a certain ID to, send them our video stream
  const call = myPeer.call(userId, stream);

  const video = document.createElement("video");
  // When the user send us back their video stream, we add their video on our browser
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });

  // removes the video when the user disconnect
  call.on("close", () => {
    video.remove();
  });

  peers[userId] = call;
}

function addVideoStream(video, stream) {
  video.srcObject = stream; // allow us to play our video

  // Once the video stream is loaded on our page, we will play that video
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  videoGrid.append(video);
}
