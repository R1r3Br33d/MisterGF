# Krypton Production Configuration

## Domain Setup

1. **DNS Records**
```
A Record:       krypton.com  -> YOUR_SERVER_IP
A Record:       www.krypton.com -> YOUR_SERVER_IP
MX Record:      [for email if needed]
```

## SSL Certificates

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Generate certificate
sudo certbot certonly --standalone -d krypton.com -d www.krypton.com

# Certificates location:
# /etc/letsencrypt/live/krypton.com/

# Copy to app directory
sudo cp /etc/letsencrypt/live/krypton.com/fullchain.pem /opt/krypton/ssl/cert.pem
sudo cp /etc/letsencrypt/live/krypton.com/privkey.pem /opt/krypton/ssl/key.pem

# Auto-renewal
sudo systemctl enable certbot.timer
```

## Environment Variables

```bash
# Copy and edit
cp .env.example .env

# Required for production:
export NODE_ENV=production
export JWT_SECRET=your-very-long-random-secret-key-here
export DB_PASSWORD=very-strong-database-password
export REDIS_PASSWORD=very-strong-redis-password
export API_URL=https://krypton.com
export FRONTEND_URL=https://krypton.com
```

## Database Backup

```bash
# Create backup directory
mkdir -p /opt/krypton/backups

# Daily automated backup
crontab -e

# Add:
0 2 * * * /opt/krypton/scripts/backup-db.sh
```

## Monitoring

```bash
# View logs
docker-compose -f docker-compose.prod.yml logs -f app

# Check services
docker-compose -f docker-compose.prod.yml ps

# Service health
curl -s https://krypton.com/health | jq
```

## Performance Tuning

### PostgreSQL
- Max connections: 200
- Shared buffers: 256MB
- Work memory: 64MB
- Effective cache size: 1GB

### Redis
- Max memory: 2GB
- Eviction policy: allkeys-lru

### Nginx
- Worker connections: 1024
- Keepalive timeout: 65s
- Gzip enabled

## Security Checklist

- [ ] SSL certificates installed
- [ ] Environment variables set
- [ ] Database passwords strong
- [ ] Redis password configured
- [ ] Firewall configured
- [ ] SSH keys only (no password login)
- [ ] Rate limiting enabled
- [ ] DDoS protection (Cloudflare)
- [ ] Backups automated
- [ ] Monitoring active

## Scaling (When Ready)

### Load Balancing
```
Users -> Cloudflare -> Load Balancer -> Multiple App Instances
                    -> PostgreSQL (replicated)
                    -> Redis Cluster
```

### Database
- Read replicas for scaling
- Primary-replica setup
- Connection pooling (PgBouncer)

### Caching
- Redis Cluster
- Multi-node setup
- Automatic failover

## Support & Escalation

- **Issues**: GitHub Issues
- **Security**: security@krypton.com
- **Community**: community@krypton.com
- **Emergencies**: 24/7 on-call team
