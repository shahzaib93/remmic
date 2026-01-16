import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import Navbar from '../../../components/Navbar'
import Footer from '../../../components/Footer'
import { useFirebase } from '../../../contexts/FirebaseContext'
import { addDevelopmentProject, DEVELOPMENT_PROJECT_STATUS } from '../../../lib/firebase'

export default function NewDevelopmentProject() {
  const router = useRouter()
  const { user } = useFirebase()
  const { propertyId } = router.query

  const [loading, setLoading] = useState(false)
  const [properties, setProperties] = useState([])
  const [formData, setFormData] = useState({
    propertyId: propertyId || '',
    projectName: '',
    projectType: 'residential',
    description: '',
    landArea: '',
    proposedUnits: '',
    estimatedCapital: '',
    targetCompletion: '',
    developmentType: 'new_construction',
    notes: ''
  })

  useEffect(() => {
    // Load evaluated properties from localStorage
    const stored = typeof window !== 'undefined'
      ? JSON.parse(localStorage.getItem('evaluatedProperties') || '[]')
      : []
    setProperties(stored)

    if (propertyId) {
      setFormData(prev => ({ ...prev, propertyId }))
    }
  }, [propertyId])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const selectedProperty = properties.find(p => p.id === formData.propertyId)

      const projectData = {
        ...formData,
        propertyTitle: selectedProperty?.title || selectedProperty?.propertyAddress || 'N/A',
        propertyLocation: selectedProperty?.location || selectedProperty?.city || 'N/A',
        status: DEVELOPMENT_PROJECT_STATUS.UNDER_EVALUATION,
        estimatedCapital: parseFloat(formData.estimatedCapital) || 0,
        proposedUnits: parseInt(formData.proposedUnits) || 0,
        createdBy: user?.uid || 'admin',
        createdByName: user?.displayName || user?.email || 'Admin'
      }

      const result = await addDevelopmentProject(projectData)

      if (result.success) {
        router.push(`/admin-dashboard/development-projects/${result.project.id}`)
      } else {
        alert('Error creating project. Please try again.')
      }
    } catch (error) {
      console.error('Error creating project:', error)
      alert('Error creating project. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>New Development Project | REMMIC Admin</title>
      </Head>
      <Navbar />

      <main className="p-8 max-w-[800px] mx-auto min-h-[70vh]">
        {/* Header */}
        <div className="mb-8">
          <Link href="/admin-dashboard" className="text-gray-500 text-sm no-underline flex items-center gap-1 mb-2 hover:text-gray-700">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>
            Back to Admin Dashboard
          </Link>
          <h1 className="m-0 text-gray-800 text-2xl font-bold">Create Development Project</h1>
          <p className="mt-2 mb-0 text-gray-500">
            Link an evaluated property to a new development project
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-[1.75rem] p-7 shadow-[0_12px_32px_rgba(15,23,42,0.08)] border border-slate-200/20 mb-6">
            <h3 className="m-0 mb-6 text-lg font-semibold text-gray-800">Property Selection</h3>

            <div className="mb-6">
              <label className="block mb-2 font-medium text-gray-700">
                Select Evaluated Property *
              </label>
              <select
                name="propertyId"
                value={formData.propertyId}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-200 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              >
                <option value="">-- Select a property --</option>
                {properties.map(prop => (
                  <option key={prop.id} value={prop.id}>
                    {prop.title || prop.propertyAddress} - {prop.location || prop.city}
                  </option>
                ))}
              </select>
              {properties.length === 0 && (
                <p className="text-sm text-amber-600 mt-2">
                  No evaluated properties found. Properties must be evaluated before creating a development project.
                </p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-[1.75rem] p-7 shadow-[0_12px_32px_rgba(15,23,42,0.08)] border border-slate-200/20 mb-6">
            <h3 className="m-0 mb-6 text-lg font-semibold text-gray-800">Project Details</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block mb-2 font-medium text-gray-700">
                  Project Name *
                </label>
                <input
                  type="text"
                  name="projectName"
                  value={formData.projectName}
                  onChange={handleChange}
                  placeholder="e.g., Green Valley Residences"
                  required
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium text-gray-700">
                  Project Type *
                </label>
                <select
                  name="projectType"
                  value={formData.projectType}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                >
                  <option value="residential">Residential</option>
                  <option value="commercial">Commercial</option>
                  <option value="mixed_use">Mixed Use</option>
                  <option value="industrial">Industrial</option>
                </select>
              </div>

              <div>
                <label className="block mb-2 font-medium text-gray-700">
                  Development Type *
                </label>
                <select
                  name="developmentType"
                  value={formData.developmentType}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                >
                  <option value="new_construction">New Construction</option>
                  <option value="renovation">Renovation</option>
                  <option value="redevelopment">Redevelopment</option>
                  <option value="expansion">Expansion</option>
                </select>
              </div>

              <div>
                <label className="block mb-2 font-medium text-gray-700">
                  Land Area (sq ft/marla)
                </label>
                <input
                  type="text"
                  name="landArea"
                  value={formData.landArea}
                  onChange={handleChange}
                  placeholder="e.g., 10 Marla or 2722 sq ft"
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium text-gray-700">
                  Proposed Units
                </label>
                <input
                  type="number"
                  name="proposedUnits"
                  value={formData.proposedUnits}
                  onChange={handleChange}
                  placeholder="e.g., 12"
                  min="0"
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>

              <div className="col-span-2">
                <label className="block mb-2 font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Brief description of the development project..."
                  className="w-full p-3 border border-gray-200 rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[1.75rem] p-7 shadow-[0_12px_32px_rgba(15,23,42,0.08)] border border-slate-200/20 mb-6">
            <h3 className="m-0 mb-6 text-lg font-semibold text-gray-800">Financial Estimates</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 font-medium text-gray-700">
                  Estimated Capital Required (PKR)
                </label>
                <input
                  type="number"
                  name="estimatedCapital"
                  value={formData.estimatedCapital}
                  onChange={handleChange}
                  placeholder="e.g., 50000000"
                  min="0"
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium text-gray-700">
                  Target Completion Date
                </label>
                <input
                  type="date"
                  name="targetCompletion"
                  value={formData.targetCompletion}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>

              <div className="col-span-2">
                <label className="block mb-2 font-medium text-gray-700">
                  Internal Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Internal notes for admin reference..."
                  className="w-full p-3 border border-gray-200 rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="mb-6 p-4 bg-orange-500/5 border border-orange-500/20 rounded-xl text-sm text-amber-800">
            REMMIC is a management and structuring platform. Investments are project-based and subject to risk. Returns are indicative only and not guaranteed.
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <Link
              href="/admin-dashboard"
              className="flex-1 text-center border border-slate-300/35 rounded-full px-4 py-2.5 text-sm font-semibold transition-all bg-slate-200/50 text-gray-800 hover:bg-slate-200 no-underline"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading || !formData.propertyId}
              className="flex-1 border-none rounded-full px-4 py-2.5 text-sm font-semibold cursor-pointer transition-all bg-gradient-to-br from-green-500 to-green-600 text-white shadow-[0_10px_18px_rgba(34,197,94,0.28)] hover:-translate-y-0.5 hover:shadow-[0_14px_24px_rgba(34,197,94,0.32)] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
            >
              {loading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </main>

      <Footer />
    </>
  )
}
