// Generate random 5-character peer ID
function generatePeerId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = '';
  for (let i = 0; i < 5; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

// Initialize peer connection
function initializePeer(setPeerId, setIncomingCall, setNotification) {
  const peerId = generatePeerId();
  const peer = new Peer(peerId);

  peer.on('open', (id) => {
    console.log('Peer connected with ID:', id);
    setPeerId(id);
  });

  peer.on('call', (call) => {
    console.log('Incoming call from:', call.peer);
    setIncomingCall(call);
  });

  peer.on('error', (error) => {
    console.error('Peer error:', error);
    setNotification?.('Connection error: ' + error.type, 'error');
  });

  return peer;
}

// Make outgoing call
async function makeCall(peer, targetId, showNotification) {
  return new Promise(async (resolve, reject) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });

      const call = peer.call(targetId, stream);
      let remoteStream = null;
      let connectionTimeout;

      connectionTimeout = setTimeout(() => {
        if (!remoteStream) {
          call.close();
          stream.getTracks().forEach(track => track.stop());
          reject(new Error('P2P_TIMEOUT'));
        }
      }, 10000);

      call.on('stream', (remote) => {
        clearTimeout(connectionTimeout);
        remoteStream = remote;
        console.log('Received remote stream');
        resolve({
          call,
          localStream: stream,
          remoteStream: remote
        });
      });

      call.on('error', (error) => {
        clearTimeout(connectionTimeout);
        console.error('Call error:', error);
        stream.getTracks().forEach(track => track.stop());
        reject(error);
      });

      call.on('close', () => {
        clearTimeout(connectionTimeout);
        stream.getTracks().forEach(track => track.stop());
      });
    } catch (error) {
      console.error('Media error:', error);
      showNotification?.('Camera/microphone access denied', 'error');
      reject(error);
    }
  });
}

// Answer incoming call
async function answerCall(incomingCall) {
  return new Promise(async (resolve, reject) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });

      incomingCall.answer(stream);
      let remoteStream = null;

      incomingCall.on('stream', (remote) => {
        remoteStream = remote;
        console.log('Received remote stream');
        resolve({
          call: incomingCall,
          localStream: stream,
          remoteStream: remote
        });
      });

      incomingCall.on('error', (error) => {
        console.error('Answer call error:', error);
        stream.getTracks().forEach(track => track.stop());
        reject(error);
      });

      incomingCall.on('close', () => {
        stream.getTracks().forEach(track => track.stop());
      });
    } catch (error) {
      console.error('Media error:', error);
      reject(error);
    }
  });
}

// Start Jitsi call as fallback
function startJitsiCall(peerId, targetId) {
  const ids = [peerId, targetId].sort();
  const roomName = `p2p-${ids[0]}-${ids[1]}`;
  return { roomName };
}