import Head from 'next/head'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Navbar from '../components/Navbar'
import { addEvaluation } from '../lib/firebase'
import Footer from '../components/Footer'

export default function Evaluation() {
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [cityDetails, setCityDetails] = useState('')
  const [mediaPreview, setMediaPreview] = useState('')
  const [docPreview, setDocPreview] = useState('')
  const [evaluationProperties, setEvaluationProperties] = useState([])
  const [formData, setFormData] = useState({
    fullName: '',
    cnic: '',
    contact: '',
    email: '',
    address: '',
    city: '',
    propertyType: '',
    propertyAddress: '',
    plotNumber: '',
    areaSize: '',
    areaUnit: 'marla',
    areaMeasurement: 'sq_feet',
    floors: '',
    propertyValue: '',
    propertyImage: [], // Changed to array
    documents: [] // Changed to array
  })

  useEffect(() => {
    setIsClient(true)
    loadEvaluationProperties()
    
    // Listen for evaluation approvals from admin
    const handleEvaluationUpdate = () => {
      loadEvaluationProperties()
    }
    
    window.addEventListener('evaluationApproved', handleEvaluationUpdate)
    window.addEventListener('evaluationPropertiesUpdated', handleEvaluationUpdate)
    
    // Load fonts
    if (typeof window !== 'undefined' && window.WebFont) {
      window.WebFont.load({
        google: { families: ["Manrope:300,regular,500,600,700,800"] }
      })
    }
    
    return () => {
      window.removeEventListener('evaluationApproved', handleEvaluationUpdate)
      window.removeEventListener('evaluationPropertiesUpdated', handleEvaluationUpdate)
    }

    // Simplified Webflow initialization without problematic form handling
    const initWebflow = () => {
      if (typeof window !== 'undefined') {
        // Basic touch detection
        const n = document.documentElement
        const t = " w-mod-"
        n.className += t + "js"
        if ("ontouchstart" in window || (window.DocumentTouch && document instanceof window.DocumentTouch)) {
          n.className += t + "touch"
        }
      }
    }

    // Animation for all sections
    const animateElements = () => {
      setTimeout(() => {
        // Hero text animations
        const elem1 = document.querySelector('[data-w-id="897e0d76-61e5-b965-3a39-4318573c87a3"]')
        const elem2 = document.querySelector('[data-w-id="da6635e5-12e7-8031-f31f-6da38a056af8"]')
        
        if (elem1) {
          elem1.style.opacity = '1'
          elem1.style.transform = 'translate3d(0, 0, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)'
          elem1.style.transition = 'all 0.8s ease'
        }
        
        if (elem2) {
          setTimeout(() => {
            elem2.style.opacity = '1'
            elem2.style.transform = 'translate3d(0, 0, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)'
            elem2.style.transition = 'all 0.8s ease'
          }, 300)
        }
      }, 500)

      // Process section is now using static transforms from original HTML
      // No need for scroll animations since we have the exact layout
    }

    initWebflow()
    animateElements()
  }, [])

  // Load evaluation properties from localStorage
  const loadEvaluationProperties = () => {
    try {
      const storedProperties = JSON.parse(localStorage.getItem('evaluationProperties') || '[]')
      setEvaluationProperties(storedProperties)
    } catch (error) {
      console.error('Error loading evaluation properties:', error)
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  };

  // Handle area unit changes
  const handleAreaUnitChange = (e) => {
    setFormData(prev => ({
      ...prev,
      areaUnit: e.target.value
    }))
  };

  // Handle measurement unit changes
  const handleMeasurementChange = (e) => {
    setFormData(prev => ({
      ...prev,
      areaMeasurement: e.target.value
    }))
  };

  // Handle form submission
  const handleFormSubmit = async (e) => {
    e.preventDefault();

    try {
      const propertyId = `eval_${Date.now()}`;
      let resolvedImage = mediaPreview;

      if (resolvedImage) {
        const match = resolvedImage.match(/src="([^"]+)"/);
        if (match && match[1]) {
          const src = match[1];
          resolvedImage = src.startsWith('data:') && src.length > 1500
            ? 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop'
            : src;
        } else {
          resolvedImage = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop';
        }
      } else {
        resolvedImage = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop';
      }

      // Handle multiple media files
      const mediaFiles = Array.isArray(formData.propertyImage) ? formData.propertyImage : [];
      const documentFiles = Array.isArray(formData.documents) ? formData.documents : [];

      const newProperty = {
        id: propertyId,
        ...formData,
        // Format the area size with selected units
        areaSize: `${formData.areaSize} ${formData.areaUnit} (${formData.areaMeasurement})`,
        submittedAt: new Date().toISOString(),
        status: 'pending', // Changed from 'Under Evaluation' to 'pending' for consistency
        evaluationValue: 'Pending',
        image: resolvedImage,
        source: 'evaluation',
        // Store file information
        mediaFiles: mediaFiles.map(file => ({
          name: file.name,
          type: file.type,
          size: file.size
        })),
        documentFiles: documentFiles.map(file => ({
          name: file.name,
          type: file.type,
          size: file.size
        }))
      };

      let savedToFirestore = false;

      try {
        const evaluationData = {
          propertyAddress: newProperty.propertyAddress,
          propertyType: newProperty.propertyType,
          // Store area information separately for better data structure
          areaSize: newProperty.areaSize,
          areaValue: formData.areaSize,
          areaUnit: formData.areaUnit,
          areaMeasurement: formData.areaMeasurement,
          propertyValue: newProperty.propertyValue,
          propertyId,
          fullName: newProperty.fullName,
          cnic: newProperty.cnic,
          contact: newProperty.contact,
          email: newProperty.email,
          city: newProperty.city,
          image: newProperty.image,
          status: 'pending', // Ensure status is 'pending' for admin review
          submittedAt: new Date().toISOString(),
          // Store file information
          mediaFiles: newProperty.mediaFiles,
          documentFiles: newProperty.documentFiles
        };

        const result = await addEvaluation(evaluationData);

        if (result.success) {
          console.log('Evaluation saved to Firestore successfully:', result.id);

          const existingProperties = JSON.parse(localStorage.getItem('evaluationProperties') || '[]');
          const updatedProperties = [newProperty, ...existingProperties];
          localStorage.setItem('evaluationProperties', JSON.stringify(updatedProperties));
          try {
            window.dispatchEvent(new StorageEvent('storage', { key: 'evaluationProperties' }));
          } catch (err) {
            window.dispatchEvent(new Event('evaluationPropertiesUpdated'));
          }
          setEvaluationProperties(updatedProperties);
          savedToFirestore = true;
        } else {
          throw new Error(result.error || 'Failed to save to Firestore');
        }
      } catch (firestoreError) {
        console.error('Error saving evaluation to Firestore, using localStorage fallback:', firestoreError);
      }

      if (!savedToFirestore) {
        const existingProperties = JSON.parse(localStorage.getItem('evaluationProperties') || '[]');
        const updatedProperties = [newProperty, ...existingProperties];
        localStorage.setItem('evaluationProperties', JSON.stringify(updatedProperties));
        try {
          window.dispatchEvent(new StorageEvent('storage', { key: 'evaluationProperties' }));
        } catch (err) {
          window.dispatchEvent(new Event('evaluationPropertiesUpdated'));
        }
        setEvaluationProperties(updatedProperties);
      }

      setFormData({
        fullName: '',
        cnic: '',
        contact: '',
        email: '',
        address: '',
        city: '',
        propertyType: '',
        propertyAddress: '',
        plotNumber: '',
        areaSize: '',
        areaUnit: 'marla',
        areaMeasurement: 'sq_feet',
        floors: '',
        propertyValue: '',
        propertyImage: [], // Reset to empty array
        documents: [] // Reset to empty array
      });
      setMediaPreview('');
      setDocPreview('');
      setShowForm(false);

      // Show success message and inform user about admin review process
      alert('Property submitted for evaluation successfully! Our admin team will review your submission and you will receive an email notification once the evaluation is complete. You can check the status of your submission in the evaluation details page.');
    } catch (error) {
      console.error('Error saving property:', error);
      alert('Error submitting property. Please try again.');
    }
  };

  const handleRegisterClick = () => {
    setShowForm(true);
  };

  const handleBackClick = () => {
    setShowForm(false);
  };

  const handleCityChange = (e) => {
    const city = e.target.value;
    if (city) {
      setCityDetails(`You selected ${city}. Please provide more details if necessary.`);
    } else {
      setCityDetails('');
    }
  };

  // Handle media file changes (allowing multiple files)
  const handleMediaChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setFormData(prev => ({
        ...prev,
        propertyImage: [...prev.propertyImage, ...files]
      }));
    }
  };

  // Handle document file changes (allowing multiple files)
  const handleDocChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setFormData(prev => ({
        ...prev,
        documents: [...prev.documents, ...files]
      }));
    }
  };

  // Remove a specific media file
  const removeMediaFile = (index) => {
    setFormData(prev => {
      const newMedia = [...prev.propertyImage];
      newMedia.splice(index, 1);
      return {
        ...prev,
        propertyImage: newMedia
      };
    });
  };

  // Remove a specific document file
  const removeDocumentFile = (index) => {
    setFormData(prev => {
      const newDocs = [...prev.documents];
      newDocs.splice(index, 1);
      return {
        ...prev,
        documents: newDocs
      };
    });
  };

  if (!isClient) {
    return null;
  }

  return (
    <>
      <Head>

        <title>Evaluation - REMMIC</title>
        <meta content="Evaluation - REMMIC" property="og:title" />
        <meta content="Evaluation - REMMIC" property="twitter:title" />
        <meta content="width=device-width, initial-scale=1" name="viewport" />
        <meta content="REMMIC" name="generator" />
        <link href="/logoremmic.png" rel="shortcut icon" type="image/x-icon" />
        <link href="/logoremmic.png" rel="apple-touch-icon" />
      </Head>

      <div className="page-wrapper">
        <Navbar />

        <main className="main-wrapper">
          <header className="section-header">
            <div className="padding-global">
              <div className="container-large">
                <div data-w-id="62fd2ec4-ce38-d610-173d-d37fd6c18d3e" className="header-component">
                  <div className="header-top-content-wrap">
                    <div className="header-top-card">
                      <h1
                        data-w-id="897e0d76-61e5-b965-3a39-4318573c87a3"
                        className="heading-style-h1"
                        style={{
                          WebkitTransform: 'translate3d(0px, 0px, 0px) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)',
                          MozTransform: 'translate3d(0px, 0px, 0px) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)',
                          msTransform: 'translate3d(0px, 0px, 0px) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)',
                          transform: 'translate3d(0px, 0px, 0px) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)',
                          opacity: 1,
                          transition: '0.8s'
                        }}
                      >
                        Power Up Your
                      </h1>
                    </div>
                    <div className="header-top-card second">
                      <div className="header-top-card-content">
                        <h1
                          data-w-id="da6635e5-12e7-8031-f31f-6da38a056af8"
                          className="heading-style-h1 text-color-brand"
                          style={{
                            opacity: 1,
                            WebkitTransform: 'translate3d(0px, 0px, 0px) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)',
                            MozTransform: 'translate3d(0px, 0px, 0px) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)',
                            msTransform: 'translate3d(0px, 0px, 0px) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)',
                            transform: 'translate3d(0px, 0px, 0px) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)',
                            transition: '0.8s'
                          }}
                        >
                          Property Management
                        </h1>
                      </div>
                      <div
                        data-w-id="header-button-wrapper"
                        className="header-button-wrapper"
                        style={{
                          opacity: 1,
                          WebkitTransform: 'translate3d(0px, 0px, 0px) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)',
                          MozTransform: 'translate3d(0px, 0px, 0px) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)',
                          msTransform: 'translate3d(0px, 0px, 0px) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)',
                          transform: 'translate3d(0px, 0px, 0px) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)',
                          transition: '0.8s'
                        }}
                      >
                        <a href="/contact" className="button is-secondary w-inline-block">
                          <div className="button-text">Get Started</div>
                        </a>
                      </div>
                    </div>
                  </div>

                  <section data-w-id="3616b13b-cf18-9839-3e56-d339fa6c63fd" className="section-process">
                    <div className="page-lode">
                      <div className="process-component">
                        <div className="process-top-content">
                          <div className="process-head-line">
                            <div>Process</div>
                          </div>
                          <h2 className="heading-style-h2">Effortlessly Manage Smarter in Just 3 Steps</h2>
                        </div>
                        <div className="process-bottom-content">
                          <div className="process-card-list-wrapper">
                            <div className="process-card-wrapper fast">
                              <div className="process-line-wrapper">
                                <div className="process-number first" style={{willChange: 'background', backgroundColor: 'rgb(8, 8, 8)'}}>
                                  <h6 data-w-id="ad81eb1f-e905-668e-f2e8-fd336f52b855" className="heading-style-h6" style={{color: 'rgb(255, 255, 255)'}}>01</h6>
                                </div>
                                <div className="process-line">
                                  <div data-w-id="4c5562e1-8782-df07-921c-19c518f2e8de" className="process-hover-line" style={{willChange: 'width, height', height: '400px'}}></div>
                                </div>
                              </div>
                              <div id="w-node-a7c0caf3-34e8-c2db-29d9-af706a3fa852-039500ab" className="process-card first" style={{willChange: 'transform, opacity', transform: 'translate3d(250px, 0px, 0px) scale3d(1, 1, 1) rotateX(0deg) rotateY(0deg) rotateZ(0deg) skew(0deg, 0deg)', transformStyle: 'preserve-3d', opacity: 1}}>
                                <img src="https://cdn.prod.website-files.com/68a06250db2face4039500cc/68a7035906e4b0e24ea61b56_Process%20Image%201.png"
                                  loading="lazy" 
                                  sizes="(max-width: 535px) 100vw, 535px"
                                  srcSet="https://cdn.prod.website-files.com/68a06250db2face4039500cc/68a7035906e4b0e24ea61b56_Process%20Image%201-p-500.png 500w, https://cdn.prod.website-files.com/68a06250db2face4039500cc/68a7035906e4b0e24ea61b56_Process%20Image%201.png 535w"
                                  alt="" className="process-card-image" />
                                <div className="process-card-content">
                                  <h6 className="heading-style-h6">Add Your Properties</h6>
                                  <div className="text-size-regular">Easily upload property listings, photos, and key details in just minutes—no technical skills needed.</div>
                                </div>
                              </div>
                            </div>
                            <div id="w-node-d9d084c9-b42a-7895-03fb-e8397585a944-039500ab" className="process-card-wrapper">
                              <div className="process-card second" style={{willChange: 'transform, opacity', transform: 'translate3d(-221px, 0px, 0px) scale3d(1, 1, 1) rotateX(0deg) rotateY(0deg) rotateZ(0deg) skew(0deg, 0deg)', transformStyle: 'preserve-3d', opacity: 1}}>
                                <img src="https://cdn.prod.website-files.com/68a06250db2face4039500cc/68a7035963f22775eca2d85a_Process%20Image%202.png"
                                  loading="lazy" 
                                  sizes="(max-width: 535px) 100vw, 535px"
                                  srcSet="https://cdn.prod.website-files.com/68a06250db2face4039500cc/68a7035963f22775eca2d85a_Process%20Image%202-p-500.png 500w, https://cdn.prod.website-files.com/68a06250db2face4039500cc/68a7035963f22775eca2d85a_Process%20Image%202.png 535w"
                                  alt="" className="process-card-image" />
                                <div className="process-card-content">
                                  <h6 className="heading-style-h6">Invite Tenants</h6>
                                  <div className="text-size-regular">Easily upload property listings, photos, and key details in just minutes—no technical skills needed.</div>
                                </div>
                              </div>
                              <div className="process-line-wrapper">
                                <div className="process-number second" style={{willChange: 'background', backgroundColor: 'rgb(38, 38, 38)'}}>
                                  <h6 data-w-id="5eb120f0-efaa-46ad-0feb-57dfdfbeecaf" className="heading-style-h6" style={{color: 'rgb(255, 255, 255)'}}>02</h6>
                                </div>
                                <div className="process-line">
                                  <div data-w-id="de6dbf9d-e5da-69a1-d249-8afdd7a5ef19" className="process-second-hover-line" style={{willChange: 'width, height', height: '400px'}}></div>
                                </div>
                              </div>
                            </div>
                            <div className="process-card-wrapper">
                              <div className="process-line-wrapper">
                                <div className="process-number third" style={{willChange: 'background', backgroundColor: 'rgb(8, 8, 8)'}}>
                                  <h6 data-w-id="2720b254-e069-03e4-1e51-b5d0af0ac48b" className="heading-style-h6" style={{color: 'rgb(255, 255, 255)'}}>03</h6>
                                </div>
                                <div className="process-line">
                                  <div className="process-third-hover-line" style={{willChange: 'width, height', height: '400px'}}></div>
                                </div>
                              </div>
                              <div id="w-node-fefd2574-931d-8619-5c53-556169d80ae5-039500ab" className="process-card third" style={{willChange: 'transform, opacity', transform: 'translate3d(250px, 0px, 0px) scale3d(1, 1, 1) rotateX(0deg) rotateY(0deg) rotateZ(0deg) skew(0deg, 0deg)', transformStyle: 'preserve-3d', opacity: 1}}>
                                <img src="https://cdn.prod.website-files.com/68a06250db2face4039500cc/68a70359241ac8d4e4389c30_Process%20Image%203.png"
                                  loading="lazy" 
                                  sizes="(max-width: 535px) 100vw, 535px"
                                  srcSet="https://cdn.prod.website-files.com/68a06250db2face4039500cc/68a70359241ac8d4e4389c30_Process%20Image%203-p-500.png 500w, https://cdn.prod.website-files.com/68a06250db2face4039500cc/68a70359241ac8d4e4389c30_Process%20Image%203.png 535w"
                                  alt="" className="process-card-image" />
                                <div className="process-card-content">
                                  <h6 className="heading-style-h6">Automate Everything</h6>
                                  <div className="text-size-regular">Easily upload property listings, photos, and key details in just minutes—no technical skills needed.</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Why Choose Us Section */}
                  <section className="section-why-choose-us" style={{padding: '80px 0', textAlign: 'center', background: '#f5f5f5', borderBottom: '3px solid #e0e0e0'}}>
                    <div className="container-large" style={{maxWidth: '1200px', margin: 'auto'}} id="why-choose-us-content">
                      <h2 style={{marginBottom: '20px', fontSize: '36px', fontWeight: 'bold', color: '#080808'}}>
                        Why Choose Us
                      </h2>
                      <p style={{marginBottom: '40px', fontSize: '18px', color: '#444444'}}>Experience the VIP property management solution with ease and full control.</p>
                      <div className="nav-button-wrapper" style={{ justifyContent: 'center' }}>
                        <a href="/signup" className="button w-inline-block register-now-cta">
                          <div className="button-text">Register Now</div>
                        </a>
                      </div>
                      <style jsx>{`
                        .register-now-cta {
                          min-width: 140px;
                          padding: 8px 18px;
                        }
                        .register-now-cta .button-text {
                          font-size: 14px;
                        }
                      `}</style>
                    </div>
                  </section>

                  {/* Fullscreen Form Overlay */}
                  {showForm && (
                    <div style={{
                      display: 'block', 
                      position: 'fixed', 
                      top: 0, 
                      left: 0, 
                      width: '100%', 
                      height: '100%',
                      background: 'rgba(255,255,255,0.95)', 
                      zIndex: 9999, 
                      overflowY: 'auto', 
                      padding: '50px 20px'
                    }}>
                      <div className="container-large" style={{maxWidth: '900px', margin: 'auto', background: '#fff', borderRadius: '20px', boxShadow: '0 0 25px rgba(0,0,0,0.15)', padding: '30px'}}>
                        <button onClick={handleBackClick} style={{backgroundColor: 'rgba(255, 165, 0, 0.952)', color: 'white', border: 'none', padding: '12px 30px', fontSize: '16px', cursor: 'pointer', borderRadius: '50px', marginBottom: '20px'}}>⬅ Back</button>
                        
                        <h2 style={{textAlign: 'center', marginBottom: '30px', fontSize: '28px', fontWeight: 'bold', color: 'orange'}}>Property Registration Form</h2>

                        <form onSubmit={handleFormSubmit} style={{display: 'flex', flexDirection: 'column', gap: '25px'}}>
                          <h3 style={{fontWeight: 'bold', fontSize: '22px', textDecoration: 'underline', color: '#333'}}>Personal Details</h3>
                          <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="Full Name" required style={{padding: '15px', border: '1px solid #ccc', borderRadius: '50px'}} />
                          <input type="text" name="cnic" value={formData.cnic} onChange={handleInputChange} placeholder="CNIC / National ID Number" required style={{padding: '15px', border: '1px solid #ccc', borderRadius: '50px'}} />
                          <input type="tel" name="contact" value={formData.contact} onChange={handleInputChange} placeholder="Contact Number" required style={{padding: '15px', border: '1px solid #ccc', borderRadius: '50px'}} />
                          <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Email Address" required style={{padding: '15px', border: '1px solid #ccc', borderRadius: '50px'}} />
                          <input type="text" name="address" value={formData.address} onChange={handleInputChange} placeholder="Address" required style={{padding: '15px', border: '1px solid #ccc', borderRadius: '50px'}} />

                          <select name="city" value={formData.city} onChange={(e) => {
                            handleInputChange(e)
                            handleCityChange(e)
                          }} required style={{padding: '15px', border: '1px solid #ccc', borderRadius: '50px'}}>
                            <option value="">Select City</option>
                            <option value="Islamabad">Islamabad</option>
                            <option value="Karachi">Karachi</option>
                            <option value="Lahore">Lahore</option>
                            <option value="Other">Other</option>
                          </select>
                          {cityDetails && (
                            <div style={{padding: '12px', border: '1px solid #ccc', borderRadius: '12px', background: '#fafafa'}}>
                              {cityDetails}
                            </div>
                          )}

                          <h3 style={{fontWeight: 'bold', fontSize: '22px', textDecoration: 'underline', color: '#333'}}>Property Details</h3>
                          <select name="propertyType" value={formData.propertyType} onChange={handleInputChange} required style={{padding: '15px', border: '1px solid #ccc', borderRadius: '50px'}}>
                            <option value="">Property Type</option>
                            <option value="residential_plot">Residential Plot</option>
                            <option value="commercial_plot">Commercial Plot</option>
                            <option value="building">Building</option>
                            <option value="agriculture_land">Agriculture Land</option>
                            <option value="apartments">Apartments</option>
                          </select>
                          <input type="text" name="propertyAddress" value={formData.propertyAddress} onChange={handleInputChange} placeholder="Property Address" required style={{padding: '15px', border: '1px solid #ccc', borderRadius: '50px'}} />
                          <input type="text" name="plotNumber" value={formData.plotNumber} onChange={handleInputChange} placeholder="Plot / Building Number" required style={{padding: '15px', border: '1px solid #ccc', borderRadius: '50px'}} />
                          
                          {/* Updated Area/Size field with dropdowns */}
                          <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
                            <input 
                              type="number" 
                              name="areaSize" 
                              value={formData.areaSize} 
                              onChange={handleInputChange} 
                              placeholder="Area / Size" 
                              required 
                              style={{flex: 1, padding: '15px', border: '1px solid #ccc', borderRadius: '50px'}} 
                              min="0"
                              step="0.01"
                            />
                            <select 
                              name="areaUnit" 
                              value={formData.areaUnit} 
                              onChange={handleAreaUnitChange} 
                              required 
                              style={{padding: '15px', border: '1px solid #ccc', borderRadius: '50px', minWidth: '120px'}}
                            >
                              <option value="marla">Marla</option>
                              <option value="kanal">Kanal</option>
                            </select>
                            <select 
                              name="areaMeasurement" 
                              value={formData.areaMeasurement} 
                              onChange={handleMeasurementChange} 
                              required 
                              style={{padding: '15px', border: '1px solid #ccc', borderRadius: '50px', minWidth: '120px'}}
                            >
                              <option value="sq_feet">Sq. Feet</option>
                              <option value="sq_meters">Sq. Meters</option>
                            </select>
                          </div>

                          <input 
                            type="number" 
                            name="floors" 
                            value={formData.floors} 
                            onChange={handleInputChange} 
                            placeholder="Number of Floors" 
                            required 
                            style={{padding: '15px', border: '1px solid #ccc', borderRadius: '50px'}} 
                            min="0"
                          />

                          <input type="text" name="propertyValue" value={formData.propertyValue} onChange={handleInputChange} placeholder="Property Value" required style={{padding: '15px', border: '1px solid #ccc', borderRadius: '50px'}} />

                          <label style={{fontWeight: 'bold', color: '#333'}}>Upload Property Images</label>
                          <div style={{display: 'flex', flexWrap: 'wrap', gap: '15px', marginBottom: '15px'}}>
                            {formData.propertyImage.map((file, index) => (
                              <div key={index} style={{position: 'relative', width: '150px'}}>
                                {file.type.startsWith('image/') ? (
                                  <img 
                                    src={URL.createObjectURL(file)} 
                                    alt={`Property ${index + 1}`} 
                                    style={{
                                      width: '100%',
                                      height: '100px',
                                      objectFit: 'cover',
                                      borderRadius: '8px'
                                    }}
                                  />
                                ) : (
                                  <div style={{
                                    width: '100%',
                                    height: '100px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: '#f1f5f9',
                                    borderRadius: '8px',
                                    fontSize: '12px'
                                  }}>
                                    {file.name.split('.').pop().toUpperCase()} File
                                  </div>
                                )}
                                <button 
                                  type="button" 
                                  onClick={() => removeMediaFile(index)}
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
                                  {file.name}
                                </div>
                              </div>
                            ))}
                          </div>
                          <input 
                            type="file" 
                            onChange={handleMediaChange} 
                            accept="image/*,video/*" 
                            style={{padding: '12px', border: '1px solid #ccc', borderRadius: '50px', marginBottom: '10px'}} 
                            multiple
                          />
                          <div style={{fontSize: '14px', color: '#6b7280'}}>
                            {formData.propertyImage.length > 0 
                              ? `${formData.propertyImage.length} file(s) selected` 
                              : 'No files selected'}
                          </div>

                          <label style={{fontWeight: 'bold', color: '#333'}}>Upload Documents</label>
                          <div style={{display: 'flex', flexWrap: 'wrap', gap: '15px', marginBottom: '15px'}}>
                            {formData.documents.map((file, index) => (
                              <div key={index} style={{position: 'relative', width: '150px'}}>
                                <div style={{
                                  width: '100%',
                                  height: '100px',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  background: '#f1f5f9',
                                  borderRadius: '8px',
                                  fontSize: '12px',
                                  padding: '10px',
                                  textAlign: 'center'
                                }}>
                                  <div style={{fontSize: '24px', marginBottom: '5px'}}>
                                    {getFileIcon(file.name)}
                                  </div>
                                  <div style={{
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    width: '100%'
                                  }}>
                                    {file.name}
                                  </div>
                                </div>
                                <button 
                                  type="button" 
                                  onClick={() => removeDocumentFile(index)}
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
                              </div>
                            ))}
                          </div>
                          <input 
                            type="file" 
                            onChange={handleDocChange} 
                            accept=".pdf,.doc,.docx,.jpg,.png" 
                            style={{padding: '12px', border: '1px solid #ccc', borderRadius: '50px', marginBottom: '10px'}} 
                            multiple
                          />
                          <div style={{fontSize: '14px', color: '#6b7280'}}>
                            {formData.documents.length > 0 
                              ? `${formData.documents.length} document(s) selected` 
                              : 'No documents selected'}
                          </div>

                          <button type="submit" style={{backgroundColor: 'orange', color: 'white', border: 'none', padding: '18px 50px', fontSize: '18px', cursor: 'pointer', borderRadius: '50px', marginTop: '20px'}}>Submit</button>
                        </form>
                      </div>
                    </div>
                  )}



                </div>
              </div>
            </div>
          </header>

          {/* Footer */}
          <Footer />
        </main>
      </div>

    </>
  )
}

const getFileIcon = (filename) => {
  const ext = filename.split('.').pop().toLowerCase();
  switch (ext) {
    case 'pdf': return '📄';
    case 'doc': case 'docx': return '📝';
    case 'jpg': case 'jpeg': case 'png': case 'gif': return '🖼️';
    default: return '📁';
  }
};



