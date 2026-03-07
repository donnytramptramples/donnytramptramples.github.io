/* global Peer */

/**
 * peerManager.js (FULL)
 * - Adds many TURN/TURNS URLs with priority on TCP 443
 * - Uses WebRTC-standard iceServers format (urls may be an array) [1](https://jitsi.support/developer/jitsi-react-sdk-npm/)[2](https://deepwiki.com/jitsi/jitsi-meet-react-sdk)
 * - Keeps your makeCall/answerCall behavior
 * - Works with script-tag + Babel environment (exports to window)
 */

function initializePeer(setPeerId, setIncomingCall, showNotification) {
  // Generate peerId (5 chars)
  const peerId = Math.random().toString(36).substring(2, 7).toUpperCase();

  // NOTE: More ICE URLs can increase setup time because ICE tries them in order. [1](https://jitsi.support/developer/jitsi-react-sdk-npm/)
  // So we prioritize the most firewall-friendly first:
  // 1) turns:...:443?transport=tcp
  // 2) turn:...:443?transport=tcp
  // 3) turn:...:3478?transport=tcp
  // 4) turn:...:3478?transport=udp
  const config = {
    iceServers: [
      // -----------------------
      // STUN (fast & free)
      // -----------------------
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
      { urls: "stun:stun2.l.google.com:19302" },
      { urls: "stun:stun3.l.google.com:19302" },
      { urls: "stun:stun4.l.google.com:19302" },
      { urls: "stun:stun.cloudflare.com:3478" },
      { urls: "stun:global.stun.twilio.com:3478" },

      // -----------------------
      // ExpressTURN (your creds)
      // -----------------------
      {
        urls: [
          // ✅ TLS on 443 first (best chance through restrictive networks) 
          "turns:free.expressturn.com:443?transport=tcp",
          // Some servers also accept plain TURN over tcp/443
          "turn:free.expressturn.com:443?transport=tcp",

          // TCP fallback
          "turn:free.expressturn.com:3478?transport=tcp",

          // UDP lowest latency if allowed
          "turn:free.expressturn.com:3478?transport=udp",

          // If supported by provider
          "turns:free.expressturn.com:5349?transport=tcp"
        ],
        username: "00000000208826051",
        credential: "e71gwsVWcjwaAmaW1TjZwW34vZI="
      },

      // -----------------------
      // OpenRelay (Metered) public test creds
      // -----------------------
      {
        urls: [
          "turns:openrelay.metered.ca:443?transport=tcp",
          "turn:openrelay.metered.ca:443?transport=tcp",
          "turn:openrelay.metered.ca:80?transport=tcp",
          "turn:openrelay.metered.ca:3478?transport=tcp",
          "turn:openrelay.metered.ca:3478?transport=udp"
        ],
        username: "openrelayproject",
        credential: "openrelayproject"
      }
    ],

    // keep as 'all' so ICE can still use direct paths when possible
    iceTransportPolicy: "all",
    sdpSemantics: "unified-plan"
  };

  const peer = new Peer(peerId, {
    config,
    debug: 2
  });

  peer.on("open", (id) => {
    console.log("Peer ID registered:", id);
    setPeerId(id);
  });

  peer.on("error", (error) => {
    console.error("PeerJS Error:", error);
    showNotification?.("Connection error: " + (error.type || error.message || error), "error");
  });

  peer.on("call", (incoming) => {
    console.log("Incoming call from:", incoming.peer);
    setIncomingCall(incoming);
  });

  return peer;
}

async function makeCall(peer, targetId, showNotification) {
  try {
    const localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    });

    const call = peer.call(targetId, localStream);

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        console.log("Call timeout");
        try { call.close(); } catch (_) {}
        try { localStream.getTracks().forEach((t) => t.stop()); } catch (_) {}
        reject(new Error("CONNECTION_TIMEOUT"));
      }, 30000);

      call.on("stream", (remoteStream) => {
        clearTimeout(timeout);
        console.log("Remote stream received");
        resolve({ call, localStream, remoteStream });
      });

      call.on("error", (error) => {
        clearTimeout(timeout);
        console.error("Call error:", error);
        try { localStream.getTracks().forEach((t) => t.stop()); } catch (_) {}
        reject(error);
      });

      call.on("close", () => {
        clearTimeout(timeout);
        try { localStream.getTracks().forEach((t) => t.stop()); } catch (_) {}
      });
    });
  } catch (error) {
    console.error("Media access error:", error);
    showNotification?.("Cannot access camera/microphone", "error");
    throw error;
  }
}

async function answerCall(incomingCall) {
  try {
    const localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    });

    incomingCall.answer(localStream);

    return new Promise((resolve, reject) => {
      incomingCall.on("stream", (remoteStream) => {
        console.log("Remote stream received (answer)");
        resolve({ call: incomingCall, localStream, remoteStream });
      });

      incomingCall.on("error", (error) => {
        console.error("Answer error:", error);
        try { localStream.getTracks().forEach((t) => t.stop()); } catch (_) {}
        reject(error);
      });

      incomingCall.on("close", () => {
        try { localStream.getTracks().forEach((t) => t.stop()); } catch (_) {}
      });
    });
  } catch (error) {
    console.error("Answer failed:", error);
    throw error;
  }
}

// ✅ expose globally (required for your Babel/script-tag setup)
window.initializePeer = initializePeer;
window.makeCall = makeCall;
window.answerCall = answerCall;
