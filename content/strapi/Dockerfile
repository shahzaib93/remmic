# Strapi CMS Dockerfile
FROM node:18-alpine

# Install system dependencies
RUN apk add --no-cache \
    build-base \
    gcc \
    autoconf \
    automake \
    zlib-dev \
    libpng-dev \
    nasm \
    bash \
    vips-dev \
    git

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY . .

# Build Strapi
RUN npm run build

# Create non-root user
RUN addgroup -g 1001 -S strapi && \
    adduser -S strapi -u 1001

# Change ownership
RUN chown -R strapi:strapi /app
USER strapi

# Expose port
EXPOSE 1337

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:1337/admin || exit 1

# Start Strapi
CMD ["npm", "start"]