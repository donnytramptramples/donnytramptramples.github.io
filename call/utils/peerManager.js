function initializePeer(setPeerId, setIncomingCall, showNotification) {
  const config = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      { urls: 'stun:stun3.l.google.com:19302' },
      { urls: 'stun:stun4.l.google.com:19302' }
    ],
    sdpSemantics: 'unified-plan'
  };

  const peerId = Math.random().toString(36).substring(2, 7).toUpperCase();
  const peer = new Peer(peerId, { config });

  peer.on('open', (id) => {
    console.log('Peer ID:', id);
    setPeerId(id);
  });

  peer.on('error', (error) => {
    console.error('Peer error:', error);
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
      call.on('stream', (remoteStream) => {
        console.log('Received remote stream');
        resolve({
          call,
          localStream,
          remoteStream
        });
      });

      call.on('error', (error) => {
        console.error('Call error:', error);
        reject(error);
      });

      call.on('close', () => {
        console.log('Call closed');
      });

      setTimeout(() => {
        reject(new Error('Call timeout'));
      }, 30000);
    });
  } catch (error) {
    console.error('Make call error:', error);
    showNotification('Could not access camera/microphone', 'error');
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
        console.log('Received remote stream');
        resolve({
          call: incomingCall,
          localStream,
          remoteStream
        });
      });

      incomingCall.on('error', (error) => {
        console.error('Answer call error:', error);
        reject(error);
      });

      incomingCall.on('close', () => {
        console.log('Call closed');
      });
    });
  } catch (error) {
    console.error('Answer call error:', error);
    throw error;
  }
}
