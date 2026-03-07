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

  // Keep latest onHangup without causing effect re-run (prevents resets)
  const onHangupRef = React.useRef(onHangup);
  React.useEffect(() => {
    onHangupRef.current = onHangup;
  }, [onHangup]);

  const [isAudioEnabled, setIsAudioEnabled] = React.useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = React.useState(true);
  const [isScreenSharing, setIsScreenSharing] = React.useState(false);

  const [showChat, setShowChat] = React.useState(false);
  const [showFileTransfer, setShowFileTransfer] = React.useState(false);
  const [showSettings, setShowSettings] = React.useState(false);
  const [showReactions, setShowReactions] = React.useState(false);

  const [reactions, setReactions] = React.useState([]);

  // Loader control: hide when iframe has loaded (Jitsi is visible)
  const [isIframeLoaded, setIsIframeLoaded] = React.useState(false);
  const [isConferenceJoined, setIsConferenceJoined] = React.useState(false);

  // Ensures the Jitsi external API script exists (works even if you forgot it in index.html)
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
      s.src = `https://${domain}/external_api.js`; // official embed path [1](https://github.com/jitsi/jitsi-meet/issues/2027)
      s.async = true;
      s.dataset.jitsiApi = "1";
      s.onload = resolve;
      s.onerror = () => reject(new Error(`Failed to load https://${domain}/external_api.js`));
      document.head.appendChild(s);
    });
  }, []);

  React.useEffect(() => {
    let cancelled = false;

    const start = async () => {
      if (!jitsiContainerRef.current) return;

      // Prevent re-init if React re-renders
      if (jitsiApiRef.current) return;

      const domain = 'meet.ffmuc.net';

      try {
        await ensureJitsiScript(domain);
        if (cancelled) return;

        const displayName = peerId || 'Peer';

        const options = {
          roomName: roomName,
          width: '100%',
          height: '100%',
          parentNode: jitsiContainerRef.current,

          // Hide loader as soon as iframe is there
          onload: () => {
            if (cancelled) return;
            setIsIframeLoaded(true);
          },

          // Set the "name" without prompting (provided by External API options) [2](https://meet.google.com/)
          userInfo: {
            displayName
          },

          configOverwrite: {
            startWithAudioMuted: false,
            startWithVideoMuted: false,
            prejoinPageEnabled: false,   // prevents the prejoin UI/name prompt [1](https://github.com/jitsi/jitsi-meet/issues/2027)
            disableDeepLinking: true
          },

          interfaceConfigOverwrite: {
            TOOLBAR_BUTTONS: [],
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            SHOW_BRAND_WATERMARK: false,
            SHOW_POWERED_BY: false
          }
        };

        const api = new window.JitsiMeetExternalAPI(domain, options); // External API embed [2](https://meet.google.com/)
        jitsiApiRef.current = api;

        // If onload didn't fire, any event implies iframe exists
        const markIframeLoaded = () => {
          if (cancelled) return;
          setIsIframeLoaded(true);
        };

        api.addEventListener('videoConferenceJoined', () => {
          if (cancelled) return;

          setIsConferenceJoined(true);
          markIframeLoaded();

          // Force name again (some deployments ignore userInfo on first load)
          if (peerId) {
            api.executeCommand('displayName', peerId);
          }
        });

        api.addEventListener('readyToClose', () => {
          onHangupRef.current?.();
        });

        api.addEventListener('audioMuteStatusChanged', (e) => {
          if (cancelled) return;
          setIsAudioEnabled(!e.muted);
          markIframeLoaded();
        });

        api.addEventListener('videoMuteStatusChanged', (e) => {
          if (cancelled) return;
          setIsVideoEnabled(!e.muted);
          markIframeLoaded();
        });

      } catch (err) {
        console.error('[JitsiCall] init error:', err);
      }
    };

    start();

    return () => {
      cancelled = true;
      if (jitsiApiRef.current) {
        try { jitsiApiRef.current.dispose(); } catch (e) {}
        jitsiApiRef.current = null;
      }
    };

    // ✅ Only re-init when roomName changes.
    // ❌ DO NOT include onHangup/messages/fileTransfers here or it will reset.
  }, [roomName, peerId, ensureJitsiScript]);

  // Controls
  const toggleAudio = () => jitsiApiRef.current?.executeCommand('toggleAudio');
  const toggleVideo = () => jitsiApiRef.current?.executeCommand('toggleVideo');

  const toggleScreenShare = () => {
    jitsiApiRef.current?.executeCommand('toggleShareScreen');
    setIsScreenSharing(prev => !prev);
  };

  // Chat: use functional state updates to avoid stale snapshots
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
    setTimeout(() => {
      setReactions(prev => prev.filter(r => r.id !== newReaction.id));
    }, 3000);
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

  const handleHangup = () => {
    jitsiApiRef.current?.executeCommand('hangup');
    onHangupRef.current?.();
  };

  return (
    <div className="relative h-screen bg-black" data-name="jitsi-call" data-file="components/JitsiCall.js">
      {/* Optionally hide iframe until loaded to avoid any flash */}
      <div
        ref={jitsiContainerRef}
        className={`w-full h-full ${isIframeLoaded ? '' : 'opacity-0'}`}
      />

      {/* Loader disappears as soon as iframe is loaded */}
      {!isIframeLoaded && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 glass-effect rounded-lg p-6 flex items-center gap-3 z-50">
          <div className="icon-loader animate-spin text-2xl text-[var(--primary-color)]"></div>
          <span className="text-lg font-medium">Loading call…</span>
        </div>
      )}

      {/* Optional subtle status once iframe exists but room not joined yet */}
      {isIframeLoaded && !isConferenceJoined && (
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 glass-effect rounded-lg px-4 py-2 z-50 text-sm">
          Joining room as <span className="font-mono">{peerId || 'Peer'}</span>…
        </div>
      )}

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
              onClick={() => {
                sendReaction(emoji);
                setShowReactions(false);
              }}
              className="w-10 h-10 text-2xl hover:scale-125 transition-transform"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 p-6 z-40">
        <div className="glass-effect rounded-lg px-6 py-4 max-w-2xl mx-auto flex items-center justify-center gap-3">
          <button
            onClick={toggleAudio}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              isAudioEnabled ? 'bg-[var(--dark-surface)] hover:bg-opacity-80' : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            <div className={`${isAudioEnabled ? 'icon-mic' : 'icon-mic-off'} text-xl`}></div>
          </button>

          <button
            onClick={toggleVideo}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              isVideoEnabled ? 'bg-[var(--dark-surface)] hover:bg-opacity-80' : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            <div className={`${isVideoEnabled ? 'icon-video' : 'icon-video-off'} text-xl`}></div>
          </button>

          <button
            onClick={toggleScreenShare}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              isScreenSharing ? 'bg-[var(--primary-color)]' : 'bg-[var(--dark-surface)] hover:bg-opacity-80'
            }`}
          >
            <div className="icon-monitor text-xl"></div>
          </button>

          <button
            onClick={() => setShowReactions(prev => !prev)}
            className="w-12 h-12 rounded-full bg-[var(--dark-surface)] hover:bg-opacity-80 flex items-center justify-center transition-all"
          >
            <div className="icon-smile text-xl"></div>
          </button>

          <button
            onClick={() => setShowChat(prev => !prev)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              showChat ? 'bg-[var(--primary-color)]' : 'bg-[var(--dark-surface)] hover:bg-opacity-80'
            }`}
          >
            <div className="icon-message-square text-xl"></div>
          </button>

          <button
            onClick={() => setShowFileTransfer(prev => !prev)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              showFileTransfer ? 'bg-[var(--primary-color)]' : 'bg-[var(--dark-surface)] hover:bg-opacity-80'
            }`}
          >
            <div className="icon-file-up text-xl"></div>
          </button>

          <button
            onClick={() => setShowSettings(true)}
            className="w-12 h-12 rounded-full bg-[var(--dark-surface)] hover:bg-opacity-80 flex items-center justify-center transition-all"
          >
            <div className="icon-settings text-xl"></div>
          </button>

          <button
            onClick={handleHangup}
            className="w-12 h-12 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center transition-all"
          >
            <div className="icon-phone-off text-xl"></div>
          </button>
        </div>
      </div>
    </div>
  );
}
