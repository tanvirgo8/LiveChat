# LiveChat API Documentation

This document formalizes the exact REST and WebSocket API contracts for the **LiveChat** backend based on empirical live responses captured from `https://frontend-task-chatapp.onrender.com`.

---

## Environment Base URLs

- **REST API Base URL**: `https://frontend-task-chatapp.onrender.com/api`
- **Socket.IO Root URL**: `https://frontend-task-chatapp.onrender.com`

> [!IMPORTANT]
> The REST endpoints use the `/api` prefix, whereas Socket.IO connects directly to the root domain origin (Socket.IO serves handshakes at `/socket.io/`).

---

## Authentication Model

### REST Requests
Protected endpoints require a Bearer token in the `Authorization` request header:
```http
Authorization: Bearer <JWT_TOKEN>
```

### WebSocket Handshake
Socket.IO connections require the same JWT in the handshake `auth` object:
```js
const socket = io('https://frontend-task-chatapp.onrender.com', {
  auth: { token: '<JWT_TOKEN>' }
});
```

---

## Standard Error Response Structure

When a REST request fails due to invalid data or unauthorized access, the backend returns:

```json
{
  "error": {
    "message": "Unauthorized",
    "code": "UNAUTHORIZED"
  }
}
```

---

## REST API Endpoints

### 1. Auth & Current User

#### `POST /auth/login`
Logs in an existing user or automatically registers a new account if the phone number is not found.

- **Authentication**: None required.
- **Request Body**:
  ```json
  {
    "phone": "+15551234567",
    "name": "Ada Lovelace"
  }
  ```
- **Response Status**: `200 OK`
- **Response Body**:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "6a882468e5d6aac97521e25e",
      "name": "Ada Lovelace",
      "phone": "+15551234567",
      "createdAt": "2026-08-21T10:11:52.529Z"
    }
  }
  ```

#### `GET /auth/me`
Restores session user profile associated with the bearer token.

- **Authentication**: Bearer Token required.
- **Request Parameters**: None.
- **Response Status**: `200 OK`
- **Response Body**:
  ```json
  {
    "_id": "6a882468e5d6aac97521e25e",
    "name": "Ada Lovelace",
    "phone": "+15551234567",
    "createdAt": "2026-08-21T10:11:52.529Z"
  }
  ```

---

### 2. User Search

#### `GET /users/search?q=`
Searches registered users by name or phone number.

- **Authentication**: Bearer Token required.
- **Query Parameter**: `q` (string, required) - search term.
- **Response Status**: `200 OK`
- **Response Body**: Array of user objects (`User[]`):
  ```json
  [
    {
      "_id": "6a8827fde5d6aac97521e499",
      "name": "Alan Turing",
      "phone": "+15552222222"
    }
  ]
  ```

---

### 3. Conversations

#### `GET /conversations`
Retrieves all direct and group conversations for the authenticated user.

- **Authentication**: Bearer Token required.
- **Response Status**: `200 OK`
- **Response Body**: Wrapped in a `{ data: Conversation[] }` object.
  ```json
  {
    "data": [
      {
        "_id": "6a882f71e5d6aac97521e90d",
        "type": "direct",
        "lastMessage": {
          "text": "Hello Alan from Ada!",
          "sender": "6a882468e5d6aac97521e25e",
          "createdAt": "2026-08-21T10:58:59.098Z"
        },
        "updatedAt": "2026-08-21T10:58:57.218Z",
        "participant": {
          "_id": "6a882f6de5d6aac97521e902",
          "name": "Alan Turing",
          "phone": "+15559876543"
        }
      },
      {
        "_id": "6a882f75e5d6aac97521e91c",
        "type": "group",
        "name": "CS Pioneers Team",
        "createdBy": "6a882468e5d6aac97521e25e",
        "admins": [
          "6a882468e5d6aac97521e25e"
        ],
        "participants": [
          {
            "_id": "6a882468e5d6aac97521e25e",
            "name": "Ada Lovelace",
            "phone": "+15551234567"
          },
          {
            "_id": "6a882f6de5d6aac97521e902",
            "name": "Alan Turing",
            "phone": "+15559876543"
          }
        ],
        "lastMessage": {},
        "updatedAt": "2026-08-21T10:59:06.533Z"
      }
    ]
  }
  ```
- **Implementation Note**: `lastMessage` can be an empty object `{}` when no messages have been sent in the conversation yet.

#### `POST /conversations`
Starts or retrieves a 1-to-1 direct conversation with another user.

- **Authentication**: Bearer Token required.
- **Request Body**:
  ```json
  {
    "userId": "6a882f6de5d6aac97521e902"
  }
  ```
- **Response Status**: `200 OK`
- **Response Body**:
  ```json
  {
    "_id": "6a882f71e5d6aac97521e90d",
    "participants": [
      "6a882468e5d6aac97521e25e",
      "6a882f6de5d6aac97521e902"
    ],
    "createdAt": "2026-08-21T10:58:57.218Z"
  }
  ```

---

### 4. Message History

#### `GET /conversations/{id}/messages`
Retrieves message history for a conversation with cursor pagination.

- **Authentication**: Bearer Token required.
- **Path Parameter**: `id` (string, required) - conversation ID.
- **Query Parameters**:
  - `limit` (integer, optional) - maximum messages per page (default: 20).
  - `before` (string, optional) - cursor ID of the oldest loaded message.
- **Response Status**: `200 OK`
- **Response Body**:
  ```json
  {
    "messages": [
      {
        "_id": "6a882f73e5d6aac97521e914",
        "conversation": "6a882f71e5d6aac97521e90d",
        "sender": "6a882468e5d6aac97521e25e",
        "text": "Hello Alan from Ada!",
        "createdAt": "2026-08-21T10:58:59.098Z"
      }
    ],
    "hasMore": false
  }
  ```

---

### 5. Sending Messages

#### `POST /messages`
Sends a message to a direct or group conversation.

- **Authentication**: Bearer Token required.
- **Request Body**:
  ```json
  {
    "conversationId": "6a882f71e5d6aac97521e90d",
    "text": "Hello Alan from Ada!"
  }
  ```
- **Response Status**: `200 OK`
- **Response Body**:
  ```json
  {
    "_id": "6a882f73e5d6aac97521e914",
    "conversation": "6a882f71e5d6aac97521e90d",
    "sender": "6a882468e5d6aac97521e25e",
    "text": "Hello Alan from Ada!",
    "createdAt": "2026-08-21T10:58:59.098Z"
  }
  ```

---

### 6. Group Management

#### `POST /conversations/group`
Creates a group conversation. The creator automatically becomes an admin.

- **Authentication**: Bearer Token required.
- **Request Body**:
  ```json
  {
    "name": "Pioneers Group",
    "participantIds": [
      "6a882f6de5d6aac97521e902",
      "6a882f6ee5d6aac97521e905"
    ]
  }
  ```
- **Response Status**: `201 Created`
- **Response Body**: Full group conversation object.

#### `POST /conversations/{id}/participants`
Adds one or more members to an existing group (Admins only).

- **Authentication**: Bearer Token required.
- **Request Body**:
  ```json
  {
    "userIds": [
      "6a882f6ee5d6aac97521e905"
    ]
  }
  ```
- **Response Status**: `200 OK`
- **Response Body**: Full updated group conversation object.

#### `DELETE /conversations/{id}/participants/{userId}`
Removes a member from a group (Admins only) or leaves the group (when `userId` is target user's own ID).

- **Authentication**: Bearer Token required.
- **Response Status**: `200 OK`
- **Response Body**: Full updated group conversation object.

#### `POST /conversations/{id}/admins`
Promotes an existing group member to an admin (Admins only).

- **Authentication**: Bearer Token required.
- **Request Body**:
  ```json
  {
    "userId": "6a882f6de5d6aac97521e902"
  }
  ```
- **Response Status**: `200 OK`
- **Response Body**: Full updated group conversation object.

#### `PATCH /conversations/{id}`
Renames a group conversation (Admins only).

- **Authentication**: Bearer Token required.
- **Request Body**:
  ```json
  {
    "name": "CS Pioneers Team"
  }
  ```
- **Response Status**: `200 OK`
- **Response Body**: Full updated group conversation object.

---

### 7. System Endpoints

#### `GET /health`
- **Authentication**: None.
- **Response Status**: `404 Not Found` (`GET /health` is not implemented on the backend server).

---

## Socket.IO Events

### Client → Server Events

#### `message:send`
Sends a real-time message via socket.
```json
{
  "conversationId": "6a882f71e5d6aac97521e90d",
  "text": "Hello world over socket!"
}
```

---

### Server → Client Events

#### `message:new`
Emitted by the server when a new message arrives in any conversation the current user is a participant in.
```json
{
  "_id": "6a882f73e5d6aac97521e914",
  "conversation": "6a882f71e5d6aac97521e90d",
  "sender": "6a882468e5d6aac97521e25e",
  "text": "Hello world over socket!",
  "createdAt": "2026-08-21T10:58:59.098Z"
}
```

#### `conversation:updated`
Emitted by the server when a group conversation's metadata, members, or admins are modified.
```json
{
  "_id": "6a882f75e5d6aac97521e91c",
  "type": "group",
  "name": "CS Pioneers Team",
  "createdBy": "6a882468e5d6aac97521e25e",
  "admins": [
    "6a882468e5d6aac97521e25e",
    "6a882f6de5d6aac97521e902"
  ],
  "participants": [ ... ]
}
```
