# P2P Video Call Application

A secure peer-to-peer video calling application built with WebRTC and PeerJS.

## Features

- **Peer-to-Peer Connection**: Direct video/audio streaming between users
- **Random Peer IDs**: Each user gets a unique 5-character ID
- **Call Management**: Initiate calls, accept/decline incoming calls
- **Media Controls**: Toggle audio, video, and screen sharing
- **KDE Plasma-Inspired Design**: Clean, modern UI with glassmorphism effects

## Technical Stack

- **Frontend**: React 18, TailwindCSS
- **WebRTC**: For P2P media streaming
- **PeerJS**: For signaling only (actual streams are P2P)
- **Icons**: Lucide icons

## How It Works

1. **Connection**: PeerJS is used only for establishing the initial connection
2. **Streaming**: Once connected, video/audio streams directly between peers (P2P) via direct WAN connection
3. **No Backend**: Runs entirely in the browser without STUN/TURN servers

## Usage

1. Share your Peer ID with the person you want to call
2. Enter their Peer ID and click "Start Call"
3. The recipient will see an incoming call notification
4. Once accepted, you're connected via P2P video call

## Controls

- **Mic Toggle**: Mute/unmute your microphone
- **Video Toggle**: Enable/disable your camera
- **Screen Share**: Share your screen instead of camera feed
- **Hang Up**: End the call

## Design

Based on KDE Plasma's Breeze theme with:
- Glassmorphism effects
- Plasma Blue (#3daee9) primary color
- Clean, flat design with subtle rounded corners
- Dark theme optimized for video calls