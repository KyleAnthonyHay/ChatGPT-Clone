# ChatGPT Clone

![ChatGPT Logo](https://www.internetmatters.org/wp-content/uploads/2025/06/Chat-GPT-logo.webp)

A full-stack ChatGPT clone application with a FastAPI backend and Next.js frontend, featuring AI-powered chat capabilities.

## Prerequisites

- Docker and Docker Compose installed
- Node.js 18+ and npm (for frontend development)
- Python 3.12+ (for local backend development, optional)

## Quick Start with Docker

### Backend (API)

1. **Set up environment variables:**
   Create a `.env` file in the `agent/` directory with your required environment variables:
   ```bash
   # Example .env file
   OPENAI_API_KEY=your_api_key_here
   ALLOWED_ORIGINS=http://localhost:3000,https://chat-gpt-clone-delta-ten.vercel.app
   ```

2. **Build and run the backend with Docker Compose:**
   ```bash
   docker-compose up --build
   ```

   The API will be available at `http://localhost:8000`

3. **Verify the backend is running:**
   ```bash
   curl http://localhost:8000/health
   ```

### Exposing the API with ngrok

To expose your local API endpoint publicly (useful for testing with external services or mobile apps):

1. **Install ngrok:**
   - Download from [ngrok.com](https://ngrok.com/download) or install via package manager:
     ```bash
     # macOS
     brew install ngrok
     
     # Or download directly from ngrok.com
     ```

2. **Start ngrok tunnel:**
   ```bash
   ngrok http 8000
   ```

3. **Update ALLOWED_ORIGINS:**
   Add the ngrok URL to your `.env` file or docker-compose environment:
   ```bash
   ALLOWED_ORIGINS=http://localhost:3000,https://chat-gpt-clone-delta-ten.vercel.app,https://your-ngrok-url.ngrok.io
   ```

4. **Restart Docker Compose:**
   ```bash
   docker-compose down
   docker-compose up
   ```

   Your API will now be accessible via the ngrok URL (e.g., `https://abc123.ngrok.io`)

### Frontend (Web)

1. **Navigate to the web directory:**
   ```bash
   cd web
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

   The frontend will be available at `http://localhost:3000`

## Project Structure

```
ChatGPT-Clone/
├── agent/          # Backend agent and AI logic
├── api/            # FastAPI application
├── web/            # Next.js frontend
├── docker-compose.yml
└── Dockerfile
```

## API Endpoints

- `GET /health` - Health check endpoint
- `POST /chat` - Send chat messages
- `POST /feedback` - Submit feedback
- `GET /chats` - List all chats
- `POST /chats` - Create a new chat
- `GET /chats/{chat_id}` - Get chat details
- `DELETE /chats/{chat_id}` - Delete a chat

## Development

### Running Backend Locally (without Docker)

1. Create a virtual environment:
   ```bash
   cd agent
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Run the API:
   ```bash
   cd ../api
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

### Building Frontend for Production

```bash
cd web
npm run build
npm start
```

## Stopping the Application

To stop the Docker containers:
```bash
docker-compose down
```

## License

This project is a clone/educational implementation inspired by ChatGPT.
