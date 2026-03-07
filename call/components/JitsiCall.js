/* global React */

/**
 * jitsi.js
 * - Auto-join: prejoinConfig.enabled=false (prejoinPageEnabled deprecated) [6](https://developer.mozilla.org/docs/Web/API/HTMLScriptElement/src)
 * - Hide Jitsi toolbar: toolbarButtons: [] [1](https://jitsi.github.io/handbook/docs/dev-guide/dev-guide-iframe-events/)[7](https://wz-it.com/en/blog/jitsi-meet-integration-own-applications/)
 * - Use datachannel messaging: endpointTextMessageReceived + sendEndpointTextMessage [1](https://jitsi.github.io/handbook/docs/dev-guide/dev-guide-iframe-events/)[3](https://stackoverflow.com/questions/61866377/how-to-send-text-messages-in-jitsi)[4](https://github.com/jitsi/jitsi-meet/issues/5975)
 * - Make it look like YOUR GUI by:
 *    - blocking pointer events on iframe
 *    - masking top/bottom “chrome” areas
 * - Still show your own camera preview tile
 * - Chat / Reactions / File transfer via app-level packets over Jitsi data channel
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
  window.dispatchEvent(
    new CustomEvent("copilot:jitsi-fallback", { detail: payload || {} })
  );
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
    addLink("preload", `https://${domain}/external_api.js`, "script");
  } catch (_) {}
};

/* -----------------------------
   Utilities (base64, chunking)
------------------------------ */

function arrayBufferToBase64(buffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function base64ToArrayBuffer(base64) {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
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
  const jitsiContainerRef = React.useRef(null);
  const jitsiApiRef = React.useRef(null);

  // Keep onHangup stable without re-init
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
  const [fatalError, setFatalError] = React.useState(null);

  // Show your own camera preview tile
  const localVideoRef = React.useRef(null);
  const localStreamRef = React.useRef(null);

  // Participants (needed because sendEndpointTextMessage targets a participantId) [3](https://stackoverflow.com/questions/61866377/how-to-send-text-messages-in-jitsi)
  const participantsRef = React.useRef(new Set()); // participant IDs (excluding us)

  // Data-channel availability (endpointTextMessageReceived exists; dataChannelOpened indicates ready) [1](https://jitsi.github.io/handbook/docs/dev-guide/dev-guide-iframe-events/)
  const [dataChannelReady, setDataChannelReady] = React.useState(false);

  // File receive assembly buffers
  const incomingFilesRef = React.useRef(new Map()); // id -> { meta, chunks:[], receivedCount }

  // Mask sizes to cover any remaining Jitsi chrome
  const MASK_TOP_PX = 64;
  const MASK_BOTTOM_PX = 96;

  // --- Script loader (external_api.js) for this domain [2](https://jitsi.github.io/handbook/docs/dev-guide/dev-guide-iframe/)[1](https://jitsi.github.io/handbook/docs/dev-guide/dev-guide-iframe-events/)
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

  // --- Make iframe non-interactive so it feels like your GUI
  const lockDownIframeInteraction = React.useCallback(() => {
    try {
      const root = jitsiContainerRef.current;
      if (!root) return;
      const iframe = root.querySelector("iframe");
      if (!iframe) return;
      iframe.style.border = "0";
      iframe.style.width = "100%";
      iframe.style.height = "100%";
      iframe.style.pointerEvents = "none"; // key: no Jitsi clicks; your buttons still work
    } catch (_) {}
  }, []);

  // --- Start local camera preview always (your own tile)
  React.useEffect(() => {
    let stopped = false;

    async function startPreview() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        if (stopped) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        // mirror local preview
        if (localVideoRef.current) localVideoRef.current.muted = true;
      } catch (e) {
        console.warn("[LocalPreview] getUserMedia failed:", e);
      }
    }

    startPreview();

    return () => {
      stopped = true;
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(t => t.stop());
        localStreamRef.current = null;
      }
    };
  }, []);

  // Keep preview in sync with your “camera” toggle state (visual only)
  React.useEffect(() => {
    const stream = localStreamRef.current;
    if (!stream) return;
    stream.getVideoTracks().forEach(t => { t.enabled = isVideoEnabled; });
  }, [isVideoEnabled]);

  // --- Packet send/receive over Jitsi data channel
  // Uses endpointTextMessageReceived (official event) [1](https://jitsi.github.io/handbook/docs/dev-guide/dev-guide-iframe-events/)
  // Uses sendEndpointTextMessage command targeting participant IDs [3](https://stackoverflow.com/questions/61866377/how-to-send-text-messages-in-jitsi)[4](https://github.com/jitsi/jitsi-meet/issues/5975)
  const sendPacketToAll = React.useCallback((packetObj) => {
    const api = jitsiApiRef.current;
    if (!api) return;

    const text = JSON.stringify(packetObj);
    const ids = Array.from(participantsRef.current);

    // Send to each participant explicitly (more reliable than “broadcast” assumptions)
    ids.forEach(pid => {
      try {
        api.executeCommand("sendEndpointTextMessage", pid, text);
      } catch (e) {
        // If channel support is disabled, this can fail on some deployments [4](https://github.com/jitsi/jitsi-meet/issues/5975)
        console.warn("[DataChannel] sendEndpointTextMessage failed:", e);
      }
    });

    // Local loopback (so sender sees their own chat/reaction/file immediately)
    handleIncomingPacket({ sender: "me", text });
  }, []);

  const handleIncomingPacket = React.useCallback((raw) => {
    // raw: { sender, text } (sender is display string, text is JSON string)
    let obj;
    try { obj = JSON.parse(raw.text); } catch { return; }
    if (!obj || !obj.type) return;

    if (obj.type === "chat") {
      const newMessage = {
        text: obj.text,
        sender: obj.sender || raw.sender || "peer",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setMessages(prev => [...prev, newMessage]);
      return;
    }

    if (obj.type === "reaction") {
      const newReaction = {
        id: Date.now() + Math.random(),
        emoji: obj.emoji,
        x: obj.x ?? (Math.random() * 80 + 10)
      };
      setReactions(prev => [...prev, newReaction]);
      setTimeout(() => setReactions(prev => prev.filter(r => r.id !== newReaction.id)), 3000);
      return;
    }

    if (obj.type === "file-meta") {
      incomingFilesRef.current.set(obj.id, {
        meta: obj,
        chunks: new Array(obj.totalChunks).fill(null),
        receivedCount: 0
      });
      // show in UI as “receiving”
      setFileTransfers(prev => [...prev, {
        id: obj.id,
        name: obj.name,
        size: obj.size,
        status: "receiving",
        progress: 0
      }]);
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

      setFileTransfers(prev => prev.map(t =>
        t.id === obj.id ? { ...t, progress, status: progress >= 100 ? "assembling" : "receiving" } : t
      ));

      if (entry.receivedCount === entry.meta.totalChunks) {
        // Reassemble
        const b64 = entry.chunks.join("");
        const buffer = base64ToArrayBuffer(b64);
        const blob = new Blob([buffer], { type: entry.meta.mime || "application/octet-stream" });
        const url = URL.createObjectURL(blob);

        // Mark completed + attach download URL
        setFileTransfers(prev => prev.map(t =>
          t.id === obj.id ? { ...t, status: "completed", progress: 100, url } : t
        ));
      }
    }
  }, [setMessages, setFileTransfers]);

  // --- Init Jitsi
  React.useEffect(() => {
    let cancelled = false;

    async function init() {
      setFatalError(null);
      setDataChannelReady(false);
      participantsRef.current = new Set();
      incomingFilesRef.current = new Map();

      if (!jitsiContainerRef.current) return;
      if (jitsiApiRef.current) return;

      const domain = "jitsi.math.uzh.ch";
      const displayName = String(peerId || "Peer");

      try {
        await ensureJitsiScript(domain);
        if (cancelled) return;

        const options = {
          roomName,
          width: "100%",
          height: "100%",
          parentNode: jitsiContainerRef.current,

          onload: () => {
            if (cancelled) return;
            lockDownIframeInteraction();
          },

          userInfo: { displayName },

          configOverwrite: {
            // Auto-join: robust modern config [6](https://developer.mozilla.org/docs/Web/API/HTMLScriptElement/src)
            prejoinConfig: { enabled: false },
            prejoinPageEnabled: false,

            // Hide UI toolbar buttons [1](https://jitsi.github.io/handbook/docs/dev-guide/dev-guide-iframe-events/)[7](https://wz-it.com/en/blog/jitsi-meet-integration-own-applications/)
            toolbarButtons: [],

            // Enable bridge datachannel where supported (otherwise endpoint messaging may error) [4](https://github.com/jitsi/jitsi-meet/issues/5975)[1](https://jitsi.github.io/handbook/docs/dev-guide/dev-guide-iframe-events/)
            openBridgeChannel: "datachannel",

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

        const api = new window.JitsiMeetExternalAPI(domain, options); [2](https://jitsi.github.io/handbook/docs/dev-guide/dev-guide-iframe/)[1](https://jitsi.github.io/handbook/docs/dev-guide/dev-guide-iframe-events/)
        jitsiApiRef.current = api;

        // Keep iframe locked if it re-renders
        const relock = () => {
          if (cancelled) return;
          setTimeout(lockDownIframeInteraction, 50);
          setTimeout(lockDownIframeInteraction, 500);
        };

        api.addEventListener("videoConferenceJoined", () => {
          if (cancelled) return;
          relock();
          // force display name
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

        // Track participants so we can target endpoint messages
        api.addEventListener("participantJoined", (e) => {
          if (cancelled) return;
          if (e?.id) participantsRef.current.add(e.id);
        });

        api.addEventListener("participantLeft", (e) => {
          if (cancelled) return;
          if (e?.id) participantsRef.current.delete(e.id);
        });

        // Data channel readiness + receive messages [1](https://jitsi.github.io/handbook/docs/dev-guide/dev-guide-iframe-events/)
        api.addEventListener("dataChannelOpened", () => {
          if (cancelled) return;
          setDataChannelReady(true);
        });

        api.addEventListener("endpointTextMessageReceived", (payload) => {
          if (cancelled) return;
          // payload: { senderInfo:{id}, eventData:{text} } [1](https://jitsi.github.io/handbook/docs/dev-guide/dev-guide-iframe-events/)
          const sender = payload?.senderInfo?.id || "peer";
          const text = payload?.eventData?.text;
          if (typeof text === "string") handleIncomingPacket({ sender, text });
        });

        // Also try receiving Jitsi chat (common in integrations) [5](https://jitsi.support/how-to/implementation-chat-feature-jitsi-meet-api/)[1](https://jitsi.github.io/handbook/docs/dev-guide/dev-guide-iframe-events/)
        api.addEventListener("incomingMessage", (evt) => {
          if (cancelled) return;
          if (!evt) return;
          const msgText = evt.message || evt?.data?.message;
          const from = evt.from || evt?.data?.from || "peer";
          if (typeof msgText === "string") {
            setMessages(prev => [...prev, {
              text: msgText,
              sender: from,
              time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            }]);
          }
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
        try { jitsiApiRef.current.dispose(); } catch (_) {}
        jitsiApiRef.current = null;
      }
    };
  }, [roomName, peerId, ensureJitsiScript, lockDownIframeInteraction, handleIncomingPacket]);

  // --- Your controls drive Jitsi
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

  // --- Chat: send via your UI + send via Jitsi chat + send via endpoint packets
  const sendMessage = (text) => {
    const newMessage = {
      text,
      sender: "me",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };
    setMessages(prev => [...prev, newMessage]);

    // 1) try Jitsi built-in chat
    jitsiApiRef.current?.executeCommand("sendChatMessage", text); [5](https://jitsi.support/how-to/implementation-chat-feature-jitsi-meet-api/)[2](https://jitsi.github.io/handbook/docs/dev-guide/dev-guide-iframe/)

    // 2) also send as datachannel packet (so your ChatPanel works even if Jitsi UI chat is hidden)
    if (dataChannelReady) {
      sendPacketToAll({ type: "chat", sender: peerId || "me", text });
    }
  };

  // --- Reactions: your overlay + datachannel packet
  const sendReaction = (emoji) => {
    // local immediate
    const newReaction = { id: Date.now(), emoji, x: Math.random() * 80 + 10 };
    setReactions(prev => [...prev, newReaction]);
    setTimeout(() => setReactions(prev => prev.filter(r => r.id !== newReaction.id)), 3000);

    // remote
    if (dataChannelReady) {
      sendPacketToAll({ type: "reaction", emoji, x: newReaction.x });
    }
  };

  // --- File transfer: chunk over endpoint messages (best-effort; depends on datachannel support) [1](https://jitsi.github.io/handbook/docs/dev-guide/dev-guide-iframe-events/)[4](https://github.com/jitsi/jitsi-meet/issues/5975)[3](https://stackoverflow.com/questions/61866377/how-to-send-text-messages-in-jitsi)
  const sendFile = async (file) => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    // show locally immediately
    setFileTransfers(prev => [...prev, {
      id,
      name: file.name,
      size: file.size,
      status: dataChannelReady ? "sending" : "failed",
      progress: 0
    }]);

    if (!dataChannelReady) return;

    const buffer = await file.arrayBuffer();
    const b64 = arrayBufferToBase64(buffer);

    const CHUNK_SIZE = 12000; // chars; keeps each message smaller
    const totalChunks = Math.ceil(b64.length / CHUNK_SIZE);

    // meta first
    sendPacketToAll({
      type: "file-meta",
      id,
      name: file.name,
      size: file.size,
      mime: file.type || "application/octet-stream",
      totalChunks
    });

    for (let i = 0; i < totalChunks; i++) {
      const slice = b64.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
      sendPacketToAll({ type: "file-chunk", id, index: i, data: slice });

      const progress = Math.floor(((i + 1) / totalChunks) * 100);
      setFileTransfers(prev => prev.map(t =>
        t.id === id ? { ...t, progress } : t
      ));
      // tiny yield to keep UI responsive
      await new Promise(r => setTimeout(r, 0));
    }

    setFileTransfers(prev => prev.map(t =>
      t.id === id ? { ...t, status: "completed", progress: 100 } : t
    ));
  };

  return (
    <div className="relative h-screen bg-black" data-name="jitsi-call" data-file="jitsi.js">
      {/* Jitsi iframe mount point */}
      <div ref={jitsiContainerRef} className="absolute inset-0 w-full h-full" />

      {/* Mask bars (covers any remaining Jitsi chrome) */}
      <div className="absolute top-0 left-0 right-0 z-30 pointer-events-none" style={{ height: MASK_TOP_PX, background: "black" }} />
      <div className="absolute bottom-0 left-0 right-0 z-30 pointer-events-none" style={{ height: MASK_BOTTOM_PX, background: "black" }} />

      {fatalError && (
        <div className="absolute inset-0 flex items-center justify-center glass-effect z-50">
          <div className="text-center p-6 bg-zinc-900/90 rounded-2xl border border-white/10 shadow-2xl max-w-md">
            <div className="text-red-400 font-semibold mb-3">Relay failed to load</div>
            <div className="text-sm text-gray-300 break-words">{fatalError}</div>
            <button onClick={() => window.location.reload()} className="mt-5 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white">
              Reload
            </button>
          </div>
        </div>
      )}

      {/* ✅ Your own local camera preview tile */}
      <div className="absolute right-4 top-4 z-40 rounded-xl overflow-hidden border border-white/10 shadow-xl"
           style={{ width: 220, height: 140, background: "#111" }}>
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
          style={{ transform: "scaleX(-1)" }}
        />
        <div className="absolute bottom-1 left-2 text-[10px] text-white/70 font-mono">
          {peerId || "me"}
        </div>
      </div>

      {/* Your panels */}
      {showChat && (
        <div className="absolute top-0 right-0 w-80 h-full z-50">
          <ChatPanel messages={messages} onSendMessage={sendMessage} onClose={() => setShowChat(false)} />
        </div>
      )}

      {showFileTransfer && (
        <div className="absolute top-0 right-0 w-80 h-full z-50">
          <FileTransferPanel fileTransfers={fileTransfers} onSendFile={sendFile} onClose={() => setShowFileTransfer(false)} />
        </div>
      )}

      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}

      <ReactionOverlay reactions={reactions} />

      {showReactions && (
        <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 glass-effect rounded-lg p-2 flex gap-2 z-50">
          {["👍", "❤️", "😂", "👏", "🎉"].map((emoji) => (
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

      {/* Your custom controls (Jitsi toolbar hidden) */}
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

        {/* Optional: small status indicator for datachannel */}
        <div className="mt-2 text-center text-[10px] text-white/40 font-mono">
          Relay data channel: {dataChannelReady ? "READY" : "NOT READY"}
        </div>
      </div>
    </div>
  );
}
