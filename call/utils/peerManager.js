function generatePeerId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = '';
  for (let i = 0; i < 5; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

function initializePeer(setPeerId, setIncomingCall, showNotification) {
  const id = generatePeerId();
  const peer = new Peer(id, {
    config: {
      iceServers: []
    }
  });

  peer.on('open', (id) => {
    setPeerId(id);
  });

  peer.on('call', (call) => {
    setIncomingCall(call);
  });

  peer.on('error', (err) => {
    console.error('Peer error:', err);
    showNotification('Connection error occurred', 'error');
  });

  return peer;
}

async function makeCall(peer, targetId, showNotification) {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: true, 
      audio: true 
    });
    
    const call = peer.call(targetId, stream);
    
    return new Promise((resolve, reject) => {
      call.on('stream', (remoteStream) => {
        resolve({ call, localStream: stream, remoteStream });
      });

      call.on('error', (err) => {
        showNotification('Call failed', 'error');
        reject(err);
      });

      setTimeout(() => {
        reject(new Error('Call timeout'));
      }, 30000);
    });
  } catch (error) {
    showNotification('Could not access camera/microphone', 'error');
    throw error;
  }
}

async function answerCall(call, showNotification) {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: true, 
      audio: true 
    });
    
    call.answer(stream);
    
    return new Promise((resolve) => {
      call.on('stream', (remoteStream) => {
        resolve({ call, localStream: stream, remoteStream });
      });
    });
  } catch (error) {
    showNotification('Could not access camera/microphone', 'error');
    throw error;
  }
}