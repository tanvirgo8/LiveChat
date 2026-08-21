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
- **Theme Mode**: Dynamic Light and Dark theme toggle with zero-flash HTML initialization.

---

# Development Approach

## Part 1 — Architecture and Approach

This application was engineered with a modular, clean, and extensible architecture designed to separate concerns between UI components, state management, HTTP API communication, and real-time socket events.

### Tech Stack & Core Approaches

- **Next.js (App Router)**: Provides modern file-system routing, Server and Client Components separation, fast Turbopack compilation, and optimized client-side navigation.
- **React 19 & TypeScript**: Leverages strict TypeScript domain interfaces (`User`, `Message`, `Conversation`) and React 19 hooks to ensure strict type safety, eliminating runtime type errors.
- **Axios Client**: Centralized HTTP client configured with a dynamic request interceptor that automatically attaches `Authorization: Bearer <token>` to all REST API endpoints.
- **Socket.IO Client**: Single authenticated socket connection managed at the application root through `SocketContext`, avoiding duplicate socket connections or memory leaks.
- **React Context**: Used selectively for top-level, global application concerns (`AuthContext`, `SocketContext`, `ThemeContext`).
- **Custom React Hooks**: Encapsulates component logic and API orchestration into reusable, focused hooks (`useConversations`, `useMessages`, `useTypingIndicator`, `useGroupManagement`, `useSmartScroll`).
- **Local/Component State vs. Redux/Zustand**: External state management libraries (Redux/Zustand) were intentionally avoided. For a real-time chat client, global state management libraries introduce unnecessary boilerplate, state synchronization overhead, and serialization complexities. Using React Context for application credentials combined with targeted custom hooks provides clean data encapsulation and superior performance.
- **REST API + Socket.IO Hybrid Architecture**: REST API endpoints are used for deterministic data fetching, pagination, authentication, and optimistic creation ACK responses. Socket.IO is used strictly for event-driven real-time push notifications (`message:new` and `conversation:updated`).
- **Cursor-Based Message Pagination**: Paginates historical thread messages using ISO timestamp cursors (`GET /conversations/{id}/messages?before=...`), preserving scroll offsets seamlessly when loading older history.
- **Server-ACK Message Sending**: When sending a message, the UI optimistically renders a draft message state, sends `POST /conversations/{id}/messages`, and replaces the temporary message with the server-acknowledged response upon success.
- **Client-Side Payload Normalization**: Inbound real-time socket events are passed through `normalizeMessage` to convert disparate backend field names (`id` -> `_id`, numeric epoch timestamp -> ISO 8601 string) into a unified internal representation.

### Trade-offs & Engineering Considerations

1. **Optimistic Rendering vs. Event Duplication**: Optimistically inserting local messages provides zero-perceived-latency UI feedback, but requires strict deduplication (`_id` matching) when `message:new` socket events arrive.
2. **Context Scope vs. Re-render Optimization**: Keeping conversation state inside `useConversations` rather than a single monolithic global context prevents global re-render cascading across unrelated UI panels.

---

## Part 2 — Design Decisions

Every design decision in LiveChat was informed by real-world production requirements and verified backend behaviors.

- **JWT Authentication & Session Restoration**: Session persistence uses `localStorage` (`livechat_token`). Upon initial load, `AuthGuard` triggers `GET /auth/me` to restore the active user profile before mounting protected routes.
- **Centralized Axios Client**: Configured in `src/lib/api-client.ts`, providing unified error handling, environment variable resolution, and token injection.
- **AuthContext & AuthGuard**: `AuthGuard` wraps protected routes (`/chat`), automatically redirecting unauthenticated users to `/login` while providing zero-flash loading screens.
- **Conversation & Message Hooks**: Decouples UI presentation from API request states, exposing clean methods (`sendMessage`, `loadOlderMessages`, `fetchConversations`).
- **Message Pagination**: Implements top-scroll detection (within 40px threshold), preserving relative scroll position by calculating `container.scrollHeight` differences before and after DOM updates.
- **Message Deduplication**: Ensures duplicate messages are never rendered by checking existing message ID sets before appending incoming socket payloads.
- **Socket.IO Real-Time Messaging**: Listens for `message:new` and `conversation:updated` events, dynamically updating conversation list order and active thread messages.
- **Socket Payload Normalization**: Normalizes socket payloads to ensure single-bubble guarantees regardless of backend field variations.
- **Smart Scrolling & "New Messages" Badge**: Auto-scrolls to bottom when the user is near the bottom threshold (80–120px) or sends a message. Displays a bouncing `↓ New messages` floating badge when the user is reading older message history.
- **Group Management & Admin Permissions**: Supports group creation (3+ members), member additions, admin promotions, and leaving groups with real-time UI updates.
- **Responsive Mobile/Desktop Layout**: Implements a dual-panel desktop layout (320px sidebar + flex-1 chat) and a responsive single-panel view on mobile devices with smooth back navigation.
- **Accessibility Improvements**: Features semantic HTML5 elements (`<main>`, `<aside>`, `<header>`), WAI-ARIA modal dialog attributes, keyboard `Escape` dismissals, and visible focus rings.

---

## AI Tools and Development Process

This application was developed through a structured AI-assisted pair-programming workflow utilizing state-of-the-art tools and environments:

### Claude
Utilized for high-level system architecture design, data flow planning, review of edge cases, and analyzing state management trade-offs.

### Gemini
Utilized for implementation assistance, exploring alternative React hook patterns, debugging TypeScript errors, and technical code reviews.

### Antigravity IDE / AI Agent
Served as the primary AI-assisted development environment for writing React/TypeScript code, refactoring components, executing automated build pipelines, running linter checks, and orchestrating feature implementations.

### Postman
Postman was used as an indispensable API testing and development tool (not as an AI agent) to interact directly with the backend endpoints. It was used to:
- Test REST authentication (`POST /auth/login`, `GET /auth/me`)
- Inspect request and response payload structures
- Verify conversation creation and participant arrays
- Audit cursor pagination parameters (`before=`)
- Investigate backend edge cases and payload discrepancies

### Real Backend Discoveries & Adaptations

AI-generated recommendations were rigorously audited and adapted against empirical backend behavior discovered during testing. Significant backend quirks discovered and resolved include:

1. **`GET /conversations` Response Structure**: Discovered that the backend wraps conversation arrays inside `{ data: Conversation[] }` rather than returning a root JSON array.
2. **Empty `lastMessage` Object**: Found that conversations without prior messages return `lastMessage: {}` instead of `null`, requiring defensive type checks (`lastMessage?.text`).
3. **Direct Conversation Creation Response**: `POST /conversations` returns a simplified participant object, requiring client-side normalization to map participant details cleanly.
4. **Socket.IO ID Inconsistency**: Socket `message:new` payloads deliver `id` instead of `_id`, which required client-side normalization to prevent duplicate message bubbles.
5. **Epoch Timestamp Conversion**: Socket payloads deliver `createdAt` as a numeric epoch timestamp (ms), requiring conversion to ISO 8601 strings for consistent date formatting.
6. **Group Participant Validation**: `POST /conversations/group` strictly requires at least two other participant IDs (minimum 3 total members including creator), which was enforced in `CreateGroupModal`.

---

## Future Improvements

To prepare LiveChat for large-scale enterprise production, the following future enhancements are recommended:

- **Automated Unit & Integration Testing**: Expand Jest and React Testing Library coverage for custom hooks (`useMessages`, `useConversations`).
- **End-to-End Test Automation**: Implement Playwright / Cypress e2e test suites for multi-browser real-time messaging flows.
- **Runtime Schema Validation**: Integrate Zod to validate incoming REST responses and socket events at runtime boundary points.
- **Enhanced Socket Reconnection Handling**: Implement visual offline/reconnecting status indicators with exponential backoff retry.
- **Advanced Accessibility Audits**: Perform automated axe-core audits and screen-reader testing (NVDA/VoiceOver).
- **Large Dataset Performance Benchmarking**: Optimize virtualized message list rendering (e.g., `react-window`) for conversations containing 10,000+ messages.
- **Shared API Contracts**: Establish shared tRPC or OpenAPI schemas between frontend and backend.
- **Reusable Component Library**: Extract core UI primitives into an isolated design system or Storybook catalog.
- **Real-Time Network Quality Monitoring**: Display real-time ping latency and socket connection health metrics.

---

## Summary Note

*Project evaluation location key: **Madagascar***

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
