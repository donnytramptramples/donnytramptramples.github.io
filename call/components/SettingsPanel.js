function SettingsPanel({ onClose }) {
  const [devices, setDevices] = React.useState({ audio: [], video: [] });
  const [selectedMic, setSelectedMic] = React.useState("");
  const [selectedCam, setSelectedCam] = React.useState("");

  // Load devices
  React.useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then((list) => {
      const audio = list.filter(d => d.kind === "audioinput");
      const video = list.filter(d => d.kind === "videoinput");

      setDevices({ audio, video });

      if (audio[0]) setSelectedMic(audio[0].deviceId);
      if (video[0]) setSelectedCam(video[0].deviceId);
    });
  }, []);

  // ✅ Switch microphone
  const changeMic = async (deviceId) => {
    setSelectedMic(deviceId);

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { deviceId: { exact: deviceId } },
      video: false
    });

    const newTrack = stream.getAudioTracks()[0];

    // Replace in local stream
    window.localStream.getAudioTracks().forEach(t => {
      window.localStream.removeTrack(t);
      t.stop();
    });
    window.localStream.addTrack(newTrack);

    // Replace in peer connection
    const sender = window.peerConnection
      ?.getSenders()
      .find(s => s.track?.kind === "audio");

    sender?.replaceTrack(newTrack);
  };

  // ✅ Switch camera
  const changeCamera = async (deviceId) => {
    setSelectedCam(deviceId);

    const stream = await navigator.mediaDevices.getUserMedia({
      video: { deviceId: { exact: deviceId } },
      audio: false
    });

    const newTrack = stream.getVideoTracks()[0];

    // Replace in local stream
    window.localStream.getVideoTracks().forEach(t => {
      window.localStream.removeTrack(t);
      t.stop();
    });
    window.localStream.addTrack(newTrack);

    // Replace in peer connection
    const sender = window.peerConnection
      ?.getSenders()
      .find(s => s.track?.kind === "video");

    sender?.replaceTrack(newTrack);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="glass-effect rounded-lg p-6 max-w-md w-full border border-gray-700">
        
        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Settings</h2>
          <button onClick={onClose}>✕</button>
        </div>

        {/* MICROPHONE */}
        <div className="mb-4">
          <label className="block text-sm text-gray-400 mb-2">Microphone</label>
          <select
            value={selectedMic}
            onChange={(e) => changeMic(e.target.value)}
            className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm"
          >
            {devices.audio.map(d => (
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
            className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm"
          >
            {devices.video.map(d => (
              <option key={d.deviceId} value={d.deviceId}>
                {d.label || "Camera"}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

// ✅ expose globally
window.SettingsPanel = SettingsPanel;
