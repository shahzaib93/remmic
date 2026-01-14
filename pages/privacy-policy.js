import Head from 'next/head'
import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function PrivacyPolicy() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <>
      <Head>
        <title>Privacy Policy - REMMIC</title>
        <meta content="Privacy Policy - REMMIC" property="og:title"/>
        <meta content="Privacy Policy - REMMIC" property="twitter:title"/>
        <meta content="width=device-width, initial-scale=1" name="viewport"/>
      </Head>
      <div className="page-wrapper">
        <Navbar />
        <main className="main-wrapper">
          <div className="section-privacy-policy">
            <div className="padding-global">
              <div className="container-large">
                <div className="privacy-policy-component" style={{
                  opacity: isVisible ? 1 : 0,
                  transition: 'opacity 0.8s ease'
                }}>
                  <div className="privacy-policy-top-content">
                    <div className="privacy-policy-left-content">
                      <h3 className="heading-style-h3">Privacy policy</h3>
                      <div className="text-size-regular">
                        Last updated: 10/08/2025
                      </div>
                    </div>
                    <a href="#" className="button is-secondary w-inline-block">
                      <div className="button-text">
                        Download PDF
                      </div>
                    </a>
                  </div>
                  <div className="privacy-policy-details w-richtext">
                    <h5 className="heading-style-h5 is-terms-and-conditions">Introduction</h5>
                    <p className="text-size-regular is-terms">d dictum rutrum eget nulla tristique id viverra. Donec massa ut morbi enim. Fermentum nunc ultricies ornare lacus ipsum aliquam ultrices. Morbi non orci lacus malesuada interdum quisque ornare eros. Aliquam senectus ullamcorper fringilla tincidunt sed eget imperdiet. Ornare blandit lacus risus in magnis elementum elementum et. Est cras id quis quis vitae enim. Aliquam cursus faucibus vestibulum erat nulla. Auctor montes duis nisl vel.</p>
                    <ol role="list" className="privacy-policy-list">
                      <li>
                        Aliquam senectus ullamcorper fringilla tincidunt
                      </li>
                      <li>
                        Puam senectus ullamcorper fringilla tincidunt
                      </li>
                      <li>
                        Benectus ullamcorper fringilla tincidunt
                      </li>
                    </ol>
                    <p>d dictum rutrum eget nulla tristique id viverra. Donec massa ut morbi enim. Fermentum nunc ultricies ornare lacus ipsum aliquam ultrices. Morbi non orci lacus malesuada interdum quisque ornare eros. Aliquam senectus ullamcorper fringilla tincidunt sed eget imperdiet. Ornare blandit lacus risus in magnis elementum elementum et. Est cras id quis quis vitae enim. Aliquam cursus faucibus vestibulum erat nulla. Auctor montes duis nisl vel.</p>
                    <h5 className="heading-style-h5 is-terms-and-conditions">Definitions</h5>
                    <p>Lorem ipsum dolor sit amet consectetur. Id dictum rutrum eget nulla tristique id viverra. Donec massa ut morbi enim. Fermentum nunc ultricies ornare lacus ipsum aliquam ultrices. Morbi non orci lacus malesuada interdum quisque ornare eros. Aliquam senectus ullamcorper fringilla tincidunt sed eget imperdiet. Ornare blandit lacus risus in magnis elementum elementum et. Est cras id quis quis vitae enim. Aliquam cursus faucibus vestibulum erat nulla. Auctor montes duis nisl vel.</p>
                    <h5 className="heading-style-h5 is-terms-and-conditions">Information Collection and Use</h5>
                    <p className="text-size-regular is-terms">Lorem ipsum dolor sit amet consectetur. Id dictum rutrum eget nulla tristique id viverra. Donec massa ut morbi enim. Fermentum nunc ultricies ornare lacus ipsum aliquam ultrices. Morbi non orci lacus malesuada interdum quisque ornare eros. Aliquam senectus ullamcorper fringilla tincidunt sed eget imperdiet. Ornare blandit lacus risus in magnis elementum elementum et. Est cras id quis quis vitae enim. Aliquam cursus faucibus vestibulum erat nulla. Auctor montes duis nisl vel.</p>
                    <h5 className="heading-style-h5 is-terms-and-conditions">Types of Data Collected</h5>
                    <p>Lorem ipsum dolor sit amet consectetur. Id dictum rutrum eget nulla tristique id viverra. Donec massa ut morbi enim. Fermentum nunc ultricies ornare lacus ipsum aliquam ultrices. Morbi non orci lacus malesuada interdum quisque ornare eros. Aliquam senectus ullamcorper fringilla tincidunt sed eget imperdiet. Ornare blandit lacus risus in magnis elementum elementum et. Est cras id quis quis vitae enim. Aliquam cursus faucibus vestibulum erat nulla. Auctor montes duis nisl vel.</p>
                    <h5 className="heading-style-h5 is-terms-and-conditions">Use of Data</h5>
                    <p>Lorem ipsum dolor sit amet consectetur. Id dictum rutrum eget nulla tristique id viverra. Donec massa ut morbi enim. Fermentum nunc ultricies ornare lacus ipsum aliquam ultrices. Morbi non orci lacus malesuada interdum quisque ornare eros. Aliquam senectus ullamcorper fringilla tincidunt sed eget imperdiet. Ornare blandit lacus risus in magnis elementum elementum et. Est cras id quis quis vitae enim. Aliquam cursus faucibus vestibulum erat nulla. Auctor montes duis nisl vel.</p>
                    <h5 className="heading-style-h5 is-terms-and-conditions">Retention of Data</h5>
                    <p className="text-size-regular is-terms">Lorem ipsum dolor sit amet consectetur. Id dictum rutrum eget nulla tristique id viverra. Donec massa ut morbi enim. Fermentum nunc ultricies ornare lacus ipsum aliquam ultrices. Morbi non orci lacus malesuada interdum quisque ornare eros. Aliquam senectus ullamcorper fringilla tincidunt sed eget imperdiet. Ornare blandit lacus risus in magnis elementum elementum et. Est cras id quis quis vitae enim. Aliquam cursus faucibus vestibulum erat nulla. Auctor montes duis nisl vel.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  )
}