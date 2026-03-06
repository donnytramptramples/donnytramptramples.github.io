/**
 * peermanager.js - Fortinet & Oundle School Bypass Version
 * Version: 10.0 (IP-Based TLS Tunneling)
 * Preserves full structure for build stability.
 */

function initializePeer(setPeerId, setIncomingCall, showNotification) {
  // CONFIGURATION: Multi-layered bypass strategy.
  // We use direct IP addresses to bypass DNS "Error 701" host lookup failures.
  const config = {
    // 'all' tests local P2P (same wifi) first, then falls back to stealth relay.
    iceTransportPolicy: 'all', 
    iceCandidatePoolSize: 10,
    iceServers: [
      // --- LAYER 1: STUN (Cloudflare & Google - Port 443/19302) ---
      { urls: 'stun:172.64.155.249:3478' }, // Cloudflare IP
      { urls: 'stun:74.125.192.127:19302' }, // Google IP
      { urls: 'stun:stun.nextcloud.com:443' },

      // --- LAYER 2: Stealth TURN (Direct IP - Port 80/443) ---
      // These bypass the domain block on 'metered.ca'
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

      // --- LAYER 3: TURN TCP (Fortinet Friendly) ---
      // transport=tcp mimics standard web browsing traffic.
      { 
        urls: 'turn:3.7.12.152:443?transport=tcp', 
        username: 'openrelayproject', 
        credential: 'openrelayproject' 
      },

      // --- LAYER 4: TURNS TLS (The Ultimate Fortinet Bypass) ---
      // Encapsulates video in SSL/TLS. Appears as standard HTTPS to the firewall.
      { 
        urls: 'turns:3.7.12.152:443?transport=tcp', 
        username: 'openrelayproject', 
        credential: 'openrelayproject' 
      },
      // Secondary IP Relay
      { 
        urls: 'turns:13.235.158.122:443?transport=tcp', 
        username: 'openrelayproject', 
        credential: 'openrelayproject' 
      }
    ],
    sdpSemantics: 'unified-plan'
  };

  // Generate a unique 5-character ID for the user
  const peerId = Math.random().toString(36).substring(2, 7).toUpperCase();
  
  // Initialize PeerJS with the stealth IP configuration.
  const peer = new Peer(peerId, { 
    config: config,
    debug: 1 // Set to 3 for deep ICE troubleshooting in console
  });

  peer.on('open', (id) => {
    console.log('✅ Registered Stealth ID (Oundle-Bypass):', id);
    setPeerId(id);
  });

  peer.on('error', (error) => {
    console.error('❌ Network link error:', error);
    showNotification('Link error: ' + error.type, 'error');
  });

  peer.on('call', (call) => {
    console.log('📞 Incoming call detected from:', call.peer);
    setIncomingCall(call);
  });

  // Reconnection logic for spotty school Wi-Fi.
  peer.on('disconnected', () => {
    console.warn('⚠️ Signaling lost. Attempting reconnect...');
    peer.reconnect();
  });

  return peer;
}

/**
 * monitorConnection - Tracks connection type and quality
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
      let connectionType = "Checking...";
      let signalScore = "Wait...";

      stats.forEach(report => {
        if (report.type === 'remote-candidate') {
          // Reports "Relayed (Bypass Active)" when tunneling through the firewall.
          connectionType = report.candidateType === 'relay' ? "Relayed (Fortinet Bypass)" : "Direct (P2P)";
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
 * makeCall - Initiates call with Fortinet fallback handshake
 */
async function makeCall(peer, targetId, showNotification, onStatusUpdate) {
  try {
    console.log('🚀 Initiating call sequence...');
    const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    const call = peer.call(targetId, localStream);
    
    return new Promise((resolve, reject) => {
      call.on('stream', (remoteStream) => {
        console.log('💎 Handshake success via Stealth Link.');
        monitorConnection(call, onStatusUpdate);
        resolve({ call, localStream, remoteStream });
      });

      call.on('error', (error) => reject(error));
      
      call.on('close', () => {
        console.log('🛑 Call closed.');
        localStream.getTracks().forEach(track => track.stop());
      });

      // Handshake timeout: Fortinet TLS handshakes take time to clear inspection.
      const callTimeout = setTimeout(() => {
        call.close();
        reject(new Error('Handshake failed. School firewall is blocking the bypass tunnel.'));
      }, 40000);

      call.on('stream', () => clearTimeout(callTimeout));
    });
  } catch (error) {
    showNotification('Hardware Error: Camera access denied.', 'error');
    throw error;
  }
}

/**
 * answerCall - Processes and responds to a call
 */
async function answerCall(incomingCall, onStatusUpdate) {
  try {
    console.log('📥 Answering call via relay link...');
    const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    incomingCall.answer(localStream);
    
    return new Promise((resolve, reject) => {
      incomingCall.on('stream', (remoteStream) => {
        console.log('💎 Media received on receiver side.');
        monitorConnection(incomingCall, onStatusUpdate);
        resolve({ call: incomingCall, localStream, remoteStream });
      });

      incomingCall.on('error', (error) => reject(error));

      incomingCall.on('close', () => {
        console.log('🛑 Call closed.');
        localStream.getTracks().forEach(track => track.stop());
      });
    });
  } catch (error) {
    console.error('Answer failed:', error);
    showNotification('Answer Error: Access denied.', 'error');
    throw error;
  }
}
