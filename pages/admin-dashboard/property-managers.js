import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import { useFirebase } from '../../contexts/FirebaseContext'
import { assignPropertyManager, removePropertyManager } from '../../lib/firebase'

export default function PropertyManagersAdmin() {
  const router = useRouter()
  const { user } = useFirebase()

  const [loading, setLoading] = useState(true)
  const [managers, setManagers] = useState([])
  const [properties, setProperties] = useState([])
  const [assignments, setAssignments] = useState([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedManager, setSelectedManager] = useState(null)
  const [saving, setSaving] = useState(false)

  const [managerForm, setManagerForm] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: ''
  })

  const [assignForm, setAssignForm] = useState({
    propertyId: ''
  })

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      // Load property managers from localStorage
      const storedManagers = typeof window !== 'undefined'
        ? JSON.parse(localStorage.getItem('propertyManagers') || '[]')
        : []
      setManagers(storedManagers)

      // Load properties
      const storedProperties = typeof window !== 'undefined'
        ? JSON.parse(localStorage.getItem('userProperties') || '[]')
        : []
      setProperties(storedProperties)

      // Load assignments
      const storedAssignments = typeof window !== 'undefined'
        ? JSON.parse(localStorage.getItem('propertyManagerAssignments') || '[]')
        : []
      setAssignments(storedAssignments)

    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleAddManager = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const newManager = {
        id: `pm_${Date.now()}`,
        ...managerForm,
        role: 'property_manager',
        status: 'active',
        createdAt: new Date().toISOString(),
        createdBy: user?.uid || 'admin'
      }

      const updatedManagers = [...managers, newManager]
      localStorage.setItem('propertyManagers', JSON.stringify(updatedManagers))
      setManagers(updatedManagers)

      setShowAddModal(false)
      setManagerForm({ name: '', email: '', phone: '', specialization: '' })
    } catch (error) {
      console.error('Error adding manager:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleAssignProperty = async (e) => {
    e.preventDefault()
    if (!selectedManager || !assignForm.propertyId) return

    setSaving(true)
    try {
      const property = properties.find(p => p.id === assignForm.propertyId)

      const newAssignment = {
        id: `assign_${Date.now()}`,
        managerId: selectedManager.id,
        managerName: selectedManager.name,
        propertyId: assignForm.propertyId,
        propertyTitle: property?.title || property?.propertyAddress || 'Property',
        assignedAt: new Date().toISOString(),
        assignedBy: user?.uid || 'admin'
      }

      // Update Firebase
      await assignPropertyManager(assignForm.propertyId, selectedManager.id)

      // Update localStorage
      const updatedAssignments = [...assignments, newAssignment]
      localStorage.setItem('propertyManagerAssignments', JSON.stringify(updatedAssignments))
      setAssignments(updatedAssignments)

      setShowAssignModal(false)
      setSelectedManager(null)
      setAssignForm({ propertyId: '' })
    } catch (error) {
      console.error('Error assigning property:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleRemoveAssignment = async (assignmentId, propertyId, managerId) => {
    if (!confirm('Are you sure you want to remove this assignment?')) return

    try {
      await removePropertyManager(propertyId, managerId)

      const updatedAssignments = assignments.filter(a => a.id !== assignmentId)
      localStorage.setItem('propertyManagerAssignments', JSON.stringify(updatedAssignments))
      setAssignments(updatedAssignments)
    } catch (error) {
      console.error('Error removing assignment:', error)
    }
  }

  const handleDeactivateManager = (managerId) => {
    if (!confirm('Are you sure you want to deactivate this manager?')) return

    const updatedManagers = managers.map(m =>
      m.id === managerId ? { ...m, status: 'inactive' } : m
    )
    localStorage.setItem('propertyManagers', JSON.stringify(updatedManagers))
    setManagers(updatedManagers)
  }

  const openAssignModal = (manager) => {
    setSelectedManager(manager)
    setShowAssignModal(true)
  }

  const getManagerAssignments = (managerId) => {
    return assignments.filter(a => a.managerId === managerId)
  }

  const getUnassignedProperties = () => {
    const assignedPropertyIds = assignments.map(a => a.propertyId)
    return properties.filter(p => !assignedPropertyIds.includes(p.id))
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A'
    return new Date(dateStr).toLocaleDateString('en-PK', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <>
      <Head>
        <title>Property Managers | REMMIC Admin</title>
      </Head>
      <Navbar />

      <main className="p-8 max-w-[1400px] mx-auto min-h-[70vh]">
        {/* Header */}
        <div className="mb-8">
          <Link href="/admin-dashboard" className="text-gray-500 text-sm no-underline flex items-center gap-1 mb-2 hover:text-gray-700">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>
            Back to Admin Dashboard
          </Link>
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <h1 className="m-0 text-gray-800 text-2xl font-bold">Property Managers</h1>
              <p className="mt-1 mb-0 text-gray-500">
                Manage property managers and their assignments
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="border-none rounded-full px-5 py-2.5 text-sm font-semibold cursor-pointer transition-all bg-gradient-to-br from-green-500 to-green-600 text-white shadow-[0_10px_18px_rgba(34,197,94,0.28)] hover:-translate-y-0.5 hover:shadow-[0_14px_24px_rgba(34,197,94,0.32)]"
            >
              + Add Property Manager
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-5 mb-8">
          <div className="bg-white rounded-2xl p-5 shadow-[0_12px_24px_rgba(15,23,42,0.08)] border border-slate-200/20">
            <h3 className="text-gray-500 text-sm font-medium mb-2">Total Managers</h3>
            <div className="text-2xl font-bold text-gray-900">{managers.length}</div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-[0_12px_24px_rgba(15,23,42,0.08)] border border-slate-200/20">
            <h3 className="text-gray-500 text-sm font-medium mb-2">Active</h3>
            <div className="text-2xl font-bold text-emerald-600">
              {managers.filter(m => m.status === 'active').length}
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-[0_12px_24px_rgba(15,23,42,0.08)] border border-slate-200/20">
            <h3 className="text-gray-500 text-sm font-medium mb-2">Assignments</h3>
            <div className="text-2xl font-bold text-gray-900">{assignments.length}</div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-[0_12px_24px_rgba(15,23,42,0.08)] border border-slate-200/20">
            <h3 className="text-gray-500 text-sm font-medium mb-2">Unassigned Properties</h3>
            <div className="text-2xl font-bold text-amber-600">
              {getUnassignedProperties().length}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading...</p>
          </div>
        ) : managers.length === 0 ? (
          <div className="bg-white rounded-[1.75rem] p-12 shadow-[0_12px_32px_rgba(15,23,42,0.08)] border border-slate-200/20 text-center">
            <div className="text-5xl mb-4">👤</div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">No Property Managers</h2>
            <p className="text-gray-500 mb-4">
              Add property managers to assign them to properties.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="border-none rounded-full px-5 py-2.5 text-sm font-semibold cursor-pointer transition-all bg-gradient-to-br from-green-500 to-green-600 text-white shadow-[0_10px_18px_rgba(34,197,94,0.28)] hover:-translate-y-0.5 hover:shadow-[0_14px_24px_rgba(34,197,94,0.32)]"
            >
              Add First Manager
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(350px,1fr))] gap-6">
            {managers.map(manager => {
              const managerAssignments = getManagerAssignments(manager.id)
              return (
                <div
                  key={manager.id}
                  className={`bg-white rounded-[1.75rem] p-6 shadow-[0_12px_32px_rgba(15,23,42,0.08)] border border-slate-200/20 ${manager.status === 'inactive' ? 'opacity-60' : ''}`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-4 items-center">
                      <div className="w-12 h-12 rounded-full bg-orange-500 text-white flex items-center justify-center font-semibold text-xl">
                        {manager.name?.charAt(0).toUpperCase() || 'P'}
                      </div>
                      <div>
                        <h3 className="m-0 text-gray-800 font-semibold">{manager.name}</h3>
                        <p className="m-0 text-sm text-gray-500">{manager.email}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded text-[0.7rem] font-medium ${
                      manager.status === 'active'
                        ? 'bg-emerald-100 text-emerald-600'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {manager.status?.toUpperCase()}
                    </span>
                  </div>

                  <div className="mb-4 text-sm text-gray-500">
                    <div>Phone: {manager.phone || 'N/A'}</div>
                    <div>Specialization: {manager.specialization || 'General'}</div>
                    <div>Added: {formatDate(manager.createdAt)}</div>
                  </div>

                  {/* Assigned Properties */}
                  <div className="mb-4">
                    <div className="text-xs text-gray-500 mb-2">
                      Assigned Properties ({managerAssignments.length})
                    </div>
                    {managerAssignments.length === 0 ? (
                      <p className="text-sm text-gray-400">No properties assigned</p>
                    ) : (
                      <div className="flex flex-col gap-1">
                        {managerAssignments.map(assignment => (
                          <div
                            key={assignment.id}
                            className="flex justify-between items-center p-2 bg-slate-50 rounded text-sm"
                          >
                            <span>{assignment.propertyTitle}</span>
                            <button
                              onClick={() => handleRemoveAssignment(assignment.id, assignment.propertyId, manager.id)}
                              className="px-2 py-1 bg-red-100 text-red-600 border-none rounded text-[0.7rem] cursor-pointer hover:bg-red-200"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => openAssignModal(manager)}
                      disabled={manager.status === 'inactive'}
                      className="flex-1 border-none rounded-full px-4 py-2 text-sm font-semibold cursor-pointer transition-all bg-gradient-to-br from-green-500 to-green-600 text-white shadow-[0_10px_18px_rgba(34,197,94,0.28)] hover:-translate-y-0.5 hover:shadow-[0_14px_24px_rgba(34,197,94,0.32)] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                    >
                      Assign Property
                    </button>
                    {manager.status === 'active' && (
                      <button
                        onClick={() => handleDeactivateManager(manager.id)}
                        className="px-4 py-2 bg-red-100 text-red-600 border-none rounded-lg cursor-pointer hover:bg-red-200"
                      >
                        Deactivate
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* Add Manager Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-4">
          <div className="bg-white rounded-2xl p-8 max-w-[500px] w-full">
            <h2 className="m-0 mb-6 text-xl font-semibold text-gray-800">Add Property Manager</h2>
            <form onSubmit={handleAddManager}>
              <div className="mb-4">
                <label className="block mb-2 font-medium text-gray-700">Full Name *</label>
                <input
                  type="text"
                  value={managerForm.name}
                  onChange={(e) => setManagerForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Ahmad Khan"
                  required
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2 font-medium text-gray-700">Email *</label>
                <input
                  type="email"
                  value={managerForm.email}
                  onChange={(e) => setManagerForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="e.g., manager@remmic.pk"
                  required
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block mb-2 font-medium text-gray-700">Phone</label>
                  <input
                    type="tel"
                    value={managerForm.phone}
                    onChange={(e) => setManagerForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+92 300 1234567"
                    className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block mb-2 font-medium text-gray-700">Specialization</label>
                  <select
                    value={managerForm.specialization}
                    onChange={(e) => setManagerForm(prev => ({ ...prev, specialization: e.target.value }))}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  >
                    <option value="">General</option>
                    <option value="residential">Residential</option>
                    <option value="commercial">Commercial</option>
                    <option value="mixed">Mixed Use</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false)
                    setManagerForm({ name: '', email: '', phone: '', specialization: '' })
                  }}
                  className="flex-1 border border-slate-300/35 rounded-full px-4 py-2.5 text-sm font-semibold cursor-pointer transition-all bg-slate-200/50 text-gray-800 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 border-none rounded-full px-4 py-2.5 text-sm font-semibold cursor-pointer transition-all bg-gradient-to-br from-green-500 to-green-600 text-white shadow-[0_10px_18px_rgba(34,197,94,0.28)] hover:-translate-y-0.5 hover:shadow-[0_14px_24px_rgba(34,197,94,0.32)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Adding...' : 'Add Manager'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Property Modal */}
      {showAssignModal && selectedManager && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-4">
          <div className="bg-white rounded-2xl p-8 max-w-[500px] w-full">
            <h2 className="m-0 mb-2 text-xl font-semibold text-gray-800">Assign Property</h2>
            <p className="text-gray-500 mb-6">
              Assigning to: <strong>{selectedManager.name}</strong>
            </p>
            <form onSubmit={handleAssignProperty}>
              <div className="mb-6">
                <label className="block mb-2 font-medium text-gray-700">Select Property *</label>
                <select
                  value={assignForm.propertyId}
                  onChange={(e) => setAssignForm({ propertyId: e.target.value })}
                  required
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                >
                  <option value="">-- Select a property --</option>
                  {properties.map(property => (
                    <option key={property.id} value={property.id}>
                      {property.title || property.propertyAddress} - {property.location || property.city}
                    </option>
                  ))}
                </select>
                {getUnassignedProperties().length === 0 && (
                  <p className="text-xs text-amber-600 mt-2">
                    All properties are already assigned. You can reassign if needed.
                  </p>
                )}
              </div>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAssignModal(false)
                    setSelectedManager(null)
                    setAssignForm({ propertyId: '' })
                  }}
                  className="flex-1 border border-slate-300/35 rounded-full px-4 py-2.5 text-sm font-semibold cursor-pointer transition-all bg-slate-200/50 text-gray-800 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || !assignForm.propertyId}
                  className="flex-1 border-none rounded-full px-4 py-2.5 text-sm font-semibold cursor-pointer transition-all bg-gradient-to-br from-green-500 to-green-600 text-white shadow-[0_10px_18px_rgba(34,197,94,0.28)] hover:-translate-y-0.5 hover:shadow-[0_14px_24px_rgba(34,197,94,0.32)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Assigning...' : 'Assign'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </>
  )
}
