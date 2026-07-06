# Krypton Database Initialization
# This script creates all necessary tables and indexes

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    profile_image_url TEXT,
    bio TEXT,
    custom_css TEXT,
    sectors TEXT[] DEFAULT ARRAY[]::TEXT[],
    followers_count INT DEFAULT 0,
    following_count INT DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    is_suspended BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);

-- Blog Posts Table
CREATE TABLE IF NOT EXISTS blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    sector VARCHAR(50) NOT NULL,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    views INT DEFAULT 0,
    comments_count INT DEFAULT 0,
    shares_count INT DEFAULT 0,
    mention_count INT DEFAULT 0,
    authenticity_score FLOAT DEFAULT 50,
    recommendation_score FLOAT DEFAULT 0,
    published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    published_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_blog_posts_author_id ON blog_posts(author_id);
CREATE INDEX idx_blog_posts_sector ON blog_posts(sector);
CREATE INDEX idx_blog_posts_published_at ON blog_posts(published_at DESC);
CREATE INDEX idx_blog_posts_tags ON blog_posts USING GIN(tags);

-- Comments Table
CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_comments_author_id ON comments(author_id);

-- Follows Table (Social Graph)
CREATE TABLE IF NOT EXISTS follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(follower_id, following_id)
);

CREATE INDEX idx_follows_follower_id ON follows(follower_id);
CREATE INDEX idx_follows_following_id ON follows(following_id);

-- Mentions Table
CREATE TABLE IF NOT EXISTS mentions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mentioner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mentioned_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
    context TEXT,
    authenticity_score FLOAT DEFAULT 50,
    engagement_count INT DEFAULT 0,
    reward_amount FLOAT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_mentions_mentioned_user_id ON mentions(mentioned_user_id);
CREATE INDEX idx_mentions_mentioner_id ON mentions(mentioner_id);
CREATE INDEX idx_mentions_created_at ON mentions(created_at DESC);

-- User Reputation Table
CREATE TABLE IF NOT EXISTS user_reputation (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    mentions_received INT DEFAULT 0,
    mentions_given INT DEFAULT 0,
    engagement_score FLOAT DEFAULT 0,
    trust_score FLOAT DEFAULT 50,
    earned_value FLOAT DEFAULT 0,
    referral_bonuses FLOAT DEFAULT 0,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Trending Topics Table
CREATE TABLE IF NOT EXISTS trending_topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    sector VARCHAR(50),
    mention_count INT DEFAULT 0,
    post_count INT DEFAULT 0,
    momentum FLOAT DEFAULT 0,
    popularity_score FLOAT DEFAULT 0,
    last_updated TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_trending_topics_popularity_score ON trending_topics(popularity_score DESC);

-- Community Treasury Table
CREATE TABLE IF NOT EXISTS community_treasury (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_type VARCHAR(50) NOT NULL,
    amount FLOAT NOT NULL,
    description TEXT,
    from_user_id UUID REFERENCES users(id),
    public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_community_treasury_created_at ON community_treasury(created_at DESC);

-- Patronage Subscriptions Table
CREATE TABLE IF NOT EXISTS patronage_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tier VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    renewed_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_patronage_subscriptions_user_id ON patronage_subscriptions(user_id);

-- Donations Table
CREATE TABLE IF NOT EXISTS donations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    donor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount FLOAT NOT NULL,
    message TEXT,
    public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_donations_created_at ON donations(created_at DESC);

-- Create function to update user_reputation on mention
CREATE OR REPLACE FUNCTION update_reputation_on_mention() RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'verified' THEN
        INSERT INTO user_reputation (user_id) VALUES (NEW.mentioned_user_id)
        ON CONFLICT (user_id) DO UPDATE SET
            mentions_received = user_reputation.mentions_received + 1,
            earned_value = user_reputation.earned_value + NEW.reward_amount,
            updated_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_reputation_on_mention
AFTER INSERT OR UPDATE ON mentions
FOR EACH ROW
EXECUTE FUNCTION update_reputation_on_mention();

echo "✅ Database initialized successfully"
