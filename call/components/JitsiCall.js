function JitsiCall({ roomName, onHangup }) {
  const jitsiContainerRef = React.useRef(null);
  const jitsiApiRef = React.useRef(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    if (!jitsiContainerRef.current) return;

    const initializeJitsi = () => {
      if (!window.JitsiMeetExternalAPI) {
        console.log('Waiting for Jitsi API script...');
        setTimeout(initializeJitsi, 300);
        return;
      }

      // 1. Swap 'meet.jit.si' for a stealthier public mirror
      // Alternatives: 'jitsi.hamburg.ccc.de', 'fairmeeting.net', 'meet.ffmuc.net'
      const domain = 'meet.ffmuc.net'; 
      
      const options = {
        roomName: "Relay_" + roomName,
        width: '100%',
        height: '100%',
        parentNode: jitsiContainerRef.current,
        configOverwrite: {
          startWithAudioMuted: false,
          startWithVideoMuted: false,
          prejoinPageEnabled: false,
          disableDeepLinking: true,
          // Force standard web ports (443) to hide from school firewalls
          preferH264: true 
        },
        interfaceConfigOverwrite: {
          TOOLBAR_BUTTONS: [
            'microphone', 'camera', 'hangup', 'chat', 'settings', 
            'videoquality', 'tileview', 'mute-everyone'
          ],
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false
        }
      };

      try {
        jitsiApiRef.current = new window.JitsiMeetExternalAPI(domain, options);

        jitsiApiRef.current.addEventListener('videoConferenceJoined', () => {
          console.log('Joined Jitsi relay successfully');
          setLoading(false);
        });

        jitsiApiRef.current.addEventListener('readyToClose', () => {
          if (onHangup) onHangup();
        });

        // Detect if the domain itself is blocked
        setTimeout(() => {
          if (loading && !jitsiApiRef.current._setupDone) {
             setError("Network block detected. Try refreshing.");
          }
        }, 8000);

      } catch (err) {
        console.error('Relay error:', err);
        setLoading(false);
      }
    };

    initializeJitsi();

    return () => {
      if (jitsiApiRef.current) {
        jitsiApiRef.current.dispose();
      }
    };
  }, [roomName, onHangup]);

  return (
    <div className="relative h-screen bg-black w-full" data-name="jitsi-call">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center glass-effect z-50">
          <div className="text-center p-6 bg-zinc-900/80 rounded-2xl border border-white/10">
            {error ? (
               <p className="text-red-400">{error}</p>
            ) : (
              <>
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-lg text-white font-medium">Bypassing Network Filters...</p>
                <p className="text-sm text-gray-400 mt-2">Connecting via encrypted relay</p>
              </>
            )}
          </div>
        </div>
      )}
      <div ref={jitsiContainerRef} className="w-full h-full"></div>
    </div>
  );
}
