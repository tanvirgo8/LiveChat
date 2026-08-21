# LiveChat - Technical Thought Process & Architectural Decoupling

This document outlines the architectural decisions, trade-offs, real-time message normalization patterns, state management strategies, and production engineering practices adopted during the construction of **LiveChat**.

---

## 1. Architectural Philosophy & Technology Stack

The primary goal of LiveChat is to deliver a reliable, high-performance real-time 1-to-1 and group chat experience.

- **Next.js 16 (App Router)**: Chosen for server rendering efficiency, file-based routing, and production optimization.
- **Axios Client with Dynamic Interceptor**: Centralized HTTP client managing Bearer token authorization and standardized API error formatting.
- **Socket.IO (Root Origin Connection)**: Operates directly against `https://frontend-task-chatapp.onrender.com` (root origin, not `/api`) for real-time WebSocket communication.
- **Modular Component Design**: Decoupled presentation (`ChatPanel`, `MessageList`, `ChatSidebar`) from state orchestration (`useMessages`, `useConversations`, `useSocket`, `useSmartScroll`, `useGroupManagement`).

---

## 2. Real-Time Socket Payload Normalization & Deduplication

A critical technical challenge was reconciling the REST API message entities with incoming Socket.IO real-time event payloads.

### The Backend Payload Variance
- **REST Response**: Returns `{ _id: string, conversation: string, sender: string, text: string, createdAt: "ISO_STRING" }`.
- **Socket.IO `message:new` Event**: Emits `{ id: string, conversation: string, sender: string, text: string, createdAt: 1787314598139 }`.

### Normalization Layer (`normalizeMessage`)
To prevent missing messages or duplicate chat bubbles:
1. `normalizeMessage` maps `raw._id || raw.id` to a single authoritative `_id`.
2. Converts numeric epoch timestamps into standard ISO 8601 string representations.
3. Indexed in a `Map<string, Message>` inside `deduplicateAndSortMessages()` before sorting chronologically.

This guarantees that messages sent via REST ACK and broadcast over Socket.IO merge into **exactly 1 message bubble** across all connected clients (e.g. from Madagascar to any global node).

---

## 3. Server-ACK Sending vs Real-Time Broadcast

We strictly enforced a **Server-ACK message flow** (no speculative client IDs or optimistic UI bugs):
1. User submits text in `MessageInput.tsx`.
2. HTTP `POST /api/messages` is sent via Axios.
3. Upon receiving HTTP 200/201 response, the server-created message is normalized and appended.
4. Input clears ONLY after successful server ACK. If network/API failure occurs, user input remains preserved in the composer for retrying.

---

## 4. Smart Auto-Scroll UX

`useSmartScroll.ts` manages viewport positioning:
- **Initial Load**: Immediate scroll to bottom without animation.
- **User Send**: Smooth scroll to bottom upon REST ACK.
- **Incoming Socket Message**:
  - If user is near bottom (`threshold <= 100px`) or is the sender: auto-scrolls down.
  - If user is scrolled up reading history: viewport position is preserved, and a floating `↓ New messages` badge appears.
- **Pagination**: Height difference delta measurement (`container.scrollTop += newHeight - oldHeight`) prevents viewport jumping when prepending older messages.

---

## 5. Group Management & Permissions

Group operations (`POST /conversations/group`, `PATCH /conversations/{id}`, `POST /participants`, `POST /admins`, `DELETE /participants/{userId}`) return the updated `GroupConversation` entity, updating local state immediately via `updateOrAddConversation()`. Validation rules (such as enforcing a 3-member minimum total) are handled gracefully with non-blocking UI notifications.

---

## Summary

The resulting architecture is fully production-ready, typed, accessible, and resilient against race conditions, network dropouts, and multi-session real-time events.
