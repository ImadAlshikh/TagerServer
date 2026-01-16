# Tager Server - Backend API

A robust Express.js backend API for the Tager marketplace platform, featuring authentication, real-time chat, credit system, and comprehensive post management.

## 🚀 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js 5
- **Language**: TypeScript
- **Database ORM**: Prisma
- **Database**: PostgreSQL (Neon)
- **Authentication**: Passport.js (Local + Google OAuth 2.0)
- **Session Management**: Express Session + Redis
- **Real-time**: Socket.IO
- **File Upload**: Multer
- **Image Storage**: Cloudinary
- **Password Hashing**: Bcrypt
- **Validation**: Zod

## 📋 Prerequisites

- Node.js 20+
- PostgreSQL database (local or Neon)
- Redis server
- Cloudinary account
- Google OAuth credentials (for Google login)

## 🛠️ Installation

1. **Clone the repository** (if not already done)

   ```bash
   git clone <repository-url>
   cd Tager/tager_server
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env` file in the root directory:

   ```env
   PORT=3001
   FRONTEND_URL=http://localhost:3000

   # Database
   DATABASE_URL=postgresql://user:password@host:5432/database

   # Google OAuth
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret

   # Session
   SESSION_SECRET=your_session_secret_key

   # Cloudinary
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   CLOUDINARY_CLOUD_NAME=your_cloud_name

   # Redis
   REDIS_URL=redis://localhost:6379

   # App Config
   CACHE_TIME=604800
   POST_CREATE_COST=5
   ```

4. **Set up the database**

   ```bash
   # Generate Prisma client
   npx prisma generate

   # Run migrations
   npx prisma migrate dev

   # (Optional) Seed the database
   npx prisma db seed
   ```

5. **Run the development server**

   ```bash
   npm run dev
   ```

   The API will be available at [http://localhost:3001](http://localhost:3001)

## 📁 Project Structure

```
src/
├── authStrategies/               # Passport strategies
│   ├── GoogleStrategy.ts         # Google OAuth strategy
│   └── LocalStrategy.ts          # Local email/password strategy
├── controllers/                  # Route controllers
│   ├── chatController.ts         # Chat management
│   ├── creditsController.ts      # Credits/wallet operations
│   ├── postController.ts         # Post CRUD operations
│   ├── ratingController.ts       # User ratings
│   ├── reportController.ts       # Report system
│   └── userController.ts         # User management
├── middlewares/                  # Express middlewares
│   ├── attachUser.ts             # Attach user to request
│   ├── authMiddleware.ts         # Authentication guard
│   ├── errorHandler.ts           # Global error handler
│   └── permissionsMiddleware.ts  # Role-based access control
├── routes/                       # API routes
│   ├── chatRoutes.ts             # /chats endpoints
│   ├── creditsRoutes.ts          # /credits endpoints
│   ├── postRoutes.ts             # /posts endpoints
│   ├── ratingRoutes.ts           # /ratings endpoints
│   ├── reportRotues.ts           # /reports endpoints
│   └── userRoutes.ts             # /users endpoints
├── services/                     # Business logic
│   ├── chatService.ts            # Chat operations
│   ├── creditsService.ts         # Wallet/credits logic
│   ├── postService.ts            # Post operations
│   ├── ratingService.ts          # Rating operations
│   ├── reportService.ts          # Report operations
│   └── userService.ts            # User operations
├── lib/                          # External service configs
│   ├── cloudinary.ts             # Cloudinary setup
│   ├── prisma.ts                 # Prisma client
│   ├── redis.ts                  # Redis client
│   └── socket.ts                 # Socket.IO setup
├── types/                        # TypeScript types
│   ├── express-session.d.ts      # Session type extensions
│   └── socket-session.d.ts       # Socket session types
├── utils/                        # Utilities
│   ├── AppError.ts               # Custom error class
│   ├── PrismaErrorMapper.ts      # Map Prisma errors
│   ├── catchAsync.ts             # Async error wrapper
│   └── validator.ts              # Zod schemas
└── index.ts                      # App entry point
```

## 🎯 Key Features

### Authentication & Authorization

- **Local Authentication**: Email/password with bcrypt hashing
- **Google OAuth 2.0**: Seamless Google sign-in
- **Session Management**: Redis-backed sessions (24-hour duration)
- **Role-based Access**: USER, ADMIN, SUPPORT roles
- **Protected Routes**: Middleware-based route protection

### Post Management

- Create, read, update posts
- Image upload to Cloudinary
- Category-based organization (26+ categories)
- Search and filtering
- Post status management (ACTIVE, SOLD, EXPIRED, HIDDEN, REMOVED)
- Credit-based posting (5 credits per post)

### Real-time Chat

- One-to-one messaging between users
- Socket.IO for real-time delivery
- Message read status tracking
- Chat history persistence
- Unread message count

### Credits & Wallet System

- Dual credit system (free + paid)
- Credit packages for purchase
- Transaction logging
- Monthly free credit reset
- Credit deduction priority (free first, then paid)

### User Management

- Profile creation and updates
- Profile picture upload
- User ratings and reviews
- User reports
- Wallet management

### Search & Filter

- Full-text search
- Category filtering
- Price sorting
- Pagination support

## 🔌 API Endpoints

### User Routes (`/users`)

| Method | Endpoint   | Description              | Auth Required |
| ------ | ---------- | ------------------------ | ------------- |
| POST   | `/signup`  | Register new user        | No            |
| POST   | `/signin`  | Login user               | No            |
| GET    | `/`        | Get all users            | No            |
| GET    | `/profile` | Get current user profile | Yes           |
| PUT    | `/profile` | Update profile           | Yes           |
| GET    | `/:id`     | Get user by ID           | No            |
| DELETE | `/logout`  | Logout                   | Yes           |

### Post Routes (`/posts`)

| Method | Endpoint       | Description           | Auth Required |
| ------ | -------------- | --------------------- | ------------- |
| POST   | `/`            | Create post           | Yes           |
| GET    | `/`            | Get posts (paginated) | No            |
| PUT    | `/`            | Edit post             | Yes           |
| GET    | `/search`      | Search posts          | No            |
| GET    | `/by-user/:id` | Get posts by user     | No            |
| GET    | `/:id`         | Get post by ID        | No            |

### Chat Routes (`/chats`)

| Method | Endpoint | Description      | Auth Required |
| ------ | -------- | ---------------- | ------------- |
| POST   | `/start` | Start new chat   | Yes           |
| POST   | `/send`  | Send message     | Yes           |
| GET    | `/`      | Get user's chats | Yes           |
| GET    | `/:id`   | Get chat by ID   | Yes           |

### Credits Routes (`/credits`)

| Method | Endpoint | Description  | Auth Required |
| ------ | -------- | ------------ | ------------- |
| POST   | `/load`  | Load credits | Yes           |

### Rating Routes (`/ratings`)

| Method | Endpoint | Description          | Auth Required |
| ------ | -------- | -------------------- | ------------- |
| POST   | `/`      | Create rating        | Yes           |
| GET    | `/:id`   | Get ratings for user | No            |

### Report Routes (`/reports`)

| Method | Endpoint | Description   | Auth Required |
| ------ | -------- | ------------- | ------------- |
| POST   | `/`      | Create report | Yes           |

### Auth Routes

| Method | Endpoint                | Description           |
| ------ | ----------------------- | --------------------- |
| GET    | `/auth/google`          | Initiate Google OAuth |
| GET    | `/auth/google/callback` | Google OAuth callback |

## 🗄️ Database Schema

### Core Models

- **User**: User accounts with authentication
- **Post**: Marketplace listings
- **Chat**: Chat conversations
- **Message**: Individual messages
- **Wallet**: User credit balance
- **WalletLog**: Credit transaction history
- **Rating**: User ratings
- **Report**: User/post reports
- **Category**: Post categories
- **Image**: Cloudinary image metadata

See [PROJECT_DOCUMENTATION.md](../PROJECT_DOCUMENTATION.md) for detailed schema.

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start development server with hot reload

# Database
npx prisma generate  # Generate Prisma client
npx prisma migrate dev  # Run migrations
npx prisma studio    # Open Prisma Studio (database GUI)

# Production
npm run build        # Build TypeScript
npm start            # Start production server
```

## 🔐 Environment Variables

| Variable                | Description                  | Required |
| ----------------------- | ---------------------------- | -------- |
| `PORT`                  | Server port                  | Yes      |
| `FRONTEND_URL`          | Frontend URL for CORS        | Yes      |
| `DATABASE_URL`          | PostgreSQL connection string | Yes      |
| `GOOGLE_CLIENT_ID`      | Google OAuth client ID       | Yes      |
| `GOOGLE_CLIENT_SECRET`  | Google OAuth secret          | Yes      |
| `SESSION_SECRET`        | Session encryption key       | Yes      |
| `CLOUDINARY_API_KEY`    | Cloudinary API key           | Yes      |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret        | Yes      |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name        | Yes      |
| `REDIS_URL`             | Redis connection URL         | Yes      |
| `CACHE_TIME`            | Cache duration (seconds)     | No       |
| `POST_CREATE_COST`      | Credits per post             | No       |

## 🔌 Socket.IO Events

### Chat Events

```typescript
// Join a chat room
socket.emit("join-chat", { chatId, userId });

// Leave a chat room
socket.emit("leave-chat", chatId);

// New message received
socket.on("new-message", { text, senderId, chatId, created_at });
```

### Notification Events

```typescript
// Subscribe to notifications
socket.emit("subscribe-notification", userId);

// Receive notification
socket.on("notification", { type, message, data });
```

## 🛡️ Security Features

- **Password Hashing**: Bcrypt with 10 salt rounds
- **Session Security**: httpOnly cookies, sameSite: 'lax'
- **CORS Protection**: Configured for frontend URL only
- **Input Validation**: Zod schemas for all inputs
- **SQL Injection Protection**: Prisma ORM parameterized queries
- **XSS Protection**: Input sanitization
- **Error Handling**: No sensitive data in error messages

## 🐛 Troubleshooting

### Common Issues

**Database connection errors**

```bash
# Check DATABASE_URL format
# Ensure PostgreSQL is running
# Test connection with Prisma Studio
npx prisma studio
```

**Redis connection errors**

```bash
# Ensure Redis is running
redis-cli ping  # Should return PONG

# Start Redis (if not running)
redis-server
```

**Port already in use**

```bash
# Kill process on port 3001
npx kill-port 3001

# Or change PORT in .env
PORT=3002
```

**Prisma client errors**

```bash
# Regenerate Prisma client
npx prisma generate

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

**Cloudinary upload errors**

- Verify API credentials in `.env`
- Check Cloudinary dashboard for quota limits
- Ensure image size is within limits

**Google OAuth errors**

- Verify redirect URI in Google Console matches your callback URL
- Check GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET
- Ensure frontend URL is correct

## 📊 Database Management

### Prisma Studio

```bash
npx prisma studio
```

Opens a GUI at `http://localhost:5555` to view and edit database records.

### Migrations

```bash
# Create a new migration
npx prisma migrate dev --name migration_name

# Apply migrations in production
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset
```

## 🧪 Testing

```bash
# Run tests (if configured)
npm test

# Test API endpoints with curl
curl http://localhost:3001/users
```

## 📈 Performance Optimization

- **Redis Caching**: Session data cached in Redis
- **Database Indexing**: Optimized Prisma schema with indexes
- **Image CDN**: Cloudinary for fast image delivery
- **Connection Pooling**: Prisma connection pooling

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Update documentation
5. Submit a pull request

## 📄 License

This project is private and proprietary.

## 🔗 Related

- [Frontend Documentation](../tager_client/README.md)
- [Project Documentation](../PROJECT_DOCUMENTATION.md)
