# videTube

A complete, production-ready backend for a YouTube-like video hosting platform, built with **Node.js**, **Express**, and **MongoDB**. This project implements all the core features of a video-sharing website: user authentication (JWT access & refresh tokens), video uploads (via Cloudinary), likes, comments, replies, subscriptions, playlists, tweets, watch history, and a channel dashboard.

## 📺 Features

- **Authentication** — Register, login, logout, access/refresh token rotation, password change, secure httpOnly cookies
- **Users** — Update account details, avatar & cover image uploads, channel profile, watch history
- **Videos** — Publish, list (paginated + search + sort), get by ID, update, delete, toggle publish status
- **Tweets** — Create, list user tweets, update, delete
- **Subscriptions** — Subscribe/unsubscribe to channels, list subscribers & subscribed channels
- **Comments** — Add, get video comments, update, delete
- **Likes** — Toggle like on videos, comments, and tweets; list liked videos
- **Playlists** — Create, get, update, delete playlists; add/remove videos
- **Dashboard** — Channel stats and channel videos
- **Healthcheck** — Server health endpoint

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Runtime | Node.js |
| Framework | Express.js |
| Database | MongoDB + Mongoose |
| Auth | JSON Web Tokens (access + refresh), bcrypt |
| File uploads | Multer + Cloudinary |
| Cookies | cookie-parser |
| CORS | cors |
| Env config | dotenv |
| Pagination | mongoose-aggregate-paginate-v2 |

## 📁 Project Structure

```
videTube/
├── src/
│   ├── app.js              # Express app setup & middlewares
│   ├── index.js            # Entry point (DB connection + server listen)
│   ├── constants.js        # App constants (DB_NAME)
│   ├── controllers/        # Route controllers (request handlers)
│   ├── db/                 # MongoDB connection
│   ├── middlewares/        # auth (verifyJWT), multer (file upload)
│   ├── models/             # Mongoose schemas (User, Video, Tweet, ...)
│   ├── routes/             # Express route definitions
│   └── utils/              # asyncHandler, ApiError, ApiResponse, cloudinary
├── public/                 # Static / temp uploads
├── .env                    # Environment variables (local, gitignored)
├── .env.example            # Example environment variables
├── .gitignore
├── .prettierignore
├── .prettierrc
├── package.json
├── package-lock.json
└── Readme.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- MongoDB (Atlas cluster or local instance)
- Cloudinary account (for image/video storage)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/<your-username>/videTube.git
   cd videTube
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Copy the example file and fill in your values:
   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your actual credentials:

   ```env
   PORT=8000
   MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/
   CORS_ORIGIN=*

   ACCESS_TOKEN_SECRET=your_access_token_secret
   ACCESS_TOKEN_EXPIRY=1d

   REFRESH_TOKEN_SECRET=your_refresh_token_secret
   REFRESH_TOKEN_EXPIRY=10d

   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

   The server starts on `http://localhost:8000` (or your `PORT`).

## 📡 API Endpoints

Base path: `/api/v1`

### Healthcheck
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/healthcheck` | Server health check |

### Users
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/users/register` | Register user (avatar + coverImage) | No |
| POST | `/users/login` | Login & set auth cookies | No |
| POST | `/users/logout` | Logout & clear cookies | Yes |
| POST | `/users/refresh-token` | Refresh access token | No |
| POST | `/users/change-password` | Change password | Yes |
| GET | `/users/current-user` | Get logged-in user | Yes |
| PATCH | `/users/update-account` | Update fullName/email | Yes |
| PATCH | `/users/avatar` | Update avatar image | Yes |
| PATCH | `/users/cover-image` | Update cover image | Yes |
| GET | `/users/c/:username` | Get channel profile by username | Yes |
| GET | `/users/history` | Get watch history | Yes |

### Videos
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/videos` | List videos (paginated, search, sort) | Yes |
| POST | `/videos` | Publish a video (videoFile + thumbnail) | Yes |
| GET | `/videos/:videoId` | Get video by ID | Yes |
| DELETE | `/videos/:videoId` | Delete a video | Yes |
| PATCH | `/videos/:videoId` | Update video (title/description/thumbnail) | Yes |
| PATCH | `/videos/toggle/publish/:videoId` | Toggle publish status | Yes |

### Tweets
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/tweets` | Create a tweet | Yes |
| GET | `/tweets/user/:userId` | Get tweets by user | Yes |
| PATCH | `/tweets/:tweetId` | Update a tweet | Yes |
| DELETE | `/tweets/:tweetId` | Delete a tweet | Yes |

### Subscriptions
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/subscriptions/c/:channelId` | Subscribe/unsubscribe to channel | Yes |
| GET | `/subscriptions/c/:channelId` | Get subscribed channels | Yes |
| GET | `/subscriptions/u/:subscriberId` | Get user's channel subscribers | Yes |

### Comments
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/comments/:videoId` | Get comments for a video | Yes |
| POST | `/comments/:videoId` | Add a comment to a video | Yes |
| DELETE | `/comments/c/:commentId` | Delete a comment | Yes |
| PATCH | `/comments/c/:commentId` | Update a comment | Yes |

### Likes
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/likes/toggle/v/:videoId` | Toggle like on a video | Yes |
| POST | `/likes/toggle/c/:commentId` | Toggle like on a comment | Yes |
| POST | `/likes/toggle/t/:tweetId` | Toggle like on a tweet | Yes |
| GET | `/likes/videos` | Get liked videos | Yes |

### Playlists
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/playlist` | Create a playlist | Yes |
| GET | `/playlist/:playlistId` | Get playlist by ID | Yes |
| PATCH | `/playlist/:playlistId` | Update a playlist | Yes |
| DELETE | `/playlist/:playlistId` | Delete a playlist | Yes |
| PATCH | `/playlist/add/:videoId/:playlistId` | Add video to playlist | Yes |
| PATCH | `/playlist/remove/:videoId/:playlistId` | Remove video from playlist | Yes |
| GET | `/playlist/user/:userId` | Get playlists by user | Yes |

### Dashboard
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/dashboard/stats` | Get channel stats | Yes |
| GET | `/dashboard/videos` | Get channel videos | Yes |

## 🔐 Authentication

This API uses **JWT access and refresh tokens** stored in **httpOnly cookies**:
- `accessToken` — short-lived (default 1 day), used to authorize requests
- `refreshToken` — long-lived (default 10 days), used to obtain a new access token

Protected routes require the `verifyJWT` middleware, which validates the access token from cookies or the `Authorization: Bearer <token>` header.

## 🧱 Key Models

- **User** — username, email, fullName, avatar, coverImage, watchHistory, password, refreshToken
- **Video** — videoFile, thumbnail, title, description, duration, views, isPublished, owner
- **Tweet** — content, owner
- **Subscription** — channel, subscriber
- **Comment** — content, video, owner
- **Like** — video, comment, tweet, likedBy
- **Playlist** — name, description, videos, owner

## 📦 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server with nodemon |

## 🤝 Contributing

This is a learning project from the *Chai Aur Code* backend series. Contributions are welcome! Please:

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m "feat: add your feature"`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

## 📽️ Video Series

This project is part of the **Chai Aur Code** backend YouTube series:
- [Video Playlist](https://www.youtube.com/watch?v=EH3vGeqeIAo&list=PLu71SKxNbfoBGh_8p_NS-ZAh6v7HhYqHW)
- [Discord](https://hitesh.ai/discord)
- [Twitter](https://twitter.com/@hiteshdotcom)

## 📄 License

ISC License

---
Built with ❤️ using Node.js, Express, MongoDB & Cloudinary.