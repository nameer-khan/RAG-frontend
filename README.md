#  RAG Chat Frontend

A beautiful React.js frontend with Material-UI that integrates with the **Ultimate Simplified RAG Backend**.

##  Features

- ** JWT Authentication** - Secure login/register with token management
- ** Real-time Chat** - Beautiful chat interface with integrated RAG responses
- ** Session Management** - Create, manage, and organize chat sessions
- ** Auto RAG Responses** - Send messages and get AI responses automatically
- ** Document Categories** - Filter RAG responses by document categories
- ** Modern UI** - Beautiful Material-UI design with responsive layout
- ** TypeScript** - Full type safety and better development experience

##  Architecture

```
src/
├── components/          # React components
│   ├── Login.tsx       # Authentication login
│   ├── Register.tsx    # User registration
│   ├── Dashboard.tsx   # Main dashboard layout
│   ├── Chat.tsx        # Chat interface with RAG
│   └── SessionList.tsx # Chat session management
├── contexts/           # React contexts
│   └── AuthContext.tsx # Authentication state management
├── services/           # API services
│   └── api.ts         # Backend API integration
└── App.tsx            # Main application component
```

##  Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- RAG Backend running on `http://localhost:8000`

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm start
   ```

3. **Open your browser:**
   Navigate to `http://localhost:3000`

##  Configuration

The frontend automatically connects to the RAG backend at `http://localhost:8000`. If you need to change this:

1. Edit `src/services/api.ts`
2. Update the `baseURL` in the `ApiService` constructor

##  Usage

### 1. Authentication
- **Register** a new account or **Login** with existing credentials
- JWT tokens are automatically managed and stored securely

### 2. Chat Sessions
- **Create** new chat sessions from the sidebar
- **Select** existing sessions to continue conversations
- **Delete** sessions you no longer need

### 3. RAG Chat
- **Send messages** and get automatic AI responses
- **Select document categories** to filter RAG responses
- **View sources** used for each response
- **Real-time updates** with smooth scrolling

### 4. Document Management
- **Upload documents** to improve RAG responses
- **Categorize documents** for better organization
- **View document sources** in chat responses

##  UI Components

### Login/Register
- Clean, modern authentication forms
- Password visibility toggles
- Form validation and error handling
- Smooth transitions between login/register

### Dashboard
- **App Bar** with user profile and logout
- **Session Sidebar** with session management
- **Chat Area** with message display and input
- **Responsive design** for all screen sizes

### Chat Interface
- **Message bubbles** with user/assistant distinction
- **RAG context display** showing sources used
- **Document category filtering**
- **Real-time message sending**
- **Auto-scroll** to latest messages

## API Integration

The frontend integrates seamlessly with the **Ultimate Simplified RAG Backend**:

### Authentication APIs
- `POST /api/v1/users/register/` - User registration
- `POST /api/v1/token/` - JWT login
- `GET /api/v1/users/profile/` - User profile

### Chat APIs
- `GET /api/v1/sessions/` - List chat sessions
- `POST /api/v1/sessions/` - Create new session
- `GET /api/v1/sessions/{id}/messages/` - Get session messages
- `POST /api/v1/sessions/{id}/messages/` - Send message (with auto RAG response)

### Document APIs
- `GET /api/v1/documents/` - List documents
- `POST /api/v1/documents/` - Create document

##  Development

### Available Scripts

```bash
npm start          # Start development server
npm run build      # Build for production
npm test           # Run tests
npm run eject      # Eject from Create React App
```

### Project Structure

```
rag-frontend/
├── public/                 # Static files
├── src/
│   ├── components/         # React components
│   ├── contexts/          # React contexts
│   ├── services/          # API services
│   ├── App.tsx           # Main app component
│   └── index.tsx         # App entry point
├── package.json           # Dependencies and scripts
└── tsconfig.json         # TypeScript configuration
```

### Key Technologies

- **React 18** - Modern React with hooks
- **TypeScript** - Type safety and better DX
- **Material-UI** - Beautiful UI components
- **Axios** - HTTP client for API calls
- **React Context** - State management

##  Key Features

### 1. **Ultra-Simple Integration**
- Only 2 core APIs to understand
- Automatic RAG responses built into chat
- No separate API calls needed

### 2. **Beautiful UX**
- Modern Material-UI design
- Responsive layout
- Smooth animations
- Intuitive navigation

### 3. **Real-time Chat**
- Instant message sending
- Auto-scroll to new messages
- Loading states and error handling
- Message timestamps

### 4. **Smart RAG Integration**
- Document category filtering
- Source attribution display
- Context-aware responses
- Seamless AI integration

##  Security

- **JWT Authentication** with automatic token refresh
- **Secure token storage** in localStorage
- **Automatic logout** on token expiration
- **Protected routes** and API calls

##  Responsive Design

The frontend is fully responsive and works on:
- **Desktop** - Full-featured experience
- **Tablet** - Optimized layout
- **Mobile** - Touch-friendly interface

##  Deployment

### Build for Production

```bash
npm run build
```

### Deploy Options

1. **Netlify** - Drag and drop the `build` folder
2. **Vercel** - Connect your GitHub repository
3. **AWS S3** - Upload the `build` folder
4. **Docker** - Use a Node.js container

##  Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

##  License

This project is licensed under the MIT License.

##  Getting Started

1. **Start the RAG Backend:**
   ```bash
   cd ../RAG-backend
   docker-compose up
   ```

2. **Start the Frontend:**
   ```bash
   cd rag-frontend
   npm start
   ```

3. **Open your browser** and enjoy the ultimate simplified RAG chat experience! 

---

**Built by Nameer for the ultimate simplified RAG experience!**
