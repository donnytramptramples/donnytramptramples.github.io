/**
 * peermanager.js - High-Reliability P2P Video Call Logic
 * Version: 3.0 (Extreme Firewall Bypass + Connection Diagnostics)
 * Purpose: Ensures connectivity on restricted school networks and monitors signal.
 */

function initializePeer(setPeerId, setIncomingCall, showNotification) {
  // CONFIGURATION: Multi-layered STUN/TURNS strategy.
  // We prioritize TLS-wrapped TCP relay to mimic standard HTTPS web traffic.
  const config = {
    iceServers: [
      // --- LAYER 1: Standard STUN (Fastest, but often blocked by schools) ---
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      
      // --- LAYER 2: Advanced STUN (Uses Port 443 to bypass basic filters) ---
      { urls: 'stun:stun.services.mozilla.com' },
      { urls: 'stun:stun.nextcloud.com:443' },
      { urls: 'stun:stun.l.google.com:19305' },

      // --- LAYER 3: TURN Relays (The "Workhorses" for restricted networks) ---
      // These act as an intermediate server when P2P is blocked.
      { 
        urls: 'turn:openrelay.metered.ca:80', 
        username: 'openrelayproject', 
        credential: 'openrelayproject' 
      },
      { 
        urls: 'turn:openrelay.metered.ca:443', 
        username: 'openrelayproject', 
        credential: 'openrelayproject' 
      },
      
      // --- LAYER 4: The "School Bypass" (TCP + TLS) ---
      // transport=tcp: Forces the data through standard web protocols.
      // turns: Wraps the video data in SSL encryption (mimics HTTPS).
      { 
        urls: 'turn:openrelay.metered.ca:443?transport=tcp', 
        username: 'openrelayproject', 
        credential: 'openrelayproject' 
      },
      { 
        urls: 'turns:openrelay.metered.ca:443?transport=tcp', 
        username: 'openrelayproject', 
        credential: 'openrelayproject' 
      }
    ],
    // iceCandidatePoolSize: Pre-gathers candidates to speed up connection on slow WiFi.
    iceCandidatePoolSize: 10,
    sdpSemantics: 'unified-plan'
  };

  // Generate a unique 5-character ID for the user (e.g., A7B9C)
  const peerId = Math.random().toString(36).substring(2, 7).toUpperCase();
  
  // Initialize PeerJS with the reinforced IceServer configuration.
  const peer = new Peer(peerId, { 
    config: config,
    debug: 1 // Set to 3 if you need to debug the ICE gathering process in console.
  });

  // Event: Fired when the signaling server assigns the Peer ID.
  peer.on('open', (id) => {
    console.log('✅ Peer ID registered with signaling server:', id);
    setPeerId(id);
  });

  // Event: Global PeerJS error handling (e.g., network timeout, disconnected).
  peer.on('error', (error) => {
    console.error('❌ PeerJS Global Error:', error);
    showNotification('Network connection error: ' + error.type, 'error');
  });

  // Event: Handling an incoming call request from a remote peer.
  peer.on('call', (call) => {
    console.log('📞 Incoming call detected from:', call.peer);
    setIncomingCall(call);
  });

  // Reconnection logic: Helps maintain presence on spotty school Wi-Fi.
  peer.on('disconnected', () => {
    console.warn('⚠️ Signaling disconnected. Attempting to re-establish link...');
    peer.reconnect();
  });

  return peer;
}

/**
 * monitorConnection - Internal helper to track P2P vs Relay and Signal Strength
 */
function monitorConnection(call, onStatusUpdate) {
  if (!onStatusUpdate) return;

  const pc = call.peerConnection;
  const statsInterval = setInterval(async () => {
    if (pc.iceConnectionState === 'disconnected' || pc.iceConnectionState === 'closed') {
      clearInterval(statsInterval);
      return;
    }

    try {
      const stats = await pc.getStats();
      let connectionType = "Checking...";
      let signalScore = "Calculating...";

      stats.forEach(report => {
        // Identify if connection is Direct or Relayed
        if (report.type === 'remote-candidate') {
          connectionType = report.candidateType === 'relay' ? "Relayed (Firewall Bypass)" : "Direct (P2P)";
        }
        // Identify Signal Strength via Round Trip Time
        if (report.type === 'candidate-pair' && report.state === 'succeeded') {
          const rtt = report.currentRoundTripTime * 1000; 
          if (rtt < 150) signalScore = "Excellent";
          else if (rtt < 300) signalScore = "Good";
          else signalScore = "Weak";
        }
      });

      onStatusUpdate({ type: connectionType, signal: signalScore });
    } catch (e) {
      console.error("Stats monitoring error:", e);
    }
  }, 2500);
}

/**
 * makeCall - Initiates an outgoing video/audio call
 */
async function makeCall(peer, targetId, showNotification, onStatusUpdate) {
  try {
    console.log('🚀 Attempting to start outgoing call...');
    
    const localStream = await navigator.mediaDevices.getUserMedia({ 
      video: true, 
      audio: true 
    });

    console.log('📡 Signaling peer:', targetId);
    const call = peer.call(targetId, localStream);
    
    return new Promise((resolve, reject) => {
      call.on('stream', (remoteStream) => {
        console.log('💎 Media stream established successfully!');
        // Start connection monitoring
        monitorConnection(call, onStatusUpdate);
        resolve({
          call,
          localStream,
          remoteStream
        });
      });

      call.on('error', (error) => {
        console.error('⚠️ Call connection failed:', error);
        reject(error);
      });

      call.on('close', () => {
        console.log('🛑 Call terminated.');
        localStream.getTracks().forEach(track => track.stop());
      });

      const callTimeout = setTimeout(() => {
        console.warn('⌛ Call timed out - no answer from receiver.');
        call.close();
        reject(new Error('Connection timed out. Firewall likely blocking relay.'));
      }, 30000);

      call.on('stream', () => clearTimeout(callTimeout));
    });
  } catch (error) {
    console.error('❌ Outgoing call system error:', error);
    showNotification('Hardware Error: Check camera permissions.', 'error');
    throw error;
  }
}

/**
 * answerCall - Processes and responds to an incoming call
 */
async function answerCall(incomingCall, onStatusUpdate) {
  try {
    console.log('📥 Processing answer for call from:', incomingCall.peer);
    
    const localStream = await navigator.mediaDevices.getUserMedia({ 
      video: true, 
      audio: true 
    });

    incomingCall.answer(localStream);

    return new Promise((resolve, reject) => {
      incomingCall.on('stream', (remoteStream) => {
        console.log('💎 Remote media received on receiver side.');
        // Start connection monitoring
        monitorConnection(incomingCall, onStatusUpdate);
        resolve({
          call: incomingCall,
          localStream,
          remoteStream
        });
      });

      incomingCall.on('error', (error) => {
        console.error('⚠️ Answer logic error:', error);
        reject(error);
      });

      incomingCall.on('close', () => {
        console.log('🛑 Call terminated by peer.');
        localStream.getTracks().forEach(track => track.stop());
      });
    });
  } catch (error) {
    console.error('❌ Failed to answer call:', error);
    showNotification('Answer Error: Access denied.', 'error');
    throw error;
  }
}
