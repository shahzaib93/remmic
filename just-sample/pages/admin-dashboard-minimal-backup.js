import Head from 'next/head'
import { useState, useEffect } from 'react'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <>
      <Head>
        <title>Admin Dashboard - REMMIC</title>
      </Head>

      <div style={{
        display: 'flex',
        minHeight: '100vh',
        background: '#f8fafc'
      }}>
        {/* Sidebar */}
        <div style={{width: '250px', background: 'white'}}>
          <h1>Admin</h1>
        </div>

        {/* Main Content Area */}
        <main style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '2rem',
          background: '#ffffff',
          minHeight: 'calc(100vh - 140px)'
        }}>
          
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div>
              <h2>Platform Overview</h2>
              <p>Dashboard content here</p>
            </div>
          )}

        </main>
      </div>
    </>
  )
}