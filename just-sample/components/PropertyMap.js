import { useEffect, useState, useRef } from 'react'
import { buildOpenStreetMapEmbed } from '../utils/geocode'

export default function PropertyMap({ 
  coordinates, 
  address, 
  height = 320, 
  borderRadius = 16, 
  showLink = true, 
  showAllProperties = false 
}) {
  const [embedConfig, setEmbedConfig] = useState(null)
  const [allProperties, setAllProperties] = useState([])
  const mapRef = useRef(null)
  const resolvedHeight = typeof height === 'number' ? `${height}px` : height
  const resolvedRadius = typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius

  useEffect(() => {
    if (showAllProperties) {
      // Load all properties from localStorage
      try {
        const userProperties = JSON.parse(localStorage.getItem('userProperties') || '[]')
        const propertiesWithCoordinates = userProperties.filter(prop => 
          prop.coordinates && 
          prop.coordinates.lat && 
          prop.coordinates.lng
        )
        setAllProperties(propertiesWithCoordinates)
      } catch (error) {
        console.error('Error loading properties for map:', error)
      }
    }
  }, [showAllProperties])

  useEffect(() => {
    setEmbedConfig(buildOpenStreetMapEmbed({ coordinates, address }))
  }, [coordinates, address])

  useEffect(() => {
    if (showAllProperties && allProperties.length > 0 && typeof window !== 'undefined' && window.L) {
      // Initialize Leaflet map if showing all properties
      const mapElement = mapRef.current
      if (mapElement) {
        // Clear existing map
        mapElement.innerHTML = ''
        
        // Create map
        const map = window.L.map(mapElement).setView([31.5204, 74.3587], 10) // Default to Lahore
        
        // Add OpenStreetMap tiles
        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(map)

        // Create marker cluster group
        const markers = window.L.markerClusterGroup ? window.L.markerClusterGroup() : window.L.layerGroup()

        // Add markers for all properties
        allProperties.forEach(property => {
          const lat = parseFloat(property.coordinates.lat)
          const lng = parseFloat(property.coordinates.lng)
          
          if (!isNaN(lat) && !isNaN(lng)) {
            const marker = window.L.marker([lat, lng])
            
            // Create popup content
            const popupContent = `
              <div style="max-width: 250px;">
                <h4 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600;">${property.title || 'Property'}</h4>
                ${property.image ? `<img src="${property.image}" alt="${property.title}" style="width: 100%; height: 120px; object-fit: cover; border-radius: 4px; margin-bottom: 8px;">` : ''}
                <p style="margin: 0 0 4px 0; font-size: 12px; color: #666;">📍 ${property.location || 'Location not specified'}</p>
                <p style="margin: 0 0 4px 0; font-size: 12px; color: #666;">📐 ${property.area || 'Area not specified'}</p>
                <p style="margin: 0 0 8px 0; font-size: 12px; color: #666;">Type: ${property.type || 'Property'}</p>
                <a href="/property/${property.id}" style="display: inline-block; padding: 4px 8px; background: #2563eb; color: white; text-decoration: none; border-radius: 4px; font-size: 11px;">View Details</a>
              </div>
            `
            
            marker.bindPopup(popupContent)
            markers.addLayer(marker)
          }
        })

        // Add markers to map
        map.addLayer(markers)

        // Fit map to show all markers
        if (allProperties.length > 0) {
          const group = new window.L.featureGroup(Object.values(markers._layers || {}))
          if (group.getBounds && group.getBounds().isValid()) {
            map.fitBounds(group.getBounds().pad(0.1))
          }
        }
      }
    }
  }, [allProperties, showAllProperties])

  if (showAllProperties) {
    return (
      <div style={{ position: 'relative' }}>
        <div
          ref={mapRef}
          id="property-map"
          style={{
            height: resolvedHeight,
            borderRadius: resolvedRadius,
            border: '1px solid #e2e8f0',
            position: 'relative',
            zIndex: 1
          }}
        />
        {allProperties.length === 0 && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#f8fafc',
              borderRadius: resolvedRadius,
              color: '#64748b',
              textAlign: 'center',
              padding: '24px',
              zIndex: 2
            }}
          >
            <div>
              <strong>No properties with locations found</strong>
              <div style={{ fontSize: '14px', marginTop: '6px' }}>
                Upload properties with valid addresses to see them on the map.
              </div>
            </div>
          </div>
        )}
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      </div>
    )
  }

  if (!embedConfig) {
    return (
      <div
        style={{
          height: resolvedHeight,
          borderRadius: resolvedRadius,
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#64748b',
          textAlign: 'center',
          padding: '24px',
        }}
      >
        <div>
          <strong>Location preview unavailable</strong>
          <div style={{ fontSize: '14px', marginTop: '6px' }}>
            We could not load a map for this property. Please confirm the address details.
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <iframe
        title="Property location"
        src={embedConfig.embedUrl}
        style={{ width: '100%', height: resolvedHeight, border: '0', borderRadius: resolvedRadius }}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
      {showLink && embedConfig.linkUrl && (
        <div style={{
          padding: '10px 4px 0',
          textAlign: 'right',
          fontSize: '14px',
        }}>
          <a
            href={embedConfig.linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 600 }}
          >
            View larger map
          </a>
        </div>
      )}
    </>
  )
}
