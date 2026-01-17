export default function Footer() {
  return (
    <footer className="section-footer">
      <div className="padding-global">
        <div className="container-large">
          <div className="footer-component">
            <div className="footer-top-content">
              <div className="footer-form-block w-form">
                <form id="email-form" name="email-form" method="get" className="footer-form">
                  <input
                    className="footer-input w-input"
                    maxLength="256"
                    name="email"
                    placeholder="Enter your email"
                    type="email"
                    id="email"
                    required
                  />
                  <div className="footer-submit-button">
                    <button type="submit" className="button w-inline-block" style={{ cursor: 'pointer' }}>
                      <div className="button-text">Submit</div>
                    </button>
                  </div>
                </form>
                <div className="w-form-done">
                  <div>Thank you! Your submission has been received!</div>
                </div>
                <div className="w-form-fail">
                  <div>Oops! Something went wrong while submitting the form.</div>
                </div>
              </div>
              <div className="footer-social-link-wrapper">
                <a href="https://www.instagram.com/" target="_blank" className="footer-social-link-circle w-inline-block">
                  <img src="https://cdn.prod.website-files.com/68a06250db2face4039500cc/68ac246154f611ea1420a7c4_instagram.svg" loading="lazy" alt="instagram" className="social-link" />
                  <img src="https://cdn.prod.website-files.com/68a06250db2face4039500cc/68ac2461db48f9856f9b7dc5_instagram%2002.svg" loading="lazy" alt="instagram" className="hover-social-link" />
                </a>
                <a href="https://x.com/" target="_blank" className="footer-social-link-circle w-inline-block">
                  <img src="https://cdn.prod.website-files.com/68a06250db2face4039500cc/68ac2462f03cccc6637bd306_twitter.svg" loading="lazy" alt="X" className="social-link" />
                  <img src="https://cdn.prod.website-files.com/68a06250db2face4039500cc/68ac24611de591518864682a_twitter%2002.svg" loading="lazy" alt="X" className="hover-social-link" />
                </a>
                <a href="https://linkedin.com/" target="_blank" className="footer-social-link-circle w-inline-block">
                  <img src="https://cdn.prod.website-files.com/68a06250db2face4039500cc/68ac2461ba0482ed367c032e_linkedin.svg" loading="lazy" alt="linkdin" className="social-link" />
                  <img src="https://cdn.prod.website-files.com/68a06250db2face4039500cc/68ac2461471a6191f7cb01da_linkedin%2002.svg" loading="lazy" alt="Linkdine" className="hover-social-link" />
                </a>
                <a href="https://www.facebook.com/" target="_blank" className="footer-social-link-circle w-inline-block">
                  <img src="https://cdn.prod.website-files.com/68a06250db2face4039500cc/68ac24610096cecff568c101_facebook.svg" loading="lazy" alt="facebook" className="social-link" />
                  <img src="https://cdn.prod.website-files.com/68a06250db2face4039500cc/68ac24615c48e8d43a920438_facebook%2002.svg" loading="lazy" alt="Facebook" className="hover-social-link" />
                </a>
              </div>
            </div>
            <div className="footer-card">
              <div className="text-size-regular">Company</div>
              <div className="footer-link-list">
                <a href="/" className="text-size-regular">Home</a>
                <a href="/about" className="text-size-regular">About</a>
                <a href="/contact" className="text-size-regular">Contact</a>
                <a href="/blog" className="text-size-regular">Blog</a>
              </div>
            </div>
            <div className="footer-card-list">
              <div className="footer-card">
                <div className="text-size-regular">Inner page</div>
                <div className="footer-bottom-link-list">
                  <a href="/feature" className="footer-text">Feature</a>
                  <a href="/team" className="footer-text">Team</a>
                  <a href="/pricing" className="footer-text">Price</a>
                  <a href="/privacy-policy" className="footer-text">Privacy Policy</a>
                  <a href="/terms-and-conditions" className="footer-text">Terms & Conditions</a>
                </div>
              </div>
              <div className="footer-card second">
                <div className="text-size-regular">Authentication</div>
                <div className="footer-bottom-link-list">
                  <a href="#" className="footer-text">Login</a>
                  <a href="#" className="footer-text">Sign up</a>
                  <a href="#" className="footer-text">Forgot</a>
                  <a href="#" className="footer-text">Confirm email</a>
                </div>
              </div>
              <div className="footer-card">
                <div className="text-size-regular">Utility pages</div>
                <div className="footer-bottom-link-list">
                  <a href="/style-guide" className="footer-text">Style Guide</a>
                  <a href="/change-log" className="footer-text">Change log</a>
                  <a href="/licenses" className="footer-text">Licenses</a>
                  <a href="/protected" className="footer-text">Protected</a>
                </div>
              </div>
            </div>
            <div className="footer-botom-content">
              <div className="text-size-small tex-color-black-700">© 2024 REMMIC. All rights reserved.</div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
