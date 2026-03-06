/**
 * peermanager.js - High-Reliability P2P Video Call Logic
 * Version: 2.1 (Extreme Firewall Bypass)
 * Purpose: Ensures connectivity on restricted school/corporate networks.
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
 * makeCall - Initiates an outgoing video/audio call
 * @param {Object} peer - The local Peer instance
 * @param {String} targetId - The remote Peer ID to call
 */
async function makeCall(peer, targetId, showNotification) {
  try {
    console.log('🚀 Attempting to start outgoing call...');
    
    // Request access to hardware (Camera/Mic). 
    // Fails here if "NotAllowedError" appears.
    const localStream = await navigator.mediaDevices.getUserMedia({ 
      video: true, 
      audio: true 
    });

    console.log('📡 Signaling peer:', targetId);
    const call = peer.call(targetId, localStream);
    
    return new Promise((resolve, reject) => {
      // Event: Remote peer answers and media starts flowing.
      call.on('stream', (remoteStream) => {
        console.log('💎 Media stream established successfully!');
        resolve({
          call,
          localStream,
          remoteStream
        });
      });

      // Event: Specific negotiation or connection error.
      call.on('error', (error) => {
        console.error('⚠️ Call connection failed:', error);
        reject(error);
      });

      // Cleanup: Stops the camera light when the call is closed.
      call.on('close', () => {
        console.log('🛑 Call terminated.');
        localStream.getTracks().forEach(track => track.stop());
      });

      // 30-Second Timeout: Fails if the network blocks the handshake.
      const callTimeout = setTimeout(() => {
        console.warn('⌛ Call timed out - no answer from receiver.');
        call.close();
        reject(new Error('Connection timed out. The school firewall may be blocking P2P/Relay traffic.'));
      }, 30000);

      // Clear the timeout if we actually get a stream.
      call.on('stream', () => clearTimeout(callTimeout));
    });
  } catch (error) {
    console.error('❌ Outgoing call system error:', error);
    showNotification('Hardware Error: Ensure camera and mic are permitted.', 'error');
    throw error;
  }
}

/**
 * answerCall - Processes and responds to an incoming call
 * @param {Object} incomingCall - The PeerJS call object
 */
async function answerCall(incomingCall) {
  try {
    console.log('📥 Processing answer for call from:', incomingCall.peer);
    
    // Receiver must also provide a local stream to the caller.
    const localStream = await navigator.mediaDevices.getUserMedia({ 
      video: true, 
      audio: true 
    });

    // Answer the call using our local camera/mic stream.
    incomingCall.answer(localStream);

    return new Promise((resolve, reject) => {
      // Event: Media from the caller is received.
      incomingCall.on('stream', (remoteStream) => {
        console.log('💎 Remote media received on receiver side.');
        resolve({
          call: incomingCall,
          localStream,
          remoteStream
        });
      });

      // Event: Receiver-side connection error.
      incomingCall.on('error', (error) => {
        console.error('⚠️ Answer logic error:', error);
        reject(error);
      });

      // Cleanup: Stops the camera light when the call is closed.
      incomingCall.on('close', () => {
        console.log('🛑 Call terminated by peer.');
        localStream.getTracks().forEach(track => track.stop());
      });
    });
  } catch (error) {
    console.error('❌ Failed to answer call:', error);
    showNotification('Answer Error: Access to camera or microphone denied.', 'error');
    throw error;
  }
}
