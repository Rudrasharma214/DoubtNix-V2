# DoubtNix

## Project Overview

DoubtNix is an intelligent document-based question answering platform that leverages artificial intelligence to help users clarify their doubts by asking questions about uploaded documents. Users can upload documents in various formats (PDF, images, Word documents), extract content from them, and interact with an AI-powered conversation system to get instant answers and explanations related to the document content.

## How It's Implemented

DoubtNix is built as a full-stack web application with a modern, scalable architecture:

**Backend Technologies:**
- Express.js - RESTful API server
- MongoDB with Mongoose - NoSQL database for data persistence
- Hugging Face (meta-llama/Llama-3.1-8B-Instruct:novita) - AI model for Q&A
- Cloudinary - Cloud storage for documents and images
- Multer - File upload handling
- JWT - Authentication and authorization
- Bcrypt - Password encryption
- Winston - Logging system

**Frontend Technologies:**
- React - UI framework
- React Router - Client-side routing
- TanStack React Query - Server state management
- Tailwind CSS - Utility-first CSS framework
- Axios - HTTP client
- React Markdown - Markdown rendering for AI responses
- React Dropzone - File upload UI component
- Lucide React - Icon library

**Architecture:**
- Event-driven architecture with EventBus for asynchronous processing
- Service-oriented design pattern for separation of concerns
- Middleware-based error handling and logging
- Context API for theme management and authentication state

## Main Features

1. **User Authentication**
   - User registration and login with email verification
   - Password reset functionality
   - JWT-based secure authentication
   - Email OTP verification

2. **Document Management**
   - Upload documents in multiple formats (PDF, images, Word documents)
   - Automatic text extraction from documents using OCR and parsers
   - Document storage with metadata
   - Document listing and management

3. **AI-Powered Question Answering**
   - Ask questions about uploaded documents
   - Real-time AI responses using Google Generative AI and OpenAI
   - Context-aware answers based on document content
   - Support for multiple languages

4. **Conversation Management**
   - Create and manage conversations
   - View conversation history
   - Update conversation titles
   - Delete conversations
   - Paginated conversation listing with search functionality

5. **User Dashboard**
   - View uploaded documents
   - Access conversation history
   - Manage profile information
   - Switch between light and dark themes

6. **Email Notifications**
   - Welcome emails for new users
   - OTP verification emails

7. **Responsive UI**
   - Mobile-friendly design
   - Dark and light theme support

## Folder Structure

### Backend Structure

```
Backend/
├── src/
│   ├── app.js                          # Express app configuration
│   ├── server.js                       # Server entry point
│   ├── config/                         # Configuration files
│   ├── constants/                      # Application constants
│   ├── controllers/                    # Request handlers
│   ├── events/                         # Event-driven architecture
│   ├── middlewares/                    # Express middlewares
│   ├── models/                         # MongoDB schemas
│   ├── routes/                         # API endpoints
│   ├── services/                       # Business logic
│   ├── templates/                      # Email templates
│   └── utils/                          # Utility functions
├── ecosystem.config.cjs               # PM2 configuration
└── package.json                       # Project dependencies
```

### Frontend Structure

```
Frontend/
├── src/
│   ├── App.jsx                        # Main application component
│   ├── index.css                      # Global styles
│   ├── main.jsx                       # React entry point
│   ├── components/                    # Reusable UI components
│   ├── context/                       # React Context for state 
│   ├── hooks/                         # Custom React hooks
│   ├── layout/                        # Layout components
│   ├── pages/                         # Page components
│   ├── routes/                        # Routing configuration
│   └── services/                      # API service layer
├── public/                            # Static assets
├── index.html                         # HTML entry point
├── vite.config.js                    # Vite configuration
├── eslint.config.js                  # ESLint rules
├── vercel.json                       # Vercel deployment config
└── package.json                      # Project dependencies
```

## Tech Stack Summary

**Backend:**
- Runtime: Node.js with Express.js
- Database: MongoDB
- AI/ML: Hugging Face (meta-llama/Llama-3.1-8B-Instruct:novita)
- Storage: Cloudinary
- Authentication: JWT, Bcrypt
- Email: Brevo API
- Document Processing: PDF-Parse, Mammoth, Tesseract.js
- Logging: Winston

**Frontend:**
- Framework: React 19
- Build Tool: Vite
- Styling: Tailwind CSS
- State Management: TanStack React Query, React Context
- Routing: React Router v7
- HTTP Client: Axios

## Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB
- Cloudinary account
- Brevo account
- Google Generative AI API key or OpenAI API key

### Installation

1. Clone the repository
2. Install Backend dependencies:
   ```bash
   cd Backend
   npm install
   ```

3. Install Frontend dependencies:
   ```bash
   cd Frontend
   npm install
   ```

4. Configure environment variables in Backend

5. Run Backend:
   ```bash
   npm run dev
   ```

6. Run Frontend:
   ```bash
   npm run dev
   ```

## Project Architecture

The application follows a three-layer architecture:

1. **Presentation Layer (Frontend)** - React components handling UI and user interaction
2. **Business Logic Layer (Backend Services)** - Core application logic and AI integration
3. **Data Layer (MongoDB)** - Persistent data storage

Event-driven architecture is used for asynchronous operations like email notifications and document processing.
