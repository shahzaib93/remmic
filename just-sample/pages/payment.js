import Head from 'next/head'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function Payment() {
  return (
    <>
      <Head>
        <title>Payment - REMMIC</title>
      </Head>
      <div className="page-wrapper">
        <Navbar />
        <main className="main-wrapper">
          <div style={{padding: '50px', textAlign: 'center'}}>
            <h1>Payment Processing</h1>
            <p>This page will contain payment processing and transaction management</p>
          </div>
        </main>

        <Footer />
      </div>
      <script src="/scripts/remove-webflow-badge.js"></script>
    </>
  )
}