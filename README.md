# VibeWall — Interactive Community Message Board

A complete, modern, authentic social community web application built with **React**, **Vite**, **Node.js**, **Express**, **MongoDB (Mongoose)**, **Socket.IO**, and **Tailwind CSS**.

---

## 🌟 Project Mission & Authenticity Guarantee

VibeWall is a real social platform where actual people can register, log in, create profiles, publish posts, share images, comment, react with emotional vibes, discover niche topic circles, tackle daily creative prompts, and bookmark inspiring content.

### Non-Negotiable Standards:
- **No demo login accounts:** Every user authenticates with genuine MongoDB-backed credentials.
- **No fabricated activity:** No fake follower counts, bot posts, or synthetic notifications.
- **Real persistence:** Posts, reactions, comments, bookmarks, and circle memberships are permanently stored in MongoDB.
- **Graceful degradation:** If external image storage (Cloudinary) is unconfigured, text posts and full community functionality remain active with clear, honest configuration messaging.

---

## 🏗️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite 6, JavaScript, React Router 6, Tailwind CSS 3, Lucide React icons |
| **Backend** | Node.js (v24), Express.js (v4), RESTful API, Socket.IO (v4) for real-time delivery |
| **Database** | MongoDB & Mongoose 8 (Unique indexes, schemas, compound relationships) |
| **Security** | bcryptjs password hashing, JSON Web Tokens (JWT), HTTP-only cookies, Rate Limiting, Helmet |
| **Media** | Cloudinary integration with Multer memory storage & client-side validation |
| **Testing** | Jest, Supertest, Live E2E Integration Suite |

---

## 📁 Project Architecture

```
VibeWall/
├── client/                     # Vite + React Frontend
│   ├── src/
│   │   ├── components/         # Reusable UI Components
│   │   │   ├── common/         # Navbar, Sidebar, MobileNav, Avatar, Modal
│   │   │   ├── feed/           # CreatePostCard, PostCard, ReactionButton, CommentSection
│   │   │   └── circles/        # CircleCard, CreateCircleModal
│   │   ├── context/            # AuthContext, SocketContext
│   │   ├── layouts/            # AppLayout (3-column responsive), AuthGuard
│   │   ├── pages/              # LandingPage, LoginPage, RegisterPage, FeedPage,
│   │   │                       # ExplorePage, CirclesPage, CircleDetailPage,
│   │   │                       # DailySparkPage, SavedPostsPage, NotificationsPage,
│   │   │                       # ProfilePage, SettingsPage, NotFoundPage
│   │   ├── services/           # Axios API configuration & interceptors
│   │   ├── styles/             # Tailwind CSS & custom animations
│   │   ├── App.jsx             # Route definitions & providers
│   │   └── main.jsx            # Entrypoint
│   ├── index.html              # HTML template with Google Fonts (Plus Jakarta Sans)
│   ├── tailwind.config.js      # Custom theme colors (vibe violet & coral palettes)
│   ├── vite.config.js          # Vite config with API proxy
│   └── package.json
│
├── server/                     # Express.js REST API & WebSocket Server
│   ├── config/                 # MongoDB (db.js) & Cloudinary (cloudinary.js)
│   ├── controllers/            # auth, user, post, comment, reaction, circle,
│   │                           # bookmark, notification, challenge, search controllers
│   ├── middleware/             # auth (protect & optionalAuth), upload (Multer), rateLimiter
│   ├── models/                 # User, Post, Comment, Reaction, Circle,
│   │                           # CircleMembership, Bookmark, Notification, DailyChallenge, ChallengeSubmission
│   ├── routes/                 # Express routers for all resources
│   ├── socket/                 # Socket.IO event dispatchers & room management
│   ├── tests/                  # Jest integration test suite & live E2E script
│   ├── server.js               # Express application entrypoint
│   └── package.json
│
├── package.json                # Root package with concurrent run scripts
└── README.md                   # Complete documentation
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **MongoDB** (Local MongoDB instance on `mongodb://127.0.0.1:27017` OR MongoDB Atlas connection string)

### 2. Installation
Install all root, backend, and frontend dependencies in one command:
```bash
npm run install:all
```
Or manually:
```bash
npm install
cd server && npm install
cd ../client && npm install
```

### 3. Environment Configuration

#### Backend Configuration (`server/.env`):
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/vibewall
JWT_SECRET=your_secure_jwt_secret_key_here
CLIENT_URL=http://localhost:5173
NODE_ENV=development

# Optional: Cloudinary credentials for persistent image uploads
# If left blank, text posts remain 100% functional
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

#### Frontend Configuration (`client/.env`):
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### 4. Running the Development Servers
From the root directory, launch both the backend API and frontend Vite server concurrently:
```bash
npm run dev
```

- **Frontend Client:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:5000](http://localhost:5000)
- **API Health Check:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🧪 Automated Testing

### Run Jest API Integration Suite (17 Tests)
```bash
cd server
npm test
```
Tests all critical backend workflows including:
- Real MongoDB registration & bcrypt password hashing
- Rejection of duplicate email & username
- Authentication with valid & invalid credentials
- Protected routes & session recovery (`/api/auth/me`)
- Post creation & authorization checks (403 forbidden when editing another user's post)
- 6-vibe reaction toggle mechanism & live counters
- Comment creation & post owner / author deletion rights
- Private bookmarks persistence
- Vibe circle auto-seeding & memberships

### Run Live E2E User Journey Script (14 Steps)
```bash
node server/tests/e2e_journey.js
```
Runs a complete simulated user journey directly against the live HTTP and database endpoints.

---

## 📡 REST API Reference

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new account (fullName, username, email, password, confirmPassword) | No |
| `POST` | `/api/auth/login` | Authenticate with credentials and receive JWT | No |
| `GET` | `/api/auth/me` | Fetch currently authenticated user session | Yes |
| `POST` | `/api/auth/logout` | Clear session cookie | Yes |
| `PUT` | `/api/auth/update-password` | Update account password securely | Yes |
| `DELETE`| `/api/auth/delete-account` | Permanently delete account and cascade user data | Yes |

### Posts & Interactions (`/api/posts`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/posts` | Get paginated community feed with optional `circle` or `search` | Optional |
| `GET` | `/api/posts/:id` | Get single post details | Optional |
| `POST` | `/api/posts` | Create new post (supports optional image & circle tag) | Yes |
| `PUT` | `/api/posts/:id` | Edit post content (owner only) | Yes |
| `DELETE`| `/api/posts/:id` | Delete post and associated comments/reactions (owner only) | Yes |
| `POST` | `/api/posts/:postId/react` | Toggle or switch reaction (`like`, `love`, `inspired`, `happy`, `curious`, `supportive`) | Yes |
| `GET` | `/api/posts/:postId/comments` | Fetch comments for a post | No |
| `POST` | `/api/posts/:postId/comments` | Add a comment to a post | Yes |
| `DELETE`| `/api/posts/:postId/comments/:commentId` | Delete a comment (comment author or post owner) | Yes |
| `POST` | `/api/posts/:postId/bookmark` | Bookmark or unbookmark a post | Yes |

### Vibe Circles (`/api/circles`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/circles` | List all circles with category filter & search | Optional |
| `GET` | `/api/circles/my/joined`| Get circles joined by current user | Yes |
| `GET` | `/api/circles/:slug` | Get circle details and membership status | Optional |
| `POST` | `/api/circles` | Create new topic circle | Yes |
| `POST` | `/api/circles/:id/join` | Join circle and increment member count | Yes |
| `POST` | `/api/circles/:id/leave`| Leave circle and decrement member count | Yes |

### Daily Spark (`/api/challenges`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/challenges/today` | Fetch active creative challenge for today | Optional |
| `GET` | `/api/challenges/:id/submissions` | Fetch community post submissions for challenge | No |

### Bookmarks & Notifications
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/bookmarks` | Private saved posts for authenticated user | Yes |
| `GET` | `/api/notifications` | Fetch user notifications | Yes |
| `GET` | `/api/notifications/unread-count` | Count unread notifications | Yes |
| `PUT` | `/api/notifications/:id/read` | Mark notification (or all) as read | Yes |

---

## ⚡ Real-Time Socket.IO Events

Authenticated users join their personal room `user:<userId>`.

| Event Name | Direction | Payload |
|---|---|---|
| `notification:new` | Server -> Client | Real-time notification object (comment, reaction) |
| `post:new` | Server -> Client | Newly published community post |
| `post:deleted` | Server -> Client | `{ postId }` to remove post from live feeds |
| `post:reaction` | Server -> Client | `{ postId, reactionCounts, userId, type }` |
| `post:comment` | Server -> Client | `{ postId, comment, commentsCount }` |

---

## 🛡️ License

MIT © 2026 VibeWall Contributors.
