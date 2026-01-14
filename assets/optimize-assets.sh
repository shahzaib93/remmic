#!/bin/sh

# Asset Optimization Script for REMMIC
set -e

echo "Starting asset optimization..."

# Create optimized directory structure
mkdir -p /var/www/assets/optimized/logos
mkdir -p /var/www/assets/optimized/images
mkdir -p /var/www/assets/optimized/media

# Function to optimize SVG
optimize_svg() {
    local input="$1"
    local output="$2"
    
    # Create a minified version of SVG
    sed 's/<!--.*-->//g; s/[[:space:]]\+/ /g; s/> </></g' "$input" > "$output"
    echo "Optimized SVG: $output"
}

# Function to create PNG from SVG
svg_to_png() {
    local input="$1"
    local output="$2"
    local size="$3"
    
    # Convert SVG to PNG using ImageMagick
    magick -background transparent -size "${size}x${size}" "$input" "$output"
    
    # Optimize PNG
    optipng -quiet "$output" 2>/dev/null || true
    echo "Created PNG: $output (${size}x${size})"
}

# Function to create WebP from PNG
png_to_webp() {
    local input="$1"
    local output="$2"
    
    # Convert PNG to WebP
    cwebp -q 90 -alpha_q 90 "$input" -o "$output" >/dev/null 2>&1
    echo "Created WebP: $output"
}

# Function to create favicon
create_favicon() {
    local svg_input="$1"
    local ico_output="$2"
    
    # Create multiple sizes for favicon
    local temp_dir="/tmp/favicon_temp"
    mkdir -p "$temp_dir"
    
    # Generate different sizes
    for size in 16 32 48 64 128 256; do
        magick -background transparent -size "${size}x${size}" "$svg_input" "${temp_dir}/favicon-${size}.png"
    done
    
    # Combine into ICO file
    magick "${temp_dir}/favicon-16.png" "${temp_dir}/favicon-32.png" "${temp_dir}/favicon-48.png" "${temp_dir}/favicon-64.png" "$ico_output"
    
    # Cleanup
    rm -rf "$temp_dir"
    echo "Created favicon: $ico_output"
}

# Process REMMIC logo
LOGO_SVG="/var/www/assets/logos/remmic-logo.svg"
LOGO_SVG_ORIGINAL="/var/www/assets/logos/REMMIC LOGO SVG.svg"

# Use the copy without spaces, or fallback to original
if [ -f "$LOGO_SVG" ]; then
    echo "Using logo file: $LOGO_SVG"
elif [ -f "$LOGO_SVG_ORIGINAL" ]; then
    cp "$LOGO_SVG_ORIGINAL" "$LOGO_SVG"
    echo "Copied original logo to: $LOGO_SVG"
fi

if [ -f "$LOGO_SVG" ]; then
    echo "Processing REMMIC logo..."
    
    # Create optimized SVG
    optimize_svg "$LOGO_SVG" "/var/www/assets/optimized/logos/remmic-logo.svg"
    
    # Create small optimized version
    sed 's/viewBox="[^"]*"/viewBox="0 0 200 64"/g; s/width="[^"]*"/width="200"/g; s/height="[^"]*"/height="64"/g' "$LOGO_SVG" > "/var/www/assets/optimized/logos/remmic-logo-small.svg"
    echo "Created small logo variant"
    
    # Create PNG versions
    svg_to_png "$LOGO_SVG" "/var/www/assets/optimized/logos/remmic-logo-large.png" "800"
    svg_to_png "$LOGO_SVG" "/var/www/assets/optimized/logos/remmic-logo.png" "400"
    svg_to_png "$LOGO_SVG" "/var/www/assets/optimized/logos/remmic-logo-small.png" "200"
    svg_to_png "$LOGO_SVG" "/var/www/assets/optimized/logos/remmic-logo-thumb.png" "100"
    
    # Create WebP versions
    png_to_webp "/var/www/assets/optimized/logos/remmic-logo.png" "/var/www/assets/optimized/logos/remmic-logo.webp"
    png_to_webp "/var/www/assets/optimized/logos/remmic-logo-small.png" "/var/www/assets/optimized/logos/remmic-logo-small.webp"
    
    # Create favicon
    create_favicon "$LOGO_SVG" "/var/www/assets/optimized/logos/favicon.ico"
    
    # Create Apple touch icon
    svg_to_png "$LOGO_SVG" "/var/www/assets/optimized/logos/apple-touch-icon.png" "180"
    
    echo "REMMIC logo processing completed"
else
    echo "Warning: REMMIC logo SVG not found at $LOGO_SVG"
fi

# Process other images in images directory
if [ -d "/var/www/assets/images" ]; then
    echo "Processing additional images..."
    
    for img in /var/www/assets/images/*.{jpg,jpeg,png,gif}; do
        [ -f "$img" ] || continue
        
        filename=$(basename "$img")
        extension="${filename##*.}"
        name="${filename%.*}"
        
        case "$extension" in
            jpg|jpeg)
                # Optimize JPEG
                jpegoptim --max=85 --strip-all --preserve --dest="/var/www/assets/optimized/images" "$img" >/dev/null 2>&1 || cp "$img" "/var/www/assets/optimized/images/"
                
                # Create WebP
                cwebp -q 85 "$img" -o "/var/www/assets/optimized/images/${name}.webp" >/dev/null 2>&1
                echo "Optimized: $filename"
                ;;
            png)
                # Optimize PNG
                cp "$img" "/var/www/assets/optimized/images/"
                optipng -quiet "/var/www/assets/optimized/images/$filename" 2>/dev/null || true
                
                # Create WebP
                cwebp -q 90 -alpha_q 90 "$img" -o "/var/www/assets/optimized/images/${name}.webp" >/dev/null 2>&1
                echo "Optimized: $filename"
                ;;
            gif)
                # Copy GIF as-is (could be animated)
                cp "$img" "/var/www/assets/optimized/images/"
                echo "Copied: $filename"
                ;;
        esac
    done
fi

# Set proper permissions
chown -R assets:assets /var/www/assets/optimized
chmod -R 755 /var/www/assets/optimized

# Create asset manifest
cat > /var/www/assets/manifest.json << EOF
{
  "version": "1.0.0",
  "generated": "$(date -Iseconds)",
  "assets": {
    "logos": {
      "main": {
        "svg": "/logo.svg",
        "png": {
          "large": "/optimized/logos/remmic-logo-large.png",
          "medium": "/optimized/logos/remmic-logo.png", 
          "small": "/optimized/logos/remmic-logo-small.png",
          "thumb": "/optimized/logos/remmic-logo-thumb.png"
        },
        "webp": {
          "medium": "/optimized/logos/remmic-logo.webp",
          "small": "/optimized/logos/remmic-logo-small.webp"
        },
        "ico": "/optimized/logos/favicon.ico",
        "apple_touch_icon": "/optimized/logos/apple-touch-icon.png"
      }
    },
    "endpoints": {
      "logo": "/logo",
      "logo_svg": "/logo.svg",
      "logo_png": "/logo.png", 
      "logo_webp": "/logo.webp",
      "logo_small": "/logo-small.svg",
      "favicon": "/logo-favicon.ico"
    }
  }
}
EOF

echo "Asset manifest created"
echo "Asset optimization completed successfully!"

# Start nginx
echo "Starting nginx asset server..."
exec nginx -g 'daemon off;'