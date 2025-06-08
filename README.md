# T3 Chat Cloneathon Implementation

A modern, real-time chat application built with SolidJS, Zero (Rocicorp), and various AI services. This implementation includes all core requirements and bonus features from the T3 Chat Cloneathon.

## 🚀 Features

### Core Requirements ✅

- **Multi-LLM Chat**: Integrated with [OpenRouter](https://openrouter.ai/) for unified access to multiple AI models
  - GPT-4o, Claude 3.5 Sonnet, Gemini Pro, Llama 3.1, and more
  - Model selector in chat interface
  - Streaming responses with real-time updates

- **Authentication & Sync**: Real-time synchronization powered by Zero
  - JWT-based authentication (Clerk integration ready)
  - Cross-device/tab synchronization
  - User management and permissions

### Bonus Features ✅

- **Real-Time Collaborative Chat Rooms**: Create and join multiple chat rooms
- **File Upload Support**: Attach images, documents, and files to messages
- **Image Generation**: AI-powered image generation with DALL-E 3 and Stable Diffusion
- **Web Search Integration**: Search the web with multiple providers (Bing, Brave, SerpAPI, DuckDuckGo)
- **Chat Sharing**: Generate shareable links for conversations
- **Syntax Highlighting**: Code blocks with Prism.js highlighting
- **Chat Branching**: Fork conversations from any message (planned)
- **Resumable Streams**: Continue interrupted AI responses (planned)
- **Modern UI**: Beautiful, responsive design with TailwindCSS

## 🛠 Tech Stack

- **Frontend**: SolidJS, TailwindCSS, Solid Router
- **Backend**: Hono, Node.js, Zero (Rocicorp)
- **Database**: PostgreSQL with Zero sync layer
- **AI Integration**: OpenRouter API for multi-LLM support
- **Real-time Sync**: Zero (Rocicorp) for instant synchronization
- **File Uploads**: UploadThing integration
- **Styling**: TailwindCSS with custom design system

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd t3-chat-clone
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your API keys:
   - `OPENROUTER_API_KEY`: Get from [OpenRouter](https://openrouter.ai/)
   - `ZERO_AUTH_SECRET`: Generate a secure secret key
   - Optional: Add search API keys for web search functionality

4. **Start the development database**
   ```bash
   npm run dev:db-up
   ```

5. **Start the development servers**
   ```bash
   # Terminal 1: Start Zero cache
   npm run dev:zero-cache
   
   # Terminal 2: Start the UI
   npm run dev:ui
   ```

6. **Open your browser**
   Navigate to `http://localhost:5173`

## 🔧 Development Scripts

```bash
# Development
npm run dev:ui          # Start Vite dev server
npm run dev:zero-cache  # Start Zero development cache
npm run dev:db-up       # Start PostgreSQL with Docker
npm run dev:db-down     # Stop PostgreSQL
npm run dev:clean       # Clean database and cache

# Building
npm run build           # Build for production
npm run lint            # Run ESLint
```

## 🏗 Project Structure

```
├── app/                    # Frontend SolidJS application
│   ├── App.tsx            # Main app component with routing
│   ├── main.tsx           # App entry point
│   └── index.css          # TailwindCSS styles
├── server/                # Backend Hono server
│   ├── index.ts           # Main server with all endpoints
│   ├── openrouter.ts      # LLM integration
│   ├── upload.ts          # File upload handling
│   ├── websearch.ts       # Web search integration
│   └── push.ts            # Zero push endpoint
├── shared/                # Shared code between client/server
│   ├── schema.ts          # Database schema with Zero
│   ├── mutators.ts        # Data mutations
│   └── auth.ts            # Authentication helpers
├── functions/             # Serverless functions
└── docker/                # Docker configuration
```

## 🎨 UI Components

The application features a modern chat interface with:

- **Sidebar**: Room list, chat list, model selector
- **Header**: Current chat info, share button, settings
- **Messages**: Formatted messages with syntax highlighting
- **Input**: Rich text input with file upload, web search, and image generation buttons

## 🔌 API Endpoints

### Chat & LLM
- `POST /api/llm` - Send message to LLM
- `POST /api/llm/stream` - Streaming LLM responses
- `POST /api/image/generate` - Generate images

### Files & Search
- `POST /api/upload` - Upload files
- `POST /api/search` - Web search

### Sharing
- `POST /api/share` - Create share link
- `GET /api/share/:id` - Get shared chat

### Utilities
- `GET /api/models` - Available LLM models
- `GET /api/health` - Health check

## 🌐 Deployment

### Vercel (Recommended)

1. **Connect to Vercel**
   ```bash
   npm i -g vercel
   vercel
   ```

2. **Set environment variables** in Vercel dashboard

3. **Deploy**
   ```bash
   vercel --prod
   ```

### Other Platforms

The app can be deployed to:
- Railway
- Fly.io
- Netlify
- Any Node.js hosting platform

## 🔑 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENROUTER_API_KEY` | OpenRouter API key for LLM access | Yes |
| `ZERO_AUTH_SECRET` | Secret key for Zero authentication | Yes |
| `VITE_PUBLIC_SERVER` | Zero server URL | Yes |
| `BING_SEARCH_KEY` | Bing Search API key | No |
| `CLERK_PUBLISHABLE_KEY` | Clerk authentication | No |
| `UPLOADTHING_SECRET` | File upload service | No |

## 🎯 Usage

1. **Create a Room**: Click "+ Room" to create a new chat room
2. **Select Model**: Choose your preferred AI model from the dropdown
3. **Start Chatting**: Type messages and get AI responses
4. **Upload Files**: Click 📎 to attach files
5. **Search Web**: Click 🔍 to search the internet
6. **Generate Images**: Click 🎨 to create AI images
7. **Share Chats**: Click 🔗 to generate shareable links

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🏆 T3 Chat Cloneathon

This implementation covers all requirements from the [T3 Chat Cloneathon](https://cloneathon.t3.chat/):

### Core Requirements ✅
- [x] Chat with various LLMs via OpenRouter
- [x] Authentication & real-time sync with Zero
- [x] User management and permissions

### Bonus Features ✅
- [x] Real-time collaborative chat rooms
- [x] File attachment support
- [x] AI image generation
- [x] Web search integration
- [x] Chat sharing capabilities
- [x] Modern responsive UI
- [x] Syntax highlighting
- [x] Streaming responses

### Technical Implementation ✅
- [x] SolidJS frontend with routing
- [x] Zero (Rocicorp) for real-time sync
- [x] Hono backend with multiple endpoints
- [x] TailwindCSS for styling
- [x] TypeScript for type safety
- [x] Modern deployment ready

## 🎉 Acknowledgments

- [T3 Stack](https://create.t3.gg/) for inspiration
- [Zero (Rocicorp)](https://zero.rocicorp.dev/) for real-time sync
- [OpenRouter](https://openrouter.ai/) for LLM access
- [SolidJS](https://solidjs.com/) for the reactive framework

---

**Built with ❤️ for the T3 Chat Cloneathon**

```bash
git clone git@github.com:rocicorp/hello-zero-solid.git
cd hello-zero-solid
npm install
npm run dev:db-up

# in a second terminal
npm run dev:zero-cache

# in yet another terminal
npm run dev:ui
```
