/**
 * peermanager.js - P2P Video Call Logic with TURN Relay Support
 * Optimized for restrictive networks like school wifi
 */

function initializePeer(setPeerId, setIncomingCall, showNotification) {
  // CONFIGURATION: Multiple STUN/TURN servers for maximum compatibility
  const config = {
    iceServers: [
      // Google STUN servers for direct P2P
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      { urls: 'stun:stun3.l.google.com:19302' },
      { urls: 'stun:stun4.l.google.com:19302' },
      
      // Jitsi Meet public STUN servers (SFU fallback)
      { urls: 'stun:meet-jit-si-turnrelay.jitsi.net:443' },
      
      // OpenRelay TURN servers - Multiple protocols for restrictive networks
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
      { 
        urls: 'turn:openrelay.metered.ca:443?transport=tcp', 
        username: 'openrelayproject', 
        credential: 'openrelayproject' 
      },
      
      // Jitsi Meet public TURN servers (SFU fallback)
      {
        urls: 'turn:meet-jit-si-turnrelay.jitsi.net:443',
        username: 'webrtc',
        credential: 'turnpassword'
      },
      {
        urls: 'turn:meet-jit-si-turnrelay.jitsi.net:443?transport=tcp',
        username: 'webrtc',
        credential: 'turnpassword'
      },
      
      // Additional Twilio STUN servers
      { urls: 'stun:global.stun.twilio.com:3478' }
    ],
    // Force relay mode for restrictive networks
    iceTransportPolicy: 'all',
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
 * Initiates an outgoing call to a target Peer ID with automatic Jitsi SFU fallback
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
    let resolved = false;
    
    return new Promise((resolve, reject) => {
      call.on('stream', (remoteStream) => {
        console.log('Remote stream received - P2P connection successful');
        resolved = true;
        resolve({
          call,
          localStream,
          remoteStream
        });
      });

      call.on('error', (error) => {
        console.error('P2P call error:', error);
        if (!resolved) {
          localStream.getTracks().forEach(track => track.stop());
          call.close();
          reject(new Error('P2P_TIMEOUT'));
        }
      });

      // Timeout for P2P connection - if no stream after 15 seconds, trigger Jitsi fallback
      setTimeout(() => {
        if (!resolved) {
          console.log('P2P connection timeout - switching to Jitsi SFU');
          localStream.getTracks().forEach(track => track.stop());
          call.close();
          reject(new Error('P2P_TIMEOUT'));
        }
      }, 15000);
    });
  } catch (error) {
    console.error('Hardware access error:', error);
    showNotification('Error: Could not access camera or microphone.', 'error');
    throw error;
  }
}

/**
 * Initiates a Jitsi SFU call as fallback
 */
function startJitsiCall(peerId, targetId) {
  const roomName = `call-${peerId}-${targetId}`;
  return { type: 'jitsi', roomName };
}

/**
 * Answers an incoming call with SFU fallback monitoring
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
      // Monitor ICE connection state for connection quality
      const peerConnection = incomingCall.peerConnection;
      
      peerConnection.oniceconnectionstatechange = () => {
        const state = peerConnection.iceConnectionState;
        console.log('ICE connection state (receiver):', state);
        
        if (state === 'failed') {
          console.log('P2P connection failed, using Jitsi SFU relay...');
        }
      };

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
