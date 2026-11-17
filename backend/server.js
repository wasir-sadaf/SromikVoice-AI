
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { AccessToken } = require("livekit-server-sdk");
const { RoomAgentDispatch, RoomConfiguration } = require("@livekit/protocol");

const app = express();

app.use(cors());

app.get("/api/token", async (req, res) => {
  try {
    const roomName = `sromikvoice-${Date.now()}`;

    const token = new AccessToken(
      process.env.LIVEKIT_API_KEY,
      process.env.LIVEKIT_API_SECRET,
      { identity: `user-${Date.now()}` }
    );

    token.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
    });

    token.roomConfig = new RoomConfiguration({
      agents: [
        new RoomAgentDispatch({
          agentName: "my-agent",
        }),
      ],
    });

    res.json({
      token: await token.toJwt(),
      serverUrl: process.env.LIVEKIT_URL,
      roomName,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Token generation failed" });
  }
});

app.listen(5000, () => {
  console.log("Backend running on port 5000");
});
