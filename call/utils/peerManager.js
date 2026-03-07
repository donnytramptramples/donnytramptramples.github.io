function initializePeer(setPeerId, setIncomingCall, showNotification) {
  const config = {
    iceServers: [
      // Google STUN servers
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      { urls: 'stun:stun3.l.google.com:19302' },
      { urls: 'stun:stun4.l.google.com:19302' },
      
      // Free ExpressTURN servers - Multiple protocols
      {
        urls: 'turn:free.expressturn.com:3478',
        username: '00000000208826051',
        credential: 'e71gwsVWcjwaAmaW1TjZwW34vZI='
      },
      {
        urls: 'turn:free.expressturn.com:3478?transport=tcp',
        username: '00000000208826051',
        credential: 'e71gwsVWcjwaAmaW1TjZwW34vZI='
      },
      {
        urls: 'turns:free.expressturn.com:5349',
        username: '00000000208826051',
        credential: 'e71gwsVWcjwaAmaW1TjZwW34vZI='
      },
      
      // OpenRelay TURN servers
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
      
      // Twilio STUN
      { urls: 'stun:global.stun.twilio.com:3478' }
    ],
    iceTransportPolicy: 'all',
    sdpSemantics: 'unified-plan'
  };

  const peerId = Math.random().toString(36).substring(2, 7).toUpperCase();
  
  const peer = new Peer(peerId, { 
    config: config,
    debug: 2
  });

  peer.on('open', (id) => {
    console.log('Peer ID registered:', id);
    setPeerId(id);
  });

  peer.on('error', (error) => {
    console.error('PeerJS Error:', error);
    showNotification('Connection error: ' + error.type, 'error');
  });

  peer.on('call', (call) => {
    console.log('Incoming call from:', call.peer);
    setIncomingCall(call);
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
        console.log('Call timeout');
        reject(new Error('CONNECTION_TIMEOUT'));
      }, 30000);

      call.on('stream', (remoteStream) => {
        clearTimeout(timeout);
        console.log('Remote stream received');
        resolve({
          call,
          localStream,
          remoteStream
        });
      });

      call.on('error', (error) => {
        clearTimeout(timeout);
        console.error('Call error:', error);
        localStream.getTracks().forEach(track => track.stop());
        reject(error);
      });
    });
  } catch (error) {
    console.error('Media access error:', error);
    showNotification('Cannot access camera/microphone', 'error');
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
      incomingCall.on('stream', (remoteStream) => {
        console.log('Remote stream received (answer)');
        resolve({
          call: incomingCall,
          localStream,
          remoteStream
        });
      });

      incomingCall.on('error', (error) => {
        console.error('Answer error:', error);
        reject(error);
      });
    });
  } catch (error) {
    console.error('Answer failed:', error);
    throw error;
  }
}