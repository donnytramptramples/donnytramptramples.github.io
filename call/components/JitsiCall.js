/* global React */

/**
 * jitsi.js
 * - Fast UI switch (no big "Connecting..." screen)
 * - Auto-join (skip prejoin/join button)
 * - Hide all Jitsi UI buttons
 * - Auto displayName = peerId
 * - Global fallback trigger to switch from P2P->Jitsi immediately
 */

/* -----------------------------
   Global helpers (fallback API)
------------------------------ */

// Stable shared room name: both ends compute the same string
window.makeJitsiRoomName = function makeJitsiRoomName(peerId, remotePeerId) {
  const a = String(peerId || '').trim();
  const b = String(remotePeerId || '').trim();
  const [p1, p2] = [a, b].sort();
  return `p2p-${p1}-${p2}`.replace(/[^a-zA-Z0-9-_]/g, '');
};

// Call this from PeerJS error / WebRTC fail to switch immediately
window.triggerJitsiFallback = function triggerJitsiFallback(payload) {
  // payload: { reason, peerId, remotePeerId, roomName }
  window.dispatchEvent(new CustomEvent('copilot:jitsi-fallback', { detail: payload || {} }));
};

// OPTIONAL: one-liner to preload Jitsi endpoints early (reduces “first switch” delay)
window.prewarmJitsi = function prewarmJitsi(domain = 'meet.ffmuc.net') {
  try {
    const head = document.head || document.getElementsByTagName('head')[0];

    const addLink = (rel, href, as) => {
      if (document.querySelector(`link[rel="${rel}"][href="${href}"]`)) return;
      const l = document.createElement('link');
      l.rel = rel;
      l.href = href;
      if (as) l.as = as;
      head.appendChild(l);
    };

    addLink('preconnect', `https://${domain}`);
    addLink('dns-prefetch', `https://${domain}`);
    addLink('preload', `https://${domain}/external_api.js`, 'script');
  } catch (_) {}
};

/* -----------------------------
   JitsiCall Component
------------------------------ */

function JitsiCall({
  roomName,
  peerId,
  remotePeerId,
  messages,
  setMessages,
  fileTransfers,
  setFileTransfers,
  onHangup
}) {
  const jitsiContainerRef = React.useRef(null);
  const jitsiApiRef = React.useRef(null);

  // keep onHangup stable without re-init
  const onHangupRef = React.useRef(onHangup);
  React.useEffect(() => { onHangupRef.current = onHangup; }, [onHangup]);

  const [isAudioEnabled, setIsAudioEnabled] = React.useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = React.useState(true);
  const [isScreenSharing, setIsScreenSharing] = React.useState(false);

  const [showChat, setShowChat] = React.useState(false);
  const [showFileTransfer, setShowFileTransfer] = React.useState(false);
  const [showSettings, setShowSettings] = React.useState(false);
  const [showReactions, setShowReactions] = React.useState(false);

  const [reactions, setReactions] = React.useState([]);

  // “Fast transition”: we don’t block the screen; just show a tiny pill briefly
  const [isIframeLoaded, setIsIframeLoaded] = React.useState(false);
  const [showSwitchPill, setShowSwitchPill] = React.useState(true);
  const [fatalError, setFatalError] = React.useState(null);

  // Load external_api.js (correct iFrame API script path)
  const ensureJitsiScript = React.useCallback((domain) => {
    return new Promise((resolve, reject) => {
      if (window.JitsiMeetExternalAPI) return resolve();

      // if we already injected it, wait
      const existing = document.querySelector('script[data-jitsi-api="1"]');
      if (existing) {
        existing.addEventListener('load', resolve, { once: true });
        existing.addEventListener('error', () => reject(new Error('Jitsi API script failed to load')), { once: true });
        return;
      }

      // Prewarm connections (speed feel)
      window.prewarmJitsi?.(domain);

      const s = document.createElement('script');
      s.src = `https://${domain}/external_api.js`; // documented include [4](https://github.com/jitsi/ljm-getting-started)[5](https://stackoverflow.com/questions/76793059/how-i-can-add-custom-ui-for-lib-jitsi-meet-dist)
      s.async = true;
      s.dataset.jitsiApi = "1";
      s.onload = resolve;
      s.onerror = () => reject(new Error(`Failed to load https://${domain}/external_api.js`));
      document.head.appendChild(s);
    });
  }, []);

  React.useEffect(() => {
    let cancelled = false;

    async function init() {
      setFatalError(null);
      setIsIframeLoaded(false);

      // tiny pill only, and auto-hide it quickly
      setShowSwitchPill(true);
      setTimeout(() => { if (!cancelled) setShowSwitchPill(false); }, 800);

      if (!jitsiContainerRef.current) return;
      if (jitsiApiRef.current) return;

      const domain = 'jitsi.math.uzh.ch';
      const displayName = String(peerId || 'Peer');

      try {
        await ensureJitsiScript(domain);
        if (cancelled) return;

        const options = {
          roomName: roomName,
          width: '100%',
          height: '100%',
          parentNode: jitsiContainerRef.current,

          // “Jitsi is there” when iframe loads
          onload: () => {
            if (cancelled) return;
            setIsIframeLoaded(true);
            setShowSwitchPill(false);
          },

          // auto name
          userInfo: { displayName },

          configOverwrite: {
            // ✅ Auto-join: skip the prejoin "Join meeting" screen [1](https://jitsi.github.io/handbook/docs/dev-guide/dev-guide-ljm/)[2](https://jitsi.support/developer/getting-started-lib-jitsi-meet/)
            prejoinPageEnabled: false,

            // ✅ Hide ALL UI buttons (empty array hides all) [3](https://stackoverflow.com/questions/67400253/auto-join-jitsi-meet)
            toolbarButtons: [],

            disableDeepLinking: true,
            startWithAudioMuted: false,
            startWithVideoMuted: false
          },

          interfaceConfigOverwrite: {
            // extra hardening: also hide toolbar list if deployment reads interfaceConfig
            TOOLBAR_BUTTONS: [],

            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            SHOW_BRAND_WATERMARK: false,
            SHOW_POWERED_BY: false
          }
        };

        const api = new window.JitsiMeetExternalAPI(domain, options);
        jitsiApiRef.current = api;

        api.addEventListener('videoConferenceJoined', () => {
          if (cancelled) return;
          setShowSwitchPill(false);

          // force display name again (some instances apply userInfo late)
          if (peerId) api.executeCommand('displayName', String(peerId));
        });

        api.addEventListener('readyToClose', () => {
          onHangupRef.current?.();
        });

        api.addEventListener('audioMuteStatusChanged', (e) => {
          if (cancelled) return;
          setIsAudioEnabled(!e.muted);
        });

        api.addEventListener('videoMuteStatusChanged', (e) => {
          if (cancelled) return;
          setIsVideoEnabled(!e.muted);
        });

      } catch (err) {
        console.error('[JitsiCall] init error:', err);
        setFatalError(err.message || String(err));
      }
    }

    init();

    return () => {
      cancelled = true;
      if (jitsiApiRef.current) {
        try { jitsiApiRef.current.dispose(); } catch (_) {}
        jitsiApiRef.current = null;
      }
    };

    // IMPORTANT: Only re-init when roomName/peerId changes (prevents reset while typing)
  }, [roomName, peerId, ensureJitsiScript]);

  // Controls
  const toggleAudio = () => jitsiApiRef.current?.executeCommand('toggleAudio');
  const toggleVideo = () => jitsiApiRef.current?.executeCommand('toggleVideo');

  const toggleScreenShare = () => {
    jitsiApiRef.current?.executeCommand('toggleShareScreen');
    setIsScreenSharing(prev => !prev);
  };

  const handleHangup = () => {
    jitsiApiRef.current?.executeCommand('hangup');
    onHangupRef.current?.();
  };

  // Chat (functional update = no stale snapshot)
  const sendMessage = (text) => {
    const newMessage = {
      text,
      sender: 'me',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, newMessage]);
    jitsiApiRef.current?.executeCommand('sendChatMessage', text);
  };

  const sendReaction = (emoji) => {
    const newReaction = { id: Date.now(), emoji, x: Math.random() * 80 + 10 };
    setReactions(prev => [...prev, newReaction]);
    setTimeout(() => setReactions(prev => prev.filter(r => r.id !== newReaction.id)), 3000);
  };

  const sendFile = (file) => {
    const transferId = Date.now();
    const newTransfer = {
      id: transferId,
      name: file.name,
      size: file.size,
      status: 'completed',
      progress: 100
    };
    setFileTransfers(prev => [...prev, newTransfer]);
  };

  // UI
  return (
    <div className="relative h-screen bg-black" data-name="jitsi-call" data-file="jitsi.js">
      {/* FAST: show iframe area immediately (don’t hide it while loading) */}
      <div ref={jitsiContainerRef} className="w-full h-full" />

      {/* Tiny pill instead of full-screen “Connecting…” */}
      {showSwitchPill && !fatalError && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 glass-effect rounded-full px-4 py-2 z-50 text-sm">
          Switching to relay…
        </div>
      )}

      {fatalError && (
        <div className="absolute inset-0 flex items-center justify-center glass-effect z-50">
          <div className="text-center p-6 bg-zinc-900/90 rounded-2xl border border-white/10 shadow-2xl max-w-md">
            <div className="text-red-400 font-semibold mb-3">Jitsi failed to load</div>
            <div className="text-sm text-gray-300 break-words">{fatalError}</div>
            <button
              onClick={() => window.location.reload()}
              className="mt-5 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white"
            >
              Reload
            </button>
          </div>
        </div>
      )}

      {/* Your panels */}
      {showChat && (
        <div className="absolute top-0 right-0 w-80 h-full z-50">
          <ChatPanel
            messages={messages}
            onSendMessage={sendMessage}
            onClose={() => setShowChat(false)}
          />
        </div>
      )}

      {showFileTransfer && (
        <div className="absolute top-0 right-0 w-80 h-full z-50">
          <FileTransferPanel
            fileTransfers={fileTransfers}
            onSendFile={sendFile}
            onClose={() => setShowFileTransfer(false)}
          />
        </div>
      )}

      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}

      <ReactionOverlay reactions={reactions} />

      {showReactions && (
        <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 glass-effect rounded-lg p-2 flex gap-2 z-50">
          {['👍', '❤️', '😂', '👏', '🎉'].map(emoji => (
            <button
              key={emoji}
              onClick={() => { sendReaction(emoji); setShowReactions(false); }}
              className="w-10 h-10 text-2xl hover:scale-125 transition-transform"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Your custom controls (Jitsi toolbar hidden by toolbarButtons: []) */}
      <div className="absolute bottom-0 left-0 right-0 p-6 z-40">
        <div className="glass-effect rounded-lg px-6 py-4 max-w-2xl mx-auto flex items-center justify-center gap-3">
          <button
            onClick={toggleAudio}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              isAudioEnabled ? 'bg-[var(--dark-surface)] hover:bg-opacity-80' : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            <div className={`${isAudioEnabled ? 'icon-mic' : 'icon-mic-off'} text-xl`} />
          </button>

          <button
            onClick={toggleVideo}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              isVideoEnabled ? 'bg-[var(--dark-surface)] hover:bg-opacity-80' : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            <div className={`${isVideoEnabled ? 'icon-video' : 'icon-video-off'} text-xl`} />
          </button>

          <button
            onClick={toggleScreenShare}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              isScreenSharing ? 'bg-[var(--primary-color)]' : 'bg-[var(--dark-surface)] hover:bg-opacity-80'
            }`}
          >
            <div className="icon-monitor text-xl" />
          </button>

          <button
            onClick={() => setShowReactions(prev => !prev)}
            className="w-12 h-12 rounded-full bg-[var(--dark-surface)] hover:bg-opacity-80 flex items-center justify-center transition-all"
          >
            <div className="icon-smile text-xl" />
          </button>

          <button
            onClick={() => setShowChat(prev => !prev)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              showChat ? 'bg-[var(--primary-color)]' : 'bg-[var(--dark-surface)] hover:bg-opacity-80'
            }`}
          >
            <div className="icon-message-square text-xl" />
          </button>

          <button
            onClick={() => setShowFileTransfer(prev => !prev)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              showFileTransfer ? 'bg-[var(--primary-color)]' : 'bg-[var(--dark-surface)] hover:bg-opacity-80'
            }`}
          >
            <div className="icon-file-up text-xl" />
          </button>

          <button
            onClick={() => setShowSettings(true)}
            className="w-12 h-12 rounded-full bg-[var(--dark-surface)] hover:bg-opacity-80 flex items-center justify-center transition-all"
          >
            <div className="icon-settings text-xl" />
          </button>

          <button
            onClick={handleHangup}
            className="w-12 h-12 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center transition-all"
          >
            <div className="icon-phone-off text-xl" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* -----------------------------------------
   OPTIONAL: Fast P2P failure -> Jitsi trigger
   Call window.installFastP2PFallback(...) from VideoCall.js
------------------------------------------ */

window.installFastP2PFallback = function installFastP2PFallback({
  peerId,
  remotePeerId,
  pc,            // RTCPeerConnection (optional)
  peer,          // PeerJS Peer (optional)
  graceMs = 900  // how fast to fallback after "disconnected"
}) {
  const roomName = window.makeJitsiRoomName(peerId, remotePeerId);

  const fire = (reason) => {
    window.triggerJitsiFallback({ reason, peerId, remotePeerId, roomName });
  };

  // PeerJS error -> immediate fallback (e.g. "Could not connect to peer ...")
  // PeerJS supports peer.on('error', ...) [6](https://meet.google.com/)
  if (peer && typeof peer.on === 'function') {
    peer.on('error', () => fire('peer-error'));
    peer.on('disconnected', () => fire('peer-disconnected'));
  }

  // ICE / connection state -> fast fallback
  // "disconnected" may be transient; "failed" indicates ICE cannot find a match [2](https://jitsi.support/developer/getting-started-lib-jitsi-meet/)
  if (pc && typeof pc.addEventListener === 'function') {
    let t = null;

    pc.addEventListener('iceconnectionstatechange', () => {
      const s = pc.iceConnectionState;
      if (s === 'failed') {
        fire('ice-failed');
      } else if (s === 'disconnected') {
        clearTimeout(t);
        t = setTimeout(() => {
          if (pc.iceConnectionState === 'disconnected') fire('ice-disconnected');
        }, graceMs);
      } else if (s === 'connected' || s === 'completed') {
        clearTimeout(t);
      }
    });

    pc.addEventListener('connectionstatechange', () => {
      if (pc.connectionState === 'failed') fire('pc-failed');
    });
  }

  return { roomName };
};
