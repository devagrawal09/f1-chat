# T3 Chat Cloneathon Implementation Plan

## Core Requirements

### 1. Chat with Various LLMs

- [ ] Integrate [OpenRouter](https://openrouter.ai/) for unified multi-LLM support
  - [ ] UI: Add model selector to chat input (edit `app/App.tsx`)
  - [ ] Backend: Add API handler to route requests to OpenRouter (new file: `server/openrouter.ts`)
  - [ ] Store selected model in message metadata (update `shared/schema.ts`, `shared/mutators.ts`)
  - [ ] Update message creation logic to include model info (edit `app/App.tsx`, `shared/mutators.ts`)

### 2. Authentication & Sync

- [ ] Implement user authentication with [Clerk](https://clerk.com/)
  - [ ] Install and configure Clerk SDK (update project root, add Clerk config files)
  - [ ] Initialize Clerk in app entry (edit `app/main.tsx`)
  - [ ] Replace JWT login/logout with Clerk UI (edit `app/App.tsx`)
  - [ ] Protect server endpoints using Clerk session (edit `server/index.ts`, `server/push.ts`, `server/login.ts`)
  - [ ] Sync Clerk user ID with Zero userID (edit `app/main.tsx`, `shared/auth.ts`)
- [ ] Chat history synchronization
  - [ ] Store chat history per user in Zero (edit `shared/schema.ts`, `shared/mutators.ts`)
  - [ ] Ensure real-time sync across devices/tabs (Zero handles this; ensure correct user scoping in queries in `app/App.tsx`)
  - [ ] Use Zero's mutators and schema for chat/message tables (edit `shared/mutators.ts`, `shared/schema.ts`)

---

## Bonus Features

### 1. Attachment Support

- [ ] UI: Add file upload to chat input (edit `app/App.tsx`)
- [ ] Backend: Add file upload endpoint (new file: `server/upload.ts`)
- [ ] Store file URLs in messages (edit `shared/schema.ts`, `shared/mutators.ts`)
- [ ] Display attachments in chat (edit `app/App.tsx`)

### 2. Image Generation Support

- [ ] UI: Add image generation button (edit `app/App.tsx`)
- [ ] Backend: Add handler to call image model via OpenRouter (edit `server/openrouter.ts`)
- [ ] Store generated image URLs in messages (edit `shared/schema.ts`, `shared/mutators.ts`)
- [ ] Display generated images in chat (edit `app/App.tsx`)

### 3. Syntax Highlighting

- [ ] Install and configure `shiki` or `prismjs` (update project dependencies)
- [ ] Detect code blocks in messages (edit `app/App.tsx`)
- [ ] Render code with highlighting (edit `app/App.tsx`)

### 4. Resumable Streams

- [ ] Store stream state in Zero/localStorage (edit `app/App.tsx`, `shared/schema.ts`)
- [ ] On refresh, resume incomplete generations (edit `app/App.tsx`)
- [ ] UI indicator for ongoing streams (edit `app/App.tsx`)

### 5. Chat Branching

- [ ] Add parent/child relationship to message schema (edit `shared/schema.ts`)
- [ ] UI: Allow branching from any message (edit `app/App.tsx`)
- [ ] Store and navigate branches (edit `app/App.tsx`, `shared/mutators.ts`)

### 6. Chat Sharing

- [ ] Generate shareable links (edit `app/App.tsx`)
- [ ] Backend: Add endpoint for public chat access (new file: `server/share.ts`)
- [ ] UI: Read-only/collab modes (edit `app/App.tsx`)

### 7. Web Search

- [ ] UI: Add web search button (edit `app/App.tsx`)
- [ ] Backend: Add web search API integration (new file: `server/websearch.ts`)
- [ ] Display search results in chat (edit `app/App.tsx`)

### 8. Your Feature Ideas

- [ ] Add new features as needed (create new files/components as appropriate)

---

## Markdown Rendering & Streaming

- [ ] Integrate [`streaming-markdown`](https://thetarnav.github.io/streaming-markdown/) for efficient, streaming markdown rendering in chat
  - [ ] Install and configure in project dependencies
  - [ ] Use in chat message rendering (edit `app/App.tsx`)
  - [ ] Ensure compatibility with syntax highlighting and attachments

---

## Routing

- [ ] Use [Solid Router](https://docs.solidjs.com/solid-router) for client-side routing
  - [ ] Install and configure router (edit `app/main.tsx`, add `app/routes/` if needed)
  - [ ] Define all app routes (see below)
  - [ ] Use `<Router>`, `<Route>`, and navigation primitives in UI (edit `app/App.tsx` and new route components)
  - [ ] Support for chat sharing, branching, and public views

---

## App Routes

- `/` — Main chat UI (default route, chat list and input)
- `/login` — Login page (Clerk SignIn UI)
- `/signup` — Signup page (Clerk SignUp UI)
- `/chat/:chatId` — View a specific chat/conversation (supports branching)
- `/share/:shareId` — Public/shared chat view (read-only or collaborative)
- `/settings` — User/account settings
- `/search` — Web search results (optional, or as a modal/side panel)
- `/image/:imageId` — View generated image (optional, for direct links)
- `/attachments/:attachmentId` — View/download attachment (optional)

---

## Tech Stack

- **Frontend:** SolidJS (`app/`), Vite, TailwindCSS, shadcn/ui, streaming-markdown, solid-router
- **Backend:** Zero (Rocicorp) (`server/`, `shared/`), Node.js, Hono, PostgreSQL
- **LLM Integration:** OpenRouter API (`server/openrouter.ts`)
- **Storage:** S3/Supabase for attachments (`server/upload.ts`)
- **Deployment:** Vercel, Railway, or Fly.io

---

## Milestones & Timeline

### Week 1

- [ ] Project setup, repo, CI/CD
- [ ] Clerk auth integration (`app/main.tsx`, `app/App.tsx`, `server/index.ts`)
- [ ] Zero sync setup (`shared/`, `server/push.ts`)
- [ ] Basic chat UI, LLM integration (`app/App.tsx`, `server/openrouter.ts`)
- [ ] Chat history per user (`shared/schema.ts`, `shared/mutators.ts`)
- [ ] Routing and markdown rendering (`app/main.tsx`, `app/App.tsx`)

### Week 2

- [ ] Bonus features (pick 2-3 minimum, see above for file impact)
- [ ] UI/UX polish (`app/`, `index.css`)
- [ ] Testing & bugfixes (all dirs)
- [ ] Prepare demo, documentation, and submission

---

## Submission Checklist

- [ ] All core requirements implemented (see above for file mapping)
- [ ] At least 2-3 bonus features (see above for file mapping)
- [ ] Open source, permissive license (MIT/Apache)
- [ ] Clear README and demo video
- [ ] Deployed and accessible app

---

## UI Structure

### Main Layout

- `App.tsx` (root):
  - `<Router>` (Solid Router)
    - `<Route path="/" component={ChatPage} />`
    - `<Route path="/login" component={LoginPage} />`
    - `<Route path="/signup" component={SignupPage} />`
    - `<Route path="/chat/:chatId" component={ChatPage} />`
    - `<Route path="/share/:shareId" component={SharePage} />`
    - `<Route path="/settings" component={SettingsPage} />`
    - ...

### ChatPage

- Header: Model selector, user info, settings link
- MessageList: Scrollable, uses streaming-markdown for rendering
- MessageInput: Textarea, file upload, send button, web search button, image gen button
- Branching/Share controls as needed

### LoginPage/SignupPage

- Clerk SignIn/SignUp components

### SharePage

- Read-only/collab chat view, share link, fork button

---

## Database Schema (Zero)

```ts
// shared/schema.ts
import {
  createSchema,
  table,
  string,
  number,
  boolean,
  relationships,
} from "@rocicorp/zero";

const user = table("user")
  .columns({ id: string(), name: string(), email: string() })
  .primaryKey("id");

const chat = table("chat")
  .columns({ id: string(), title: string(), ownerID: string() })
  .primaryKey("id");

const message = table("message")
  .columns({
    id: string(),
    chatID: string(),
    senderID: string(),
    body: string(),
    timestamp: number(),
    model: string(), // LLM model used
    parentID: string(), // for branching
    attachmentID: string(),
    webSearchID: string(),
    imageID: string(),
  })
  .primaryKey("id");

const attachment = table("attachment")
  .columns({
    id: string(),
    url: string(),
    type: string(),
    uploaderID: string(),
    uploadedAt: number(),
    messageID: string(),
  })
  .primaryKey("id");

const schema = createSchema({ tables: [user, chat, message, attachment] });
```

---

## Example Queries (ZQL)

- Get all messages for a chat:

```ts
z.query.message.where("chatID", chatId).orderBy("timestamp", "asc");
```

- Get all branches from a message:

```ts
z.query.message.where("parentID", messageId);
```

- Get all attachments for a message:

```ts
z.query.attachment.where("messageID", messageId);
```

---

## LLM Call Logic (OpenRouter)

**Client:**

```ts
// app/App.tsx
const sendMessage = async (input, model) => {
  const res = await fetch("/api/llm", {
    method: "POST",
    body: JSON.stringify({ input, model }),
    headers: { "Content-Type": "application/json" },
  });
  const data = await res.json();
  // Optimistically add message, update on response
};
```

**Server:**

```ts
// server/openrouter.ts
import fetch from "node-fetch";
export async function handler(req, res) {
  const { input, model } = await req.json();
  const resp = await fetch("https://openrouter.ai/api/v1/chat", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.OPENROUTER_KEY}` },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: input }],
    }),
  });
  const data = await resp.json();
  res.json(data);
}
```

---

## Streaming Markdown Rendering

```tsx
// app/MessageList.tsx
import { StreamingMarkdown } from "streaming-markdown";
<StreamingMarkdown source={message.body} />;
```

- Supports partial/streamed updates for LLM responses.
- Integrates with syntax highlighting and attachment rendering.

---

## Attachment Upload/Download Flow

**Client:**

```tsx
// app/App.tsx
const handleFileUpload = async (file) => {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: form });
  const { url, id } = await res.json();
  // Add attachmentID to message
};
```

**Server:**

```ts
// server/upload.ts
import { uploadToS3 } from "./s3";
export async function handler(req, res) {
  const file = req.file;
  const url = await uploadToS3(file);
  // Save attachment record in Zero
  res.json({ url, id });
}
```

- Attachments are referenced in messages by `attachmentID`.
- Download/view via `/attachments/:attachmentId` route.

---

## Web Search Tool Call Flow

**Client:**

```ts
// app/App.tsx
const handleWebSearch = async (query) => {
  const res = await fetch("/api/websearch", {
    method: "POST",
    body: JSON.stringify({ query }),
    headers: { "Content-Type": "application/json" },
  });
  const data = await res.json();
  // Insert web search result into chat
};
```

**Server:**

```ts
// server/websearch.ts
import fetch from "node-fetch";
export async function handler(req, res) {
  const { query } = await req.json();
  const resp = await fetch(
    `https://api.bing.microsoft.com/v7.0/search?q=${encodeURIComponent(query)}`,
    {
      headers: { "Ocp-Apim-Subscription-Key": process.env.BING_KEY },
    }
  );
  const data = await resp.json();
  res.json(data);
}
```

- Web search results are rendered in chat, optionally with citations.

---

## Error Handling, Optimistic Updates, Real-Time Sync

- Use optimistic UI for message send, attachment upload, and web search insert.
- Roll back on error (show error toast, revert UI state).
- Zero ensures real-time sync across tabs/devices; use `createQuery` for live updates.
- Handle upload/LLM/search errors gracefully in UI.

---

## Example UI Snippet: Message Input

```tsx
<div class="message-input">
  <textarea ... />
  <input type="file" onChange={handleFileUpload} />
  <button onClick={sendMessage}>Send</button>
  <button onClick={handleWebSearch}>Web Search</button>
  <button onClick={handleImageGen}>Generate Image</button>
</div>
```

---

## Example UI Snippet: Message Rendering

```tsx
<div class="message">
  <StreamingMarkdown source={message.body} />
  {message.attachmentID && <AttachmentView id={message.attachmentID} />}
  {message.webSearchID && <WebSearchResult id={message.webSearchID} />}
  {message.imageID && <img src={imageUrl} />}
</div>
```

---

## Example: Branching/Forking a Chat

- UI: Button on each message to "Branch from here"
- Logic: Create new chat with parentID set to message.id
- Query: Show all branches for a chat/message

---

## Example: Sharing a Chat

- UI: Share button generates `/share/:shareId` link
- Backend: `/api/share` endpoint creates a share record, returns link
- Public view: `/share/:shareId` route renders chat in read-only/collab mode

---

## Security & Permissions

- Clerk protects all sensitive endpoints (middleware in `server/index.ts`)
- Zero permissions restrict message/attachment access to chat members/owners
- Attachments are signed URLs or require auth for download

---

## Library Integrations & Usage Details

### Streaming Markdown ([docs](https://github.com/thetarnav/streaming-markdown))

- **Install:** `npm install streaming-markdown`
- **Usage:**
  - In `app/components/ChatMessage.tsx` (or similar):
    ```js
    import * as smd from "streaming-markdown";
    const element = document.getElementById("markdown");
    const renderer = smd.default_renderer(element);
    const parser = smd.parser(renderer);
    smd.parser_write(parser, messageChunk); // stream chunks as they arrive
    smd.parser_end(parser); // when done
    ```
  - Use for streaming LLM markdown output in chat.
  - Touches: `app/components/ChatMessage.tsx`, `app/App.tsx`

### Solid Router ([docs](https://docs.solidjs.com/solid-router))

- **Install:** `npm i @solidjs/router`
- **Setup:**
  - In `app/main.tsx`:
    ```js
    import { Router, Route } from "@solidjs/router";
    import ChatPage from "./pages/ChatPage";
    // ...
    <Router>
      <Route path="/" component={ChatPage} />
      {/* ...other routes */}
    </Router>;
    ```
  - Use nested and dynamic routes for chat, login, settings, etc.
  - Touches: `app/main.tsx`, `app/pages/*`, `app/components/Nav.tsx`

### UploadThing ([docs](https://docs.uploadthing.com/))

- **Install:** `npm install uploadthing`
- **Server:**
  - In `server/uploadthing.ts`:
    ```ts
    import { createUploadthing, type FileRouter } from "uploadthing/server";
    const f = createUploadthing();
    export const uploadRouter = {
      imageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
        .middleware(async ({ req }) => { /* auth logic */ return { userId: ... }; })
        .onUploadComplete(async ({ metadata, file }) => { /* handle file */ }),
    } satisfies FileRouter;
    export type OurFileRouter = typeof uploadRouter;
    ```
- **Client (SolidJS):**

  - In `app/components/AttachmentUpload.tsx`:

    ```tsx
    import { createSignal } from "solid-js";

    function AttachmentUpload() {
      const [file, setFile] = createSignal<File | null>(null);
      const [uploading, setUploading] = createSignal(false);
      const [error, setError] = createSignal("");

      async function handleUpload() {
        if (!file()) return;
        setUploading(true);
        setError("");
        const formData = new FormData();
        formData.append("file", file()!);
        try {
          const res = await fetch("/api/uploadthing?endpoint=imageUploader", {
            method: "POST",
            body: formData,
          });
          if (!res.ok) throw new Error("Upload failed");
          // handle response, update chat, etc.
        } catch (e) {
          setError(e.message);
        } finally {
          setUploading(false);
        }
      }

      return (
        <div>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          <button disabled={uploading()} onClick={handleUpload}>
            Upload
          </button>
          {error() && <span>{error()}</span>}
        </div>
      );
    }
    export default AttachmentUpload;
    ```

  - Touches: `server/uploadthing.ts`, `app/components/AttachmentUpload.tsx`, `app/App.tsx`

- **Note:** All UI/component code uses SolidJS (`createSignal`, JSX, etc.), not React.

## Attachment Upload/Download Flow

- **Upload:**
  - User selects file in chat UI (`AttachmentUpload.tsx`)
  - UploadButton sends file to `/api/uploadthing` (handled by `server/uploadthing.ts`)
  - On success, file URL is saved in Zero message/attachment schema (`shared/schema.ts`)
- **Download:**
  - Message with attachment displays download link/button in chat (`ChatMessage.tsx`)
  - Clicking link fetches file from UploadThing CDN
- **Security:**
  - Middleware in `server/uploadthing.ts` checks user auth (via Clerk session)
  - Only allow uploads for authenticated users
  - Handle errors with `onUploadError` and display to user

## Streaming Markdown in Chat

- **In `ChatMessage.tsx`:**
  - As LLM response streams, feed chunks to `streaming-markdown` parser
  - Render output in a `<div id="markdown">` or similar

## Routing Structure (Solid Router)

- **Main routes:**
  - `/` (main chat)
  - `/login`
  - `/signup`
  - `/chat/:chatId`
  - `/share/:shareId`
  - `/settings`
  - `/search`
  - `/image/:imageId`
  - `/attachments/:attachmentId`
- **How handled:**
  - All routes defined in `app/main.tsx` using `<Router>` and `<Route>`
  - Dynamic params accessed via `useParams()` in route components

## Error Handling & Security

- **File uploads:**
  - Use UploadThing's `onUploadError` to catch and display errors
  - Server-side: throw `UploadThingError` for unauthorized or invalid uploads
- **Routing:**
  - Add catch-all route for 404s
- **General:**
  - Use optimistic UI updates for chat, revert on error

## References

- [streaming-markdown docs](https://github.com/thetarnav/streaming-markdown)
- [Solid Router docs](https://docs.solidjs.com/solid-router)
- [UploadThing docs](https://docs.uploadthing.com/)

---

_Reference: [T3 Chat Cloneathon Requirements](https://cloneathon.t3.chat/)_

## Real-Time Collaborative AI Chat Rooms

**Goal:** Allow users to create, join, and chat in multiple real-time rooms, with all messages, presence, and membership synced live via Zero.

### Schema Changes (`shared/schema.ts`)

```ts
const room = table("room")
  .columns({
    id: string(),
    name: string(),
    createdAt: number(),
    ownerID: string(),
  })
  .primaryKey("id");

const roomMember = table("roomMember")
  .columns({
    roomID: string(),
    userID: string(),
    joinedAt: number(),
  })
  .primaryKey(["roomID", "userID"]);

// message.chatID becomes message.roomID
```

### UI/UX

- **Room List/Sidebar:**
  - List all rooms user is a member of (`app/components/RoomList.tsx`)
  - Button to create/join rooms
- **Room View:**
  - Main chat area shows messages for selected room only (`app/App.tsx`, `app/components/ChatMessage.tsx`)
  - Room name, member list, invite link
- **Switching Rooms:**
  - Selecting a room updates the message query to filter by `roomID`

### Permissions

- Only room members can read/post messages in a room
- Use Zero row-level security to enforce access
- Room owner can invite/remove members

### Real-Time Sync

- All room, member, and message changes sync instantly via Zero
- Use `createQuery` to fetch rooms, members, and messages for the current user

### Files/Components Touched

- `shared/schema.ts` (add Room, RoomMember, update Message)
- `shared/mutators.ts` (room CRUD, join/leave, invite)
- `app/App.tsx` (room selection, message filtering)
- `app/components/RoomList.tsx` (room list/sidebar)
- `app/components/ChatMessage.tsx` (filter by roomID)
- `server/*` (if any server-side room logic)

### Example Query

```ts
// Get all rooms for current user
z.query.roomMember.where("userID", userId);
// Get all messages for a room
z.query.message.where("roomID", roomId).orderBy("timestamp", "asc");
```

### Bonus

- Room avatars, public/private rooms, invite links, presence indicators

**Result:**
Multiple users can join the same room and see messages, edits, and presence in real time—no extra infra needed, thanks to Zero.
