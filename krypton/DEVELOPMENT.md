# Krypton Development Guide

## Getting Started

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL client (`psql`)
- Git

### Local Setup

```bash
# Clone repo
git clone https://github.com/R1r3Br33d/krypton.git
cd krypton

# Install dependencies
npm install

# Start services
docker-compose up -d

# Wait for services
sleep 10

# Run migrations
npm run migrate

# Seed sample data
npm run seed

# Start dev server
npm run dev

# Visit http://localhost:3000
```

## Project Structure

```
krypton/
├── src/
│   ├── server.ts           # Express app setup
│   ├── routes/             # API endpoints
│   ├── middleware/         # Custom middleware
│   ├── utils/              # Utilities
│   └── types/              # TypeScript types
├── tests/                  # Test suite
├── scripts/
│   ├── deploy.sh          # Production deployment
│   ├── backup-db.sh       # Database backups
│   └── migrate.ts         # Database migrations
├── docker-compose.yml     # Development
├── docker-compose.prod.yml # Production
├── .env.example           # Environment template
├── package.json           # Dependencies
├── tsconfig.json          # TypeScript config
└── README.md              # Documentation
```

## Development Workflow

### Create a Feature

```bash
# Create feature branch
git checkout -b feature/amazing-feature

# Make changes
# Run tests
npm test

# Commit
git add .
git commit -m "Add amazing feature"

# Push
git push origin feature/amazing-feature

# Create PR on GitHub
```

### Testing

```bash
# Run all tests
npm test

# Run specific test
npm test -- tests/routes/blogs.test.ts

# Watch mode
npm test -- --watch

# Coverage
npm test -- --coverage
```

### Database

```bash
# Connect to database
psql postgresql://postgres:postgres@localhost:5432/krypton

# View schema
\dt

# View specific table
\d blog_posts

# Run migrations
npm run migrate

# Seed data
npm run seed
```

## API Development

### Adding a New Endpoint

1. **Create route file**: `src/routes/new-feature.ts`

```typescript
import express from 'express';
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'New feature' });
});

export default router;
```

2. **Register in server.ts**:

```typescript
import newFeatureRoutes from './routes/new-feature';
app.use('/api/new-feature', newFeatureRoutes);
```

3. **Add tests**: `tests/routes/new-feature.test.ts`

4. **Document**: Add to API section in README

## Common Commands

```bash
# Development
npm run dev              # Start dev server
npm run build           # Build for production
npm test               # Run tests
npm run lint           # Check code quality
npm run format         # Format code

# Database
npm run migrate        # Run migrations
npm run seed          # Seed sample data
npm run db:dump       # Export database
npm run db:restore    # Import database

# Docker
docker-compose up     # Start services
docker-compose down   # Stop services
docker-compose logs   # View logs

# Deployment
bash scripts/deploy.sh # Deploy to production
```

## Debugging

### Enable Debug Logs

```bash
export DEBUG=krypton:*
npm run dev
```

### Database Debugging

```bash
# Connect to running database
docker-compose exec postgres psql -U postgres -d krypton

# Enable query logging
ALTER DATABASE krypton SET log_statement = 'all';
```

### API Testing

```bash
# Using curl
curl -X GET http://localhost:3000/health

# Using Postman
# Import collection from: docs/postman-collection.json

# Using REST Client extension (VS Code)
# Create: .vscode/api.http
```

## Contributing Guidelines

1. **Code Style**
   - Use TypeScript
   - Follow ESLint config
   - 2-space indentation

2. **Commit Messages**
   - Use conventional commits
   - Format: `type(scope): description`
   - Example: `feat(blogs): add blog search`

3. **Pull Requests**
   - Descriptive title
   - Reference related issues
   - Include tests
   - Update documentation

4. **Code Review**
   - At least one approval
   - All tests passing
   - No conflicts

## Performance Tips

- Use database indexes
- Cache frequently accessed data in Redis
- Implement pagination
- Use connection pooling
- Monitor query performance

## Resources

- [Express.js Docs](https://expressjs.com/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Node.js Best Practices](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)

## Support

- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions
- **Chat**: Discord community
- **Docs**: https://krypton.com/docs
