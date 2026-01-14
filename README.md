<div align="center">

  <h1>Explainer AI</h1>
  
  <p>
    <strong>Turn your reading list
into a playlist</strong>
  </p>

  <p>
    <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-19-blue?logo=react&logoColor=white" alt="React 19" /></a>
    <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/Node.js-22-green?logo=nodedotjs&logoColor=white" alt="Node.js" /></a>
    <a href="https://vitejs.dev/"><img src="https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white" alt="Vite 7" /></a>
    <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind-4-38B2AC?logo=tailwindcss&logoColor=white" alt="Tailwind CSS 4" /></a>
    <a href="https://prisma.io/"><img src="https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma&logoColor=white" alt="Prisma" /></a>
  </p>
</div>

<br />

## 🚀 Overview

**Explainer AI** is a AI-powered Podcast Generator that transforms web content into high-quality audio podcasts. By leveraging Google's Gemini AI for script generation and advanced text-to-speech synthesis, it allows users to consume written content on the go.

Designed with a modern, responsive dashboard and a robust backend architecture, Explainer-AI handles complex background processing to ensure a seamless user experience.

## ✨ Features

- **🤖 AI-Powered Script Generation**: Automatically converts articles and web pages into engaging podcast scripts using **Google Gemini AI**.
- **🌐 Web Scraping & Analysis**: Integrates **Firecrawl** to accurately extract key information from URLs.
- **🎙️ High-Fidelity Audio Synthesis**: Generates natural-sounding lifelike voiceovers for your podcasts.
- **⚡ Asynchronous Processing**: Utilizes **BullMQ** and **Redis** for reliable, scalable background job management using a specialized worker microservice.
- **🔐 Secure Authentication**: Robust user management protected by JWT and secure password hashing.
- **📊 Interactive Dashboard**: Built with **Shadcn/UI** for a premium, accessible, and responsive user interface.
- **☁️ Cloud Storage**: Seamless audio file management using **Supabase Storage**.

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS 4, Shadcn/UI (Radix Primitives)
- **Icons**: Lucide React
- **State/Data**: Axios, React Router 7

### Backend
- **Runtime**: Node.js
- **Framework**: Express 5
- **Database**: PostgreSQL (via Supabase)
- **ORM**: Prisma
- **Queue**: BullMQ (Redis)
- **AI/ML**: Google GenAI SDK, Firecrawl JS
- **Storage**: Supabase Storage

## 🏗️ Architecture

Explainer-AI follows a decoupled client-server architecture:
1.  **Frontend**: A React SPA that interacts with the backend REST API.
2.  **API Server**: Handles requests, authentication, and dispatches jobs to the queue.
3.  **Worker Service**: A dedicated background worker that picks up jobs from Redis to perform resource-intensive tasks (scraping, script generation, audio synthesis) without blocking the main API.

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites
- **Node.js** (v20+ recommended)
- **npm** or **yarn**
- **Redis** server running locally or remotely (required for job queues)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/nyxsky404/Explainer-AI.git
    cd Explainer-AI
    ```

2.  **Install Dependencies**
    
    Backend:
    ```bash
    cd backend
    npm install
    ```

    Frontend:
    ```bash
    cd ../frontend
    npm install
    ```

3.  **Environment Variables**

    Create a `.env` file in the **backend** directory:
    ```env
    # backend/.env

    # AI & Scraping
    FIRECRAWL_API_KEY=your_firecrawl_key
    GEMINI_API_KEY=your_gemini_key

    # Auth
    JWT_SECRET=your_jwt_secret

    # Database & Storage (Supabase)
    SUPABASE_URL=your_supabase_url
    SUPABASE_SERVICE_KEY=your_supabase_service_key
    DATABASE_URL=your_database_url
    DIRECT_URL=your_direct_url_for_migrations

    # Queue
    REDIS_URL=redis://localhost:6379
    ```

    Create a `.env` file in the **frontend** directory:
    ```env
    # frontend/.env

    VITE_API_URL=http://localhost:3000/api
    ```

4.  **Database Setup**
    Initialize the database schema using Prisma:
    ```bash
    cd backend
    npx prisma migrate deploy
    npx prisma generate
    ```

### Running the Application

1.  **Start the Backend (API + Worker)**
    It is recommended to run the server and worker. Check `package.json` for specific scripts, but usually:
    ```bash
    # Terminal 1: specific backend path
    cd backend
    npm run dev
    # OR if separate worker script exists
    npm run worker
    ```

2.  **Start the Frontend**
    ```bash
    # Terminal 2
    cd frontend
    npm run dev
    ```

3.  Access the app at `http://localhost:5173` (or the port shown in your terminal).

## 🤝 Contributing

Contributions are welcome! Please fork the repository and submit a pull request for any improvements or bug fixes.
