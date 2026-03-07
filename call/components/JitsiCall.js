function JitsiCall({ roomName, peerId, remotePeerId, messages, setMessages, fileTransfers, setFileTransfers, onHangup }) {
  try {
    const jitsiContainerRef = React.useRef(null);
    const jitsiApiRef = React.useRef(null);
    const [isAudioEnabled, setIsAudioEnabled] = React.useState(true);
    const [isVideoEnabled, setIsVideoEnabled] = React.useState(true);
    const [isScreenSharing, setIsScreenSharing] = React.useState(false);
    const [showChat, setShowChat] = React.useState(false);
    const [showFileTransfer, setShowFileTransfer] = React.useState(false);
    const [showSettings, setShowSettings] = React.useState(false);
    const [showReactions, setShowReactions] = React.useState(false);
    const [reactions, setReactions] = React.useState([]);
    const [isConnected, setIsConnected] = React.useState(false);

    React.useEffect(() => {
      if (!jitsiContainerRef.current || !window.JitsiMeetExternalAPI) {
        return;
      }

      const domain = 'meet.jit.si';
      const options = {
        roomName: roomName,
        width: '100%',
        height: '100%',
        parentNode: jitsiContainerRef.current,
        configOverwrite: {
          startWithAudioMuted: false,
          startWithVideoMuted: false,
          prejoinPageEnabled: false,
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

      jitsiApiRef.current = new window.JitsiMeetExternalAPI(domain, options);

      jitsiApiRef.current.addEventListener('videoConferenceJoined', () => {
        console.log('Jitsi conference joined');
        setIsConnected(true);
      });

      jitsiApiRef.current.addEventListener('readyToClose', () => {
        onHangup();
      });

      jitsiApiRef.current.addEventListener('audioMuteStatusChanged', (e) => {
        setIsAudioEnabled(!e.muted);
      });

      jitsiApiRef.current.addEventListener('videoMuteStatusChanged', (e) => {
        setIsVideoEnabled(!e.muted);
      });

      return () => {
        if (jitsiApiRef.current) {
          jitsiApiRef.current.dispose();
        }
      };
    }, [roomName, onHangup]);

    const toggleAudio = () => {
      if (jitsiApiRef.current) {
        jitsiApiRef.current.executeCommand('toggleAudio');
      }
    };

    const toggleVideo = () => {
      if (jitsiApiRef.current) {
        jitsiApiRef.current.executeCommand('toggleVideo');
      }
    };

    const toggleScreenShare = () => {
      if (jitsiApiRef.current) {
        jitsiApiRef.current.executeCommand('toggleShareScreen');
        setIsScreenSharing(!isScreenSharing);
      }
    };

    const sendMessage = (text) => {
      const newMessage = {
        text,
        sender: 'me',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages([...messages, newMessage]);
      
      if (jitsiApiRef.current) {
        jitsiApiRef.current.executeCommand('sendChatMessage', text);
      }
    };

    const sendReaction = (emoji) => {
      const newReaction = {
        id: Date.now(),
        emoji,
        x: Math.random() * 80 + 10
      };
      setReactions([...reactions, newReaction]);
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
      if (jitsiApiRef.current) {
        jitsiApiRef.current.executeCommand('hangup');
      }
      onHangup();
    };

    return (
      <div className="relative h-screen bg-black" data-name="jitsi-call" data-file="components/JitsiCall.js">
        <div ref={jitsiContainerRef} className="w-full h-full"></div>

        {!isConnected && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 glass-effect rounded-lg p-6 flex items-center gap-3">
            <div className="icon-loader animate-spin text-2xl text-[var(--primary-color)]"></div>
            <span className="text-lg font-medium">Connecting...</span>
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
              onClick={() => setShowReactions(!showReactions)}
              className="w-12 h-12 rounded-full bg-[var(--dark-surface)] hover:bg-opacity-80 flex items-center justify-center transition-all"
            >
              <div className="icon-smile text-xl"></div>
            </button>

            <button
              onClick={() => setShowChat(!showChat)}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                showChat ? 'bg-[var(--primary-color)]' : 'bg-[var(--dark-surface)] hover:bg-opacity-80'
              }`}
            >
              <div className="icon-message-square text-xl"></div>
            </button>

            <button
              onClick={() => setShowFileTransfer(!showFileTransfer)}
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
  } catch (error) {
    console.error('JitsiCall component error:', error);
    return null;
  }
}
