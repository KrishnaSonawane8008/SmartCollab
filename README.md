<img src="./readme/smart-collab.svg" alt="Alt Text" style="width: 100%; height: auto;">

<!-- Row 1: Core Application Stack -->
![Python](https://img.shields.io/badge/python-v3.12.4-3776AB?style=for-the-badge&logo=python&style=plastic)
![FastAPI](https://img.shields.io/badge/fastapi-v0.127.0-009688?style=for-the-badge&logo=fastapi&style=plastic)
![ollama](https://img.shields.io/badge/ollama-v0.21.0-000000?style=for-the-badge&logo=ollama&style=plastic)
![PostgreSQL](https://img.shields.io/badge/postgresql-v18.3-4169E1?style=for-the-badge&logo=postgresql&logoColor=4169E1&style=plastic)
![Redis](https://img.shields.io/badge/redis-v4.2.3-FF4438?style=for-the-badge&logo=redis&style=plastic)
![React](https://img.shields.io/badge/react-v19.2.0-61DAFB?style=for-the-badge&logo=react&style=plastic)
![Tailwind CSS](https://img.shields.io/badge/tailwindcss-v4.1.18-06B6D4?style=for-the-badge&logo=tailwindcss&style=plastic)
![Node.js](https://img.shields.io/badge/node.js-v24.12.0-5FA04E?style=for-the-badge&logo=nodedotjs&style=plastic)
![WebRTC Mediasoup](https://img.shields.io/badge/medisoup-v3.19.17-06B6D4?style=for-the-badge&logo=webrtc&style=plastic)
![WebSockets](https://img.shields.io/badge/socket.io-v4.8.3-010101?style=for-the-badge&logo=socketdotio&style=plastic)

---

SmartCollab is a real-time collaboration ecosystem designed to eliminate linguistic, geographical, and organizational barriers in modern remote teamwork. By combining low-latency multi-party video conferencing, dynamic WebSockets messaging, automated C++ Whisper audio transcription, neural machine translation (NLLB-200), and streaming AI meeting summarization (Llama 3.1), SmartCollab transforms disparate digital interactions into a unified, intelligent, and highly accessible workplace.

---

## 🌟 Key Features

### 1. Multilingual Real-Time Chat & Script Detection
* **Instant Message Translation:** Built-in neural machine translation covering 20+ Indian and global languages (e.g., Hindi, Marathi, Bengali, Tamil, Telugu, Gujarati, Kannada, Malayalam, Urdu, Punjabi, English) using Meta's NLLB-200 model accelerated by CTranslate2.
* **Automatic Script Heuristics:** Client and server-side script identification automatically detects input scripts (Devanagari, Bengali, Tamil, Arabic/Urdu, Latin, etc.) and routes translation requests only when necessary.
* **InScript Virtual Keyboard:** Integrated multilingual on-screen virtual keyboard supporting native script input directly within the chat interface.

### 2. Low-Latency Multi-Party Video & Screen Sharing
* **Selective Forwarding Unit (SFU) Architecture:** Powered by Node.js and `mediasoup` for scalable, low-latency audio/video packet forwarding.
* **Real-Time Media Controls:** Dynamic camera toggling, microphone muting/unmuting, and desktop/window screen sharing.
* **Floating Call Overlay:** Non-blocking picture-in-picture video window allowing users to navigate channels and communities while remaining active on a call.

### 3. Real-Time Audio Pipeline & Automated Speech-to-Text
* **Direct RTP Audio Extraction:** SFU server pipes audio tracks via UDP plain transport directly to a dedicated Transcriber service.
* **Jitter Buffer & PCM Stitcher:** Custom Node.js Opus decoding pipeline with jitter buffering and PCM sample stitching for loss-resilient audio reconstruction.
* **Local Whisper C++ Transcription:** Offline speech recognition executing `whisper.cpp` (GGML models) to generate precise, timestamped user transcripts.

### 4. Streaming AI Meeting Summarization
* **LLM Meeting Insights:** Integration with local Ollama runtime (`Llama-3.1-8B-Instruct`) to generate concise, structured meeting overviews, action items, and key decisions.
* **Server-Sent Events (SSE):** Token-by-token real-time streaming summaries rendered directly on the frontend.
* **Transcript & Summary History:** Persistent storage and retrieval of historical call logs, full transcripts, and AI-generated summaries.

### 5. Hierarchical Workspace Management
* **Communities & Channels:** Discord/Slack-style organization structure featuring top-level Communities and sub-level text/voice Channels.
* **Role-Based Access Control (RBAC):** Token-verified authorization for community access, channel joins/leaves, and call creation.
* **Real-Time Notifications:** Event-driven invite system powered by Redis Pub/Sub and WebSockets.

---

## 🛠 Tech Stack

### Frontend
* **Framework & Tooling:** React 18, Vite, JavaScript (ES6+)
* **Styling & UI:** Tailwind CSS, Lucide React Icons, SimpleBar
* **State & Data Fetching:** TanStack Query (React Query v5), React Context API, React Router DOM v6
* **Real-Time & Media Client:** Socket.io-Client, Mediasoup-Client (WebRTC SFU), Native WebSockets API

### Backend & Microservices
| Microservice | Technology Stack | Primary Responsibility |
| :--- | :--- | :--- |
| **Main API & WebSocket Gateway** | Python, FastAPI, SQLAlchemy, Uvicorn | Auth, community/channel state, persistent chat logs, WebSocket connection management |
| **SFU Media Server** | Node.js, Express, Socket.io, Mediasoup | WebRTC transport creation, multi-party media routing, plain UDP RTP audio streaming |
| **Transcriber Service** | Node.js, UDP Sockets (`dgram`), `@discordjs/opus`, `whisper.cpp` | UDP RTP reception, jitter buffering, Opus-to-PCM decoding, C++ Whisper STT execution |
| **Translation Service** | Python, FastAPI, CTranslate2, HuggingFace Transformers | Meta NLLB-200 quantized model host (`nllb-ct2-q_i8-f32`), batch neural translation |
| **Summary Service** | Python, FastAPI, Ollama (`llama3.1:8b-instruct`), SSE (`sse-starlette`) | Meeting transcript noise filtering, LLM prompt engineering, SSE streaming summaries |

### Database & Event Infrastructure
* **Primary Database:** PostgreSQL (SQLAlchemy ORM schema management)
* **In-Memory Store & Cache:** Redis (Redis Streams, Pub/Sub, notification queues, active call state)

---

## 💻 Demo

## Homepage, Auth and UI Navigation
https://github.com/user-attachments/assets/f5f7a156-f606-4839-af07-60c0525ab824

## Chatting and Chat Translation
https://github.com/user-attachments/assets/baccf40a-03a7-430f-b4f1-84e88471b66c

## Video/Audio Calling and Call Summarization
https://github.com/user-attachments/assets/5bac9536-c44b-44d9-9526-bfc97f5fa678

---

## 📐 Architecture / How It Works

<img src="./readme/sytem arch full.svg" alt="Alt Text" style="width: 100%; height: auto;">

1. **Messaging Flow:** Users broadcast chat messages through FastAPI WebSockets. Messages are pushed to Redis Streams, cached in Redis Lists for fast channel re-hydration, and asynchronously committed to PostgreSQL.
2. **Translation Flow:** Incoming or historical messages are inspected via script detection regex. Non-target script messages are processed via FastAPI Neural Translation endpoints utilizing CTranslate2 and NLLB-200 models.
3. **WebRTC Media Flow:** WebRTC video/audio streams connect clients to the Mediasoup SFU Server. Mediasoup routes video between peers while piping plain audio RTP packets over UDP to the Transcriber microservice.
4. **Audio Transcription Flow:** The Transcriber service receives raw RTP audio, buffers packets through a custom Jitter Buffer to correct sequence anomalies, decodes Opus frames into raw PCM 16kHz/48kHz WAV chunks, and feeds them into local C++ `whisper.cpp` binaries.
5. **AI Summarization Flow:** Upon call completion, compiled transcripts are saved as JSON structures. When requested, the Summary service extracts cleaned conversation segments, constructs structured prompts, and streams generated summary tokens back to the frontend via Server-Sent Events (SSE).

---

## ⚙️ Prerequisites & Installation

### Prerequisites
* **Node.js:** v18.x or higher
* **Python:** v3.10 or higher
* **PostgreSQL:** v14.x or higher
* **Redis:** v6.x or higher (WSL2 recommended for Windows)
* **C++ Build Tools & Cmake:** Required for compiling `mediasoup` and `whisper.cpp` native binaries
* **Ollama:** Installed with `llama3.1:8b-instruct-q4_K_M` model downloaded

---

### Step-by-Step Installation and Setup

#### 1. PostgreSQL Database Setup
```bash
# Connect to PostgreSQL as superuser
psql -U postgres

# Execute SQL setup commands
CREATE ROLE smartcollab_user WITH LOGIN PASSWORD 'your_password';
CREATE SCHEMA smartcollab_schema AUTHORIZATION smartcollab_user;
GRANT USAGE ON SCHEMA smartcollab_schema TO smartcollab_user;
CREATE DATABASE smartcollab_db;
```

#### 2. Redis Setup
```bash
# On Linux / Ubuntu (WSL2)
sudo apt update
sudo apt install redis-server
sudo service redis-server start

# Verify Redis connection
redis-cli ping # Expected output: PONG
```

#### 3. Backend (FastAPI Core) Setup
```bash
cd backend

# Create and activate virtual environment
python -m venv .venv
# On Windows: .venv\Scripts\activate
# On Linux/macOS: source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt


# Start FastAPI main server
python main.py
```
*Note: Visit `http://localhost:8000/populate_db` once to seed test users and communities.*

#### 4. SFU Media Server Setup
```bash
cd sfu-server

# Install Node modules
npm install

# Generate local SSL certificates using mkcert
choco install mkcert -y  # Windows (Chocolatey) or brew install mkcert (macOS)
mkcert -install
mkcert localhost 127.0.0.1 ::1

# Start SFU Server
npm run dev
```

#### 5. Translation Microservice Setup
```bash
cd translation

# Install required dependencies
pip install fastapi uvicorn ctranslate2 transformers pydantic

# Update MODEL_DIR and TOKENIZER_DIR paths in translation_service.py to point to your NLLB local model folder
python server.py
```

#### 6. Summary Microservice Setup
```bash
cd summary

# Ensure Ollama is running Llama 3.1
ollama run llama3.1:8b-instruct-q4_K_M

# Run summary service
python summary.py
```

#### 7. Frontend Setup
```bash
cd frontend

# Install Node modules
npm install

# Start Vite React development server
npm run dev
```

---

### Environment Setup

#### 1. Backend .env structure
```bash
./backend/.env:

DATABASE_URL=postgresql+psycopg2://pg_username:pg_password@pg_host:pg_port/pg_db_name
POSTGRESDB_SCHEMA=pg_schema
REDIS_HOST=redis_host
REDIS_PORT=redis_port

#key included with every request made from the SFU server
SFU_KEY=sfu_request_key

#dev mode key can be set by you, used only locally to access some functionality that is accessible in development
#if left unassigned, dev access will be denied. Key must match with the one coming from frontend.
DEV_MODE_KEY=dev_mode_key
```

#### 2. Frontend .env structure
```bash
./frontend/.env:

VITE_API_BASE_URL=/backend
VITE_API_PROXY_URL=http://localhost:8000

VITE_TRANSLATION_API_BASE=/translation
VITE_TRANSLATION_API_PROXY_URL=http://localhost:8002

VITE_SUMMARY_STREAM_URL=http://localhost:8001/summary_stream/

FRONTEND_URL=http://localhost:5173

VITE_CHATS_WEBSOCKET_BASE_URL=/ws
VITE_CHATS_WEBSOCKET_PROXY_URL=ws://localhost:8000

VITE_SFU_SERVER_URL_BASE=/sfu
VITE_SFU_SERVER_PROXY_URL=https://localhost:8080

#dev mode key can be set by you, used only locally to access some functionality that is accessible in development
#if left unassigned, dev access will be denied. Key must match with the one coming from backend
VITE_DEV_MODE_KEY=dev_mode_key
```

#### 3. SFU-server .env structure
```bash
./sfu-server/.env

#allow frontend, backend and transcription server to make requests
ALLOWED_ORIGINS=https://localhost:5173,http://localhost:8000,http://localhost:5000
MEDIASOUP_LISTEN_IP=0.0.0.0
#this ip is for fallback
MEDIASOUP_ANNOUNCED_IP=local_device_ip

#used if the transcriber is running locally along with the sfu
TRANSCRIBER_IP=127.0.0.1
TRANSCRIBER_LISTEN_PORT=5000

FASTAPI_SERVER_BASE_URL=http://localhost:8000
SFU_KEY=sfu_request_key

#this maps to the folder structure you choose
#to have to store the local ssl certificates and keys
SSL_DIR_PATH=cert
SSL_KEY_PATH=localhost+2-key.pem
SSL_CERT_PATH=localhost+2.pem
```

#### 4. Transcriber .env structure
```bash
./transcriber/.env

PORT=5000
SFU_URL=https://localhost:8080
```