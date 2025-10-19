# Kinfolk API Server

Backend REST API server for the Kinfolk social platform. Built with Express.js, Prisma ORM, and SQLite.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set up database
npm run prisma:migrate

# Seed database with initial data
npm run prisma:seed

# Start development server
npm run dev
```

The server will be running at `http://localhost:3000`

## 📋 Prerequisites

- Node.js 18+
- npm or yarn

## 🛠 Tech Stack

- **Framework**: Express.js with TypeScript
- **Database**: SQLite with Prisma ORM
- **Authentication**: JWT tokens with bcrypt password hashing
- **Validation**: Zod schemas
- **Dev Tools**: tsx (TypeScript execution with hot-reload)

## 📁 Project Structure

```
/server
  /src
    /controllers      # Business logic (auth, stories, users)
    /middleware       # Auth middleware, error handling
    /routes          # API route definitions
    /types           # Zod validation schemas
    /utils           # Prisma client, utility functions
    server.ts        # Express app entry point
  /prisma
    schema.prisma    # Database schema definition
    seed.ts          # Database seed script
    dev.db          # SQLite database file (generated)
    /migrations     # Database migrations (generated)
  package.json
  tsconfig.json
  .env             # Environment variables
```

## 🗄 Database Schema

### Models

- **User** - User accounts with authentication and profile data
- **Channel** - User channels for organizing stories
- **Story** - Posts and comments (supports nested replies via self-relation)
- **Like** - Many-to-many relationship for story likes
- **Media** - File attachments for stories (images/videos)
- **Subscription** - Channel subscriptions with approval workflow

### Seed Data

The database is seeded with 5 test users, 7 channels, and 5 stories with comments.

**Test User Credentials** (all use password: `password`):
- sarah@example.com
- alex@example.com
- maya@example.com
- jordan@example.com
- sam@example.com

## 🔌 API Endpoints

### Base URL
```
http://localhost:3000
```

### Health Check
```http
GET /health
```

### Authentication

#### Register New User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepassword",
  "name": "John Doe"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "sarah@example.com",
  "password": "password"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": { "id": 1, "username": "sarahchen", "email": "...", ... },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Stories

#### Get All Stories
```http
GET /api/stories?page=1&limit=50
```

#### Create Story
```http
POST /api/stories
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "My first story!",
  "channelId": 1,
  "parentId": null,  // Optional: set for comments
  "media": []        // Optional: array of media objects
}
```

#### Update Story
```http
PUT /api/stories/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Updated content"
}
```

#### Delete Story
```http
DELETE /api/stories/:id
Authorization: Bearer <token>
```

#### Toggle Like
```http
POST /api/stories/:id/like
Authorization: Bearer <token>
```

### Users

#### Get User Profile
```http
GET /api/users/:id
```

#### Update User Profile
```http
PUT /api/users/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "bio": "My bio",
  "location": "San Francisco, CA",
  "website": "example.com",
  "themeId": "ocean"
}
```

### Channels & Subscriptions

*(Coming soon - stub routes currently implemented)*

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication.

1. Login or register to receive a token
2. Include the token in the `Authorization` header for protected routes:
   ```
   Authorization: Bearer <your-jwt-token>
   ```

## 🌍 Environment Variables

Create a `.env` file in the server directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL="file:./prisma/dev.db"

# JWT Secret (change in production!)
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

# CORS
FRONTEND_URL="http://localhost:5173"
```

## 📜 Available Scripts

```bash
# Development
npm run dev              # Start dev server with hot-reload

# Build
npm run build            # Compile TypeScript to JavaScript
npm start                # Run production build

# Database
npm run prisma:generate  # Generate Prisma Client
npm run prisma:migrate   # Run database migrations
npm run prisma:studio    # Open Prisma Studio (DB GUI)
npm run prisma:seed      # Seed database with initial data
npm run db:reset         # Reset database (migrate + seed)
```

## 🧪 Testing the API

### Using cURL

```bash
# Health check
curl http://localhost:3000/health

# Get stories
curl http://localhost:3000/api/stories

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"sarah@example.com","password":"password"}'

# Create story (with auth token)
curl -X POST http://localhost:3000/api/stories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"content":"Hello from API!","channelId":1}'
```

### Using Prisma Studio

```bash
npm run prisma:studio
```

Opens a web UI at `http://localhost:5555` to browse and edit database records.

## 🔒 Security Features

- **Password Hashing**: bcrypt with 10 salt rounds
- **JWT Authentication**: Secure token-based auth with expiration
- **Input Validation**: Zod schemas validate all incoming data
- **CORS Protection**: Configured for frontend origin only
- **Ownership Checks**: Users can only modify their own resources
- **SQL Injection Protection**: Prisma ORM prevents SQL injection

## 🚧 Pending Features

- [ ] Channel management endpoints (CRUD operations)
- [ ] Subscription endpoints (subscribe, approve, manage)
- [ ] File upload for media (currently accepts base64/URLs)
- [ ] Rate limiting
- [ ] Request logging to file
- [ ] API documentation (Swagger/OpenAPI)
- [ ] Unit and integration tests

## 🐛 Common Issues

### Database locked error
```bash
# Reset the database
npm run db:reset
```

### Prisma Client not generated
```bash
# Regenerate Prisma Client
npm run prisma:generate
```

### Port already in use
```bash
# Change PORT in .env file or kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

## 📝 Response Format

All API responses follow this format:

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "details": []  // Optional validation errors
}
```

## 🔗 Integration with Frontend

The frontend is configured to connect to this API server. To integrate:

1. Start the backend server: `npm run dev` (port 3000)
2. Start the frontend: `npm run dev` (port 5173)
3. Frontend API calls will automatically proxy to `http://localhost:3000`

## 📄 License

MIT

## 🤝 Contributing

This is a demo project for the Kinfolk social platform.
