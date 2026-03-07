# WebRTC Video Call Application

A peer-to-peer video calling application built with React and WebRTC.

## Features

- **Video Calling**: Real-time peer-to-peer video communication
- **Chat**: Text messaging during calls
- **File Transfer**: Share files with call participants
- **Settings**: Configure audio/video quality and devices
- **Reactions**: Send emoji reactions during calls

## Project Structure

```
/
├── index.html              # Main HTML entry point
├── app.js                  # Main application component
├── package.json            # Project metadata
├── components/             # React components
│   ├── ChatPanel.js        # Chat interface
│   ├── FileTransferPanel.js # File sharing
│   ├── Icon.js             # Icon component
│   ├── IdScreen.js         # User ID and call initiation
│   ├── IncomingCall.js     # Incoming call notification
│   ├── Notification.js     # Toast notifications
│   ├── ReactionOverlay.js  # Emoji reactions
│   ├── SettingsPanel.js    # Call settings
│   └── VideoCall.js        # Video call interface
├── utils/                  # Utility functions
│   └── peerManager.js      # WebRTC peer connection manager
└── trickle/               # Trickle-specific folders
    └── notes/             # Project documentation
```

## How to Use

1. Open `index.html` in a web browser
2. Share your generated ID with the person you want to call
3. Enter their ID and click "Start Call"
4. During the call, use the control buttons to:
   - Mute/unmute microphone
   - Turn camera on/off
   - Open chat
   - Access settings
   - End call

## Technology Stack

- React 18
- TailwindCSS
- Lucide Icons
- WebRTC (for peer connections)

© 2026 WebRTC Call App