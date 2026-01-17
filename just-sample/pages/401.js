import { useState } from 'react'
import Head from 'next/head'
import Footer from '../components/Footer'

export default function PasswordProtected() {
  const [password, setPassword] = useState('')
  const [showError, setShowError] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setShowError(false)

    // Simulate password checking - replace with actual logic
    setTimeout(() => {
      if (password === 'correct-password') {
        // Redirect to protected content or handle success
        console.log('Password correct')
      } else {
        setShowError(true)
      }
      setIsLoading(false)
    }, 1000)
  }

  return (
    <>
      <Head>
        <title>Protected page</title>
        <meta content="Protected page" property="og:title"/>
        <meta content="Protected page" property="twitter:title"/>
        <meta content="width=device-width, initial-scale=1" name="viewport"/>
        <link href="https://cdn.prod.website-files.com/68a06250db2face4039500cc/css/opixo.webflow.shared.269830e95.css" rel="stylesheet" type="text/css"/>
        <link href="https://fonts.googleapis.com" rel="preconnect"/>
        <link href="https://fonts.gstatic.com" rel="preconnect" crossOrigin="anonymous"/>
        <link href="https://cdn.prod.website-files.com/68a06250db2face4039500cc/68b576a462172f27e0264706_32.png" rel="shortcut icon" type="image/x-icon"/>
        <link href="https://cdn.prod.website-files.com/68a06250db2face4039500cc/68b576a587e457b5e3256985_256.png" rel="apple-touch-icon"/>
      </Head>

      <div className="page-wrapper">
        {/* Navigation */}
        <div data-animation="default" data-collapse="medium" data-duration="400" data-easing="ease" data-easing2="ease" role="banner" className="navbar w-nav">
          <div className="nav-container">
            <a href="/" className="nav-logo-wrapper w-nav-brand">
              <img src="https://cdn.prod.website-files.com/68a06250db2face4039500cc/68a43f33c7f3bc90883aa5b8_NAv%20Logo.svg" loading="lazy" alt="Nav Logo " className="nav-logo"/>
            </a>
            <nav role="navigation" className="nav-menu w-nav-menu">
              <a href="/" className="nav-link w-nav-link">Home</a>
              <a href="/about" className="nav-link w-nav-link">About</a>
              <a href="/contact" className="nav-link w-nav-link">Feature</a>
              <a href="#" className="nav-link w-nav-link">Blog</a>
              <div className="nav-button-wrapper hide-desktop">
                <a href="#" className="button w-inline-block">
                  <div className="button-text">
                    Try For Free
                  </div>
                </a>
              </div>
            </nav>
            <div className="menu-button w-nav-button">
              <div className="menu-line"></div>
              <div className="menu-line"></div>
              <div className="menu-line"></div>
            </div>
            <div className="nav-button-wrapper hide-tablet">
              <a href="#" className="button w-inline-block">
                <div className="button-text">
                  Try For Free
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Password Protection Form */}
        <div className="utility-page-wrapper">
          <div style={{opacity: 1}} className="utility-page-content w-password-page w-form">
            <form onSubmit={handleSubmit} className="utility-page-form w-password-page">
              <img src="https://cdn.prod.website-files.com/68a06250db2face4039500cc/68a1ddcffe204e69d6731900_Pass%20Icon.svg" loading="lazy" alt="" className="password-image"/>
              <h2 className="heading-style-h2">Password Protected</h2>
              <label htmlFor="pass" className="field-label w-password-page">Password</label>
              <div className="password-input-field">
                <input 
                  className="password-input w-password-page w-input" 
                  autoFocus={true} 
                  maxLength="256" 
                  name="pass" 
                  placeholder="Enter your password" 
                  type="password" 
                  id="pass"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <input 
                  type="submit" 
                  className="button is-secondary is-normal w-password-page w-button" 
                  value={isLoading ? "Please wait..." : "Submit"}
                  disabled={isLoading}
                />
              </div>
              {showError && (
                <div className="w-password-page w-form-fail" style={{display: 'block'}}>
                  <div>
                    Incorrect password. Please try again.
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Footer */}
        <Footer />
      </div>

      {/* Scripts */}
      <script 
        dangerouslySetInnerHTML={{
          __html: `
            !function(o,c){
              var n=c.documentElement,t=" w-mod-";
              n.className+=t+"js",
              ("ontouchstart"in o||o.DocumentTouch&&c instanceof DocumentTouch)&&(n.className+=t+"touch")
            }(window,document);
          `
        }}
      />
    </>
  )
}