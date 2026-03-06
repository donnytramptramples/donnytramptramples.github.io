/**
 * peermanager.js - Smart Hybrid P2P/Relay Edition
 * Version: 8.5 (P2P-First with IP-Based Stealth Fallback)
 */

function initializePeer(setPeerId, setIncomingCall, showNotification) {
  // CONFIGURATION: Multi-layered strategy. 
  // We use direct IPs (3.7.12.152) to bypass school domain-level blocking.
  const config = {
    // 'all' ensures it tests P2P (same Wi-Fi) first. 
    // It will automatically move to TURN if P2P is blocked.
    iceTransportPolicy: 'all', 
    iceCandidatePoolSize: 10,
    iceServers: [
      // --- LAYER 1: STUN (IP-based to avoid DNS blocking) ---
      { urls: 'stun:74.125.192.127:19302' }, // Google IP
      { urls: 'stun:172.64.155.249:3478' },  // Cloudflare IP
      { urls: 'stun:stun.nextcloud.com:443' },

      // --- LAYER 2: TURN (Standard UDP) ---
      { 
        urls: 'turn:3.7.12.152:80', 
        username: 'openrelayproject', 
        credential: 'openrelayproject' 
      },
      { 
        urls: 'turn:3.7.12.152:443', 
        username: 'openrelayproject', 
        credential: 'openrelayproject' 
      },

      // --- LAYER 3: TURN TCP (Bypasses School UDP blocks) ---
      { 
        urls: 'turn:3.7.12.152:443?transport=tcp', 
        username: 'openrelayproject', 
        credential: 'openrelayproject' 
      },

      // --- LAYER 4: TURNS TLS (Stealth Mode - Mimics HTTPS) ---
      // Wraps video in SSL to bypass Deep Packet Inspection.
      { 
        urls: 'turns:3.7.12.152:443?transport=tcp', 
        username: 'openrelayproject', 
        credential: 'openrelayproject' 
      }
    ],
    sdpSemantics: 'unified-plan'
  };

  const peerId = Math.random().toString(36).substring(2, 7).toUpperCase();
  
  const peer = new Peer(peerId, { 
    config: config,
    debug: 1 
  });

  peer.on('open', (id) => {
    console.log('✅ Registered Stealth ID:', id);
    setPeerId(id);
  });

  peer.on('error', (error) => {
    console.error('❌ PeerJS Global Error:', error);
    showNotification('Connection error: ' + error.type, 'error');
  });

  peer.on('call', (call) => {
    console.log('📞 Incoming call detected from:', call.peer);
    setIncomingCall(call);
  });

  peer.on('disconnected', () => {
    console.warn('⚠️ Disconnected. Reconnecting...');
    peer.reconnect();
  });

  return peer;
}

/**
 * monitorConnection - Internal diagnostics for P2P vs Relay
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
          // Reports "Direct (P2P)" for same wifi, "Relayed" for school bypass
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
 * makeCall - Initiates call and waits for P2P or Relay handshake
 */
async function makeCall(peer, targetId, showNotification, onStatusUpdate) {
  try {
    const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    const call = peer.call(targetId, localStream);
    
    return new Promise((resolve, reject) => {
      call.on('stream', (remoteStream) => {
        console.log('💎 Handshake Success!');
        monitorConnection(call, onStatusUpdate);
        resolve({ call, localStream, remoteStream });
      });

      call.on('error', (err) => reject(err));
      
      call.on('close', () => {
        localStream.getTracks().forEach(track => track.stop());
      });

      // 35s timeout to allow all STUN/TURN fallbacks to be tried
      const callTimeout = setTimeout(() => {
        call.close();
        reject(new Error('All connection paths (P2P & Relay) failed.'));
      }, 35000);

      call.on('stream', () => clearTimeout(callTimeout));
    });
  } catch (error) {
    showNotification('Camera access denied.', 'error');
    throw error;
  }
}

/**
 * answerCall - Responds to call
 */
async function answerCall(incomingCall, onStatusUpdate) {
  try {
    const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    incomingCall.answer(localStream);
    return new Promise((resolve, reject) => {
      incomingCall.on('stream', (remoteStream) => {
        console.log('💎 Handshake Success!');
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
