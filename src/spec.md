# Specification

## Summary
**Goal:** Build a web-based messenger with an Android 6-inspired flat Material UI, supporting username/password authentication, direct messages, and group chats with polling-based updates.

**Planned changes:**
- Apply a cohesive Android 6 (flat Material) theme across all screens and ensure all UI text is in English.
- Add Register/Login/Logout frontend flow with session persistence across refresh.
- Implement backend user accounts with unique usernames and salted password hashing.
- Create a responsive chat home layout: conversation list (DMs + groups) and selected thread view, with mobile-friendly navigation.
- Implement DMs: start/open by username, send messages, and view DM history and recent list previews.
- Implement group chats: create groups, add members by username, enforce member-only access, and support group message history.
- Add polling/refetch plus manual refresh controls for conversation lists and threads (no WebSockets).
- Add and use generated static assets (icon/logo and background) served from frontend static files.

**User-visible outcome:** Users can register/login, see an Android 6-style messenger UI, start DMs or create group chats by username, exchange messages, and see updates via periodic polling or manual refresh.
