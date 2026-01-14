# REMMIC Docker Setup

This document provides comprehensive instructions for containerizing and deploying the REMMIC application using Docker.

## Prerequisites

- Docker (version 20.0 or higher)
- Docker Compose (version 2.0 or higher)
- Node.js 18+ (for local development)

## Quick Start

### Development Environment

1. **Build and run the development container:**
   ```bash
   npm run docker:build-dev
   npm run docker:up-dev
   ```

2. **Access the application:**
   - Application: http://localhost:3008
   - Hot reload enabled with volume mounting

### Production Environment

1. **Build and run the production container:**
   ```bash
   npm run docker:build
   npm run docker:up
   ```

2. **Access the application:**
   - Application: http://localhost:3008

## Available Docker Commands

| Command | Description |
|---------|-------------|
| `npm run docker:build` | Build production image |
| `npm run docker:build-dev` | Build development image |
| `npm run docker:run` | Run production container |
| `npm run docker:run-dev` | Run development container with volumes |
| `npm run docker:up` | Start with docker-compose (production) |
| `npm run docker:up-dev` | Start with docker-compose (development) |
| `npm run docker:down` | Stop all containers |
| `npm run docker:logs` | View container logs |
| `npm run docker:clean` | Clean up Docker system |

## Docker Configurations

### 1. Dockerfile (Production)
- Multi-stage build for optimized production image
- Uses Next.js standalone output for minimal size
- Runs as non-root user for security
- Includes health checks

### 2. Dockerfile.dev (Development)
- Single-stage build for faster development
- Includes volume mounting for hot reload
- Development dependencies included

### 3. docker-compose.yml (Local Development)
- Main application service
- Optional development service with hot reload
- Optional Nginx reverse proxy for production testing
- Health checks and restart policies

### 4. docker-compose.prod.yml (Production)
- Production-optimized configuration
- Nginx reverse proxy with SSL support
- Resource limits and health checks
- Optional Watchtower for automatic updates

## Production Deployment

### With Docker Compose (Recommended)

1. **Prepare environment:**
   ```bash
   # Copy and configure environment files
   cp .env.example .env.production
   # Edit .env.production with production values
   ```

2. **Deploy with nginx reverse proxy:**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

3. **Enable SSL (Optional):**
   ```bash
   # Place SSL certificates in ./ssl/ directory
   # Uncomment HTTPS server block in nginx/default.conf
   docker-compose -f docker-compose.prod.yml restart nginx
   ```

### Manual Docker Commands

1. **Build production image:**
   ```bash
   docker build -t remmic-app:latest .
   ```

2. **Run container:**
   ```bash
   docker run -d \
     --name remmic-app \
     -p 3008:3008 \
     -e NODE_ENV=production \
     --restart unless-stopped \
     remmic-app:latest
   ```

## Environment Variables

Create appropriate environment files for different stages:

### .env.production
```env
NODE_ENV=production
PORT=3008
HOSTNAME=0.0.0.0
NEXT_TELEMETRY_DISABLED=1

# Firebase Configuration
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_auth_domain
FIREBASE_PROJECT_ID=your_project_id
```

## Nginx Configuration

### Development
- Direct proxy to Next.js app
- No SSL required
- Basic security headers

### Production
- SSL termination
- Rate limiting for API endpoints
- Static file caching
- Security headers
- GZIP compression

## Security Considerations

1. **Container Security:**
   - Runs as non-root user
   - Minimal base image (Alpine Linux)
   - No unnecessary packages

2. **Network Security:**
   - Internal Docker network
   - Only necessary ports exposed
   - Nginx reverse proxy for additional security

3. **SSL/TLS:**
   - Place certificates in `./ssl/` directory
   - Update nginx configuration for HTTPS
   - Use Let's Encrypt for free certificates

## Monitoring and Maintenance

### Health Checks
- Application health endpoint: `/`
- Container health status: `docker ps`
- Detailed health: `docker inspect remmic-app`

### Logs
```bash
# View application logs
npm run docker:logs

# View specific service logs
docker-compose logs -f remmic-app

# View nginx logs
docker-compose logs -f nginx
```

### Updates
```bash
# Manual update
docker-compose pull
docker-compose up -d

# Automatic updates (with Watchtower)
docker-compose --profile auto-update up -d
```

## Troubleshooting

### Common Issues

1. **Port conflicts:**
   ```bash
   # Check what's using port 3008
   lsof -i :3008
   
   # Use different port
   docker run -p 3009:3008 remmic-app
   ```

2. **Build failures:**
   ```bash
   # Clean Docker cache
   npm run docker:clean
   
   # Rebuild without cache
   docker build --no-cache -t remmic-app .
   ```

3. **Permission issues:**
   ```bash
   # Fix file permissions
   sudo chown -R $USER:$USER .
   ```

### Performance Optimization

1. **Image size reduction:**
   - Uses multi-stage builds
   - Alpine Linux base image
   - Next.js standalone output
   - Excludes dev dependencies

2. **Runtime optimization:**
   - Memory limits configured
   - Health checks enabled
   - Restart policies set

## Development Workflow

### Local Development with Docker
```bash
# Start development environment
npm run docker:up-dev

# Make changes to code (auto-reload enabled)
# View logs
npm run docker:logs

# Stop when done
npm run docker:down
```

### Testing Production Build Locally
```bash
# Build and test production image locally
npm run docker:build
npm run docker:run

# Test with nginx proxy
docker-compose --profile production up -d
```

## Best Practices

1. **Use .dockerignore to exclude unnecessary files**
2. **Keep images small with multi-stage builds**
3. **Run containers as non-root users**
4. **Use health checks for reliability**
5. **Implement proper logging and monitoring**
6. **Regular security updates**
7. **Backup important data and configurations**

## Support

For issues related to Docker setup:
1. Check container logs: `npm run docker:logs`
2. Verify Docker installation: `docker --version`
3. Check available resources: `docker system df`
4. Review configuration files for syntax errors