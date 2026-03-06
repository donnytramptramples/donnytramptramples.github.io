/**
 * peermanager.js - Stealth IP-Based Firewall Bypass Version
 * Version: 7.0 (DNS-Bypass + TCP/TLS Hybrid)
 * Preserves full 160+ line structure for build compatibility.
 */

function initializePeer(setPeerId, setIncomingCall, showNotification) {
  // CONFIGURATION: Using direct IPs to bypass domain-level blacklisting.
  // We use the AWS-backed IP for Metered.ca (3.7.12.152) to avoid "Error 701".
  const config = {
    // FORCE RELAY: Change 'all' to 'relay' if different Wi-Fi still fails.
    iceTransportPolicy: 'all', 
    iceCandidatePoolSize: 10,
    iceServers: [
      // --- STUN (Direct IPs to bypass school DNS blocks) ---
      { urls: 'stun:74.125.192.127:19302' }, // Google IP
      { urls: 'stun:172.64.155.249:3478' },  // Cloudflare IP
      { urls: 'stun:stun.nextcloud.com:443' },

      // --- TURN (IP-BASED RELAY to bypass domain filters like metered.ca) ---
      // Uses 'openrelayproject' credentials but hits the server directly via IP.
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
      // TCP Fallback: Mimics standard HTTPS web traffic on port 443.
      { 
        urls: 'turn:3.7.12.152:443?transport=tcp', 
        username: 'openrelayproject', 
        credential: 'openrelayproject' 
      },
      // TURNS (TLS): The ultimate bypass. Wraps video in SSL encryption.
      { 
        urls: 'turns:3.7.12.152:443?transport=tcp', 
        username: 'openrelayproject', 
        credential: 'openrelayproject' 
      }
    ],
    sdpSemantics: 'unified-plan'
  };

  // Generate a unique 5-character ID for the user.
  const peerId = Math.random().toString(36).substring(2, 7).toUpperCase();
  
  // Initialize PeerJS with the stealth IP configuration.
  const peer = new Peer(peerId, { 
    config: config,
    debug: 1 // Set to 3 for deep ICE troubleshooting.
  });

  // Event: Successfully registered with signaling server.
  peer.on('open', (id) => {
    console.log('✅ Registered Stealth ID:', id);
    setPeerId(id);
  });

  // Event: Global network or signaling error.
  peer.on('error', (error) => {
    console.error('❌ Network Link Error:', error);
    showNotification('Link error: ' + error.type, 'error');
  });

  // Event: Handling an incoming call.
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
 * monitorConnection - Real-time diagnostics for connection type/signal
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
        // Detect if the connection succeeded via Relay or Direct.
        if (report.type === 'remote-candidate') {
          connectionType = report.candidateType === 'relay' ? "Relayed (Bypass Active)" : "Direct (P2P)";
        }
        // Calculate signal quality via Round Trip Time.
        if (report.type === 'candidate-pair' && report.state === 'succeeded') {
          const rtt = report.currentRoundTripTime * 1000; 
          if (rtt < 150) signalScore = "Excellent";
          else if (rtt < 300) signalScore = "Good";
          else signalScore = "Weak";
        }
      });
      onStatusUpdate({ type: connectionType, signal: signalScore });
    } catch (e) { console.error("Stats error:", e); }
  }, 2500);
}

/**
 * makeCall - Initiates outgoing call with stealth monitoring.
 */
async function makeCall(peer, targetId, showNotification, onStatusUpdate) {
  try {
    console.log('🚀 Initiating stealth handshake...');
    const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    const call = peer.call(targetId, localStream);
    
    return new Promise((resolve, reject) => {
      call.on('stream', (remoteStream) => {
        console.log('💎 Connection established via stealth relay.');
        monitorConnection(call, onStatusUpdate);
        resolve({ call, localStream, remoteStream });
      });

      call.on('error', (error) => reject(error));
      
      call.on('close', () => {
        console.log('🛑 Call ended.');
        localStream.getTracks().forEach(track => track.stop());
      });

      // Handshake timeout: allows for multiple TCP/TLS fallback attempts.
      const callTimeout = setTimeout(() => {
        call.close();
        reject(new Error('Handshake failed. School DPI is blocking the tunnel.'));
      }, 35000);

      call.on('stream', () => clearTimeout(callTimeout));
    });
  } catch (error) {
    console.error('Hardware access error:', error);
    showNotification('Camera access denied.', 'error');
    throw error;
  }
}

/**
 * answerCall - Processes and responds to a call.
 */
async function answerCall(incomingCall, onStatusUpdate) {
  try {
    console.log('📥 Answering call via stealth link...');
    const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    incomingCall.answer(localStream);
    
    return new Promise((resolve, reject) => {
      incomingCall.on('stream', (remoteStream) => {
        console.log('💎 Media flowing on receiver side.');
        monitorConnection(incomingCall, onStatusUpdate);
        resolve({ call: incomingCall, localStream, remoteStream });
      });

      incomingCall.on('error', (error) => reject(error));

      incomingCall.on('close', () => {
        console.log('🛑 Call ended.');
        localStream.getTracks().forEach(track => track.stop());
      });
    });
  } catch (error) {
    console.error('Answer failed:', error);
    showNotification('Answer Error: Access denied.', 'error');
    throw error;
  }
}
