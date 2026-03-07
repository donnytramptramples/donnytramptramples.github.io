/* global React */

// ------------------------------
// Global: Jitsi fallback event API
// ------------------------------
// Call this from PeerJS / VideoCall when P2P fails.
// Your app.js should listen and switch UI to <JitsiCall .../>
window.requestJitsiFallback = function requestJitsiFallback(detail) {
  // detail: { roomName, peerId, remotePeerId, reason }
  window.dispatchEvent(new CustomEvent('copilot:jitsi-fallback', { detail }));
};

// Stable room name helper (same room for both sides)
window.makeJitsiRoomName = function makeJitsiRoomName(peerId, remotePeerId) {
  const a = String(peerId || '').trim();
  const b = String(remotePeerId || '').trim();
  // Sort so both ends compute same room
  const [p1, p2] = [a, b].sort();
  return `p2p-${p1}-${p2}`.replace(/[^a-zA-Z0-9-_]/g, '');
};

// ------------------------------
// JitsiCall Component
// ------------------------------
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

  // Keep latest onHangup without reinitializing Jitsi (prevents resets)
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

  // Loader state: hide when iframe loads (Jitsi is there)
  const [isIframeLoaded, setIsIframeLoaded] = React.useState(false);
  const [isConferenceJoined, setIsConferenceJoined] = React.useState(false);
  const [fatalError, setFatalError] = React.useState(null);

  // Dynamic loader for the correct Jitsi iFrame API script
  const ensureJitsiScript = React.useCallback((domain) => {
    return new Promise((resolve, reject) => {
      if (window.JitsiMeetExternalAPI) return resolve();

      const existing = document.querySelector('script[data-jitsi-api="1"]');
      if (existing) {
        existing.addEventListener('load', resolve, { once: true });
        existing.addEventListener('error', () => reject(new Error('Jitsi API script failed to load')), { once: true });
        return;
      }

      const s = document.createElement('script');
      s.src = `https://${domain}/external_api.js`; // documented include path [6](https://github.com/jitsi/ljm-getting-started)[7](https://stackoverflow.com/questions/76793059/how-i-can-add-custom-ui-for-lib-jitsi-meet-dist)
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
      setIsConferenceJoined(false);

      if (!jitsiContainerRef.current) return;
      if (jitsiApiRef.current) return; // prevent double init

      const domain = 'meet.ffmuc.net';
      const displayName = String(peerId || 'Peer');

      try {
        await ensureJitsiScript(domain);
        if (cancelled) return;

        const options = {
          roomName: roomName,
          width: '100%',
          height: '100%',
          parentNode: jitsiContainerRef.current,

          // Hide loader when iframe is present
          onload: () => {
            if (cancelled) return;
            setIsIframeLoaded(true);
          },

          // Auto-fill name; avoid any name prompt
          userInfo: { displayName },

          configOverwrite: {
            // ✅ Auto-join (skip "Join meeting" prejoin screen)
            prejoinPageEnabled: false, // [1](https://jitsi.github.io/handbook/docs/dev-guide/dev-guide-ljm/)[2](https://jitsi.support/developer/getting-started-lib-jitsi-meet/)

            // ✅ Hide ALL Jitsi UI buttons
            toolbarButtons: [], // [3](https://stackoverflow.com/questions/67400253/auto-join-jitsi-meet)

            disableDeepLinking: true,
            startWithAudioMuted: false,
            startWithVideoMuted: false
          },

          interfaceConfigOverwrite: {
            // Keep branding/watermarks off
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            SHOW_BRAND_WATERMARK: false,
            SHOW_POWERED_BY: false
          }
        };

        const api = new window.JitsiMeetExternalAPI(domain, options); // iFrame API constructor [6](https://github.com/jitsi/ljm-getting-started)[8](https://blog.csdn.net/gitblog_00395/article/details/155419436)
        jitsiApiRef.current = api;

        const markLoaded = () => { if (!cancelled) setIsIframeLoaded(true); };

        api.addEventListener('videoConferenceJoined', () => {
          if (cancelled) return;
          setIsConferenceJoined(true);
          markLoaded();

          // Force set display name again (some deployments apply it late)
          if (peerId) api.executeCommand('displayName', String(peerId));
        });

        api.addEventListener('readyToClose', () => {
          onHangupRef.current?.();
        });

        api.addEventListener('audioMuteStatusChanged', (e) => {
          if (cancelled) return;
          setIsAudioEnabled(!e.muted);
          markLoaded();
        });

        api.addEventListener('videoMuteStatusChanged', (e) => {
          if (cancelled) return;
          setIsVideoEnabled(!e.muted);
          markLoaded();
        });

        // Optional: If the API emits errors, surface them
        api.addEventListener('error', (e) => {
          console.warn('[JitsiCall] API error:', e);
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
        try { jitsiApiRef.current.dispose(); } catch (e) {}
        jitsiApiRef.current = null;
      }
    };

    // ✅ DO NOT include onHangup/messages/fileTransfers here → prevents resets while typing
  }, [roomName, peerId, ensureJitsiScript]);

  // ---------- Controls ----------
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

  // Use functional updates so typing doesn’t depend on stale props
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

  // ---------- UI ----------
  return (
    <div className="relative h-screen bg-black" data-name="jitsi-call" data-file="jitsi.js">
      {/* Hide iframe until loaded to avoid any UI flash */}
      <div
        ref={jitsiContainerRef}
        className={`w-full h-full ${isIframeLoaded ? '' : 'opacity-0'}`}
      />

      {/* Loader disappears when iframe exists */}
      {!isIframeLoaded && !fatalError && (
        <div className="absolute inset-0 flex items-center justify-center glass-effect z-50">
          <div className="text-center p-6 bg-zinc-900/90 rounded-2xl border border-white/10 shadow-2xl">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-5" />
            <div className="text-lg font-medium">Loading call…</div>
            <div className="mt-2 text-xs text-gray-400">
              Auto-joining as <span className="font-mono">{peerId || 'Peer'}</span>
            </div>
          </div>
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

      {/* Optional: small status while joining the conference */}
      {isIframeLoaded && !isConferenceJoined && !fatalError && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 glass-effect rounded-lg px-4 py-2 z-40 text-sm">
          Joining room…
        </div>
      )}

      {/* Your side panels */}
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

      {/* Your custom controls (Jitsi toolbar is hidden by toolbarButtons: []) */}
      <div className="absolute bottom-0 left-0 right-0 p-6 z-40">
        <div className="glass-effect rounded-lg px-6 py-4 max-w-2xl mx-auto flex items-center justify-center gap-3">
          <button
            onClick={toggleAudio}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              isAudioEnabled ? 'bg-[var(--dark-surface)] hover:bg-opacity-80' : 'bg-red-600 hover:bg-red-700'
            }`}
            title="Mute/Unmute"
          >
            <div className={`${isAudioEnabled ? 'icon-mic' : 'icon-mic-off'} text-xl`} />
          </button>

          <button
            onClick={toggleVideo}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              isVideoEnabled ? 'bg-[var(--dark-surface)] hover:bg-opacity-80' : 'bg-red-600 hover:bg-red-700'
            }`}
            title="Camera On/Off"
          >
            <div className={`${isVideoEnabled ? 'icon-video' : 'icon-video-off'} text-xl`} />
          </button>

          <button
            onClick={toggleScreenShare}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              isScreenSharing ? 'bg-[var(--primary-color)]' : 'bg-[var(--dark-surface)] hover:bg-opacity-80'
            }`}
            title="Share Screen"
          >
            <div className="icon-monitor text-xl" />
          </button>

          <button
            onClick={() => setShowReactions(prev => !prev)}
            className="w-12 h-12 rounded-full bg-[var(--dark-surface)] hover:bg-opacity-80 flex items-center justify-center transition-all"
            title="Reactions"
          >
            <div className="icon-smile text-xl" />
          </button>

          <button
            onClick={() => setShowChat(prev => !prev)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              showChat ? 'bg-[var(--primary-color)]' : 'bg-[var(--dark-surface)] hover:bg-opacity-80'
            }`}
            title="Chat"
          >
            <div className="icon-message-square text-xl" />
          </button>

          <button
            onClick={() => setShowFileTransfer(prev => !prev)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              showFileTransfer ? 'bg-[var(--primary-color)]' : 'bg-[var(--dark-surface)] hover:bg-opacity-80'
            }`}
            title="Files"
          >
            <div className="icon-file-up text-xl" />
          </button>

          <button
            onClick={() => setShowSettings(true)}
            className="w-12 h-12 rounded-full bg-[var(--dark-surface)] hover:bg-opacity-80 flex items-center justify-center transition-all"
            title="Settings"
          >
            <div className="icon-settings text-xl" />
          </button>

          <button
            onClick={handleHangup}
            className="w-12 h-12 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center transition-all"
            title="Hang up"
          >
            <div className="icon-phone-off text-xl" />
          </button>
        </div>
      </div>
    </div>
  );
}
