function VideoCall({ call, peerId, remotePeerId, messages, setMessages, fileTransfers, setFileTransfers, onHangup, onJitsiFallback }) {
  try {
    const localVideoRef = React.useRef(null);
    const remoteVideoRef = React.useRef(null);
    const [isAudioEnabled, setIsAudioEnabled] = React.useState(true);
    const [isVideoEnabled, setIsVideoEnabled] = React.useState(true);
    const [isScreenSharing, setIsScreenSharing] = React.useState(false);
    const [showChat, setShowChat] = React.useState(false);
    const [showFileTransfer, setShowFileTransfer] = React.useState(false);
    const [showSettings, setShowSettings] = React.useState(false);
    const [showReactions, setShowReactions] = React.useState(false);
    const [reactions, setReactions] = React.useState([]);
    const [isDataChannelReady, setIsDataChannelReady] = React.useState(false);
    const originalStreamRef = React.useRef(null);
    const screenStreamRef = React.useRef(null);
    const dataChannelRef = React.useRef(null);
    const fileChunksRef = React.useRef({});

    React.useEffect(() => {
      console.log('VideoCall mounted');
      console.log('Local stream:', call.localStream);
      console.log('Remote stream:', call.remoteStream);
      
      if (localVideoRef.current && call.localStream) {
        localVideoRef.current.srcObject = call.localStream;
        originalStreamRef.current = call.localStream;
        console.log('Local video stream set');
      }
      if (remoteVideoRef.current && call.remoteStream) {
        remoteVideoRef.current.srcObject = call.remoteStream;
        console.log('Remote video stream set');
      }

      const peerConnection = call.call.peerConnection;
      console.log('PeerConnection state:', peerConnection.connectionState);
      console.log('ICE connection state:', peerConnection.iceConnectionState);
      
      peerConnection.oniceconnectionstatechange = () => {
        console.log('ICE connection state changed:', peerConnection.iceConnectionState);
      };
      
      peerConnection.onconnectionstatechange = () => {
        console.log('Connection state changed:', peerConnection.connectionState);
      };
      
      try {
        dataChannelRef.current = peerConnection.createDataChannel('communication');
        console.log('Data channel created as initiator');
        setupDataChannel(dataChannelRef.current);
      } catch (e) {
        console.log('Data channel will be received from initiator');
      }
      
      peerConnection.ondatachannel = (event) => {
        console.log('Data channel received');
        dataChannelRef.current = event.channel;
        setupDataChannel(event.channel);
      };
    }, [call]);

    const setupDataChannel = (channel) => {
      console.log('Setting up data channel');
      channel.onopen = () => {
        console.log('Data channel opened, ready state:', channel.readyState);
        setIsDataChannelReady(true);
      };
      channel.onclose = () => {
        console.log('Data channel closed');
        setIsDataChannelReady(false);
      };
      channel.onmessage = handleDataChannelMessage;
      channel.onerror = (error) => {
        console.error('Data channel error:', error);
      };
    };

    const toggleAudio = () => {
      const audioTracks = call.localStream.getAudioTracks();
      audioTracks.forEach(track => track.enabled = !track.enabled);
      setIsAudioEnabled(!isAudioEnabled);
    };

    const toggleVideo = () => {
      const videoTracks = call.localStream.getVideoTracks();
      videoTracks.forEach(track => track.enabled = !track.enabled);
      setIsVideoEnabled(!isVideoEnabled);
    };

    const toggleScreenShare = async () => {
      try {
        if (!isScreenSharing) {
          const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
          const videoTrack = screenStream.getVideoTracks()[0];
          screenStreamRef.current = screenStream;
          
          const sender = call.call.peerConnection.getSenders().find(s => s.track.kind === 'video');
          if (sender) {
            sender.replaceTrack(videoTrack);
          }
          
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = screenStream;
          }
          
          videoTrack.onended = () => {
            stopScreenShare();
          };
          
          setIsScreenSharing(true);
        } else {
          stopScreenShare();
        }
      } catch (error) {
        console.error('Screen share error:', error);
      }
    };

    const stopScreenShare = () => {
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(track => track.stop());
      }
      
      const videoTrack = originalStreamRef.current.getVideoTracks()[0];
      const sender = call.call.peerConnection.getSenders().find(s => s.track.kind === 'video');
      if (sender) {
        sender.replaceTrack(videoTrack);
      }
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = originalStreamRef.current;
      }
      
      setIsScreenSharing(false);
    };

    const sendMessage = (text) => {
      const newMessage = {
        text,
        sender: 'me',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages([...messages, newMessage]);
      
      console.log('Attempting to send message:', text);
      console.log('Data channel state:', dataChannelRef.current?.readyState);
      
      if (dataChannelRef.current && dataChannelRef.current.readyState === 'open') {
        const messageData = JSON.stringify({
          type: 'chat',
          text,
          time: newMessage.time
        });
        console.log('Sending message data:', messageData);
        dataChannelRef.current.send(messageData);
      } else {
        console.error('Data channel not ready. State:', dataChannelRef.current?.readyState);
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
      
      console.log('Attempting to send reaction:', emoji);
      console.log('Data channel state:', dataChannelRef.current?.readyState);
      
      if (dataChannelRef.current && dataChannelRef.current.readyState === 'open') {
        const reactionData = JSON.stringify({
          type: 'reaction',
          emoji,
          x: newReaction.x,
          id: newReaction.id
        });
        console.log('Sending reaction data:', reactionData);
        dataChannelRef.current.send(reactionData);
      } else {
        console.error('Data channel not ready for reaction. State:', dataChannelRef.current?.readyState);
      }
    };

    const sendFile = (file) => {
      console.log('Attempting to send file:', file.name);
      console.log('Data channel state:', dataChannelRef.current?.readyState);
      
      if (!dataChannelRef.current || dataChannelRef.current.readyState !== 'open') {
        console.error('Data channel not ready for file transfer');
        return;
      }

      const transferId = Date.now();
      const newTransfer = {
        id: transferId,
        name: file.name,
        size: file.size,
        status: 'sending',
        progress: 0
      };
      setFileTransfers(prev => [...prev, newTransfer]);

      const metaData = JSON.stringify({
        type: 'file-meta',
        id: transferId,
        name: file.name,
        size: file.size
      });
      console.log('Sending file metadata:', metaData);
      dataChannelRef.current.send(metaData);

      const chunkSize = 16384;
      let offset = 0;

      const sendChunk = () => {
        const slice = file.slice(offset, offset + chunkSize);
        const reader = new FileReader();
        
        reader.onload = (e) => {
          if (dataChannelRef.current && dataChannelRef.current.readyState === 'open') {
            try {
              dataChannelRef.current.send(e.target.result);
              offset += chunkSize;
              
              const progress = Math.min(100, Math.round((offset / file.size) * 100));
              setFileTransfers(prev => prev.map(t => 
                t.id === transferId ? { ...t, progress } : t
              ));

              if (offset < file.size) {
                setTimeout(sendChunk, 10);
              } else {
                setFileTransfers(prev => prev.map(t => 
                  t.id === transferId ? { ...t, status: 'completed', progress: 100 } : t
                ));
                dataChannelRef.current.send(JSON.stringify({
                  type: 'file-complete',
                  id: transferId
                }));
              }
            } catch (error) {
              console.error('Error sending chunk:', error);
            }
          }
        };
        reader.readAsArrayBuffer(slice);
      };
      
      sendChunk();
    };

    const handleDataChannelMessage = (event) => {
      console.log('Received data channel message');
      try {
        const data = JSON.parse(event.data);
        console.log('Parsed message type:', data.type);
        console.log('Message data:', data);
        
        if (data.type === 'chat') {
          console.log('Received chat message:', data.text);
          const newMessage = {
            text: data.text,
            sender: 'them',
            time: data.time
          };
          setMessages(prev => [...prev, newMessage]);
        } else if (data.type === 'reaction') {
          console.log('Received reaction:', data.emoji);
          const newReaction = {
            id: data.id,
            emoji: data.emoji,
            x: data.x
          };
          setReactions(prev => [...prev, newReaction]);
          setTimeout(() => {
            setReactions(prev => prev.filter(r => r.id !== data.id));
          }, 3000);
        } else if (data.type === 'file-meta') {
          console.log('Received file metadata:', data.name);
          fileChunksRef.current[data.id] = {
            name: data.name,
            size: data.size,
            chunks: [],
            receivedSize: 0
          };
          const newTransfer = {
            id: data.id,
            name: data.name,
            size: data.size,
            status: 'receiving',
            progress: 0
          };
          setFileTransfers(prev => [...prev, newTransfer]);
        } else if (data.type === 'file-complete') {
          console.log('File transfer complete');
          const fileData = fileChunksRef.current[data.id];
          if (fileData) {
            const blob = new Blob(fileData.chunks);
            const url = URL.createObjectURL(blob);
            setFileTransfers(prev => prev.map(t => 
              t.id === data.id ? { ...t, status: 'completed', progress: 100, downloadUrl: url } : t
            ));
            delete fileChunksRef.current[data.id];
          }
        } else if (data.type === 'jitsi-invite') {
          console.log('Received Jitsi invite:', data.roomName);
          // Automatically switch to Jitsi when invited
          if (onJitsiFallback) {
            onJitsiFallback(data.roomName);
          }
        }
      } catch (e) {
        console.log('Received binary data chunk, size:', event.data?.byteLength);
        for (const fileId in fileChunksRef.current) {
          const fileData = fileChunksRef.current[fileId];
          fileData.chunks.push(event.data);
          fileData.receivedSize += event.data.byteLength;
          
          const progress = Math.min(100, Math.round((fileData.receivedSize / fileData.size) * 100));
          setFileTransfers(prev => prev.map(t => 
            t.id === fileId ? { ...t, progress } : t
          ));
        }
      }
    };

    const handleHangup = () => {
      call.localStream.getTracks().forEach(track => track.stop());
      call.call.close();
      onHangup();
    };

    return (
      <div className="relative h-screen bg-black" data-name="video-call" data-file="components/VideoCall.js">
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
        
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className="absolute top-4 right-4 w-64 h-48 object-cover rounded-lg border-2 border-[var(--primary-color)] shadow-lg"
        />

        {!isDataChannelReady && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 glass-effect rounded-lg p-6 flex items-center gap-3">
            <div className="icon-loader animate-spin text-2xl text-[var(--primary-color)]"></div>
            <span className="text-lg font-medium">Connecting...</span>
          </div>
        )}

        {showChat && (
          <div className="absolute top-0 right-0 w-80 h-full">
            <ChatPanel 
              messages={messages} 
              onSendMessage={sendMessage} 
              onClose={() => setShowChat(false)}
            />
          </div>
        )}

        {showFileTransfer && (
          <div className="absolute top-0 right-0 w-80 h-full">
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
          <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 glass-effect rounded-lg p-2 flex gap-2">
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

        <div className="absolute bottom-0 left-0 right-0 p-6">
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
              onClick={() => {
                // Create consistent room name by sorting peer IDs
                const ids = [peerId, remotePeerId].sort();
                const roomName = `p2p-${ids[0]}-${ids[1]}`;
                
                // Send Jitsi room invitation to remote peer
                if (dataChannelRef.current && dataChannelRef.current.readyState === 'open') {
                  dataChannelRef.current.send(JSON.stringify({
                    type: 'jitsi-invite',
                    roomName: roomName
                  }));
                }
                
                // Switch to Jitsi on this side
                if (onJitsiFallback) {
                  onJitsiFallback(roomName);
                }
              }}
              disabled={!isDataChannelReady}
              className="w-12 h-12 rounded-full bg-yellow-600 hover:bg-yellow-700 flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              title="Switch to Jitsi (if P2P has issues)"
            >
              <div className="icon-refresh-cw text-xl"></div>
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
    console.error('VideoCall component error:', error);
    return null;
  }
}

