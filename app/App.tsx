import { Zero } from "@rocicorp/zero";
import { createQuery } from "@rocicorp/zero/solid";
import { Route, Routes, useNavigate, useParams, A } from "@solidjs/router";
import { 
  createSignal, 
  createEffect, 
  For, 
  Show, 
  onMount, 
  createMemo,
  Suspense,
  ErrorBoundary 
} from "solid-js";
import { Mutators } from "../shared/mutators";
import { Schema, Room, Chat, Message, User } from "../shared/schema";
import { formatDate } from "./date";
import { randInt } from "./rand";
import { randomMessage } from "./test-data";

function App({ z }: { z: Zero<Schema, Mutators> }) {
  return (
    <ErrorBoundary fallback={(err) => <div class="p-4 text-red-600">Error: {err.message}</div>}>
      <div class="min-h-screen bg-secondary-50">
        <Routes>
          <Route path="/" component={() => <ChatApp z={z} />} />
          <Route path="/chat/:chatId" component={() => <ChatApp z={z} />} />
          <Route path="/room/:roomId" component={() => <ChatApp z={z} />} />
          <Route path="/share/:shareId" component={() => <ShareView z={z} />} />
          <Route path="/login" component={LoginPage} />
          <Route path="/signup" component={SignupPage} />
          <Route path="/settings" component={SettingsPage} />
          <Route path="*" component={() => <div class="p-4">404 - Page not found</div>} />
        </Routes>
      </div>
    </ErrorBoundary>
  );
}

function ChatApp({ z }: { z: Zero<Schema, Mutators> }) {
  const params = useParams();
  const navigate = useNavigate();
  
  // State
  const [selectedModel, setSelectedModel] = createSignal("openai/gpt-4o");
  const [messageInput, setMessageInput] = createSignal("");
  const [isStreaming, setIsStreaming] = createSignal(false);
  const [currentRoomId, setCurrentRoomId] = createSignal<string>("");
  const [currentChatId, setCurrentChatId] = createSignal<string>("");
  const [showSidebar, setShowSidebar] = createSignal(true);
  const [models, setModels] = createSignal<Array<{id: string, name: string, provider: string}>>([]);
  
  // Queries
  const [users] = createQuery(() => z.query.user, { ttl: "5m" });
  const [rooms] = createQuery(() => z.query.room, { ttl: "5m" });
  const [chats] = createQuery(() => {
    if (!currentRoomId()) return z.query.chat.where("id", "never");
    return z.query.chat.where("roomID", currentRoomId());
  });
  
  const [messages] = createQuery(() => {
    if (!currentChatId()) return z.query.message.where("id", "never");
    return z.query.message
      .where("chatID", currentChatId())
      .related("sender", (q) => q.one())
      .orderBy("timestamp", "asc");
  });

  // Load available models
  onMount(async () => {
    try {
      const response = await fetch("/api/models");
      const data = await response.json();
      setModels(data.models);
    } catch (error) {
      console.error("Failed to load models:", error);
    }
  });

  // Handle route params
  createEffect(() => {
    if (params.roomId) {
      setCurrentRoomId(params.roomId);
    }
    if (params.chatId) {
      setCurrentChatId(params.chatId);
    }
  });

  // Auto-select first room/chat if none selected
  createEffect(() => {
    const roomList = rooms();
    const chatList = chats();
    
    if (!currentRoomId() && roomList.length > 0) {
      setCurrentRoomId(roomList[0].id);
      navigate(`/room/${roomList[0].id}`);
    }
    
    if (currentRoomId() && !currentChatId() && chatList.length > 0) {
      setCurrentChatId(chatList[0].id);
      navigate(`/chat/${chatList[0].id}`);
    }
  });

  const currentUser = createMemo(() => 
    users().find(user => user.id === z.userID)
  );

  const sendMessage = async () => {
    const input = messageInput().trim();
    if (!input || !currentChatId() || isStreaming()) return;
    
    setMessageInput("");
    setIsStreaming(true);

    try {
      // Create user message
      const userMessageId = `msg_${Date.now()}_${Math.random().toString(36).substring(2)}`;
      await z.mutate.message.insert({
        id: userMessageId,
        chatID: currentChatId(),
        roomID: currentRoomId(),
        senderID: z.userID,
        body: input,
        timestamp: Date.now(),
        model: "",
        parentID: "",
        attachmentID: "",
        webSearchID: "",
        imageID: "",
        streamState: "",
        isComplete: true,
      });

      // Create assistant message
      const assistantMessageId = `msg_${Date.now()}_${Math.random().toString(36).substring(2)}`;
      await z.mutate.message.insert({
        id: assistantMessageId,
        chatID: currentChatId(),
        roomID: currentRoomId(),
        senderID: "assistant",
        body: "",
        timestamp: Date.now(),
        model: selectedModel(),
        parentID: "",
        attachmentID: "",
        webSearchID: "",
        imageID: "",
        streamState: "generating",
        isComplete: false,
      });

      // Send to LLM
      const conversation = messages().map(msg => ({
        role: msg.senderID === z.userID ? "user" : "assistant",
        content: msg.body
      }));
      
      conversation.push({ role: "user", content: input });

      const response = await fetch("/api/llm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: selectedModel(),
          messages: conversation,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get LLM response");
      }

      const data = await response.json();
      const assistantResponse = data.choices?.[0]?.message?.content || "Sorry, I couldn't generate a response.";

      // Update assistant message
      await z.mutate.message.update({
        id: assistantMessageId,
        body: assistantResponse,
        streamState: "complete",
        isComplete: true,
      });

    } catch (error) {
      console.error("Error sending message:", error);
      // Could add error message to chat here
    } finally {
      setIsStreaming(false);
    }
  };

  const createNewRoom = async () => {
    const name = prompt("Enter room name:");
    if (!name) return;

    const roomId = `room_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    await z.mutate.room.insert({
      id: roomId,
      name,
      createdAt: Date.now(),
      ownerID: z.userID,
      isPublic: true,
    });

    // Join the room
    await z.mutate.roomMember.insert({
      roomID: roomId,
      userID: z.userID,
      joinedAt: Date.now(),
    });

    // Create initial chat
    const chatId = `chat_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    await z.mutate.chat.insert({
      id: chatId,
      title: "General",
      roomID: roomId,
      ownerID: z.userID,
      createdAt: Date.now(),
    });

    setCurrentRoomId(roomId);
    setCurrentChatId(chatId);
    navigate(`/chat/${chatId}`);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div class="chat-layout">
      {/* Sidebar */}
      <Show when={showSidebar()}>
        <div class="chat-sidebar bg-white border-r border-secondary-200 overflow-hidden flex flex-col">
          <div class="p-4 border-b border-secondary-200">
            <div class="flex items-center justify-between mb-4">
              <h1 class="text-xl font-bold text-secondary-900">T3 Chat</h1>
              <button 
                onClick={createNewRoom}
                class="btn-primary text-sm"
              >
                + Room
              </button>
            </div>
            
            <div class="mb-3">
              <label class="block text-sm font-medium text-secondary-700 mb-1">
                Model
              </label>
              <select 
                class="model-selector w-full"
                value={selectedModel()}
                onChange={(e) => setSelectedModel(e.target.value)}
              >
                <For each={models()}>
                  {(model) => (
                    <option value={model.id}>
                      {model.name} ({model.provider})
                    </option>
                  )}
                </For>
              </select>
            </div>
          </div>

          <div class="flex-1 overflow-y-auto scrollbar-thin">
            <div class="p-4">
              <h3 class="text-sm font-medium text-secondary-700 mb-2">Rooms</h3>
              <For each={rooms()}>
                {(room) => (
                  <div 
                    class={`room-item ${currentRoomId() === room.id ? 'active' : ''}`}
                    onClick={() => {
                      setCurrentRoomId(room.id);
                      navigate(`/room/${room.id}`);
                    }}
                  >
                    <div class="font-medium">{room.name}</div>
                    <div class="text-xs text-secondary-500">
                      {new Date(room.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                )}
              </For>
            </div>

            <Show when={currentRoomId()}>
              <div class="p-4 border-t border-secondary-100">
                <h3 class="text-sm font-medium text-secondary-700 mb-2">Chats</h3>
                <For each={chats()}>
                  {(chat) => (
                    <div 
                      class={`room-item text-sm ${currentChatId() === chat.id ? 'active' : ''}`}
                      onClick={() => {
                        setCurrentChatId(chat.id);
                        navigate(`/chat/${chat.id}`);
                      }}
                    >
                      {chat.title}
                    </div>
                  )}
                </For>
              </div>
            </Show>
          </div>

          <div class="p-4 border-t border-secondary-200">
            <div class="text-sm text-secondary-600">
              {currentUser()?.name || "Anonymous User"}
            </div>
            <button class="btn-ghost text-sm mt-2 w-full">
              Settings
            </button>
          </div>
        </div>
      </Show>

      {/* Header */}
      <div class="chat-header bg-white border-b border-secondary-200 p-4 flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <button 
            class="btn-ghost md:hidden"
            onClick={() => setShowSidebar(!showSidebar())}
          >
            ☰
          </button>
          <div>
            <h2 class="font-semibold text-secondary-900">
              {chats().find(c => c.id === currentChatId())?.title || "Chat"}
            </h2>
            <div class="text-sm text-secondary-500">
              {rooms().find(r => r.id === currentRoomId())?.name}
            </div>
          </div>
        </div>
        
        <div class="flex items-center space-x-2">
          <button class="btn-ghost">🔗 Share</button>
          <button class="btn-ghost">⚙️</button>
        </div>
      </div>

      {/* Messages */}
      <div class="chat-messages overflow-y-auto scrollbar-thin p-4 space-y-4">
        <For each={messages()}>
          {(message) => (
            <MessageComponent message={message} currentUserId={z.userID} />
          )}
        </For>
        
        <Show when={isStreaming()}>
          <div class="message-bubble message-assistant">
            <div class="flex items-center space-x-2">
              <div class="loading-dots">
                <div class="loading-dot" style="animation-delay: 0ms"></div>
                <div class="loading-dot" style="animation-delay: 150ms"></div>
                <div class="loading-dot" style="animation-delay: 300ms"></div>
              </div>
              <span class="text-sm text-secondary-500">Thinking...</span>
            </div>
          </div>
        </Show>
      </div>

      {/* Input */}
      <div class="chat-input-area bg-white border-t border-secondary-200 p-4">
        <div class="flex space-x-3">
          <button class="btn-ghost">📎</button>
          <button class="btn-ghost">�</button>
          <button class="btn-ghost">🎨</button>
          
          <textarea
            class="chat-input flex-1 min-h-[44px] max-h-32"
            placeholder="Type your message..."
            value={messageInput()}
            onInput={(e) => setMessageInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isStreaming()}
          />
          
          <button 
            class="btn-primary"
            onClick={sendMessage}
            disabled={!messageInput().trim() || isStreaming()}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

function MessageComponent(props: { message: Message & { sender?: User }, currentUserId: string }) {
  const isUser = () => props.message.senderID === props.currentUserId;
  const isSystem = () => props.message.senderID === "system";

  return (
    <div class={`message-bubble ${isUser() ? 'message-user' : isSystem() ? 'message-system' : 'message-assistant'}`}>
      <div class="flex items-start space-x-3">
        <div class="flex-shrink-0">
          <div class="w-8 h-8 rounded-full bg-secondary-300 flex items-center justify-center text-sm font-medium">
            {isUser() ? "You" : isSystem() ? "🤖" : "AI"}
          </div>
        </div>
        
        <div class="flex-1 min-w-0">
          <div class="flex items-center space-x-2 mb-1">
            <span class="text-sm font-medium">
              {isUser() ? "You" : props.message.sender?.name || "Assistant"}
            </span>
            <span class="text-xs text-secondary-500">
              {new Date(props.message.timestamp).toLocaleTimeString()}
            </span>
            <Show when={props.message.model}>
              <span class="text-xs bg-secondary-100 text-secondary-600 px-2 py-1 rounded">
                {props.message.model}
              </span>
            </Show>
          </div>
          
          <div class="prose prose-sm max-w-none select-text">
            {props.message.body}
          </div>
          
          <Show when={!props.message.isComplete}>
            <div class="streaming-indicator mt-2"></div>
          </Show>
        </div>
      </div>
    </div>
  );
}

function ShareView({ z }: { z: Zero<Schema, Mutators> }) {
  const params = useParams();
  return (
    <div class="p-8 text-center">
      <h1 class="text-2xl font-bold mb-4">Shared Chat</h1>
      <p>Share ID: {params.shareId}</p>
      <p class="text-secondary-600 mt-2">
        This feature is under development. Shared chats will appear here.
      </p>
    </div>
  );
}

function LoginPage() {
  return (
    <div class="min-h-screen flex items-center justify-center bg-secondary-50">
      <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 class="text-2xl font-bold text-center mb-6">Login to T3 Chat</h1>
        <p class="text-center text-secondary-600 mb-6">
          Clerk authentication will be integrated here.
        </p>
        <A href="/" class="btn-primary w-full text-center block">
          Continue as Guest
        </A>
      </div>
    </div>
  );
}

function SignupPage() {
  return (
    <div class="min-h-screen flex items-center justify-center bg-secondary-50">
      <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 class="text-2xl font-bold text-center mb-6">Sign Up for T3 Chat</h1>
        <p class="text-center text-secondary-600 mb-6">
          Clerk authentication will be integrated here.
        </p>
        <A href="/" class="btn-primary w-full text-center block">
          Continue as Guest
        </A>
      </div>
    </div>
  );
}

function SettingsPage() {
  return (
    <div class="min-h-screen bg-secondary-50 p-8">
      <div class="max-w-2xl mx-auto">
        <h1 class="text-2xl font-bold mb-6">Settings</h1>
        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-lg font-semibold mb-4">Preferences</h2>
          <p class="text-secondary-600">Settings panel will be implemented here.</p>
        </div>
      </div>
    </div>
  );
}

export default App;
