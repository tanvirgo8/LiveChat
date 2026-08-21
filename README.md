# LiveChat - Real-Time 1-to-1 and Group Chat Application

LiveChat is a production-quality, real-time messaging web application built with Next.js (App Router), React 19, TypeScript, Tailwind CSS, Axios, and Socket.IO Client.

---

## Features

- **Authentication**: Automatic phone-number registration & login with session restoration via JWT Bearer authentication.
- **1-to-1 Direct Messaging**: Search registered users by name or phone and start private 1-to-1 conversations.
- **Group Conversations**: Create multi-user groups (3+ members), rename groups, add participants, promote members to admin, and leave groups.
- **Real-Time Delivery**: Sub-second real-time messaging powered by Socket.IO (`message:new` & `conversation:updated` events).
- **Payload Normalization**: Automatic client-side normalization (`id` -> `_id`, numeric epoch timestamp -> ISO string) ensuring seamless deduplication and single-bubble guarantees.
- **Cursor Pagination**: Infinite scroll pagination (`GET /conversations/{id}/messages?before=`) with viewport position preservation.
- **Smart Auto-Scroll**: Intelligent scroll behavior — automatically scrolls down when near bottom or sending messages; displays a floating `↓ New messages` badge when reading older history.
- **Responsive & Accessible**: Mobile-first responsive layout (320px–1440px+), keyboard `Escape` key handlers, WAI-ARIA dialog semantics, and focus ring styling.

---

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI & Styling**: React 19, Tailwind CSS, Lucide React Icons
- **HTTP Client**: Axios with dynamic Bearer Token request interceptor
- **Real-Time Client**: Socket.IO Client (v4)
- **Language**: TypeScript (Strict Mode)

---

## Environment Configuration

Create a `.env.local` file in the root directory (refer to `.env.example`):

```env
# REST API Endpoint
NEXT_PUBLIC_API_URL=https://frontend-task-chatapp.onrender.com/api

# Root Socket.IO Server Origin
NEXT_PUBLIC_SOCKET_URL=https://frontend-task-chatapp.onrender.com
```

---

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Run Linter

```bash
npm run lint
```

### 4. Build Production Bundle

```bash
npm run build
```

---

## Authentication Flow

1. **Login**: `POST /api/auth/login` accepts `{ phone, name }`. Automatically registers new users and logs in existing users, returning a JWT token.
2. **Token Storage**: The JWT is stored in `localStorage` under `livechat_token`.
3. **API Requests**: Axios request interceptor attaches `Authorization: Bearer <token>` to all outgoing REST API calls.
4. **Session Restore**: On page reload, `GET /api/auth/me` validates the token and restores the active user state.
5. **Socket Handshake**: Socket.IO connects to the root origin (`https://frontend-task-chatapp.onrender.com`) passing `{ auth: { token } }`.
