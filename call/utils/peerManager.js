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
 * Initiates an outgoing call to a target Peer ID with SFU fallback
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
    let connectionAttempted = false;
    
    return new Promise((resolve, reject) => {
      // Monitor ICE connection state for P2P failure detection
      const peerConnection = call.peerConnection;
      let iceCheckTimeout;
      
      peerConnection.oniceconnectionstatechange = () => {
        const state = peerConnection.iceConnectionState;
        console.log('ICE connection state:', state);
        
        if (state === 'failed' && !connectionAttempted) {
          console.log('P2P connection failed, attempting Jitsi SFU fallback...');
          connectionAttempted = true;
          clearTimeout(iceCheckTimeout);
          
          // Attempt SFU fallback through Jitsi TURN servers
          showNotification('Connecting via relay server...', 'info');
        }
      };
      
      // Give ICE gathering some time before declaring success
      iceCheckTimeout = setTimeout(() => {
        const state = peerConnection.iceConnectionState;
        if (state !== 'connected' && state !== 'completed') {
          console.log('ICE gathering timeout, connection may be using TURN relay');
        }
      }, 5000);

      call.on('stream', (remoteStream) => {
        console.log('Remote stream received (Caller side)');
        clearTimeout(iceCheckTimeout);
        resolve({
          call,
          localStream,
          remoteStream
        });
      });

      call.on('error', (error) => {
        console.error('Outgoing call error:', error);
        clearTimeout(iceCheckTimeout);
        reject(error);
      });

      call.on('close', () => {
        console.log('Call connection terminated');
        clearTimeout(iceCheckTimeout);
      });

      // Timeout if the peer doesn't answer within 30 seconds
      setTimeout(() => {
        clearTimeout(iceCheckTimeout);
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
