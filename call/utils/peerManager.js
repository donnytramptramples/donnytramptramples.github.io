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
    console.error('Error type:', err.type);
    console.error('Error message:', err.message);
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
    
    console.log('Calling peer:', targetId);
    console.log('Local stream tracks:', stream.getTracks());
    
    return new Promise((resolve, reject) => {
      call.on('stream', (remoteStream) => {
        console.log('Received remote stream');
        console.log('Remote stream tracks:', remoteStream.getTracks());
        resolve({ call, localStream: stream, remoteStream });
      });

      call.on('error', (err) => {
        console.error('Call error:', err);
        showNotification('Call failed', 'error');
        reject(err);
      });

      call.on('close', () => {
        console.log('Call closed');
      });

      setTimeout(() => {
        console.error('Call timeout after 30 seconds');
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
    
    console.log('Answering call from:', call.peer);
    console.log('Local stream tracks:', stream.getTracks());
    
    call.answer(stream);
    
    return new Promise((resolve, reject) => {
      call.on('stream', (remoteStream) => {
        console.log('Received remote stream');
        console.log('Remote stream tracks:', remoteStream.getTracks());
        resolve({ call, localStream: stream, remoteStream });
      });

      call.on('error', (err) => {
        console.error('Answer call error:', err);
        reject(err);
      });

      call.on('close', () => {
        console.log('Call closed');
      });
    });
  } catch (error) {
    showNotification('Could not access camera/microphone', 'error');
    throw error;
  }
}