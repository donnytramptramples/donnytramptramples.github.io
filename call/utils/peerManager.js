/**
 * peermanager.js - Extreme Firewall Bypass (Version 11.0)
 * Multi-Provider, Multi-Port, Multi-Protocol Stealth Tunneling
 */

function initializePeer(setPeerId, setIncomingCall, showNotification) {
  const config = {
    // We keep 'all' to allow P2P on same-wifi, but add massive relay fallbacks.
    iceTransportPolicy: 'all', 
    iceCandidatePoolSize: 10,
    iceServers: [
      // --- LAYER 1: Standard STUN (Google/Cloudflare IPs) ---
      { urls: 'stun:74.125.192.127:19302' }, 
      { urls: 'stun:172.64.155.249:3478' },
      { urls: 'stun:stun.nextcloud.com:443' },

      // --- LAYER 2: Metered.ca IP-BASED (Bypasses DNS Block) ---
      { urls: 'turn:3.7.12.152:80', username: 'openrelayproject', credential: 'openrelayproject' },
      { urls: 'turn:3.7.12.152:443', username: 'openrelayproject', credential: 'openrelayproject' },
      { urls: 'turn:3.7.12.152:443?transport=tcp', username: 'openrelayproject', credential: 'openrelayproject' },
      { urls: 'turns:3.7.12.152:443?transport=tcp', username: 'openrelayproject', credential: 'openrelayproject' },

      // --- LAYER 3: Xirsys Global Relays (Different Infrastructure) ---
      // If the school blocked the Metered IP range, they might not block Xirsys.
      { urls: 'turn:://global.xirsys.com', username: 'guest', credential: 'guest' },
      { urls: 'turn:://global.xirsys.com', username: 'guest', credential: 'guest' },
      { urls: 'turns:://global.xirsys.com', username: 'guest', credential: 'guest' },

      // --- LAYER 4: DNS Port Fallback (Port 53) ---
      // Firewalls often leave Port 53 open for DNS traffic.
      { urls: 'turn:3.7.12.152:53?transport=udp', username: 'openrelayproject', credential: 'openrelayproject' },

      // --- LAYER 5: Alternative Public Relays ---
      { urls: 'turn:numb.viagenie.ca', username: 'guest@numb.viagenie.ca', credential: 'guest' },
      { urls: 'turn:stun.l.google.com:19302' }
    ],
    sdpSemantics: 'unified-plan'
  };

  const peerId = Math.random().toString(36).substring(2, 7).toUpperCase();
  const peer = new Peer(peerId, { config: config, debug: 1 });

  peer.on('open', (id) => {
    console.log('✅ Stealth ID Registered:', id);
    setPeerId(id);
  });

  peer.on('error', (error) => {
    console.error('❌ Signaling/Network Error:', error);
    showNotification('Link error: ' + error.type, 'error');
  });

  peer.on('call', (call) => setIncomingCall(call));

  peer.on('disconnected', () => {
    console.warn('⚠️ Link lost. Attempting stealth reconnect...');
    peer.reconnect();
  });

  return peer;
}

/**
 * monitorConnection - Real-time diagnostics
 */
function monitorConnection(call, onStatusUpdate) {
  if (!onStatusUpdate) return;
  const pc = call.peerConnection;
  const statsInterval = setInterval(async () => {
    if (pc.iceConnectionState === 'disconnected' || pc.iceConnectionState === 'closed') {
      clearInterval(statsInterval);
      return;
    }
    try {
      const stats = await pc.getStats();
      let connectionType = "Searching...";
      let signalScore = "Wait...";

      stats.forEach(report => {
        if (report.type === 'remote-candidate') {
          connectionType = report.candidateType === 'relay' ? "Relayed (Bypass Active)" : "Direct (P2P)";
        }
        if (report.type === 'candidate-pair' && report.state === 'succeeded') {
          const rtt = report.currentRoundTripTime * 1000; 
          if (rtt < 150) signalScore = "Excellent";
          else if (rtt < 300) signalScore = "Good";
          else signalScore = "Weak";
        }
      });
      onStatusUpdate({ type: connectionType, signal: signalScore });
    } catch (e) { console.error(e); }
  }, 2500);
}

/**
 * makeCall - Initiates call with massive fallback window
 */
async function makeCall(peer, targetId, showNotification, onStatusUpdate) {
  try {
    console.log('🚀 Launching stealth handshake...');
    const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    const call = peer.call(targetId, localStream);
    
    return new Promise((resolve, reject) => {
      call.on('stream', (remoteStream) => {
        console.log('💎 Handshake success!');
        monitorConnection(call, onStatusUpdate);
        resolve({ call, localStream, remoteStream });
      });

      call.on('error', (err) => reject(err));
      call.on('close', () => {
        localStream.getTracks().forEach(track => track.stop());
      });

      // Increased timeout to 45s to allow the browser to try EVERY fallback server
      const callTimeout = setTimeout(() => {
        call.close();
        reject(new Error('Handshake failed. School DPI is blocking all 12 fallback routes.'));
      }, 45000);

      call.on('stream', () => clearTimeout(callTimeout));
    });
  } catch (error) {
    showNotification('Camera access denied.', 'error');
    throw error;
  }
}

/**
 * answerCall - Processes and responds to a call
 */
async function answerCall(incomingCall, onStatusUpdate) {
  try {
    console.log('📥 Answering via stealth link...');
    const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    incomingCall.answer(localStream);
    return new Promise((resolve, reject) => {
      incomingCall.on('stream', (remoteStream) => {
        monitorConnection(incomingCall, onStatusUpdate);
        resolve({ call: incomingCall, localStream, remoteStream });
      });
      incomingCall.on('error', (error) => reject(error));
      incomingCall.on('close', () => {
        localStream.getTracks().forEach(track => track.stop());
      });
    });
  } catch (error) {
    showNotification('Answer Error: Access denied.', 'error');
    throw error;
  }
}
