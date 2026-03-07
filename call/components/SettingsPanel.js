function SettingsPanel({ onClose }) {
  const [devices, setDevices] = React.useState({ audio: [], video: [] });
  const [selectedMic, setSelectedMic] = React.useState("");
  const [selectedCam, setSelectedCam] = React.useState("");
  const [error, setError] = React.useState("");

  // Helper: safe refresh of local preview
  const refreshPreview = React.useCallback(() => {
    if (typeof window.refreshLocalPreview === "function") {
      window.refreshLocalPreview();
      return;
    }
    // fallback: rebind srcObject if possible
    if (window.localVideo && window.localStream) {
      try {
        window.localVideo.srcObject = null;
        window.localVideo.srcObject = window.localStream;
        window.localVideo.play?.().catch(() => {});
      } catch (_) {}
    }
  }, []);

  // Load devices (and try to pick currently active ones)
  const loadDevices = React.useCallback(async () => {
    try {
      setError("");

      // Some browsers won't show labels unless permissions were granted at least once.
      // We'll still list devices; labels may be blank until user has allowed cam/mic.
      const list = await navigator.mediaDevices.enumerateDevices();

      const audio = list.filter((d) => d.kind === "audioinput");
      const video = list.filter((d) => d.kind === "videoinput");

      setDevices({ audio, video });

      // Prefer currently active tracks if available
      const currentAudioTrack = window.localStream?.getAudioTracks?.()[0];
      const currentVideoTrack = window.localStream?.getVideoTracks?.()[0];

      const currentMicId = currentAudioTrack?.getSettings?.().deviceId || "";
      const currentCamId = currentVideoTrack?.getSettings?.().deviceId || "";

      // If the current deviceId matches a known device, keep it selected
      if (currentMicId && audio.some((d) => d.deviceId === currentMicId)) {
        setSelectedMic(currentMicId);
      } else if (!selectedMic && audio[0]) {
        setSelectedMic(audio[0].deviceId);
      }

      if (currentCamId && video.some((d) => d.deviceId === currentCamId)) {
        setSelectedCam(currentCamId);
      } else if (!selectedCam && video[0]) {
        setSelectedCam(video[0].deviceId);
      }
    } catch (e) {
      console.error("enumerateDevices failed:", e);
      setError("Could not list devices. Check browser permissions.");
    }
  }, [selectedMic, selectedCam]);

  React.useEffect(() => {
    loadDevices();

    const onDeviceChange = () => loadDevices();
    navigator.mediaDevices.addEventListener?.("devicechange", onDeviceChange);

    return () => {
      navigator.mediaDevices.removeEventListener?.("devicechange", onDeviceChange);
    };
  }, [loadDevices]);

  // Guard: require globals from VideoCall.js
  const requireGlobals = () => {
    if (!window.localStream) return "localStream not available yet (start/join a call first).";
    if (!window.peerConnection) return "peerConnection not available yet (call not fully established).";
    return "";
  };

  // ✅ Switch microphone
  const changeMic = async (deviceId) => {
    setSelectedMic(deviceId);
    setError("");

    const missing = requireGlobals();
    if (missing) {
      setError(missing);
      return;
    }

    let tempStream;
    try {
      tempStream = await navigator.mediaDevices.getUserMedia({
        audio: { deviceId: { exact: deviceId } },
        video: false
      });

      const newTrack = tempStream.getAudioTracks()[0];
      if (!newTrack) throw new Error("No audio track returned");

      // Replace track in peer connection first (so remote updates immediately)
      const sender = window.peerConnection
        ?.getSenders()
        .find((s) => s.track && s.track.kind === "audio");

      if (sender) {
        await sender.replaceTrack(newTrack);
      }

      // Replace in localStream
      const oldTracks = window.localStream.getAudioTracks();
      oldTracks.forEach((t) => {
        try { window.localStream.removeTrack(t); } catch (_) {}
        try { t.stop(); } catch (_) {}
      });
      window.localStream.addTrack(newTrack);

      // Stop any remaining tracks in temp stream (except the one we moved)
      tempStream.getTracks().forEach((t) => {
        if (t !== newTrack) {
          try { t.stop(); } catch (_) {}
        }
      });

      // No preview refresh needed for audio
    } catch (e) {
      console.error("changeMic failed:", e);
      setError("Microphone switch failed. Check permissions/device availability.");
      try { tempStream?.getTracks?.().forEach((t) => t.stop()); } catch (_) {}
    }
  };

  // ✅ Switch camera
  const changeCamera = async (deviceId) => {
    setSelectedCam(deviceId);
    setError("");

    const missing = requireGlobals();
    if (missing) {
      setError(missing);
      return;
    }

    let tempStream;
    try {
      tempStream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: deviceId } },
        audio: false
      });

      const newTrack = tempStream.getVideoTracks()[0];
      if (!newTrack) throw new Error("No video track returned");

      // Replace track in peer connection first
      const sender = window.peerConnection
        ?.getSenders()
        .find((s) => s.track && s.track.kind === "video");

      if (sender) {
        await sender.replaceTrack(newTrack);
      }

      // Replace in localStream
      const oldTracks = window.localStream.getVideoTracks();
      oldTracks.forEach((t) => {
        try { window.localStream.removeTrack(t); } catch (_) {}
        try { t.stop(); } catch (_) {}
      });
      window.localStream.addTrack(newTrack);

      // Stop any remaining tracks in temp stream (except the one we moved)
      tempStream.getTracks().forEach((t) => {
        if (t !== newTrack) {
          try { t.stop(); } catch (_) {}
        }
      });

      // ✅ This is the key: refresh local preview so it shows the new camera
      refreshPreview();
    } catch (e) {
      console.error("changeCamera failed:", e);
      setError("Camera switch failed. Check permissions/device availability.");
      try { tempStream?.getTracks?.().forEach((t) => t.stop()); } catch (_) {}
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="glass-effect rounded-lg p-6 max-w-md w-full border border-gray-700">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Settings</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded flex items-center justify-center hover:bg-[var(--dark-surface)] transition-colors"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 text-sm text-red-300 bg-red-900/30 border border-red-700/40 rounded p-3">
            {error}
          </div>
        )}

        {/* MICROPHONE */}
        <div className="mb-4">
          <label className="block text-sm text-gray-400 mb-2">Microphone</label>
          <select
            value={selectedMic}
            onChange={(e) => changeMic(e.target.value)}
            className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-[var(--primary-color)]"
          >
            {devices.audio.length === 0 && (
              <option value="">No microphones found</option>
            )}
            {devices.audio.map((d) => (
              <option key={d.deviceId} value={d.deviceId}>
                {d.label || "Microphone"}
              </option>
            ))}
          </select>
        </div>

        {/* CAMERA */}
        <div>
          <label className="block text-sm text-gray-400 mb-2">Camera</label>
          <select
            value={selectedCam}
            onChange={(e) => changeCamera(e.target.value)}
            className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-[var(--primary-color)]"
          >
            {devices.video.length === 0 && (
              <option value="">No cameras found</option>
            )}
            {devices.video.map((d) => (
              <option key={d.deviceId} value={d.deviceId}>
                {d.label || "Camera"}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-6 text-xs text-gray-400">
          Tip: If device names are blank, allow camera/mic permissions once and reopen Settings.
        </div>
      </div>
    </div>
  );
}

// ✅ expose globally
window.SettingsPanel = SettingsPanel;
