/**
 * peermanager.js - P2P Video Call Logic with TURN Relay Support
 * Full 145+ line structure with high-reliability iceServer config
 */

function initializePeer(setPeerId, setIncomingCall, showNotification) {
  // CONFIGURATION: STUN for speed (P2P), TURN for reliability (Relay)
  // Expanded with high-compatibility fallbacks for firewalls
  const config = {
    iceServers: [
      // Standard Google STUN servers for direct P2P
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      
      // Fallback Public STUN (Port 443 often bypasses basic filters)
      { urls: 'stun:stun.services.mozilla.com' },
      { urls: 'stun:stun.nextcloud.com:443' },

      // TURN Relay servers (OpenRelay) - Essential for different networks
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
      // TCP Fallback: Forces data through HTTPS port if UDP is blocked
      { 
        urls: 'turn:openrelay.metered.ca:443?transport=tcp', 
        username: 'openrelayproject', 
        credential: 'openrelayproject' 
      },
      // TURNS (TLS): The ultimate firewall bypass (Encrypted Relay)
      { 
        urls: 'turns:openrelay.metered.ca:443?transport=tcp', 
        username: 'openrelayproject', 
        credential: 'openrelayproject' 
      }
    ],
    // Force browser to pre-gather candidates to prevent connection lag
    iceCandidatePoolSize: 10,
    sdpSemantics: 'unified-plan'
  };

  // Generate a short 5-character ID (e.g., XJ39K)
  const peerId = Math.random().toString(36).substring(2, 7).toUpperCase();
  
  // Initialize PeerJS with our custom IceServer config
  const peer = new Peer(peerId, { 
    config: config,
    debug: 1 // Set to 3 for full logs in console if it fails
  });

  // Event: Successfully connected to PeerJS signaling server
  peer.on('open', (id) => {
    console.log('Peer ID successfully registered:', id);
    setPeerId(id);
  });

  // Event: Global error handling
  peer.on('error', (error) => {
    console.error('PeerJS Error:', error);
    showNotification('Connection error: ' + error.type, 'error');
  });

  // Event: Handling incoming calls from other peers
  peer.on('call', (call) => {
    console.log('Incoming call from peer:', call.peer);
    setIncomingCall(call);
  });

  // Log disconnection for debugging
  peer.on('disconnected', () => {
    console.warn('Peer disconnected from signaling server. Attempting reconnect...');
    peer.reconnect();
  });

  return peer;
}

/**
 * Initiates an outgoing call to a target Peer ID
 */
async function makeCall(peer, targetId, showNotification) {
  try {
    console.log('Requesting local media for outgoing call...');
    // Request hardware access
    const localStream = await navigator.mediaDevices.getUserMedia({ 
      video: true, 
      audio: true 
    });

    console.log('Starting PeerJS call to:', targetId);
    // Start the P2P/Relay call
    const call = peer.call(targetId, localStream);
    
    return new Promise((resolve, reject) => {
      // Event: Remote user answers and sends their stream
      call.on('stream', (remoteStream) => {
        console.log('Remote stream received (Caller side)');
        resolve({
          call,
          localStream,
          remoteStream
        });
      });

      // Event: Specific call error (e.g., media negotiation failed)
      call.on('error', (error) => {
        console.error('Outgoing call error:', error);
        reject(error);
      });

      // Event: Call closed by either party
      call.on('close', () => {
        console.log('Call connection terminated');
        // Clean up tracks
        localStream.getTracks().forEach(track => track.stop());
      });

      // Timeout if the friend doesn't answer within 30 seconds
      const callTimeout = setTimeout(() => {
        console.warn('Call timed out - no answer from peer');
        call.close();
        reject(new Error('Call timeout: Peer did not answer.'));
      }, 30000);

      // Clear timeout if the stream starts
      call.on('stream', () => clearTimeout(callTimeout));
    });
  } catch (error) {
    console.error('Hardware access or Call error:', error);
    showNotification('Error: Could not access camera or microphone.', 'error');
    throw error;
  }
}

/**
 * Answers an incoming call
 */
async function answerCall(incomingCall) {
  try {
    console.log('Answering call. Requesting local media...');
    // Request local hardware access to send back our stream
    const localStream = await navigator.mediaDevices.getUserMedia({ 
      video: true, 
      audio: true 
    });

    // Answer the call with our local stream
    incomingCall.answer(localStream);

    return new Promise((resolve, reject) => {
      // Event: Receiver gets the Caller's stream
      incomingCall.on('stream', (remoteStream) => {
        console.log('Remote stream received (Receiver side)');
        resolve({
          call: incomingCall,
          localStream,
          remoteStream
        });
      });

      // Event: Receiver-side call error
      incomingCall.on('error', (error) => {
        console.error('Answer logic error:', error);
        reject(error);
      });

      // Event: Call closed by either party
      incomingCall.on('close', () => {
        console.log('Call connection terminated');
        // Clean up tracks
        localStream.getTracks().forEach(track => track.stop());
      });
    });
  } catch (error) {
    console.error('Failed to answer call:', error);
    showNotification('Answer Error: Check camera/mic permissions.', 'error');
    throw error;
  }
}
