# Assets Management Container
FROM nginx:alpine

# Install additional tools for image processing
RUN apk add --no-cache \
    curl \
    imagemagick \
    optipng \
    jpegoptim \
    webp-tools

# Create directories
RUN mkdir -p /var/www/assets/{logos,images,media,optimized}

# Copy assets
COPY logos/ /var/www/assets/logos/
COPY images/ /var/www/assets/images/
COPY media/ /var/www/assets/media/

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf
COPY default.conf /etc/nginx/conf.d/default.conf

# Create optimization script
COPY optimize-assets.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/optimize-assets.sh

# Create non-root user
RUN addgroup -g 1001 -S assets && \
    adduser -S assets -u 1001 -G assets

# Set ownership
RUN chown -R assets:assets /var/www/assets

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost/health || exit 1

# Expose port
EXPOSE 80

# Start nginx
CMD ["/usr/local/bin/optimize-assets.sh"]