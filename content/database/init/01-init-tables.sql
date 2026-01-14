-- REMMIC Content Database Initialization
-- This script sets up the initial database structure for content management

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- Create schemas
CREATE SCHEMA IF NOT EXISTS content;
CREATE SCHEMA IF NOT EXISTS analytics;
CREATE SCHEMA IF NOT EXISTS cache;

-- Properties table (mirrored from Strapi for direct queries)
CREATE TABLE IF NOT EXISTS properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    slug VARCHAR(255) UNIQUE NOT NULL,
    price DECIMAL(15,2) NOT NULL,
    area VARCHAR(100) NOT NULL,
    location VARCHAR(255) NOT NULL,
    property_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'available',
    featured BOOLEAN DEFAULT FALSE,
    images JSONB,
    documents JSONB,
    coordinates JSONB,
    amenities JSONB,
    share_offering JSONB,
    seo JSONB,
    view_count INTEGER DEFAULT 0,
    published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    published_at TIMESTAMP WITH TIME ZONE
);

-- Property views tracking
CREATE TABLE IF NOT EXISTS content.property_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    visitor_ip INET,
    user_agent TEXT,
    referer TEXT,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    session_id VARCHAR(255),
    country VARCHAR(100),
    city VARCHAR(100)
);

-- Content analytics
CREATE TABLE IF NOT EXISTS analytics.content_performance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_type VARCHAR(50) NOT NULL,
    content_id UUID NOT NULL,
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(15,4) NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    additional_data JSONB
);

-- Search queries tracking
CREATE TABLE IF NOT EXISTS analytics.search_queries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    query_text TEXT NOT NULL,
    results_count INTEGER,
    user_clicked BOOLEAN DEFAULT FALSE,
    clicked_property_id UUID,
    search_filters JSONB,
    searched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    visitor_ip INET,
    session_id VARCHAR(255)
);

-- Content cache metadata
CREATE TABLE IF NOT EXISTS cache.cache_metadata (
    cache_key VARCHAR(255) PRIMARY KEY,
    content_type VARCHAR(100) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE,
    size_bytes INTEGER,
    hit_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content syndication tracking
CREATE TABLE IF NOT EXISTS content.syndication_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_id UUID NOT NULL,
    content_type VARCHAR(50) NOT NULL,
    target_platform VARCHAR(100) NOT NULL,
    syndicated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(50) DEFAULT 'pending',
    response_data JSONB,
    error_message TEXT
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_type ON properties(property_type);
CREATE INDEX IF NOT EXISTS idx_properties_featured ON properties(featured);
CREATE INDEX IF NOT EXISTS idx_properties_published ON properties(published);
CREATE INDEX IF NOT EXISTS idx_properties_created_at ON properties(created_at);
CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(price);
CREATE INDEX IF NOT EXISTS idx_properties_location_gin ON properties USING GIN(to_tsvector('english', location));
CREATE INDEX IF NOT EXISTS idx_properties_title_gin ON properties USING GIN(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_properties_description_gin ON properties USING GIN(to_tsvector('english', description));

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_properties_fulltext ON properties USING GIN(
    to_tsvector('english', title || ' ' || description || ' ' || location)
);

-- Views tracking indexes
CREATE INDEX IF NOT EXISTS idx_property_views_property_id ON content.property_views(property_id);
CREATE INDEX IF NOT EXISTS idx_property_views_viewed_at ON content.property_views(viewed_at);
CREATE INDEX IF NOT EXISTS idx_property_views_ip ON content.property_views(visitor_ip);

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_content_performance_type_id ON analytics.content_performance(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_content_performance_recorded_at ON analytics.content_performance(recorded_at);
CREATE INDEX IF NOT EXISTS idx_search_queries_text_gin ON analytics.search_queries USING GIN(to_tsvector('english', query_text));
CREATE INDEX IF NOT EXISTS idx_search_queries_searched_at ON analytics.search_queries(searched_at);

-- Cache indexes
CREATE INDEX IF NOT EXISTS idx_cache_metadata_expires_at ON cache.cache_metadata(expires_at);
CREATE INDEX IF NOT EXISTS idx_cache_metadata_content_type ON cache.cache_metadata(content_type);

-- Syndication indexes
CREATE INDEX IF NOT EXISTS idx_syndication_log_content ON content.syndication_log(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_syndication_log_platform ON content.syndication_log(target_platform);
CREATE INDEX IF NOT EXISTS idx_syndication_log_status ON content.syndication_log(status);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to properties table
CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Apply updated_at trigger to cache metadata
CREATE TRIGGER update_cache_metadata_updated_at BEFORE UPDATE ON cache.cache_metadata
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create materialized view for popular properties
CREATE MATERIALIZED VIEW IF NOT EXISTS content.popular_properties AS
SELECT 
    p.*,
    COALESCE(pv.view_count_24h, 0) as views_24h,
    COALESCE(pv.view_count_7d, 0) as views_7d,
    COALESCE(pv.view_count_30d, 0) as views_30d
FROM properties p
LEFT JOIN (
    SELECT 
        property_id,
        COUNT(*) FILTER (WHERE viewed_at >= NOW() - INTERVAL '24 hours') as view_count_24h,
        COUNT(*) FILTER (WHERE viewed_at >= NOW() - INTERVAL '7 days') as view_count_7d,
        COUNT(*) FILTER (WHERE viewed_at >= NOW() - INTERVAL '30 days') as view_count_30d
    FROM content.property_views 
    GROUP BY property_id
) pv ON p.id = pv.property_id
WHERE p.published = true
ORDER BY views_7d DESC, p.created_at DESC;

-- Create index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_popular_properties_id ON content.popular_properties(id);

-- Function to refresh popular properties view
CREATE OR REPLACE FUNCTION refresh_popular_properties()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY content.popular_properties;
END;
$$ LANGUAGE plpgsql;

-- Create function to clean old analytics data
CREATE OR REPLACE FUNCTION cleanup_old_analytics()
RETURNS void AS $$
BEGIN
    -- Delete property views older than 1 year
    DELETE FROM content.property_views WHERE viewed_at < NOW() - INTERVAL '1 year';
    
    -- Delete search queries older than 6 months
    DELETE FROM analytics.search_queries WHERE searched_at < NOW() - INTERVAL '6 months';
    
    -- Delete performance metrics older than 1 year
    DELETE FROM analytics.content_performance WHERE recorded_at < NOW() - INTERVAL '1 year';
    
    -- Clean expired cache metadata
    DELETE FROM cache.cache_metadata WHERE expires_at < NOW();
    
    -- Vacuum tables
    VACUUM ANALYZE content.property_views;
    VACUUM ANALYZE analytics.search_queries;
    VACUUM ANALYZE analytics.content_performance;
    VACUUM ANALYZE cache.cache_metadata;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT USAGE ON SCHEMA content TO remmic_user;
GRANT USAGE ON SCHEMA analytics TO remmic_user;
GRANT USAGE ON SCHEMA cache TO remmic_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA content TO remmic_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA analytics TO remmic_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cache TO remmic_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO remmic_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA content TO remmic_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA analytics TO remmic_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA cache TO remmic_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO remmic_user;