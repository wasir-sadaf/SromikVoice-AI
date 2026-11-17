
import { useState } from "react";

import {
  LiveKitRoom,
  RoomAudioRenderer,
  useVoiceAssistant,
  BarVisualizer,
} from "@livekit/components-react";

import "@livekit/components-styles";

const BACKEND_URL = "http://localhost:5000";

function VoiceInterface({ onDisconnect }) {
  const { state, audioTrack } = useVoiceAssistant();

  return (
    <div style={styles.container}>
      <h1>SromikVoice AI</h1>

      <p style={styles.status}>
        Agent status: <strong>{state || "Connecting..."}</strong>
      </p>

      <div style={styles.visualizer}>
        {audioTrack && (
          <BarVisualizer
            state={state}
            trackRef={audioTrack}
            barCount={5}
            style={{ height: "100px" }}
          />
        )}
      </div>

      <p style={styles.instruction}>
        Speak to start your conversation.
      </p>

      <button
        onClick={onDisconnect}
        style={styles.disconnectButton}
      >
        End Conversation
      </button>

      <RoomAudioRenderer />
    </div>
  );
}

export default function App() {
  const [connection, setConnection] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function connect() {
    try {
      setLoading(true);
      setError("");

      console.log("Requesting LiveKit token...");

      const response = await fetch(`${BACKEND_URL}/api/token`);

      if (!response.ok) {
        throw new Error(
          `Backend error: ${response.status}`
        );
      }

      const data = await response.json();

      if (!data.token || !data.serverUrl) {
        throw new Error("Invalid token response from backend.");
      }

      console.log("Token received.");
      console.log("Connecting to:", data.serverUrl);

      setConnection(data);
    } catch (err) {
      console.error("Connection setup failed:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function disconnect() {
    setConnection(null);
  }

  return (
    <div style={styles.app}>
      {!connection ? (
        <div style={styles.container}>
          <h1>SromikVoice AI</h1>

          <p style={styles.instruction}>
            Your AI voice assistant for worker support.
          </p>

          {error && (
            <p style={styles.error}>{error}</p>
          )}

          <button
            onClick={connect}
            disabled={loading}
            style={styles.connectButton}
          >
            {loading ? "Connecting..." : "Start Conversation"}
          </button>
        </div>
      ) : (
        <LiveKitRoom
          serverUrl={connection.serverUrl}
          token={connection.token}
          connect={true}
          audio={true}
          video={false}
          onConnected={() => {
            console.log("LIVEKIT CONNECTED");
          }}
          onDisconnected={() => {
            console.log("LIVEKIT DISCONNECTED");
          }}
          onError={(err) => {
            console.error("LIVEKIT ERROR:", err);
            setError(err.message);
          }}
        >
          <VoiceInterface onDisconnect={disconnect} />
        </LiveKitRoom>
      )}
    </div>
  );
}

const styles = {
  app: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f0f7ff",
    fontFamily: "Arial, sans-serif",
    padding: "20px",
  },

  container: {
    width: "100%",
    maxWidth: "450px",
    padding: "40px",
    background: "#ffffff",
    borderRadius: "16px",
    textAlign: "center",
    boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
  },

  status: {
    color: "#2563eb",
    marginTop: "20px",
  },

  visualizer: {
    height: "120px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  instruction: {
    color: "#64748b",
    margin: "20px 0",
  },

  connectButton: {
    padding: "14px 25px",
    background: "#2563eb",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "16px",
  },

  disconnectButton: {
    padding: "12px 25px",
    background: "#dc2626",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "15px",
  },

  error: {
    color: "#dc2626",
    margin: "15px 0",
  },
};
