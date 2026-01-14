import Head from 'next/head'
import { useState } from 'react'
import { useRouter } from 'next/router'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useFirebase } from '../contexts/FirebaseContext'

export default function AddProperty() {
  const router = useRouter()
  const { user, addProperty } = useFirebase()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedImages, setSelectedImages] = useState([]) // Store array of files
  const [imagePreviews, setImagePreviews] = useState([]) // Store array of previews with file data
  const [submitMessage, setSubmitMessage] = useState('')

  const [propertyData, setPropertyData] = useState({
    type: 'residential_plot',
    title: '',
    description: '',
    location: '',
    area: '', // Keep as string to handle input properly
    areaUnit: 'marla',
    areaMeasurement: 'sq_feet',
    price: '',
    bedrooms: '',
    bathrooms: '',
    floors: '',
    features: '',
    status: 'pending', // Changed to pending - admin will approve
    contactInfo: {
      name: '',
      phone: '',
      email: ''
    }
  })

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      // Create previews for all files
      const newPreviews = [];
      const newFiles = [];
      
      files.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          newPreviews.push({ url: e.target.result, file });
          newFiles.push(file);
          
          // Update state when all previews are ready
          if (newPreviews.length === files.length) {
            setSelectedImages(prev => [...prev, ...newFiles]);
            setImagePreviews(prev => [...prev, ...newPreviews]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  // Remove a specific image
  const removeImage = (index) => {
    setSelectedImages(prev => {
      const newFiles = [...prev];
      newFiles.splice(index, 1);
      return newFiles;
    });
    
    setImagePreviews(prev => {
      const newPreviews = [...prev];
      newPreviews.splice(index, 1);
      return newPreviews;
    });
  };

  // Remove all images
  const removeAllImages = () => {
    setSelectedImages([]);
    setImagePreviews([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitMessage('')

    try {
      // Check if user is logged in
      if (!user) {
        throw new Error('Please login to add a property')
      }

      // Validate required fields
      if (!propertyData.title || !propertyData.description || !propertyData.location || !propertyData.price) {
        throw new Error('Please fill in all required fields')
      }

      // Create new property data for Firebase
      const newProperty = {
        ...propertyData,
        // Format the area size with selected units
        area: `${propertyData.area} ${propertyData.areaUnit} (${propertyData.areaMeasurement})`,
        images: imagePreviews.map((preview, index) => ({
          url: preview.url || preview,
          name: selectedImages[index] ? selectedImages[index].name : `image-${index + 1}`
        })),
        // Important fields for approval workflow
        status: 'pending', // Admin will approve
        statusCode: 'pending',
        userId: user.uid || user.id, // Link to user
        ownerName: propertyData.contactInfo.name || user.name || 'Unknown',
        ownerPhone: propertyData.contactInfo.phone || user.phone || '',
        ownerEmail: propertyData.contactInfo.email || user.email || '',
        createdAt: new Date().toISOString(),
        submittedAt: new Date().toISOString(),
      }

      // Save to Firebase using context
      const result = await addProperty(newProperty)

      if (!result.success) {
        throw new Error(result.error || 'Failed to add property')
      }

      setSubmitMessage('Property submitted successfully! Admin will review and approve it.')

      // Reset form after successful submission
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)

    } catch (error) {
      setSubmitMessage(error.message || 'Failed to add property. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Head>
        <title>Add New Property - REMMIC</title>
        <meta name="description" content="Add a new property listing to REMMIC" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="page-wrapper">
        <Navbar />
        
        <div className="main-wrapper" style={{paddingTop: '100px', minHeight: '100vh', background: '#f9fafb'}}>
          <div className="section-add-property">
            <div className="padding-global">
              <div className="container-large">
                <div style={{maxWidth: '800px', margin: '0 auto'}}>
                  <div style={{
                    background: 'white',
                    borderRadius: '16px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    padding: '40px',
                    marginBottom: '40px'
                  }}>
                    <h1 style={{
                      fontSize: '2.5rem',
                      fontWeight: '700',
                      color: '#1f2937',
                      marginBottom: '10px'
                    }}>
                      Add New Property
                    </h1>
                    <p style={{
                      fontSize: '1.1rem',
                      color: '#6b7280',
                      marginBottom: '40px'
                    }}>
                      Fill in the details below to list your property on REMMIC
                    </p>

                    <form onSubmit={handleSubmit}>
                      <div style={{marginBottom: '25px'}}>
                        <label style={{
                          display: 'block',
                          marginBottom: '8px',
                          fontSize: '1rem',
                          fontWeight: '600',
                          color: '#374151'
                        }}>
                          Property Type *
                        </label>
                        <select
                          value={propertyData.type}
                          onChange={(e) => setPropertyData({...propertyData, type: e.target.value})}
                          style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '8px',
                            border: '1px solid #d1d5db',
                            fontSize: '1rem'
                          }}
                          required
                        >
                          <option value="residential_plot">Residential Plot</option>
                          <option value="commercial_plot">Commercial Plot</option>
                          <option value="building">Building</option>
                          <option value="agriculture_land">Agriculture Land</option>
                          <option value="apartments">Apartments</option>
                        </select>
                      </div>

                      <div style={{marginBottom: '25px'}}>
                        <label style={{
                          display: 'block',
                          marginBottom: '8px',
                          fontSize: '1rem',
                          fontWeight: '600',
                          color: '#374151'
                        }}>
                          Property Title *
                        </label>
                        <input
                          type="text"
                          value={propertyData.title}
                          onChange={(e) => setPropertyData({...propertyData, title: e.target.value})}
                          placeholder="Enter property title"
                          style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '8px',
                            border: '1px solid #d1d5db',
                            fontSize: '1rem'
                          }}
                          required
                        />
                      </div>

                      <div style={{marginBottom: '25px'}}>
                        <label style={{
                          display: 'block',
                          marginBottom: '8px',
                          fontSize: '1rem',
                          fontWeight: '600',
                          color: '#374151'
                        }}>
                          Description *
                        </label>
                        <textarea
                          value={propertyData.description}
                          onChange={(e) => setPropertyData({...propertyData, description: e.target.value})}
                          placeholder="Enter detailed property description"
                          rows="4"
                          style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '8px',
                            border: '1px solid #d1d5db',
                            fontSize: '1rem',
                            resize: 'vertical'
                          }}
                          required
                        />
                      </div>

                      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '25px'}}>
                        <div>
                          <label style={{
                            display: 'block',
                            marginBottom: '8px',
                            fontSize: '1rem',
                            fontWeight: '600',
                            color: '#374151'
                          }}>
                            Location *
                          </label>
                          <input
                            type="text"
                            value={propertyData.location}
                            onChange={(e) => setPropertyData({...propertyData, location: e.target.value})}
                            placeholder="Enter location"
                            style={{
                              width: '100%',
                              padding: '12px',
                              borderRadius: '8px',
                              border: '1px solid #d1d5db',
                              fontSize: '1rem'
                            }}
                            required
                          />
                        </div>

                        <div>
                          <label style={{
                            display: 'block',
                            marginBottom: '8px',
                            fontSize: '1rem',
                            fontWeight: '600',
                            color: '#374151'
                          }}>
                            Area *
                          </label>
                          <div style={{display: 'flex', gap: '10px'}}>
                            <input
                              type="number"
                              value={propertyData.area}
                              onChange={(e) => setPropertyData({...propertyData, area: e.target.value})}
                              placeholder="Enter area"
                              style={{
                                flex: 1,
                                padding: '12px',
                                borderRadius: '8px',
                                border: '1px solid #d1d5db',
                                fontSize: '1rem'
                              }}
                              required
                              min="0"
                              step="0.01"
                            />
                            <select
                              value={propertyData.areaUnit}
                              onChange={(e) => setPropertyData({...propertyData, areaUnit: e.target.value})}
                              style={{
                                padding: '12px',
                                borderRadius: '8px',
                                border: '1px solid #d1d5db',
                                fontSize: '1rem',
                                minWidth: '100px'
                              }}
                            >
                              <option value="marla">Marla</option>
                              <option value="kanal">Kanal</option>
                            </select>
                            <select
                              value={propertyData.areaMeasurement}
                              onChange={(e) => setPropertyData({...propertyData, areaMeasurement: e.target.value})}
                              style={{
                                padding: '12px',
                                borderRadius: '8px',
                                border: '1px solid #d1d5db',
                                fontSize: '1rem',
                                minWidth: '120px'
                              }}
                            >
                              <option value="sq_feet">Sq. Feet</option>
                              <option value="sq_meters">Sq. Meters</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '25px'}}>
                        <div>
                          <label style={{
                            display: 'block',
                            marginBottom: '8px',
                            fontSize: '1rem',
                            fontWeight: '600',
                            color: '#374151'
                          }}>
                            Price * (Crores)
                          </label>
                          <input
                            type="number"
                            value={propertyData.price}
                            onChange={(e) => setPropertyData({...propertyData, price: e.target.value})}
                            placeholder="Enter price"
                            step="0.01"
                            style={{
                              width: '100%',
                              padding: '12px',
                              borderRadius: '8px',
                              border: '1px solid #d1d5db',
                              fontSize: '1rem'
                            }}
                            required
                          />
                        </div>

                        <div>
                          <label style={{
                            display: 'block',
                            marginBottom: '8px',
                            fontSize: '1rem',
                            fontWeight: '600',
                            color: '#374151'
                          }}>
                            Bedrooms
                          </label>
                          <input
                            type="number"
                            value={propertyData.bedrooms}
                            onChange={(e) => setPropertyData({...propertyData, bedrooms: e.target.value})}
                            placeholder="Number"
                            min="0"
                            style={{
                              width: '100%',
                              padding: '12px',
                              borderRadius: '8px',
                              border: '1px solid #d1d5db',
                              fontSize: '1rem'
                            }}
                          />
                        </div>

                        <div>
                          <label style={{
                            display: 'block',
                            marginBottom: '8px',
                            fontSize: '1rem',
                            fontWeight: '600',
                            color: '#374151'
                          }}>
                            Bathrooms
                          </label>
                          <input
                            type="number"
                            value={propertyData.bathrooms}
                            onChange={(e) => setPropertyData({...propertyData, bathrooms: e.target.value})}
                            placeholder="Number"
                            min="0"
                            style={{
                              width: '100%',
                              padding: '12px',
                              borderRadius: '8px',
                              border: '1px solid #d1d5db',
                              fontSize: '1rem'
                            }}
                          />
                        </div>
                      </div>

                      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '25px'}}>
                        <div>
                          <label style={{
                            display: 'block',
                            marginBottom: '8px',
                            fontSize: '1rem',
                            fontWeight: '600',
                            color: '#374151'
                          }}>
                            Number of Floors
                          </label>
                          <input
                            type="number"
                            value={propertyData.floors}
                            onChange={(e) => setPropertyData({...propertyData, floors: e.target.value})}
                            placeholder="Number of Floors"
                            min="0"
                            style={{
                              width: '100%',
                              padding: '12px',
                              borderRadius: '8px',
                              border: '1px solid #d1d5db',
                              fontSize: '1rem'
                            }}
                          />
                        </div>

                        <div>
                          <label style={{
                            display: 'block',
                            marginBottom: '8px',
                            fontSize: '1rem',
                            fontWeight: '600',
                            color: '#374151'
                          }}>
                            Features
                          </label>
                          <input
                            type="text"
                            value={propertyData.features}
                            onChange={(e) => setPropertyData({...propertyData, features: e.target.value})}
                            placeholder="Enter features separated by commas (e.g., Parking, Garden, Security)"
                            style={{
                              width: '100%',
                              padding: '12px',
                              borderRadius: '8px',
                              border: '1px solid #d1d5db',
                              fontSize: '1rem'
                            }}
                          />
                        </div>
                      </div>

                      <div style={{
                        background: '#f9fafb',
                        padding: '25px',
                        borderRadius: '12px',
                        marginBottom: '25px'
                      }}>
                        <h3 style={{
                          fontSize: '1.25rem',
                          fontWeight: '600',
                          color: '#374151',
                          marginBottom: '20px'
                        }}>
                          Contact Information
                        </h3>

                        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px'}}>
                          <div>
                            <label style={{
                              display: 'block',
                              marginBottom: '8px',
                              fontSize: '1rem',
                              fontWeight: '500',
                              color: '#374151'
                            }}>
                              Contact Name
                            </label>
                            <input
                              type="text"
                              value={propertyData.contactInfo.name}
                              onChange={(e) => setPropertyData({
                                ...propertyData,
                                contactInfo: {...propertyData.contactInfo, name: e.target.value}
                              })}
                              placeholder="Contact person name"
                              style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '8px',
                                border: '1px solid #d1d5db',
                                fontSize: '1rem',
                                background: 'white'
                              }}
                            />
                          </div>

                          <div>
                            <label style={{
                              display: 'block',
                              marginBottom: '8px',
                              fontSize: '1rem',
                              fontWeight: '500',
                              color: '#374151'
                            }}>
                              Phone Number
                            </label>
                            <input
                              type="tel"
                              value={propertyData.contactInfo.phone}
                              onChange={(e) => setPropertyData({
                                ...propertyData,
                                contactInfo: {...propertyData.contactInfo, phone: e.target.value}
                              })}
                              placeholder="Contact phone number"
                              style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '8px',
                                border: '1px solid #d1d5db',
                                fontSize: '1rem',
                                background: 'white'
                              }}
                            />
                          </div>
                        </div>

                        <div>
                          <label style={{
                            display: 'block',
                            marginBottom: '8px',
                            fontSize: '1rem',
                            fontWeight: '500',
                            color: '#374151'
                          }}>
                            Email Address
                          </label>
                          <input
                            type="email"
                            value={propertyData.contactInfo.email}
                            onChange={(e) => setPropertyData({
                              ...propertyData,
                              contactInfo: {...propertyData.contactInfo, email: e.target.value}
                            })}
                            placeholder="Contact email address"
                            style={{
                              width: '100%',
                              padding: '12px',
                              borderRadius: '8px',
                              border: '1px solid #d1d5db',
                              fontSize: '1rem',
                              background: 'white'
                            }}
                          />
                        </div>
                      </div>

                      <div style={{marginBottom: '30px'}}>
                        <label style={{
                          display: 'block',
                          marginBottom: '8px',
                          fontSize: '1rem',
                          fontWeight: '600',
                          color: '#374151'
                        }}>
                          Property Images
                        </label>
                        <div style={{
                          border: '2px dashed #d1d5db',
                          borderRadius: '12px',
                          padding: '20px',
                          backgroundColor: '#f9fafb'
                        }}>
                          {imagePreviews.length > 0 ? (
                            <div>
                              <div style={{display: 'flex', flexWrap: 'wrap', gap: '15px', marginBottom: '15px'}}>
                                {imagePreviews.map((preview, index) => (
                                  <div key={index} style={{position: 'relative', width: '150px'}}>
                                    <img 
                                      src={preview.url} 
                                      alt={`Property ${index + 1}`} 
                                      style={{
                                        width: '100%',
                                        height: '100px',
                                        objectFit: 'cover',
                                        borderRadius: '8px'
                                      }}
                                    />
                                    <button
                                      type="button"
                                      onClick={() => removeImage(index)}
                                      style={{
                                        position: 'absolute',
                                        top: '-8px',
                                        right: '-8px',
                                        background: '#ef4444',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '50%',
                                        width: '24px',
                                        height: '24px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '16px',
                                        fontWeight: 'bold'
                                      }}
                                    >
                                      ×
                                    </button>
                                    <div style={{
                                      fontSize: '10px',
                                      marginTop: '5px',
                                      textAlign: 'center',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap'
                                    }}>
                                      {preview.file.name}
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <div style={{fontSize: '14px', color: '#6b7280', marginBottom: '15px'}}>
                                {imagePreviews.length} image(s) selected
                              </div>
                              <button
                                type="button"
                                onClick={removeAllImages}
                                style={{
                                  background: '#ef4444',
                                  color: 'white',
                                  padding: '8px 16px',
                                  borderRadius: '6px',
                                  border: 'none',
                                  fontSize: '14px',
                                  fontWeight: '600',
                                  cursor: 'pointer'
                                }}
                              >
                                Remove All Images
                              </button>
                            </div>
                          ) : (
                            <div style={{textAlign: 'center', padding: '20px'}}>
                              <div style={{fontSize: '48px', marginBottom: '10px'}}>📷</div>
                              <p style={{margin: '0 0 15px 0', color: '#6b7280'}}>
                                No images uploaded yet
                              </p>
                            </div>
                          )}
                          
                          <div style={{marginTop: '20px'}}>
                            <input
                              type="file"
                              accept="image/*"
                              id="imageUpload"
                              style={{display: 'none'}}
                              onChange={handleImageUpload}
                              multiple
                            />
                            <label
                              htmlFor="imageUpload"
                              style={{
                                background: '#059669',
                                color: 'white',
                                padding: '10px 20px',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '600',
                                display: 'inline-block',
                                textAlign: 'center'
                              }}
                            >
                              + Add Images
                            </label>
                            <div style={{fontSize: '12px', color: '#6b7280', marginTop: '5px'}}>
                              You can select multiple images at once
                            </div>
                          </div>
                        </div>
                      </div>

                      {submitMessage && (
                        <div style={{
                          padding: '15px',
                          borderRadius: '8px',
                          marginBottom: '20px',
                          background: submitMessage.includes('success') ? '#dcfce7' : '#fee2e2',
                          color: submitMessage.includes('success') ? '#166534' : '#991b1b',
                          border: `1px solid ${submitMessage.includes('success') ? '#86efac' : '#fca5a5'}`,
                          textAlign: 'center',
                          fontWeight: '600'
                        }}>
                          {submitMessage}
                        </div>
                      )}

                      <div style={{
                        display: 'flex',
                        gap: '15px',
                        marginTop: '40px',
                        paddingTop: '30px',
                        borderTop: '1px solid #e5e7eb'
                      }}>
                        <button
                          type="button"
                          onClick={() => router.push('/dashboard')}
                          style={{
                            flex: 1,
                            padding: '14px 24px',
                            borderRadius: '10px',
                            border: '2px solid #059669',
                            background: 'transparent',
                            color: '#059669',
                            fontSize: '1rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                          }}
                          disabled={isSubmitting}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          style={{
                            flex: 1,
                            padding: '14px 24px',
                            borderRadius: '10px',
                            border: 'none',
                            background: '#059669',
                            color: 'white',
                            fontSize: '1rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            opacity: isSubmitting ? 0.7 : 1
                          }}
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? 'Submitting...' : 'Submit for Approval'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </>
  )
}