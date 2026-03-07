/* global React */

/**
 * jitsi.js (FULL, KDE Plasma Dark)
 * - Auto join: prejoinConfig.enabled=false (prejoinPageEnabled deprecated) [2](https://github.com/jitsi/jitsi-meet-react-sdk)
 * - Events: use addListener (EventEmitter) [1](https://github.com/jitsi/jitsi-meet/issues/4671)
 * - IFrame API script: https://<domain>/external_api.js [3](https://github.com/jitsi/jitsi-meet/issues/2027)
 * - Data channel events: dataChannelOpened + endpointTextMessageReceived [1](https://github.com/jitsi/jitsi-meet/issues/4671)
 * - Make it feel like your GUI: hide toolbar, block iframe pointer-events, mask chrome
 * - Local preview tile always
 * - Chat/emoji/files via Jitsi endpoint datachannel when available; graceful fallback if not.
 */

/* -----------------------------
   Global helpers (fallback API)
------------------------------ */

window.makeJitsiRoomName = function makeJitsiRoomName(peerId, remotePeerId) {
  const a = String(peerId || "").trim();
  const b = String(remotePeerId || "").trim();
  const [p1, p2] = [a, b].sort();
  return `p2p-${p1}-${p2}`.replace(/[^a-zA-Z0-9-_]/g, "");
};

window.triggerJitsiFallback = function triggerJitsiFallback(payload) {
  window.dispatchEvent(new CustomEvent("copilot:jitsi-fallback", { detail: payload || {} }));
};

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
    addLink("preload", `https://${domain}/external_api.js`, "script"); // [3](https://github.com/jitsi/jitsi-meet/issues/2027)
  } catch (_) {}
};

/* -----------------------------
   Small helpers
------------------------------ */

function safeJsonParse(s) {
  try { return JSON.parse(s); } catch { return null; }
}

function arrayBufferToBase64(buffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function base64ToArrayBuffer(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

/* -----------------------------
   KDE Plasma Dark theme injection
------------------------------ */

function injectKdeThemeOnce() {
  if (document.getElementById("kde-plasma-dark-theme")) return;
  const style = document.createElement("style");
  style.id = "kde-plasma-dark-theme";
  style.textContent = `
    :root {
      --kde-bg: #1e1f29;
      --kde-panel: #2a2e38;
      --kde-panel2: #252a33;
      --kde-border: #3b4048;
      --kde-text: #eff0f1;
      --kde-muted: #9aa0a6;
      --kde-accent: #3daee9;
      --kde-danger: #da4453;
      --kde-shadow: 0 10px 30px rgba(0,0,0,0.55);
    }
    .kde-glass {
      background: linear-gradient(180deg, rgba(42,46,56,0.88), rgba(30,31,41,0.88));
      border: 1px solid var(--kde-border);
      box-shadow: var(--kde-shadow);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      color: var(--kde-text);
    }
    .kde-chip {
      background: rgba(42,46,56,0.92);
      border: 1px solid var(--kde-border);
      color: var(--kde-text);
      box-shadow: 0 6px 18px rgba(0,0,0,0.45);
    }
    .kde-btn {
      background: var(--kde-panel);
      border: 1px solid var(--kde-border);
      color: var(--kde-text);
      transition: transform .12s ease, box-shadow .12s ease, border-color .12s ease;
    }
    .kde-btn:hover {
      border-color: var(--kde-accent);
      box-shadow: inset 0 0 0 1px var(--kde-accent);
      transform: translateY(-1px);
    }
    .kde-btn:active { transform: translateY(0px) scale(0.98); }
    .kde-btn-danger { background: var(--kde-danger); border-color: rgba(0,0,0,0.25); }
    .kde-label {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
      color: rgba(239,240,241,0.75);
    }
  `;
  document.head.appendChild(style);
}

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
  injectKdeThemeOnce();

  const DOMAIN = "jitsi.math.uzh.ch";

  const jitsiContainerRef = React.useRef(null);
  const jitsiApiRef = React.useRef(null);

  const onHangupRef = React.useRef(onHangup);
  React.useEffect(() => { onHangupRef.current = onHangup; }, [onHangup]);

  // Local preview tile
  const localVideoRef = React.useRef(null);
  const localStreamRef = React.useRef(null);

  // Jitsi endpoint-data messaging readiness
  const [dataReady, setDataReady] = React.useState(false);
  const [dataBlocked, setDataBlocked] = React.useState(false);

  // Track participant IDs (targeted sends)
  const participantsRef = React.useRef(new Set());

  // File assembly buffers
  const incomingFilesRef = React.useRef(new Map());

  // UI state
  const [fatalError, setFatalError] = React.useState(null);
  const [statusChip, setStatusChip] = React.useState("Switching to relay…");

  const [isAudioEnabled, setIsAudioEnabled] = React.useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = React.useState(true);
  const [isScreenSharing, setIsScreenSharing] = React.useState(false);

  const [showChat, setShowChat] = React.useState(false);
  const [showFileTransfer, setShowFileTransfer] = React.useState(false);
  const [showSettings, setShowSettings] = React.useState(false);
  const [showReactions, setShowReactions] = React.useState(false);
  const [reactions, setReactions] = React.useState([]);

  // Mask sizes (tune if you still see Jitsi chrome)
  const MASK_TOP_PX = 64;
  const MASK_BOTTOM_PX = 96;

  // Script loader for external_api.js [3](https://github.com/jitsi/jitsi-meet/issues/2027)
  const ensureJitsiScript = React.useCallback((domain) => {
    return new Promise((resolve, reject) => {
      if (window.JitsiMeetExternalAPI) return resolve();

      const existing = document.querySelector('script[data-jitsi-api="1"]');
      if (existing) {
        existing.addEventListener("load", resolve, { once: true });
        existing.addEventListener("error", () => reject(new Error("Jitsi API script failed to load")), { once: true });
        return;
      }

      window.prewarmJitsi?.(domain);

      const s = document.createElement("script");
      s.src = `https://${domain}/external_api.js`;
      s.async = true;
      s.dataset.jitsiApi = "1";
      s.onload = resolve;
      s.onerror = () => reject(new Error(`Failed to load https://${domain}/external_api.js`));
      document.head.appendChild(s);
    });
  }, []);

  // Disable clicks inside iframe so it feels like your GUI
  const lockDownIframeInteraction = React.useCallback(() => {
    try {
      const root = jitsiContainerRef.current;
      if (!root) return;
      const iframe = root.querySelector("iframe");
      if (!iframe) return;
      iframe.style.border = "0";
      iframe.style.width = "100%";
      iframe.style.height = "100%";
      iframe.style.pointerEvents = "none";
    } catch (_) {}
  }, []);

  // Local preview always
  React.useEffect(() => {
    let stopped = false;
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        if (stopped) { stream.getTracks().forEach(t => t.stop()); return; }
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          localVideoRef.current.muted = true;
        }
      } catch (e) {
        console.warn("[LocalPreview] getUserMedia failed:", e);
      }
    })();
    return () => {
      stopped = true;
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(t => t.stop());
        localStreamRef.current = null;
      }
    };
  }, []);

  React.useEffect(() => {
    const stream = localStreamRef.current;
    if (!stream) return;
    stream.getVideoTracks().forEach(t => { t.enabled = isVideoEnabled; });
  }, [isVideoEnabled]);

  // AddListener helper (EventEmitter) [1](https://github.com/jitsi/jitsi-meet/issues/4671)
  const onApi = React.useCallback((api, evt, fn) => {
    if (!api || typeof api.addListener !== "function") return () => {};
    api.addListener(evt, fn);
    return () => { try { api.removeListener?.(evt, fn); } catch (_) {} };
  }, []);

  // Handle incoming endpoint packets (datachannel) [1](https://github.com/jitsi/jitsi-meet/issues/4671)
  const handlePacket = React.useCallback((senderId, text) => {
    const obj = safeJsonParse(text);
    if (!obj || !obj.type) return;

    if (obj.type === "chat") {
      setMessages(prev => [...prev, {
        text: obj.text,
        sender: obj.sender || senderId || "peer",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }]);
      return;
    }

    if (obj.type === "reaction") {
      const r = { id: Date.now() + Math.random(), emoji: obj.emoji, x: obj.x ?? (Math.random()*80+10) };
      setReactions(prev => [...prev, r]);
      setTimeout(() => setReactions(prev => prev.filter(x => x.id !== r.id)), 3000);
      return;
    }

    if (obj.type === "file-meta") {
      incomingFilesRef.current.set(obj.id, { meta: obj, chunks: new Array(obj.totalChunks).fill(null), receivedCount: 0 });
      setFileTransfers(prev => [...prev, { id: obj.id, name: obj.name, size: obj.size, status: "receiving", progress: 0 }]);
      return;
    }

    if (obj.type === "file-chunk") {
      const entry = incomingFilesRef.current.get(obj.id);
      if (!entry) return;

      if (entry.chunks[obj.index] == null) {
        entry.chunks[obj.index] = obj.data;
        entry.receivedCount += 1;
      }

      const progress = Math.floor((entry.receivedCount / entry.meta.totalChunks) * 100);
      setFileTransfers(prev => prev.map(t => t.id === obj.id ? { ...t, progress, status: progress >= 100 ? "assembling" : "receiving" } : t));

      if (entry.receivedCount === entry.meta.totalChunks) {
        const b64 = entry.chunks.join("");
        const buffer = base64ToArrayBuffer(b64);
        const blob = new Blob([buffer], { type: entry.meta.mime || "application/octet-stream" });
        const url = URL.createObjectURL(blob);
        setFileTransfers(prev => prev.map(t => t.id === obj.id ? { ...t, status: "completed", progress: 100, url } : t));
      }
    }
  }, [setMessages, setFileTransfers]);

  // Send endpoint packets to all known participants
  const sendToAll = React.useCallback((packet) => {
    const api = jitsiApiRef.current;
    if (!api) return;

    const text = JSON.stringify(packet);
    const ids = Array.from(participantsRef.current);

    // If no participants, still do local loopback
    if (!ids.length) {
      handlePacket("me", text);
      return;
    }

    ids.forEach(id => {
      try {
        api.executeCommand("sendEndpointTextMessage", id, text);
      } catch (e) {
        // Datachannel blocked on this server
        setDataBlocked(true);
        setDataReady(false);
      }
    });

    // local loopback so sender sees immediately
    handlePacket("me", text);
  }, [handlePacket]);

  // Auto-recreate (reduces long-lived broken state)
  const recreateRef = React.useRef({ tries: 0 });
  const recreate = React.useCallback((reason) => {
    const now = Date.now();
    // prevent loops: max 2 recreates per minute
    if (!recreateRef.current.last || now - recreateRef.current.last > 60000) {
      recreateRef.current = { tries: 0, last: now };
    }
    if (recreateRef.current.tries >= 2) return;

    recreateRef.current.tries += 1;
    setStatusChip(`Recovering… (${reason})`);

    try { jitsiApiRef.current?.dispose?.(); } catch (_) {}
    jitsiApiRef.current = null;
    // Re-run init by toggling a local state would be ideal, but we can just call init by forcing effect:
    // easiest: trigger a synchronous remount by clearing container:
    try { if (jitsiContainerRef.current) jitsiContainerRef.current.innerHTML = ""; } catch (_) {}
    // The effect below will re-init because jitsiApiRef.current is null and container exists.
  }, []);

  // Init Jitsi
  React.useEffect(() => {
    let cancelled = false;
    let cleanupFns = [];

    (async () => {
      try {
        setFatalError(null);
        setStatusChip("Switching to relay…");
        setDataReady(false);
        setDataBlocked(false);
        participantsRef.current = new Set();
        incomingFilesRef.current = new Map();

        if (!jitsiContainerRef.current) return;
        if (jitsiApiRef.current) return;

        await ensureJitsiScript(DOMAIN);
        if (cancelled) return;

        const options = {
          roomName,
          width: "100%",
          height: "100%",
          parentNode: jitsiContainerRef.current,
          onload: () => { if (!cancelled) lockDownIframeInteraction(); },
          userInfo: { displayName: String(peerId || "Peer") },

          configOverwrite: {
            // Auto-join reliably [2](https://github.com/jitsi/jitsi-meet-react-sdk)
            prejoinConfig: { enabled: false },
            prejoinPageEnabled: false,

            // Hide toolbar buttons
            toolbarButtons: [],

            // IMPORTANT: We do NOT force openBridgeChannel here, because it often triggers instability on public instances.
            // If the server supports endpoint datachannel, it will fire dataChannelOpened. [1](https://github.com/jitsi/jitsi-meet/issues/4671)

            disableDeepLinking: true,
            startWithAudioMuted: false,
            startWithVideoMuted: false
          },

          interfaceConfigOverwrite: {
            TOOLBAR_BUTTONS: [],
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            SHOW_BRAND_WATERMARK: false,
            SHOW_POWERED_BY: false
          }
        };

        const api = new window.JitsiMeetExternalAPI(DOMAIN, options); // [3](https://github.com/jitsi/jitsi-meet/issues/2027)
        jitsiApiRef.current = api;

        const relock = () => { setTimeout(lockDownIframeInteraction, 50); setTimeout(lockDownIframeInteraction, 500); };

        cleanupFns.push(onApi(api, "videoConferenceJoined", () => {
          relock();
          setStatusChip("Connected");
          if (peerId) api.executeCommand("displayName", String(peerId));
        }));

        cleanupFns.push(onApi(api, "readyToClose", () => {
          // Sometimes this fires on internal crash too. Recreate once, otherwise hang up.
          recreate("readyToClose");
          setTimeout(() => onHangupRef.current?.(), 250);
        }));

        cleanupFns.push(onApi(api, "audioMuteStatusChanged", (e) => setIsAudioEnabled(!e.muted)));
        cleanupFns.push(onApi(api, "videoMuteStatusChanged", (e) => setIsVideoEnabled(!e.muted)));

        cleanupFns.push(onApi(api, "participantJoined", (e) => { if (e?.id) participantsRef.current.add(e.id); }));
        cleanupFns.push(onApi(api, "participantLeft", (e) => { if (e?.id) participantsRef.current.delete(e.id); }));

        // Data channel events + endpoint messages [1](https://github.com/jitsi/jitsi-meet/issues/4671)
        cleanupFns.push(onApi(api, "dataChannelOpened", () => {
          setDataReady(true);
          setDataBlocked(false);
        }));

        cleanupFns.push(onApi(api, "endpointTextMessageReceived", (payload) => {
          const text = payload?.eventData?.text;
          const sender = payload?.senderInfo?.id || "peer";
          if (typeof text === "string") handlePacket(sender, text);
        }));

        // Watchdog: if we never connect, recreate once
        setTimeout(() => {
          if (!cancelled && jitsiApiRef.current === api && statusChip !== "Connected") {
            recreate("timeout");
          }
        }, 12000);

      } catch (err) {
        console.error("[JitsiCall] init error:", err);
        setFatalError(err?.message || String(err));
        setStatusChip("Failed");
      }
    })();

    return () => {
      cancelled = true;
      try { cleanupFns.forEach(fn => fn && fn()); } catch (_) {}
      if (jitsiApiRef.current) {
        try { jitsiApiRef.current.dispose(); } catch (_) {}
        jitsiApiRef.current = null;
      }
    };
  }, [roomName, peerId, ensureJitsiScript, lockDownIframeInteraction, onApi, handlePacket, recreate, statusChip]);

  // Controls
  const toggleAudio = () => jitsiApiRef.current?.executeCommand("toggleAudio");
  const toggleVideo = () => jitsiApiRef.current?.executeCommand("toggleVideo");
  const toggleScreenShare = () => {
    jitsiApiRef.current?.executeCommand("toggleShareScreen");
    setIsScreenSharing(prev => !prev);
  };
  const handleHangup = () => {
    jitsiApiRef.current?.executeCommand("hangup");
    onHangupRef.current?.();
  };

  // Chat / reaction / file send
  const sendMessage = (text) => {
    // Always update UI locally
    setMessages(prev => [...prev, {
      text,
      sender: "me",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }]);

    if (dataReady && !dataBlocked) {
      sendToAll({ type: "chat", sender: peerId || "me", text });
    }
  };

  const sendReaction = (emoji) => {
    // local
    const x = Math.random() * 80 + 10;
    const r = { id: Date.now() + Math.random(), emoji, x };
    setReactions(prev => [...prev, r]);
    setTimeout(() => setReactions(prev => prev.filter(t => t.id !== r.id)), 3000);

    if (dataReady && !dataBlocked) {
      sendToAll({ type: "reaction", emoji, x });
    }
  };

  const sendFile = async (file) => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    // limit to keep messages safe on hosted servers
    const MAX_BYTES = 700 * 1024; // 700KB safety
    if (file.size > MAX_BYTES) {
      setFileTransfers(prev => [...prev, { id, name: file.name, size: file.size, status: "failed", progress: 0, error: "File too large for relay mode" }]);
      return;
    }

    setFileTransfers(prev => [...prev, { id, name: file.name, size: file.size, status: (dataReady && !dataBlocked) ? "sending" : "failed", progress: 0 }]);
    if (!dataReady || dataBlocked) return;

    const buffer = await file.arrayBuffer();
    const b64 = arrayBufferToBase64(buffer);

    const CHUNK = 12000; // chars
    const totalChunks = Math.ceil(b64.length / CHUNK);

    sendToAll({ type: "file-meta", id, name: file.name, size: file.size, mime: file.type || "application/octet-stream", totalChunks });

    for (let i = 0; i < totalChunks; i++) {
      const slice = b64.slice(i * CHUNK, (i + 1) * CHUNK);
      sendToAll({ type: "file-chunk", id, index: i, data: slice });
      const progress = Math.floor(((i + 1) / totalChunks) * 100);
      setFileTransfers(prev => prev.map(t => t.id === id ? { ...t, progress } : t));
      await new Promise(r => setTimeout(r, 0));
    }

    setFileTransfers(prev => prev.map(t => t.id === id ? { ...t, status: "completed", progress: 100 } : t));
  };

  return (
    <div className="relative h-screen" style={{ background: "var(--kde-bg)" }} data-name="jitsi-call" data-file="jitsi.js">
      {/* Jitsi iframe mount */}
      <div ref={jitsiContainerRef} className="absolute inset-0 w-full h-full" />

      {/* Mask remaining Jitsi chrome */}
      <div className="absolute top-0 left-0 right-0 z-30 pointer-events-none" style={{ height: MASK_TOP_PX, background: "var(--kde-bg)" }} />
      <div className="absolute bottom-0 left-0 right-0 z-30 pointer-events-none" style={{ height: MASK_BOTTOM_PX, background: "var(--kde-bg)" }} />

      {/* Status chip */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 kde-chip rounded-full px-4 py-2 text-sm">
        {statusChip}
        <span className="ml-3 kde-label">
          Data: {dataBlocked ? "BLOCKED" : (dataReady ? "READY" : "N/A")}
        </span>
      </div>

      {/* Fatal overlay (your own, not Jitsi’s) */}
      {fatalError && (
        <div className="absolute inset-0 flex items-center justify-center z-50">
          <div className="kde-glass rounded-2xl p-6 max-w-md text-center">
            <div className="text-[var(--kde-danger)] font-semibold mb-2">Relay failed</div>
            <div className="text-sm" style={{ color: "var(--kde-muted)" }}>{fatalError}</div>
            <button
              onClick={() => window.location.reload()}
              className="mt-5 px-5 py-2 rounded-lg kde-btn"
            >
              Reload
            </button>
          </div>
        </div>
      )}

      {/* Your local camera preview tile */}
      <div
        className="absolute right-4 top-4 z-40 rounded-lg overflow-hidden"
        style={{
          width: 240,
          height: 150,
          background: "#111",
          border: "1px solid var(--kde-border)",
          boxShadow: "0 8px 24px rgba(0,0,0,.7)"
        }}
      >
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
          style={{ transform: "scaleX(-1)" }}
        />
        <div className="absolute bottom-1 left-2 text-[10px] kde-label">
          {peerId || "me"}
        </div>
      </div>

      {/* Panels */}
      {showChat && (
        <div className="absolute top-0 right-0 w-80 h-full z-50 kde-glass">
          <ChatPanel
            messages={messages}
            onSendMessage={sendMessage}
            onClose={() => setShowChat(false)}
          />
        </div>
      )}

      {showFileTransfer && (
        <div className="absolute top-0 right-0 w-80 h-full z-50 kde-glass">
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
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-50 kde-glass rounded-lg p-2 flex gap-2">
          {["👍", "❤️", "😂", "👏", "🎉"].map(emoji => (
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

      {/* Controls bar (KDE Plasma Dark style) */}
      <div className="absolute bottom-0 left-0 right-0 p-6 z-40">
        <div className="kde-glass rounded-lg px-6 py-4 max-w-2xl mx-auto flex items-center justify-center gap-3">
          <button onClick={toggleAudio}
            className={`kde-btn w-12 h-12 rounded-full flex items-center justify-center ${isAudioEnabled ? "" : "kde-btn-danger"}`}>
            <div className={`${isAudioEnabled ? "icon-mic" : "icon-mic-off"} text-xl`} />
          </button>

          <button onClick={toggleVideo}
            className={`kde-btn w-12 h-12 rounded-full flex items-center justify-center ${isVideoEnabled ? "" : "kde-btn-danger"}`}>
            <div className={`${isVideoEnabled ? "icon-video" : "icon-video-off"} text-xl`} />
          </button>

          <button onClick={toggleScreenShare}
            className="kde-btn w-12 h-12 rounded-full flex items-center justify-center">
            <div className="icon-monitor text-xl" />
          </button>

          <button onClick={() => setShowReactions(prev => !prev)}
            className="kde-btn w-12 h-12 rounded-full flex items-center justify-center">
            <div className="icon-smile text-xl" />
          </button>

          <button onClick={() => setShowChat(prev => !prev)}
            className={`kde-btn w-12 h-12 rounded-full flex items-center justify-center ${showChat ? "" : ""}`}>
            <div className="icon-message-square text-xl" />
          </button>

          <button onClick={() => setShowFileTransfer(prev => !prev)}
            className="kde-btn w-12 h-12 rounded-full flex items-center justify-center">
            <div className="icon-file-up text-xl" />
          </button>

          <button onClick={() => setShowSettings(true)}
            className="kde-btn w-12 h-12 rounded-full flex items-center justify-center">
            <div className="icon-settings text-xl" />
          </button>

          <button onClick={handleHangup}
            className="kde-btn kde-btn-danger w-12 h-12 rounded-full flex items-center justify-center">
            <div className="icon-phone-off text-xl" />
          </button>
        </div>
      </div>
    </div>
  );
}
``
