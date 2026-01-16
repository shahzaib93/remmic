import Head from 'next/head'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function AmanorxGroup() {
  const ventures = [
    {
      name: 'REMMIC',
      category: 'PropTech',
      description: 'Real Estate Evaluation, Marketing, Management & Investment platform revolutionizing property transactions in Pakistan.',
      status: 'Active'
    },
    {
      name: 'Amanorx Tech',
      category: 'Technology',
      description: 'Software development and digital transformation solutions for enterprises across multiple industries.',
      status: 'Active'
    },
    {
      name: 'Amanorx Capital',
      category: 'Investment',
      description: 'Venture capital and private equity firm focusing on high-growth startups in emerging markets.',
      status: 'Active'
    },
    {
      name: 'Amanorx Labs',
      category: 'R&D',
      description: 'Research and development center focused on AI, blockchain, and emerging technologies.',
      status: 'Active'
    }
  ]

  const values = [
    {
      title: 'Innovation',
      description: 'Constantly pushing boundaries to create solutions that transform industries.'
    },
    {
      title: 'Integrity',
      description: 'Operating with complete transparency and ethical standards in all dealings.'
    },
    {
      title: 'Excellence',
      description: 'Striving for the highest quality in every product and service we deliver.'
    },
    {
      title: 'Impact',
      description: 'Creating meaningful change that benefits communities and economies.'
    }
  ]

  const milestones = [
    { year: '2019', event: 'Amanorx Group founded with technology consulting focus' },
    { year: '2020', event: 'Expanded into software development and digital services' },
    { year: '2021', event: 'Launched Amanorx Capital for venture investments' },
    { year: '2022', event: 'Established Amanorx Labs for R&D initiatives' },
    { year: '2023', event: 'Began development of REMMIC PropTech platform' },
    { year: '2024', event: 'REMMIC enters SECP regulatory sandbox' },
    { year: '2025', event: 'REMMIC public launch and Silver Founders program' }
  ]

  return (
    <>
      <Head>
        <title>Amanorx Group - REMMIC Parent Company</title>
        <meta name="description" content="Learn about Amanorx Group, the parent company behind REMMIC and other innovative ventures" />
      </Head>
      <div className="page-wrapper">
        <Navbar />
        <main className="main-wrapper">
          {/* Hero Section */}
          <section className="ag-hero">
            <div className="ag-hero__container">
              <span className="ag-hero__badge">Parent Company</span>
              <h1 className="ag-hero__title">Amanorx Group</h1>
              <p className="ag-hero__subtitle">
                A diversified holding company building innovative solutions across technology,
                real estate, and financial services to drive economic growth in emerging markets.
              </p>
            </div>
          </section>

          {/* About Section */}
          <section className="ag-about">
            <div className="ag-about__container">
              <div className="ag-about__content">
                <h2 className="ag-section-title" style={{ textAlign: 'left' }}>About Amanorx Group</h2>
                <p>
                  Founded with a vision to transform traditional industries through technology,
                  Amanorx Group has grown into a multi-sector enterprise with presence in technology,
                  real estate, and investment management.
                </p>
                <p>
                  Our flagship venture, REMMIC, represents our commitment to solving complex market
                  problems through innovative technology solutions. We believe in creating sustainable
                  businesses that generate value for all stakeholders while maintaining the highest
                  standards of governance and transparency.
                </p>
                <p>
                  Headquartered in Pakistan, Amanorx Group is expanding its presence across the
                  Middle East, Southeast Asia, and beyond, with a mission to become a leading
                  conglomerate in emerging markets.
                </p>
              </div>
              <div className="ag-about__stats">
                <div className="ag-stat">
                  <span className="ag-stat__number">4+</span>
                  <span className="ag-stat__label">Active Ventures</span>
                </div>
                <div className="ag-stat">
                  <span className="ag-stat__number">100+</span>
                  <span className="ag-stat__label">Team Members</span>
                </div>
                <div className="ag-stat">
                  <span className="ag-stat__number">5+</span>
                  <span className="ag-stat__label">Years of Growth</span>
                </div>
                <div className="ag-stat">
                  <span className="ag-stat__number">3</span>
                  <span className="ag-stat__label">Countries</span>
                </div>
              </div>
            </div>
          </section>

          {/* Ventures Section */}
          <section className="ag-ventures">
            <div className="ag-ventures__container">
              <h2 className="ag-section-title">Our Ventures</h2>
              <p className="ag-section-subtitle">Building companies that shape the future</p>
              <div className="ag-ventures__grid">
                {ventures.map((venture, index) => (
                  <div key={index} className="ag-venture-card">
                    <div className="ag-venture-card__header">
                      <span className="ag-venture-card__category">{venture.category}</span>
                      <span className="ag-venture-card__status">{venture.status}</span>
                    </div>
                    <h3 className="ag-venture-card__name">{venture.name}</h3>
                    <p className="ag-venture-card__desc">{venture.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Values Section */}
          <section className="ag-values">
            <div className="ag-values__container">
              <h2 className="ag-section-title">Our Values</h2>
              <p className="ag-section-subtitle">The principles that guide everything we do</p>
              <div className="ag-values__grid">
                {values.map((value, index) => (
                  <div key={index} className="ag-value-card">
                    <div className="ag-value-card__number">{String(index + 1).padStart(2, '0')}</div>
                    <h3 className="ag-value-card__title">{value.title}</h3>
                    <p className="ag-value-card__desc">{value.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Timeline Section */}
          <section className="ag-timeline">
            <div className="ag-timeline__container">
              <h2 className="ag-section-title">Our Journey</h2>
              <p className="ag-section-subtitle">Key milestones in our growth story</p>
              <div className="ag-timeline__list">
                {milestones.map((milestone, index) => (
                  <div key={index} className="ag-milestone">
                    <div className="ag-milestone__year">{milestone.year}</div>
                    <div className="ag-milestone__line"></div>
                    <div className="ag-milestone__content">
                      <p>{milestone.event}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Contact Section */}
          <section className="ag-contact">
            <div className="ag-contact__container">
              <h2 className="ag-section-title">Get in Touch</h2>
              <p className="ag-section-subtitle">
                Interested in partnering with Amanorx Group or learning more about our ventures?
              </p>
              <div className="ag-contact__info">
                <div className="ag-contact__item">
                  <span className="ag-contact__icon">📍</span>
                  <div>
                    <strong>Headquarters</strong>
                    <p>Islamabad, Pakistan</p>
                  </div>
                </div>
                <div className="ag-contact__item">
                  <span className="ag-contact__icon">📧</span>
                  <div>
                    <strong>Email</strong>
                    <p>info@amanorx.com</p>
                  </div>
                </div>
                <div className="ag-contact__item">
                  <span className="ag-contact__icon">🌐</span>
                  <div>
                    <strong>Website</strong>
                    <p>www.amanorx.com</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>

      <style jsx>{`
        .ag-hero {
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
          padding: 120px 20px 80px;
          text-align: center;
          color: #fff;
        }
        .ag-hero__container {
          max-width: 800px;
          margin: 0 auto;
        }
        .ag-hero__badge {
          display: inline-block;
          background: rgba(212, 175, 55, 0.2);
          color: #D4AF37;
          padding: 8px 20px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 24px;
          border: 1px solid rgba(212, 175, 55, 0.3);
        }
        .ag-hero__title {
          font-size: 56px;
          font-weight: 700;
          margin-bottom: 20px;
          letter-spacing: -1px;
          color: #ffffff;
        }
        .ag-hero__subtitle {
          font-size: 18px;
          color: #aaa;
          line-height: 1.6;
        }

        .ag-section-title {
          font-size: 36px;
          font-weight: 700;
          text-align: center;
          margin-bottom: 12px;
          color: #1a1a1a;
        }
        .ag-section-subtitle {
          font-size: 16px;
          color: #666;
          text-align: center;
          margin-bottom: 48px;
        }

        .ag-about {
          padding: 80px 20px;
          background: #fff;
        }
        .ag-about__container {
          max-width: 1100px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 350px;
          gap: 60px;
          align-items: start;
        }
        .ag-about__content p {
          font-size: 16px;
          color: #444;
          line-height: 1.8;
          margin-bottom: 20px;
        }
        .ag-about__stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        .ag-stat {
          background: #f9f9f9;
          padding: 24px;
          border-radius: 12px;
          text-align: center;
        }
        .ag-stat__number {
          display: block;
          font-size: 36px;
          font-weight: 700;
          color: #D4AF37;
          margin-bottom: 4px;
        }
        .ag-stat__label {
          font-size: 14px;
          color: #666;
        }

        .ag-ventures {
          padding: 80px 20px;
          background: #f9f9f9;
        }
        .ag-ventures__container {
          max-width: 1200px;
          margin: 0 auto;
        }
        .ag-ventures__grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 24px;
        }
        .ag-venture-card {
          background: #fff;
          padding: 32px;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
          transition: transform 0.3s;
        }
        .ag-venture-card:hover {
          transform: translateY(-4px);
        }
        .ag-venture-card__header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }
        .ag-venture-card__category {
          font-size: 12px;
          color: #D4AF37;
          font-weight: 600;
          text-transform: uppercase;
        }
        .ag-venture-card__status {
          font-size: 12px;
          background: #e8f5e9;
          color: #2e7d32;
          padding: 4px 12px;
          border-radius: 20px;
        }
        .ag-venture-card__name {
          font-size: 24px;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 12px;
        }
        .ag-venture-card__desc {
          font-size: 14px;
          color: #666;
          line-height: 1.6;
        }

        .ag-values {
          padding: 80px 20px;
          background: radial-gradient(circle at top, rgba(255,255,255,0.08), transparent 60%), #050607;
          color: #fff;
        }
        .ag-values__container {
          max-width: 1000px;
          margin: 0 auto;
        }
        .ag-values .ag-section-title {
          color: #fff;
        }
        .ag-values .ag-section-subtitle {
          color: #aaa;
        }
        .ag-values__grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 24px;
        }
        .ag-value-card {
          padding: 24px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          backdrop-filter: blur(6px);
        }
        .ag-value-card__number {
          font-size: 48px;
          font-weight: 700;
          color: rgba(212, 175, 55, 0.3);
          margin-bottom: 12px;
        }
        .ag-value-card__title {
          font-size: 20px;
          font-weight: 600;
          margin-bottom: 8px;
        }
        .ag-value-card__desc {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.85);
          line-height: 1.6;
        }

        .ag-timeline {
          padding: 80px 20px;
          background: #fff;
        }
        .ag-timeline__container {
          max-width: 800px;
          margin: 0 auto;
        }
        .ag-timeline__list {
          position: relative;
        }
        .ag-milestone {
          display: flex;
          align-items: flex-start;
          gap: 24px;
          margin-bottom: 24px;
        }
        .ag-milestone__year {
          font-size: 18px;
          font-weight: 700;
          color: #D4AF37;
          min-width: 60px;
        }
        .ag-milestone__line {
          width: 12px;
          height: 12px;
          background: #D4AF37;
          border-radius: 50%;
          position: relative;
          flex-shrink: 0;
          margin-top: 6px;
        }
        .ag-milestone__line::after {
          content: '';
          position: absolute;
          left: 50%;
          top: 12px;
          width: 2px;
          height: calc(100% + 12px);
          background: #eee;
          transform: translateX(-50%);
        }
        .ag-milestone:last-child .ag-milestone__line::after {
          display: none;
        }
        .ag-milestone__content {
          flex: 1;
          background: #f9f9f9;
          padding: 16px 20px;
          border-radius: 8px;
        }
        .ag-milestone__content p {
          font-size: 15px;
          color: #333;
          margin: 0;
        }

        .ag-contact {
          padding: 80px 20px;
          background: #f9f9f9;
        }
        .ag-contact__container {
          max-width: 800px;
          margin: 0 auto;
          text-align: center;
        }
        .ag-contact__info {
          display: flex;
          justify-content: center;
          gap: 40px;
          flex-wrap: wrap;
          margin-top: 32px;
        }
        .ag-contact__item {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          text-align: left;
        }
        .ag-contact__icon {
          font-size: 28px;
        }
        .ag-contact__item strong {
          display: block;
          font-size: 14px;
          color: #1a1a1a;
          margin-bottom: 4px;
        }
        .ag-contact__item p {
          font-size: 14px;
          color: #666;
          margin: 0;
        }

        @media (max-width: 768px) {
          .ag-hero__title {
            font-size: 36px;
          }
          .ag-about__container {
            grid-template-columns: 1fr;
          }
          .ag-contact__info {
            flex-direction: column;
            align-items: center;
          }
        }
      `}</style>
    </>
  )
}
