import Head from 'next/head'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function Pricing() {
  return (
    <>
      <Head>
        <title>Pricing - REMMIC</title>
      </Head>
      <div className="page-wrapper">
        <Navbar />
        <main className="main-wrapper">
          <section data-wf--section-price--variant="is-header" className="section-price">
            <div className="padding-global">
              <div className="container-large">
                <div className="padding-section-medium w-variant-b61b8629-2f15-44a6-b40f-c192534d3da8">
                  <div data-w-id="2d235745-8764-6b39-8fa6-98a491d8f2e9" className="price-component">
                    <div className="price-top-content-wrap">
                      <div className="price-highlight">
                        <div>
                          Pricing
                        </div>
                      </div>
                      <h2 className="heading-style-h2">Affordable Plans, Powerful Features</h2>
                    </div>
                    <div className="padding-bottom padding-large">
                    </div>
                    <div data-current="Tab 1" data-easing="ease" data-duration-in="300" data-duration-out="100" className="price-tabs w-tabs">
                      <div className="tabs-menu w-tab-menu">
                        <a data-w-tab="Tab 1" className="tabs-link w-inline-block w-tab-link w--current">
                          <div>
                            Starter
                          </div>
                        </a>
                        <a data-w-tab="Tab 2" className="tabs-link w-inline-block w-tab-link">
                          <div>
                            Pro
                          </div>
                        </a>
                        <a data-w-tab="Tab 3" className="tabs-link w-inline-block w-tab-link">
                          <div>
                            Enterprise
                          </div>
                        </a>
                      </div>
                      <div className="tabs-content w-tab-content">
                        <div data-w-tab="Tab 1" className="tab-pane w-tab-pane w--tab-active">
                          <div className="price-tabs-wrap">
                            <div className="price-tabs-card">
                              <div className="price-top-content">
                                <h5 className="heading-style-h5">Starter</h5>
                                <div className="text-size-regular">
                                  Perfect for landlords or small portfolios
                                </div>
                              </div>
                              <div className="price-bottom-content">
                                <div className="price-card first">
                                  <ul role="list" className="price-card-list first">
                                    <li className="price-list-item">
                                      <div className="text-size-small">
                                        Manage up to 10 units
                                      </div>
                                    </li>
                                    <li className="price-list-item">
                                      <div className="text-size-small">
                                        Built-in messaging
                                      </div>
                                    </li>
                                    <li>
                                      <div className="text-size-small">
                                        Document storage
                                      </div>
                                    </li>
                                    <li>
                                      <div className="text-size-small">
                                        Mobile access
                                      </div>
                                    </li>
                                    <li>
                                      <div className="text-size-small">
                                        Email support
                                      </div>
                                    </li>
                                  </ul>
                                </div>
                              </div>
                            </div>
                            <div className="price-tab-bottom-contebt">
                              <div className="price-tab-bottom-left-contebt">
                                <h3 className="heading-style-h3">$29</h3>
                                <div className="text-size-small tex-color-black-700">
                                  /month
                                </div>
                              </div>
                              <a href="/contact" className="button w-inline-block">
                                <div className="button-text">
                                  Start Free Trial
                                </div>
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  )
}