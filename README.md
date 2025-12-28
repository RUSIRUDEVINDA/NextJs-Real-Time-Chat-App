# 🕵️‍♂️ Private Chat - Real-Time Terminal Application

A high-performance, secure, and ephemeral chat platform featuring a split architecture with a **Next.js Frontend** and a **Node.js/Socket.io Backend**. Designed for total privacy with anonymous identities and self-destructing rooms.

![Next.js](https://img.shields.io/badge/Next.js-black?style=for-the-badge&logo=next.js&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Upstash](https://img.shields.io/badge/Upstash-00E9A3?style=for-the-badge&logo=redis&logoColor=white)

---

## 📖 Table of Contents
- [Architecture Overview](#-architecture-overview)
- [Project Modules](#-project-modules)
- [How It Works (Technical Flow)](#-how-it-works-technical-flow)
- [Infrastructure Setup (Upstash)](#-infrastructure-setup-upstash)
- [Getting Started](#-getting-started)
- [Key Features](#-key-features)

---

## 🏗️ Architecture Overview

This project follows a decoupled **Client-Server architecture**, specifically optimized for real-time bidirectional communication.

### 1. The Frontend (Next.js 16)
The "Heart" of the user experience. It handles:
- **UI/UX**: Built with **Tailwind CSS v4** for a premium Cyber-Terminal aesthetic.
- **Client-Side Logic**: Manages room state, local storage for identities, and socket connections using `socket.io-client`.
- **API Communication**: Uses a custom fetch client to interact with the Node.js REST endpoints.

### 2. The Backend (Node.js & Express)
The "Brain" of the operation. It handles:
- **Socket.io Server**: Maintains persistent WebSocket connections for instant messaging and live room timers.
- **REST Endpoints**: Simple Express routes for administrative tasks like room creation.
- **Redis Integration**: Directly communicates with Upstash to manage room life-cycles and metadata.

### 3. The Database (Upstash Redis)
The "Memory" (Ephemeral). It handles:
- **Global TTL (Time-To-Live)**: Redis's native `EXPIRE` command ensures that room data is physically deleted after 10 minutes.
- **Stateless Persistence**: Allows the backend to be restarted without losing critical room metadata.

---

## 🔍 How It Works (Technical Flow)

1.  **Identity Creation**: When a user lands on the Home page, a unique "Animal Identity" is generated and stored in `localStorage`.
2.  **Room Initialization**: Clicking "Create Room" sends a `POST` request to the Node server. The server generates a `nanoid`, sets a hash in Redis, and applies a 600-second (10-minute) expiration.
3.  **WebSocket Handshake**: Upon entering a room, the client establishes a Socket.io connection and joins a specific "room channel".
4.  **Real-Time Sync**: 
    - **Messages**: Broadcasted instantly to all users in the specific room ID.
    - **TTL Heartbeat**: The server queries Redis for the remaining time and broadcasts a `ttl-update` every second.
5.  **Self-Destruction**: When the Redis key expires, the server detects the event or simply stops seeing the room data, effectively "killing" the session for all participants.

---

## ☁️ Infrastructure Setup (Upstash)

This project requires an Upstash Redis database to handle ephemeral storage.

### 1. Get Your Credentials
1.  Go to the [Upstash Console](https://console.upstash.com/).
2.  Create a new **Redis** database (The "Free Tier" is perfect for this).
3.  In the database dashboard, find the **REST API** section.
4.  Copy the following values:
    - `UPSTASH_REDIS_REST_URL`
    - `UPSTASH_REDIS_REST_TOKEN`

### 2. Configure Environment
Create a `.env` file in the project root:
```env
# Upstash Configuration
UPSTASH_REDIS_REST_URL="https://your-db-name.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-access-token"

# Backend Configuration
PORT=5000
```

---

## 🚀 Getting Started

### 1. Clone & Install
```bash
git clone https://github.com/RUSIRUDEVINDA/NextJs-Real-Time-Chat-App.git
cd NextJs-Real-Time-Chat-App
npm install
cd server && npm install && cd ..
```

### 2. Launch Development Environment
You must have **two** terminals running simultaneously:

**Terminal A (Backend)**
```bash
cd server
npm run dev
```

**Terminal B (Frontend)**
```bash
npm run dev
```

---

## ✨ Key Features
- **🕵️ Anonymous Proxy**: Interactive terminal-style identity assignment.
- **⏳ Live Countdown**: Visual real-time indicator of when the room will be destroyed.
- **👥 2-User Privacy**: Built-in middleware to prevent "third-party eavesdropping".
- **💻 CRT Effects**: High-end CSS animations including scanlines, flicker, and grid backgrounds.

---

## 🔗 Project Links
- **GitHub Repository**: [Real-Time-Chat-App](https://github.com/RUSIRUDEVINDA/Real-Time-Chat-App)
- **Documentation**: [Next.js Docs](https://nextjs.org/docs), [Socket.io Docs](https://socket.io/docs/v4/), [Upstash Redis Docs](https://docs.upstash.com/redis)

---

## 📄 Recent Updates
- **v1.2.0**: Enhanced documentation with educational technical flows and infrastructure guides.
- **v1.1.0**: Decoupled Node.js backend integration and room limit security.
