# P2P Video Call Application

A secure peer-to-peer video calling application built with WebRTC and PeerJS with comprehensive relay support.

## Features

- **Peer-to-Peer Connection**: Direct video/audio streaming between users
- **Random Peer IDs**: Each user gets a unique 5-character ID
- **Call Management**: Initiate calls, accept/decline incoming calls
- **Media Controls**: Toggle audio, video, and screen sharing (with browser stop button detection)
- **Real-time Chat**: Send text messages during video calls
- **File Transfer**: Send files with drag-and-drop support and progress tracking
- **Reactions**: Send emoji reactions that float across the screen
- **Settings Panel**: Configure audio and video devices
- **KDE Plasma-Inspired Design**: Clean, modern UI with glassmorphism effects
- **Relay Support**: Multiple STUN/TURN servers including TURN-over-TLS for maximum compatibility

## Technical Stack

- **Frontend**: React 18, TailwindCSS
- **WebRTC**: For P2P media streaming
- **PeerJS**: For signaling and connection management
- **STUN/TURN Servers**: Multiple public servers for NAT traversal and relay
- **Icons**: Lucide icons

## How It Works

1. **Connection**: PeerJS manages the WebRTC connection with multiple STUN/TURN servers
2. **Streaming**: Video/audio streams via P2P when possible, or through TURN relay when needed
3. **No Backend**: Runs entirely in the browser using public STUN/TURN infrastructure

## Usage

1. Share your Peer ID with the person you want to call
2. Enter their Peer ID and click "Start Call"
3. The recipient will see an incoming call notification
4. Once accepted, you're connected via P2P video call

## Controls

- **Mic Toggle**: Mute/unmute your microphone
- **Video Toggle**: Enable/disable your camera
- **Screen Share**: Share your screen (automatically stops when browser stop button is clicked)
- **Reactions**: Send emoji reactions (👍, ❤️, 😂, 👏, 🎉)
- **Chat**: Open/close chat panel to send text messages
- **File Transfer**: Send files via drag-and-drop or file picker with progress tracking
- **Settings**: Configure audio/video devices
- **Hang Up**: End the call

## Design

Based on KDE Plasma's Breeze theme with:
- Glassmorphism effects
- Plasma Blue (#3daee9) primary color
- Clean, flat design with subtle rounded corners
- Dark theme optimized for video calls