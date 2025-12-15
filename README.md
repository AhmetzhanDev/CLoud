# Research Assistant

Local web application for analyzing scientific articles with AI-powered summaries, quiz generation, and research direction recommendations.

## Features

- 📄 Upload and analyze scientific articles (PDF)
- 🤖 AI-powered article summarization
- 📝 Generate quiz questions for comprehension testing
- 🎯 Research direction recommendations
- 🔍 Search integration with arXiv and Semantic Scholar
- 📓 Note-taking and annotation system
- 🎮 Gamification with points, levels, and achievements
- 💾 Local-first with offline support

## Tech Stack

### Frontend
- React 18 + TypeScript
- Vite
- TailwindCSS
- Zustand (state management)
- React Query (data fetching)
- React Router (navigation)

### Backend
- Node.js + Express
- TypeScript
- SQLite (local database)
- PDF.js (PDF parsing)
- OpenAI API / Ollama (AI analysis)

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd research-assistant
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables

Backend:
```bash
cd backend
cp .env.example .env
# Edit .env with your configuration
```

Frontend:
```bash
cd frontend
cp .env.example .env
# Edit .env if needed
```

4. Start development servers
```bash
# From root directory
npm run dev
```

This will start:
- Backend API on http://localhost:3000
- Frontend on http://localhost:5173

## Project Structure

```
research-assistant/
├── frontend/          # React frontend application
├── backend/           # Express backend API
├── shared/            # Shared TypeScript types
└── package.json       # Root package.json (workspaces)
```

## Development

### Running Backend Only
```bash
npm run dev:backend
```

### Running Frontend Only
```bash
npm run dev:frontend
```

### Building for Production
```bash
npm run build:prod
```

### Preview Production Build
```bash
npm run preview
```

### Linting
```bash
npm run lint
```

### Formatting
```bash
npm run format
```

### Testing
```bash
# Frontend tests
npm run test --workspace=frontend

# Backend tests
npm run test --workspace=backend
```

### Cleaning Build Artifacts
```bash
npm run clean:build
```

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

Quick start for production:

1. Build the application:
```bash
npm run build:prod
```

2. Configure production environment variables

3. Start the server:
```bash
npm start
```

## API Documentation

### Backend Endpoints

- `POST /api/articles/upload` - Upload PDF article
- `POST /api/articles/url` - Import article from URL
- `GET /api/articles` - List all articles
- `GET /api/articles/:id` - Get article details
- `POST /api/analysis/summarize` - Generate article summary
- `POST /api/analysis/directions` - Generate research directions
- `POST /api/quiz/generate` - Generate quiz questions
- `POST /api/quiz/submit` - Submit quiz answers
- `GET /api/search/arxiv` - Search arXiv
- `GET /api/search/semantic-scholar` - Search Semantic Scholar
- `GET /api/user/:userId/progress` - Get user progress
- `GET /api/leaderboard` - Get leaderboard
- `POST /api/notes` - Create note
- `GET /api/notes` - List notes

## Performance Features

- **Code Splitting**: Routes are lazy-loaded for faster initial load
- **Image Optimization**: Lazy loading with intersection observer
- **Caching**: React Query caches API responses
- **Service Worker**: Offline support with background sync
- **Bundle Optimization**: Minification and tree-shaking enabled
- **Web Vitals Monitoring**: Performance metrics in development mode

## Error Handling

- **Error Boundary**: Catches React component errors
- **Toast Notifications**: User-friendly error messages
- **API Error Interceptor**: Centralized error handling
- **Offline Detection**: Graceful degradation when offline

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

MIT
