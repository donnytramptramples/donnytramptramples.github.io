function JitsiCall({ roomName, onHangup }) {
  const jitsiContainerRef = React.useRef(null);
  const jitsiApiRef = React.useRef(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // Basic safety check for the DOM element
    if (!jitsiContainerRef.current) {
      console.error('Jitsi container not ready');
      setLoading(false);
      return;
    }

    const initializeJitsi = () => {
      // If the script in index.html hasn't loaded yet, wait slightly
      if (!window.JitsiMeetExternalAPI) {
        console.log('Waiting for Jitsi API script to initialize...');
        setTimeout(initializeJitsi, 200);
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
          enableWelcomePage: false,
          prejoinPageEnabled: false,
          disableDeepLinking: true // Crucial for staying in-browser
        },
        interfaceConfigOverwrite: {
          TOOLBAR_BUTTONS: [
            'microphone', 'camera', 'closedcaptions', 'desktop',
            'fullscreen', 'fodeviceselection', 'hangup', 'chat',
            'recording', 'etherpad', 'settings', 'raisehand',
            'videoquality', 'filmstrip', 'stats', 'shortcuts',
            'tileview', 'download', 'help', 'mute-everyone'
          ],
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false
        }
      };

      try {
        // Create the Jitsi instance (The Non-P2P Relay)
        jitsiApiRef.current = new window.JitsiMeetExternalAPI(domain, options);

        // Hide the loading overlay once the connection is established
        jitsiApiRef.current.addEventListener('videoConferenceJoined', () => {
          console.log('Joined Jitsi meeting successfully');
          setLoading(false);
        });

        // Handle the hangup button inside the Jitsi UI
        jitsiApiRef.current.addEventListener('readyToClose', () => {
          if (onHangup) onHangup();
        });

      } catch (error) {
        console.error('Error initializing Jitsi:', error);
        setLoading(false);
      }
    };

    initializeJitsi();

    // Cleanup: Release camera and memory when switching back to P2P or ID screen
    return () => {
      if (jitsiApiRef.current) {
        try {
          jitsiApiRef.current.dispose();
        } catch (error) {
          console.error('Error disposing Jitsi:', error);
        }
      }
    };
  }, [roomName, onHangup]);

  return (
    <div className="relative h-screen bg-black w-full" data-name="jitsi-call">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center glass-effect z-50">
          <div className="text-center">
            {/* Standard CSS spinner fallback if icon-loader is missing */}
            <div className="w-12 h-12 border-4 border-[var(--primary-color)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-lg text-white font-medium">Bypassing P2P Blocks...</p>
            <p className="text-sm text-gray-400 mt-2">Connecting via Jitsi Relay</p>
          </div>
        </div>
      )}
      <div ref={jitsiContainerRef} className="w-full h-full"></div>
    </div>
  );
}
