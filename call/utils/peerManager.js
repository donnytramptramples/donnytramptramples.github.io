/**
 * peermanager.js - P2P Video Call Logic with TURN Relay Support
 */

function initializePeer(setPeerId, setIncomingCall, showNotification) {
  // CONFIGURATION: STUN for speed (P2P), TURN for reliability (Relay)
  const config = {
    iceServers: [
      // Standard Google STUN servers for direct P2P
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      
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
      }
    ],
    sdpSemantics: 'unified-plan'
  };

  // Generate a short 5-character ID (e.g., XJ39K)
  const peerId = Math.random().toString(36).substring(2, 7).toUpperCase();
  
  // Initialize PeerJS with our custom IceServer config
  const peer = new Peer(peerId, { 
    config: config,
    debug: 1 // set to 3 for full logs in console if it fails
  });

  peer.on('open', (id) => {
    console.log('Peer ID successfully registered:', id);
    setPeerId(id);
  });

  peer.on('error', (error) => {
    console.error('PeerJS Error:', error);
    showNotification('Connection error: ' + error.type, 'error');
  });

  peer.on('call', (call) => {
    console.log('Incoming call from peer:', call.peer);
    setIncomingCall(call);
  });

  return peer;
}

/**
 * Initiates an outgoing call to a target Peer ID
 */
async function makeCall(peer, targetId, showNotification) {
  try {
    // Request hardware access
    const localStream = await navigator.mediaDevices.getUserMedia({ 
      video: true, 
      audio: true 
    });

    // Start the P2P/Relay call
    const call = peer.call(targetId, localStream);
    
    return new Promise((resolve, reject) => {
      call.on('stream', (remoteStream) => {
        console.log('Remote stream received (Caller side)');
        resolve({
          call,
          localStream,
          remoteStream
        });
      });

      call.on('error', (error) => {
        console.error('Outgoing call error:', error);
        reject(error);
      });

      call.on('close', () => {
        console.log('Call connection terminated');
      });

      // Timeout if the friend doesn't answer within 30 seconds
      setTimeout(() => {
        reject(new Error('Call timeout: Peer did not answer.'));
      }, 30000);
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
    // Request local hardware access to send back our stream
    const localStream = await navigator.mediaDevices.getUserMedia({ 
      video: true, 
      audio: true 
    });

    // Answer the call with our local stream
    incomingCall.answer(localStream);

    return new Promise((resolve, reject) => {
      incomingCall.on('stream', (remoteStream) => {
        console.log('Remote stream received (Receiver side)');
        resolve({
          call: incomingCall,
          localStream,
          remoteStream
        });
      });

      incomingCall.on('error', (error) => {
        console.error('Answer logic error:', error);
        reject(error);
      });

      incomingCall.on('close', () => {
        console.log('Call connection terminated');
      });
    });
  } catch (error) {
    console.error('Failed to answer call:', error);
    throw error;
  }
}
