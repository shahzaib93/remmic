import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import AdminLayout from '../../components/admin/AdminLayout'
import { 
  testFirestoreCollections, 
  initializeFirestoreCollections,
  getAllProperties, 
  getAllInvestments, 
  getAllContactMessages,
  getBidsForProperty,
  getUserBiddingPayments,
  getAdminSettings,
  db
} from '../../lib/firebase'
import { collection, query, orderBy, getDocs } from 'firebase/firestore'

export default function FirestoreData() {
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [testResults, setTestResults] = useState(null)
  const [initResults, setInitResults] = useState(null)
  const [selectedCollection, setSelectedCollection] = useState('test')
  const [collectionData, setCollectionData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const adminStatus = localStorage.getItem('isAdmin')
    if (adminStatus !== 'true') {
      router.push('/admin')
      return
    }
    setIsAdmin(true)
    runFirestoreTest()
  }, [router])

  const runFirestoreTest = async () => {
    setLoading(true)
    try {
      const results = await testFirestoreCollections()
      setTestResults(results)
      setError('')
    } catch (err) {
      setError('Failed to test Firestore: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const initializeDatabase = async () => {
    setLoading(true)
    try {
      const results = await initializeFirestoreCollections()
      setInitResults(results)
      setError('')
      // Also run test after initialization
      const testResults = await testFirestoreCollections()
      setTestResults(testResults)
    } catch (err) {
      setError('Failed to initialize Firestore: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const loadCollectionData = async (collectionName) => {
    setLoading(true)
    setSelectedCollection(collectionName)
    try {
      let data = []
      
      switch (collectionName) {
        case 'properties':
          const propertiesResult = await getAllProperties()
          data = propertiesResult.properties || []
          break

        case 'bids':
          // Get all bids - we'll need to create a function for this
          try {
            const q = query(collection(db, 'bids'), orderBy('createdAt', 'desc'))
            const querySnapshot = await getDocs(q)
            data = []
            querySnapshot.forEach((doc) => {
              data.push({ id: doc.id, ...doc.data() })
            })
          } catch (error) {
            console.error('Error loading bids:', error)
            data = []
          }
          break

        case 'biddingPayments':
          // Get all bidding payments
          try {
            const q = query(collection(db, 'biddingPayments'), orderBy('createdAt', 'desc'))
            const querySnapshot = await getDocs(q)
            data = []
            querySnapshot.forEach((doc) => {
              data.push({ id: doc.id, ...doc.data() })
            })
          } catch (error) {
            console.error('Error loading bidding payments:', error)
            data = []
          }
          break

        case 'evaluations':
          // Get all evaluations
          try {
            const q = query(collection(db, 'evaluations'), orderBy('createdAt', 'desc'))
            const querySnapshot = await getDocs(q)
            data = []
            querySnapshot.forEach((doc) => {
              data.push({ id: doc.id, ...doc.data() })
            })
          } catch (error) {
            console.error('Error loading evaluations:', error)
            data = []
          }
          break

        case 'notifications':
          // Get all notifications
          try {
            const q = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'))
            const querySnapshot = await getDocs(q)
            data = []
            querySnapshot.forEach((doc) => {
              data.push({ id: doc.id, ...doc.data() })
            })
          } catch (error) {
            console.error('Error loading notifications:', error)
            data = []
          }
          break
          
        case 'investments':
          const investmentsResult = await getAllInvestments()
          data = investmentsResult.investments || []
          break
          
        case 'contactMessages':
          const messagesResult = await getAllContactMessages()
          data = messagesResult.messages || []
          break
          
        case 'adminSettings':
          const settingsResult = await getAdminSettings()
          data = settingsResult.settings ? [settingsResult.settings] : []
          break
          
        default:
          data = []
      }
      
      setCollectionData(data)
      setError('')
    } catch (err) {
      setError('Failed to load collection: ' + err.message)
      setCollectionData([])
    } finally {
      setLoading(false)
    }
  }

  const formatValue = (value) => {
    if (value === null || value === undefined) return 'null'
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2)
    }
    return String(value)
  }

  if (!isAdmin) {
    return <div>Loading...</div>
  }

  return (
    <AdminLayout title="Firestore Data" currentPage="firestore">
      <div style={{ padding: '20px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>
              Firestore Collections Data
            </h1>

            {/* Database Initialization Section */}
            <div style={{ 
              background: 'white', 
              borderRadius: '8px', 
              padding: '20px', 
              marginBottom: '20px',
              border: '1px solid #e5e7eb' 
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '600' }}>Database Initialization</h2>
                <button
                  onClick={initializeDatabase}
                  disabled={loading}
                  style={{
                    padding: '8px 16px',
                    background: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.6 : 1
                  }}
                >
                  {loading ? 'Initializing...' : 'Create All Collections'}
                </button>
              </div>
              
              <p style={{ color: '#6b7280', marginBottom: '15px' }}>
                Click "Create All Collections" to initialize all Firestore collections with sample data. 
                This will make all collections visible in your Firebase console.
              </p>
              
              {initResults && (
                <div>
                  <p style={{ marginBottom: '10px', fontWeight: '500' }}>
                    Initialization Results: {initResults.collectionsCreated.length} collections created
                  </p>
                  
                  {initResults.collectionsCreated.length > 0 && (
                    <div style={{ marginBottom: '10px' }}>
                      <strong>Created Collections:</strong>
                      <ul style={{ marginLeft: '20px', marginTop: '5px' }}>
                        {initResults.collectionsCreated.map((collection, index) => (
                          <li key={index} style={{ color: '#059669' }}>✅ {collection}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {initResults.errors.length > 0 && (
                    <div>
                      <strong>Errors:</strong>
                      <ul style={{ marginLeft: '20px', marginTop: '5px' }}>
                        {initResults.errors.map((error, index) => (
                          <li key={index} style={{ color: '#dc2626' }}>❌ {error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Test Results Section */}
            <div style={{ 
              background: 'white', 
              borderRadius: '8px', 
              padding: '20px', 
              marginBottom: '20px',
              border: '1px solid #e5e7eb' 
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '600' }}>Collection Status Test</h2>
                <button
                  onClick={runFirestoreTest}
                  disabled={loading}
                  style={{
                    padding: '8px 16px',
                    background: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.6 : 1
                  }}
                >
                  {loading ? 'Testing...' : 'Run Test'}
                </button>
              </div>
              
              {testResults && (
                <div>
                  <p style={{ marginBottom: '10px', fontWeight: '500' }}>
                    Test Summary: {testResults.summary}
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                    {Object.entries(testResults.results).map(([collection, status]) => (
                      <div 
                        key={collection}
                        style={{
                          padding: '8px 12px',
                          background: status ? '#dcfce7' : '#fee2e2',
                          color: status ? '#166534' : '#dc2626',
                          borderRadius: '6px',
                          fontSize: '14px'
                        }}
                      >
                        {status ? '✅' : '❌'} {collection}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {error && (
                <div style={{ 
                  marginTop: '10px', 
                  padding: '10px', 
                  background: '#fee2e2', 
                  color: '#dc2626', 
                  borderRadius: '6px' 
                }}>
                  {error}
                </div>
              )}
            </div>

            {/* Collection Data Viewer */}
            <div style={{ 
              background: 'white', 
              borderRadius: '8px', 
              padding: '20px',
              border: '1px solid #e5e7eb' 
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '15px' }}>
                Collection Data Viewer
              </h2>
              
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                  Select Collection:
                </label>
                <select
                  value={selectedCollection}
                  onChange={(e) => loadCollectionData(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    background: 'white'
                  }}
                >
                  <option value="test">Run Test First</option>
                  <option value="properties">Properties</option>
                  <option value="bids">Bids</option>
                  <option value="biddingPayments">Bidding Payments</option>
                  <option value="investments">Investments</option>
                  <option value="contactMessages">Contact Messages</option>
                  <option value="notifications">Notifications</option>
                  <option value="adminSettings">Admin Settings</option>
                </select>
              </div>

              {loading && (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  Loading collection data...
                </div>
              )}

              {!loading && collectionData.length > 0 && (
                <div>
                  <p style={{ marginBottom: '10px', fontWeight: '500' }}>
                    Found {collectionData.length} document(s) in {selectedCollection}
                  </p>
                  
                  <div style={{ 
                    maxHeight: '500px', 
                    overflow: 'auto', 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '6px' 
                  }}>
                    {collectionData.map((doc, index) => (
                      <div 
                        key={doc.id || index}
                        style={{
                          padding: '15px',
                          borderBottom: index < collectionData.length - 1 ? '1px solid #e5e7eb' : 'none',
                          background: index % 2 === 0 ? '#f9fafb' : 'white'
                        }}
                      >
                        <div style={{ fontWeight: '600', marginBottom: '8px' }}>
                          Document ID: {doc.id || 'No ID'}
                        </div>
                        <pre style={{ 
                          fontSize: '12px', 
                          background: '#f3f4f6', 
                          padding: '10px', 
                          borderRadius: '4px',
                          overflow: 'auto',
                          whiteSpace: 'pre-wrap'
                        }}>
                          {formatValue(doc)}
                        </pre>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!loading && selectedCollection !== 'test' && collectionData.length === 0 && (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '20px', 
                  color: '#6b7280' 
                }}>
                  No data found in {selectedCollection} collection
                </div>
              )}
            </div>
      </div>
    </AdminLayout>
  )
}