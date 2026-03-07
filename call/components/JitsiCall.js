function JitsiCall({ roomName, onHangup }) {
  const jitsiContainerRef = React.useRef(null);
  const jitsiApiRef = React.useRef(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [retryCount, setRetryCount] = React.useState(0);

  React.useEffect(() => {
    console.log(`[JitsiCall] Mounted with Room: ${roomName}`);
    if (!jitsiContainerRef.current) {
        console.error('[JitsiCall] Container ref is null');
        return;
    }

    const initializeJitsi = () => {
      // Check if the script exists in the window object
      if (!window.JitsiMeetExternalAPI) {
        if (retryCount > 15) { // Stop after ~5 seconds
            console.error('[JitsiCall] Global Jitsi API not found after 15 retries. Check index.html script tags.');
            setError("Jitsi script failed to load. Check your internet/firewall.");
            setLoading(false);
            return;
        }
        console.log(`[JitsiCall] Jitsi API not ready (Attempt ${retryCount}). Waiting...`);
        setRetryCount(prev => prev + 1);
        setTimeout(initializeJitsi, 300);
        return;
      }

      console.log('[JitsiCall] API script detected. Initializing Jitsi instance...');
      
      // Use the mirror domain
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
        console.log(`[JitsiCall] Connecting to Domain: ${domain}`);
        jitsiApiRef.current = new window.JitsiMeetExternalAPI(domain, options);

        // --- Log all major lifecycle events ---
        
        jitsiApiRef.current.on('videoConferenceJoined', (participant) => {
          console.log('[JitsiCall] EVENT: videoConferenceJoined', participant);
          setLoading(false);
        });

        jitsiApiRef.current.on('participantJoined', (participant) => {
          console.log('[JitsiCall] EVENT: participantJoined', participant);
        });

        jitsiApiRef.current.on('readyToClose', () => {
          console.log('[JitsiCall] EVENT: readyToClose (Hangup clicked)');
          if (onHangup) onHangup();
        });

        jitsiApiRef.current.on('error', (err) => {
          console.error('[JitsiCall] API ERROR:', err);
        });

        // Timeout check: if after 10 seconds we still show loading, the domain is likely blocked
        const connectionTimeout = setTimeout(() => {
          if (loading && !jitsiApiRef.current?._setupDone) {
             console.warn('[JitsiCall] Connection taking too long. Domain might be blocked.');
             setError("Relay server is not responding. The network might be blocking this mirror.");
          }
        }, 10000);

      } catch (err) {
        console.error('[JitsiCall] Initialization Exception:', err);
        setError("Failed to create Jitsi instance: " + err.message);
        setLoading(false);
      }
    };

    initializeJitsi();

    return () => {
      console.log('[JitsiCall] Unmounting. Disposing Jitsi...');
      if (jitsiApiRef.current) {
        try {
          jitsiApiRef.current.dispose();
          console.log('[JitsiCall] Disposed successfully');
        } catch (err) {
          console.error('[JitsiCall] Dispose Error:', err);
        }
      }
    };
  }, [roomName, onHangup, retryCount]);

  return (
    <div className="relative h-screen bg-black w-full" data-name="jitsi-call">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center glass-effect z-50">
          <div className="text-center p-8 bg-zinc-900/90 rounded-3xl border border-white/10 shadow-2xl">
            {error ? (
               <div className="space-y-4">
                 <p className="text-red-400 font-semibold">{error}</p>
                 <button 
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition"
                 >
                    Try Refreshing
                 </button>
               </div>
            ) : (
              <>
                <div className="w-14 h-14 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                <h2 className="text-xl text-white font-bold mb-2">Bypassing Network Filters</h2>
                <p className="text-sm text-gray-400">Connecting to encrypted relay server...</p>
                <div className="mt-4 text-[10px] text-gray-600 uppercase tracking-widest">Mirror: meet.ffmuc.net</div>
              </>
            )}
          </div>
        </div>
      )}
      <div ref={jitsiContainerRef} className="w-full h-full"></div>
    </div>
  );
}
