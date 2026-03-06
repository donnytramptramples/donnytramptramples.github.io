/**
 * peermanager.js - WebRTC Connectivity (PeerJS)
 * P2P-preferred via ICE, with optional TURN-relay retry on failure.
 *
 * Note: ICE already prefers direct (P2P) paths when possible. TURN is used as fallback when needed. [1](https://rmauro.dev/webrtc-deep-dive-ice-turn-and-sfu/)[2](https://www.rtcinsights.com/blog/stun-turn-configuration/)
 */

const P2P_PREFERRED_ICE_SERVERS = [
  // STUN first (helps discover srflx candidates across NAT)
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:global.stun.twilio.com:3478' },

  // Optional: your TURN servers (recommended for production reliability)
  // Replace these placeholders with your own TURN service (e.g., coturn)
  {
    urls: [
      'turn:turn.example.com:3478?transport=udp',
      'turn:turn.example.com:3478?transport=tcp',
    ],
    username: 'YOUR_TURN_USERNAME',
    credential: 'YOUR_TURN_PASSWORD',
  },
  {
    urls: 'turns:turn.example.com:443?transport=tcp',
    username: 'YOUR_TURN_USERNAME',
    credential: 'YOUR_TURN_PASSWORD',
  },
];

const RELAY_ONLY_ICE_SERVERS = [
  // TURN only; used when you want to force relay for a retry.
  {
    urls: [
      'turn:turn.example.com:3478?transport=udp',
      'turn:turn.example.com:3478?transport=tcp',
      'turns:turn.example.com:443?transport=tcp',
    ],
    username: 'YOUR_TURN_USERNAME',
    credential: 'YOUR_TURN_PASSWORD',
  },
];

function buildPeerConfig({ relayOnly = false } = {}) {
  return {
    iceTransportPolicy: relayOnly ? 'relay' : 'all', // 'relay' forces TURN candidates only. [3](https://udn.realityripple.com/docs/Web/API/RTCConfiguration/iceTransportPolicy)
    iceCandidatePoolSize: 4, // keep modest; huge pool rarely helps and can slow startup
    iceServers: relayOnly ? RELAY_ONLY_ICE_SERVERS : P2P_PREFERRED_ICE_SERVERS,
    sdpSemantics: 'unified-plan',
  };
}

/**
 * Creates a PeerJS Peer with a known peerId.
 * Keeping the same peerId makes it easier to retry with a different ICE policy.
 */
function createPeerInstance(peerId, config, setPeerId, setIncomingCall, showNotification) {
  const peer = new Peer(peerId, { config, debug: 1 });

  peer.on('open', (id) => {
    console.log('✅ Peer registered:', id);
    setPeerId(id);
  });

  peer.on('error', (error) => {
    console.error('❌ Peer error:', error);
    showNotification?.('Link error: ' + (error.type || error.message), 'error');
  });

  peer.on('call', (call) => setIncomingCall(call));

  peer.on('disconnected', () => {
    console.warn('⚠️ Disconnected. Reconnecting…');
    peer.reconnect();
  });

  return peer;
}

/**
 * initializePeer
 * - Default: P2P-preferred (ICE policy 'all', STUN+TURN list).
 * - Optionally can initialize relay-only by passing options.relayOnly = true.
 */
function initializePeer(setPeerId, setIncomingCall, showNotification, options = {}) {
  const peerId = Math.random().toString(36).substring(2, 7).toUpperCase();
  const config = buildPeerConfig({ relayOnly: !!options.relayOnly });
  const peer = createPeerInstance(peerId, config, setPeerId, setIncomingCall, showNotification);

  // Expose peerId so we can recreate the peer for relay-only retry if desired.
  peer.__peerId = peerId;

  return peer;
}

/**
 * monitorConnection - Real-time diagnostics
 * Uses stats to infer whether the selected path is relay (TURN) or direct. [4](https://webrtc.github.io/samples/src/content/peerconnection/trickle-ice/)[1](https://rmauro.dev/webrtc-deep-dive-ice-turn-and-sfu/)
 */
function monitorConnection(call, onStatusUpdate) {
  if (!onStatusUpdate) return;
  const pc = call.peerConnection;

  const statsInterval = setInterval(async () => {
    if (!pc || pc.iceConnectionState === 'disconnected' || pc.iceConnectionState === 'closed') {
      clearInterval(statsInterval);
      return;
    }

    try {
      const stats = await pc.getStats();
      let connectionType = 'Searching…';
      let signalScore = 'Wait…';

      stats.forEach((report) => {
        // candidate-pair is a good place to read RTT for a “signal quality” indicator
        if (report.type === 'candidate-pair' && report.state === 'succeeded') {
          const rttMs = (report.currentRoundTripTime || 0) * 1000;
          if (rttMs && rttMs < 150) signalScore = 'Excellent';
          else if (rttMs && rttMs < 300) signalScore = 'Good';
          else if (rttMs) signalScore = 'Weak';
        }

        // remote-candidate may reveal relay vs host/srflx (not always present in all browsers)
        if (report.type === 'remote-candidate' && report.candidateType) {
          connectionType = report.candidateType === 'relay' ? 'Relayed (TURN)' : 'Direct (P2P)';
        }
      });

      onStatusUpdate({ type: connectionType, signal: signalScore });
    } catch (e) {
      console.error(e);
    }
  }, 2500);
}

/**
 * Wait for ICE to connect or fail. Used for timeout + retry logic.
 */
function waitForIceConnected(pc, timeoutMs = 15000) {
  return new Promise((resolve, reject) => {
    if (!pc) return reject(new Error('No RTCPeerConnection available'));

    const done = (ok, err) => {
      pc.removeEventListener('iceconnectionstatechange', onChange);
      clearTimeout(t);
      ok ? resolve(true) : reject(err || new Error('ICE failed'));
    };

    const onChange = () => {
      const s = pc.iceConnectionState;
      if (s === 'connected' || s === 'completed') done(true);
      if (s === 'failed') done(false, new Error('ICE failed'));
    };

    pc.addEventListener('iceconnectionstatechange', onChange);

    const t = setTimeout(() => {
      done(false, new Error('ICE timeout'));
    }, timeoutMs);

    // In case it already connected before we attached listener
    onChange();
  });
}

/**
 * makeCall
 * - Starts a call using the provided peer (P2P-preferred).
 * - If ICE fails/times out, optionally retries once with a relay-only peer.
 */
async function makeCall(peer, targetId, showNotification, onStatusUpdate, options = {}) {
  const {
    iceTimeoutMs = 15000,
    retryWithRelayOnly = true,
  } = options;

  let localStream;
  try {
    console.log('🚀 Starting call…');
    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

    const attempt = async (activePeer, label) => {
      console.log(`📡 Attempt: ${label}`);
      const call = activePeer.call(targetId, localStream);

      return new Promise((resolve, reject) => {
        let settled = false;

        call.on('stream', (remoteStream) => {
          if (settled) return;
          settled = true;
          console.log('✅ Media connected!');
          monitorConnection(call, onStatusUpdate);
          resolve({ call, localStream, remoteStream, mode: label });
        });

        call.on('error', (err) => {
          if (settled) return;
          settled = true;
          reject(err);
        });

        call.on('close', () => {
          // caller cleanup
          if (localStream) localStream.getTracks().forEach((t) => t.stop());
        });

        // Proactively watch ICE state; if it fails, reject quickly
        waitForIceConnected(call.peerConnection, iceTimeoutMs).catch((iceErr) => {
          if (settled) return;
          console.warn(`⚠️ ICE did not connect (${label}):`, iceErr.message);
          try { call.close(); } catch {}
          reject(iceErr);
        });
      });
    };

    // Attempt 1: P2P-preferred (ICE policy 'all' lets direct happen when possible) [1](https://rmauro.dev/webrtc-deep-dive-ice-turn-and-sfu/)[2](https://www.rtcinsights.com/blog/stun-turn-configuration/)
    try {
      return await attempt(peer, 'P2P-preferred');
    } catch (err1) {
      console.warn('Attempt 1 failed:', err1?.message || err1);

      // Optional Attempt 2: Relay-only retry
      if (!retryWithRelayOnly) throw err1;

      const peerId = peer.__peerId; // same id to keep UX consistent
      if (!peerId) throw err1;

      try {
        peer.destroy(); // stop old peer
      } catch {}

      const relayPeer = createPeerInstance(
        peerId,
        buildPeerConfig({ relayOnly: true }),
        () => {}, // peerId already known; caller can keep previous UI state
        () => {},
        showNotification
      );
      relayPeer.__peerId = peerId;

      // NOTE: remote side must also have TURN configured to succeed broadly.
      return await attempt(relayPeer, 'Relay-only');
    }
  } catch (error) {
    showNotification?.('Camera/mic access denied or unavailable.', 'error');
    if (localStream) localStream.getTracks().forEach((t) => t.stop());
    throw error;
  }
}

/**
 * answerCall - Answer incoming call
 * Note: The callee’s Peer instance must also be configured with TURN for widest compatibility. [2](https://www.rtcinsights.com/blog/stun-turn-configuration/)[5](https://stackoverflow.com/questions/78355423/webrtc-connection-works-only-for-local-network-or-same-network)
 */
async function answerCall(incomingCall, showNotification, onStatusUpdate) {
  let localStream;
  try {
    console.log('📥 Answering call…');
    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    incomingCall.answer(localStream);

    return new Promise((resolve, reject) => {
      incomingCall.on('stream', (remoteStream) => {
        monitorConnection(incomingCall, onStatusUpdate);
        resolve({ call: incomingCall, localStream, remoteStream });
      });

      incomingCall.on('error', (error) => reject(error));

      incomingCall.on('close', () => {
        if (localStream) localStream.getTracks().forEach((t) => t.stop());
      });
    });
  } catch (error) {
    showNotification?.('Answer error: camera/mic access denied.', 'error');
    if (localStream) localStream.getTracks().forEach((t) => t.stop());
    throw error;
  }
}
