/* global Peer */

// -----------------------------
// TURN + STUN configuration
// -----------------------------
const ICE_SERVERS = [
  // STUN (helps discover srflx candidates)
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
  { urls: "stun:stun.cloudflare.com:3478" },

  // TURN (relay) – your provided server
  // Include both UDP and TCP transports so ICE can pick what works
  {
    urls: [
      "turn:free.expressturn.com:3478?transport=udp",
      "turn:free.expressturn.com:3478?transport=tcp"
    ],
    username: "000000002088260518",
    credential: "e71gwsVWcjwaAmaW1TjZwW34vZI"
  }
];

// Generate random 5-character peer ID
export function generatePeerId(length = 5) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let id = "";
  for (let i = 0; i < length; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

// Initialize peer connection (with ICE servers)
export function initializePeer(setPeerId, setIncomingCall, setNotification, opts = {}) {
  const { idLength = 5, debug = false } = opts;

  const peerId = generatePeerId(idLength);

  // PeerJS expects RTCPeerConnection config inside "config" -> { iceServers } [1](https://jitsi.org/blog/introducing-the-jitsi-meet-react-sdk/)
  const peer = new Peer(peerId, {
    config: {
      iceServers: ICE_SERVERS
      // Leave defaults: ICE will try host/srflx first, then relay when needed. [2](https://jitsi.support/developer/jitsi-react-sdk-npm/)
    }
  });

  peer.on("open", (id) => {
    if (debug) console.log("[Peer] connected with ID:", id);
    setPeerId(id);
  });

  peer.on("call", (call) => {
    if (debug) console.log("[Peer] incoming call from:", call.peer);
    setIncomingCall(call);
  });

  peer.on("error", (error) => {
    console.error("[Peer] error:", error);
    const msg = error?.type ? `Connection error: ${error.type}` : `Connection error: ${String(error)}`;
    setNotification?.(msg, "error");
  });

  return peer;
}

// Make outgoing call
export async function makeCall(peer, targetId, showNotification, opts = {}) {
  const { timeoutMs = 15000, debug = false } = opts;

  return new Promise(async (resolve, reject) => {
    let stream = null;
    let call = null;
    let connectionTimeout = null;
    let resolved = false;

    const cleanup = () => {
      if (connectionTimeout) clearTimeout(connectionTimeout);
      connectionTimeout = null;

      // don't destroy peer here (caller may reuse peer)
      if (call) {
        try { call.close(); } catch (_) {}
        call = null;
      }
      if (stream) {
        try { stream.getTracks().forEach(t => t.stop()); } catch (_) {}
        stream = null;
      }
    };

    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

      call = peer.call(targetId, stream);
      if (debug) console.log("[Call] calling:", targetId);

      connectionTimeout = setTimeout(() => {
        if (resolved) return;
        if (debug) console.warn("[Call] timeout waiting for remote stream");
        cleanup();
        reject(new Error("P2P_TIMEOUT"));
      }, timeoutMs);

      call.on("stream", (remote) => {
        if (resolved) return;
        resolved = true;

        if (connectionTimeout) clearTimeout(connectionTimeout);
        connectionTimeout = null;

        if (debug) console.log("[Call] received remote stream");
        resolve({ call, localStream: stream, remoteStream: remote });
        // Note: DO NOT stop local stream here; caller needs it during the call.
      });

      call.on("error", (error) => {
        if (resolved) return;
        console.error("[Call] error:", error);

        cleanup();

        // Helpful message for common NAT/TURN failures
        const msg = error?.type ? error.type : String(error);
        reject(new Error(msg));
      });

      call.on("close", () => {
        if (debug) console.log("[Call] closed");
        cleanup();
      });

    } catch (error) {
      console.error("[Media] getUserMedia error:", error);
      cleanup();
      showNotification?.("Camera/microphone access denied", "error");
      reject(error);
    }
  });
}

// Answer incoming call
export async function answerCall(incomingCall, opts = {}) {
  const { debug = false } = opts;

  return new Promise(async (resolve, reject) => {
    let stream = null;
    let resolved = false;

    const cleanup = () => {
      if (stream) {
        try { stream.getTracks().forEach(t => t.stop()); } catch (_) {}
        stream = null;
      }
    };

    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

      if (debug) console.log("[Answer] answering call from:", incomingCall.peer);
      incomingCall.answer(stream);

      incomingCall.on("stream", (remote) => {
        if (resolved) return;
        resolved = true;
        if (debug) console.log("[Answer] received remote stream");
        resolve({ call: incomingCall, localStream: stream, remoteStream: remote });
      });

      incomingCall.on("error", (error) => {
        if (resolved) return;
        console.error("[Answer] error:", error);
        cleanup();
        reject(error);
      });

      incomingCall.on("close", () => {
        if (debug) console.log("[Answer] closed");
        cleanup();
      });

    } catch (error) {
      console.error("[Media] getUserMedia error:", error);
      cleanup();
      reject(error);
    }
  });
}
