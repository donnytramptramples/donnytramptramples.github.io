function JitsiCall({ roomName, onHangup }) {
  const jitsiContainerRef = React.useRef(null);
  const jitsiApiRef = React.useRef(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  
  // Use a ref for retries to prevent the component from unmounting during the loop
  const retryCountRef = React.useRef(0);

  React.useEffect(() => {
    console.log(`[JitsiCall] Mounted. Room: ${roomName}`);
    let isMounted = true;
    let timer;

    const initializeJitsi = () => {
      if (!isMounted) return;

      // 1. Check if the script loaded from index.html is ready
      if (!window.JitsiMeetExternalAPI) {
        if (retryCountRef.current > 25) { 
            console.error('[JitsiCall] SCRIPT ERROR: External API not found after 25 tries.');
            setError("The Jitsi relay script (external_api.js) could not be loaded. This mirror might be blocked.");
            setLoading(false);
            return;
        }
        
        console.log(`[JitsiCall] API not ready. Attempt ${retryCountRef.current}/25...`);
        retryCountRef.current += 1;
        
        // We use a shorter timeout for faster detection
        timer = setTimeout(initializeJitsi, 400);
        return;
      }

      console.log('[JitsiCall] SUCCESS: Jitsi API found. Connecting to meet.ffmuc.net...');
      
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
        console.log(`[JitsiCall] Creating instance on domain: ${domain}`);
        jitsiApiRef.current = new window.JitsiMeetExternalAPI(domain, options);

        // --- Event Listeners ---
        jitsiApiRef.current.on('videoConferenceJoined', (participant) => {
          console.log('[JitsiCall] CONNECTED: Joined relay successfully', participant);
          setLoading(false);
        });

        jitsiApiRef.current.on('readyToClose', () => {
          console.log('[JitsiCall] Hangup triggered from Jitsi UI');
          if (onHangup) onHangup();
        });

        jitsiApiRef.current.on('error', (err) => {
           console.error('[JitsiCall] Jitsi Internal Error:', err);
        });

        // Set a timeout for the actual server connection (Firewall check)
        setTimeout(() => {
          if (isMounted && loading && !jitsiApiRef.current?._setupDone) {
             console.warn('[JitsiCall] Connection Timeout: Server not responding.');
             setError("Relay server did not respond. The network might be blocking the connection.");
          }
        }, 12000);

      } catch (err) {
        console.error('[JitsiCall] Init Exception:', err);
        setError("Could not start Jitsi: " + err.message);
        setLoading(false);
      }
    };

    initializeJitsi();

    return () => {
      console.log('[JitsiCall] Unmounting: Cleaning up tracks and instances...');
      isMounted = false;
      clearTimeout(timer);
      if (jitsiApiRef.current) {
        try {
          jitsiApiRef.current.dispose();
          console.log('[JitsiCall] Disposed successfully');
        } catch (err) {
          console.error('[JitsiCall] Error during dispose:', err);
        }
      }
    };
  }, [roomName, onHangup]); 

  return (
    <div className="fixed inset-0 w-full h-full bg-black z-[9999]" data-name="jitsi-call">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center glass-effect z-[10000]">
          <div className="text-center p-8 bg-zinc-900/95 rounded-3xl border border-white/10 shadow-2xl">
            {error ? (
               <div className="space-y-4">
                 <p className="text-red-400 font-bold">{error}</p>
                 <button 
                    onClick={() => window.location.reload()} 
                    className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-500 transition-all"
                 >
                    Try Refreshing
                 </button>
               </div>
            ) : (
              <>
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                <h2 className="text-2xl text-white font-bold mb-2">Bypassing Network Filters</h2>
                <p className="text-sm text-gray-400">Connecting to encrypted relay server...</p>
                <div className="mt-4 text-[10px] text-gray-600 uppercase tracking-widest font-mono">
                   Mirror: meet.ffmuc.net
                </div>
              </>
            )}
          </div>
        </div>
      )}
      <div ref={jitsiContainerRef} className="w-full h-full"></div>
    </div>
  );
}
