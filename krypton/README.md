# Krypton - Decentralized Blog Social Network

![Krypton](https://img.shields.io/badge/Krypton-Decentralized-00FF00)
![Status](https://img.shields.io/badge/Status-Development-yellow)
![License](https://img.shields.io/badge/License-MIT-blue)

**A community-owned, ad-free social blog network combining MySpace customization with modern discovery.**

> No corporations. No ads. No tracking. Just people sharing blogs, building reputation through genuine recommendations, and earning value from their influence.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- Git

### Local Development

```bash
# Clone the repository
git clone https://github.com/R1r3Br33d/krypton.git
cd krypton

# Setup environment
cp .env.example .env

# Start services
docker-compose up -d

# Wait for services to be ready, then:
npm install
npm run migrate
npm run seed

# Start dev server
npm run dev

# Visit http://localhost:3000
```

## 📚 Features

### Individual Blog Pages
- ✅ Customizable profiles with CSS
- ✅ Blog post creation & management
- ✅ Follower system
- ✅ Comments & engagement
- ✅ Media galleries

### Central Hub
- ✅ Real-time trending topics
- ✅ Posts organized by sectors (Music, Art, Tech, etc.)
- ✅ Community spotlight
- ✅ Leaderboards

### Discovery & Archive
- ✅ Full-text search
- ✅ Filter by sector, topic, time period
- ✅ Sorting by popularity, newest, mentions
- ✅ Navigable archive

### Recommendation Economy
- ✅ Mention system
- ✅ Authenticity scoring algorithm
- ✅ Reputation tracking
- ✅ Automated reward distribution

### Community Funding
- ✅ Optional patronage tiers
- ✅ Community donation system
- ✅ Transparent treasury
- ✅ No corporate influence

## 🏗️ Architecture

### Backend
```
Node.js + Express
├── PostgreSQL (data)
├── Redis (caching & real-time)
└── JWT Authentication
```

### Frontend (Coming Soon)
```
React 18 + TailwindCSS
├── Real-time updates (WebSockets)
├── Responsive design
└── Custom CSS support
```

## 📊 Database Schema

### Core Tables
- `users` - User profiles and accounts
- `blog_posts` - Individual blog posts
- `comments` - Post comments
- `mentions` - User mentions with reputation tracking
- `user_reputation` - Reputation scores and earned value
- `trending_topics` - Real-time trending calculation
- `follows` - Social graph
- `community_treasury` - Fund tracking
- `patronage_subscriptions` - Optional subscriptions

## 🔌 API Endpoints

### Authentication
```
POST   /api/auth/register     # Create account
POST   /api/auth/login        # Login
```

### Blogs
```
GET    /api/blogs/:username           # Get user's blog
POST   /api/blogs/:userId/posts       # Create post
GET    /api/blogs/posts/:postId       # Get post
PUT    /api/blogs/posts/:postId       # Edit post
DELETE /api/blogs/posts/:postId       # Delete post
POST   /api/blogs/posts/:postId/comments  # Add comment
```

### Discovery
```
GET    /api/discover/trending    # Trending topics
GET    /api/discover/sectors     # All sectors
GET    /api/discover/sectors/:sector  # Posts in sector
GET    /api/discover/spotlight   # Community spotlight
GET    /api/discover/hub         # Complete hub dashboard
```

### Archive
```
GET    /api/archive/search       # Full-text search
GET    /api/archive/sector/:sector
GET    /api/archive/topic/:topic
```

### Mentions & Reputation
```
POST   /api/mentions            # Create mention
GET    /api/mentions/:userId    # User's mentions
GET    /api/mentions/reputation/:userId
GET    /api/mentions/leaderboard/top
```

### Patronage
```
GET    /api/patronage/options          # Available tiers
POST   /api/patronage/subscribe        # Subscribe
GET    /api/patronage/status/:userId   # Subscription status
POST   /api/patronage/donate           # Make donation
GET    /api/patronage/treasury         # Public treasury
```

## 🎯 Development Roadmap

- [x] API backend
- [x] Database schema
- [x] Authentication
- [ ] React frontend
- [ ] WebSocket real-time updates
- [ ] Mobile app
- [ ] Federation support (ActivityPub)
- [ ] Cryptocurrency integration (optional)
- [ ] Advanced moderation tools

## 🔐 Privacy & Security

- ✅ Password hashing (bcrypt)
- ✅ JWT authentication
- ✅ CORS protection
- ✅ Helmet security headers
- ✅ User data ownership
- ✅ Export/delete rights
- ✅ No third-party tracking

## 💰 Monetization Model

### No Ads
Krypton refuses all advertisement and sponsored content.

### Community Funded
1. **Optional Patronage** - Users subscribe for premium features
2. **Donations** - Support the platform voluntarily
3. **Creator Tips** - Users tip creators they love
4. **Community Treasury** - Transparent fund management

### Earning Through Recommendations
- Get mentioned → Earn reputation
- High reputation → Higher earnings
- Authenticity-based rewards
- Transparent payout system

## 🤝 Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 License

MIT - Free to use, modify, and distribute

## 📧 Contact

- **Repository**: [R1r3Br33d/krypton](https://github.com/R1r3Br33d/krypton)
- **Email**: community@krypton.social
- **Discord**: [Join Community](#)

## 🙏 Acknowledgments

Built on the principles of:
- MySpace era customization
- Reddit-style discovery
- Medium-quality content
- Tumblr community
- Decentralized architecture
- User data ownership

---

**Made with ❤️ for a web where people own the means of connection.**
