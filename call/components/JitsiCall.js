/* global React */

/**
 * jitsi.js
 * Goal:
 * - Auto-join (no Join Meeting screen) using prejoinConfig.enabled=false (prejoinPageEnabled is deprecated) [3](https://github.com/jitsi/jitsi-meet/issues/16482)
 * - Hide buttons using toolbarButtons: [] [4](https://github.com/jitsi/jitsi-meet/issues/14073)[5](https://jitsi.github.io/handbook/docs/dev-guide/dev-guide-configuration/)
 * - Reduce remaining UI (filmstrip disable) [6](https://deepwiki.com/jitsi/jitsi-meet-vue-sdk/3.2-advanced-configuration)
 * - Make it LOOK like your GUI:
 *    - block all pointer interaction with the iframe (so no Jitsi clicks)
 *    - mask top/bottom areas where Jitsi chrome sometimes appears
 */

/* -----------------------------
   Global helpers (fallback API)
------------------------------ */

// Stable shared room name: both ends compute the same string
window.makeJitsiRoomName = function makeJitsiRoomName(peerId, remotePeerId) {
  const a = String(peerId || "").trim();
  const b = String(remotePeerId || "").trim();
  const [p1, p2] = [a, b].sort();
  return `p2p-${p1}-${p2}`.replace(/[^a-zA-Z0-9-_]/g, "");
};

// Fire an app-level event to switch UI to Jitsi immediately
window.triggerJitsiFallback = function triggerJitsiFallback(payload) {
  window.dispatchEvent(
    new CustomEvent("copilot:jitsi-fallback", { detail: payload || {} })
  );
};

// Optional prewarm to reduce first-switch delay (still uses external_api.js per iframe API docs) [1](https://jitsi.github.io/handbook/docs/dev-guide/dev-guide-iframe/)
window.prewarmJitsi = function prewarmJitsi(domain = "jitsi.math.uzh.ch") {
  try {
    const head = document.head || document.getElementsByTagName("head")[0];

    const addLink = (rel, href, as) => {
      if (document.querySelector(`link[rel="${rel}"][href="${href}"]`)) return;
      const l = document.createElement("link");
      l.rel = rel;
      l.href = href;
      if (as) l.as = as;
      head.appendChild(l);
    };

    addLink("preconnect", `https://${domain}`);
    addLink("dns-prefetch", `https://${domain}`);
    addLink("preload", `https://${domain}/external_api.js`, "script");
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
  onHangup,
}) {
  const jitsiContainerRef = React.useRef(null);
  const jitsiApiRef = React.useRef(null);

  // Keep onHangup stable without re-init (prevents reset while typing)
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

  // No big connecting screen: just a very short “switching…” chip if you want
  const [showSwitchPill, setShowSwitchPill] = React.useState(false);
  const [fatalError, setFatalError] = React.useState(null);

  // How much of the iframe edges to mask (tune if you still see any Jitsi chrome)
  const MASK_TOP_PX = 64;
  const MASK_BOTTOM_PX = 88;

  // Load external_api.js (iframe API) [1](https://jitsi.github.io/handbook/docs/dev-guide/dev-guide-iframe/)[2](https://deepwiki.com/jitsi/jitsi-meet/8-external-api)
  const ensureJitsiScript = React.useCallback((domain) => {
    return new Promise((resolve, reject) => {
      if (window.JitsiMeetExternalAPI) return resolve();

      const existing = document.querySelector('script[data-jitsi-api="1"]');
      if (existing) {
        existing.addEventListener("load", resolve, { once: true });
        existing.addEventListener(
          "error",
          () => reject(new Error("Jitsi API script failed to load")),
          { once: true }
        );
        return;
      }

      window.prewarmJitsi?.(domain);

      const s = document.createElement("script");
      s.src = `https://${domain}/external_api.js`;
      s.async = true;
      s.dataset.jitsiApi = "1";
      s.onload = resolve;
      s.onerror = () =>
        reject(new Error(`Failed to load https://${domain}/external_api.js`));
      document.head.appendChild(s);
    });
  }, []);

  // Helper: after the iframe exists, make it “non-interactive” so user can’t click Jitsi UI
  const lockDownIframeInteraction = React.useCallback(() => {
    try {
      const root = jitsiContainerRef.current;
      if (!root) return;
      const iframe = root.querySelector("iframe");
      if (!iframe) return;

      iframe.style.border = "0";
      iframe.style.width = "100%";
      iframe.style.height = "100%";

      // Key trick: make it feel like your GUI by preventing clicks inside Jitsi UI
      // Your controls still work via executeCommand on the External API instance.
      iframe.style.pointerEvents = "none";
    } catch (_) {}
  }, []);

  React.useEffect(() => {
    let cancelled = false;

    async function init() {
      setFatalError(null);

      // Tiny pill briefly (optional). Remove these lines if you want ZERO messaging.
      setShowSwitchPill(true);
      setTimeout(() => {
        if (!cancelled) setShowSwitchPill(false);
      }, 450);

      if (!jitsiContainerRef.current) return;
      if (jitsiApiRef.current) return;

      const domain = "jitsi.math.uzh.ch";
      const displayName = String(peerId || "Peer");

      try {
        await ensureJitsiScript(domain);
        if (cancelled) return;

        const options = {
          roomName: roomName,
          width: "100%",
          height: "100%",
          parentNode: jitsiContainerRef.current,

          // Called when iframe loads: lock down UI interaction immediately
          onload: () => {
            if (cancelled) return;
            lockDownIframeInteraction();
            setShowSwitchPill(false);
          },

          userInfo: { displayName },

          configOverwrite: {
            // ✅ Auto-join reliably: prejoinPageEnabled was deprecated; use prejoinConfig.enabled=false [3](https://github.com/jitsi/jitsi-meet/issues/16482)
            prejoinConfig: { enabled: false },

            // Keep old flag too (harmless) for older deployments
            prejoinPageEnabled: false,

            // ✅ Hide ALL toolbar buttons in web embeds [4](https://github.com/jitsi/jitsi-meet/issues/14073)[5](https://jitsi.github.io/handbook/docs/dev-guide/dev-guide-configuration/)
            toolbarButtons: [],

            // Reduce more UI: disable filmstrip via configOverwrite pattern [6](https://deepwiki.com/jitsi/jitsi-meet-vue-sdk/3.2-advanced-configuration)
            filmstrip: { disableFilmstrip: true },

            disableDeepLinking: true,
            startWithAudioMuted: false,
            startWithVideoMuted: false
          },

          interfaceConfigOverwrite: {
            // Extra hardening if the deployment reads interface_config
            TOOLBAR_BUTTONS: [],
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            SHOW_BRAND_WATERMARK: false,
            SHOW_POWERED_BY: false
          }
        };

        const api = new window.JitsiMeetExternalAPI(domain, options); // iframe API constructor [1](https://jitsi.github.io/handbook/docs/dev-guide/dev-guide-iframe/)[2](https://deepwiki.com/jitsi/jitsi-meet/8-external-api)
        jitsiApiRef.current = api;

        // Sometimes iframe reloads; re-apply pointerEvents lock
        const relock = () => {
          if (cancelled) return;
          setTimeout(lockDownIframeInteraction, 50);
          setTimeout(lockDownIframeInteraction, 500);
        };

        api.addEventListener("videoConferenceJoined", () => {
          if (cancelled) return;
          setShowSwitchPill(false);
          relock();

          // Force display name again in case the server applies it later
          if (peerId) api.executeCommand("displayName", String(peerId));
        });

        api.addEventListener("readyToClose", () => {
          onHangupRef.current?.();
        });

        api.addEventListener("audioMuteStatusChanged", (e) => {
          if (cancelled) return;
          setIsAudioEnabled(!e.muted);
        });

        api.addEventListener("videoMuteStatusChanged", (e) => {
          if (cancelled) return;
          setIsVideoEnabled(!e.muted);
        });

      } catch (err) {
        console.error("[JitsiCall] init error:", err);
        setFatalError(err.message || String(err));
      }
    }

    init();

    return () => {
      cancelled = true;
      if (jitsiApiRef.current) {
        try {
          jitsiApiRef.current.dispose();
        } catch (_) {}
        jitsiApiRef.current = null;
      }
    };
  }, [roomName, peerId, ensureJitsiScript, lockDownIframeInteraction]);

  // Controls (your GUI drives the meeting)
  const toggleAudio = () => jitsiApiRef.current?.executeCommand("toggleAudio");
  const toggleVideo = () => jitsiApiRef.current?.executeCommand("toggleVideo");

  const toggleScreenShare = () => {
    jitsiApiRef.current?.executeCommand("toggleShareScreen");
    setIsScreenSharing((prev) => !prev);
  };

  const handleHangup = () => {
    jitsiApiRef.current?.executeCommand("hangup");
    onHangupRef.current?.();
  };

  // Your app chat (still local) + optionally forward to Jitsi chat channel
  const sendMessage = (text) => {
    const newMessage = {
      text,
      sender: "me",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, newMessage]);

    // If you want: also send into Jitsi's internal chat
    jitsiApiRef.current?.executeCommand("sendChatMessage", text);
  };

  const sendReaction = (emoji) => {
    const newReaction = { id: Date.now(), emoji, x: Math.random() * 80 + 10 };
    setReactions((prev) => [...prev, newReaction]);
    setTimeout(
      () => setReactions((prev) => prev.filter((r) => r.id !== newReaction.id)),
      3000
    );
  };

  const sendFile = (file) => {
    const transferId = Date.now();
    const newTransfer = {
      id: transferId,
      name: file.name,
      size: file.size,
      status: "completed",
      progress: 100,
    };
    setFileTransfers((prev) => [...prev, newTransfer]);
  };

  return (
    <div className="relative h-screen bg-black" data-name="jitsi-call" data-file="jitsi.js">
      {/* Jitsi iframe mount point */}
      <div ref={jitsiContainerRef} className="absolute inset-0 w-full h-full" />

      {/* Mask bars to cover any remaining Jitsi chrome (works cross-origin) */}
      <div
        className="absolute top-0 left-0 right-0 z-30 pointer-events-none"
        style={{ height: MASK_TOP_PX, background: "black" }}
      />
      <div
        className="absolute bottom-0 left-0 right-0 z-30 pointer-events-none"
        style={{ height: MASK_BOTTOM_PX, background: "black" }}
      />

      {/* Optional small pill (remove if you want 0 text) */}
      {showSwitchPill && !fatalError && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 glass-effect rounded-full px-4 py-2 z-40 text-sm">
          Switching to relay…
        </div>
      )}

      {fatalError && (
        <div className="absolute inset-0 flex items-center justify-center glass-effect z-50">
          <div className="text-center p-6 bg-zinc-900/90 rounded-2xl border border-white/10 shadow-2xl max-w-md">
            <div className="text-red-400 font-semibold mb-3">Relay failed to load</div>
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
          <ChatPanel messages={messages} onSendMessage={sendMessage} onClose={() => setShowChat(false)} />
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
          {["👍", "❤️", "😂", "👏", "🎉"].map((emoji) => (
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

      {/* Your custom controls (the iframe itself is non-interactive) */}
      <div className="absolute bottom-0 left-0 right-0 p-6 z-40">
        <div className="glass-effect rounded-lg px-6 py-4 max-w-2xl mx-auto flex items-center justify-center gap-3">
          <button
            onClick={toggleAudio}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              isAudioEnabled ? "bg-[var(--dark-surface)] hover:bg-opacity-80" : "bg-red-600 hover:bg-red-700"
            }`}
          >
            <div className={`${isAudioEnabled ? "icon-mic" : "icon-mic-off"} text-xl`} />
          </button>

          <button
            onClick={toggleVideo}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              isVideoEnabled ? "bg-[var(--dark-surface)] hover:bg-opacity-80" : "bg-red-600 hover:bg-red-700"
            }`}
          >
            <div className={`${isVideoEnabled ? "icon-video" : "icon-video-off"} text-xl`} />
          </button>

          <button
            onClick={toggleScreenShare}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              isScreenSharing ? "bg-[var(--primary-color)]" : "bg-[var(--dark-surface)] hover:bg-opacity-80"
            }`}
          >
            <div className="icon-monitor text-xl" />
          </button>

          <button
            onClick={() => setShowReactions((prev) => !prev)}
            className="w-12 h-12 rounded-full bg-[var(--dark-surface)] hover:bg-opacity-80 flex items-center justify-center transition-all"
          >
            <div className="icon-smile text-xl" />
          </button>

          <button
            onClick={() => setShowChat((prev) => !prev)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              showChat ? "bg-[var(--primary-color)]" : "bg-[var(--dark-surface)] hover:bg-opacity-80"
            }`}
          >
            <div className="icon-message-square text-xl" />
          </button>

          <button
            onClick={() => setShowFileTransfer((prev) => !prev)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              showFileTransfer ? "bg-[var(--primary-color)]" : "bg-[var(--dark-surface)] hover:bg-opacity-80"
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
