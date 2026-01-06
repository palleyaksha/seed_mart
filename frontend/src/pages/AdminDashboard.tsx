import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AddSeedForm from '../components/AddSeedForm'
import EditSeedForm from '../components/EditSeedForm'
import api from '../services/api'
import '../App.css'

interface Seed {
  id: number
  name: string
  category: string
  price: number
  quantity: number
}

const AdminDashboard = () => {
  const { user, logout } = useAuth()
  const [seeds, setSeeds] = useState<Seed[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingSweet, setEditingSweet] = useState<Sweet | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')

  useEffect(() => {
    fetchSeeds()
  }, [])

  const fetchSeeds = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await api.get('/seeds')
      if (response.data && Array.isArray(response.data)) {
        setSeeds(response.data)
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch seeds')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (seedId: number, seedName: string) => {
    if (!window.confirm(`Are you sure you want to delete "${sweetName}"? This action cannot be undone.`)) {
      return
    }

    try {
      await api.delete(`/seeds/${seedId}`)
      setSeeds(seeds.filter(s => s.id !== seedId))
      showToast(`${seedName} deleted successfully`, 'success')
    } catch (err: any) {
      showToast(err.response?.data?.detail || 'Failed to delete sweet', 'error')
    }
  }

  const handleRestock = async (seedId: number, currentQuantity: number, seedName: string) => {
    const restockAmount = prompt(`Seed: ${seedName}\nCurrent stock: ${currentQuantity}\n\nEnter amount to add:`, '10')

    if (!restockAmount || isNaN(Number(restockAmount)) || Number(restockAmount) <= 0) {
      return
    }

    try {
      const response = await api.post(`/seeds/${seedId}/restock`, {
        quantity: Number(restockAmount)
      })
      setSeeds(seeds.map(s => s.id === seedId ? response.data : s))
      showToast(`${seedName}: Restocked ${restockAmount} items (New total: ${response.data.quantity})`, 'success')
    } catch (err: any) {
      showToast(err.response?.data?.detail || 'Failed to restock', 'error')
    }
  }

  const handleAddSuccess = (newSeed: Seed) => {
    setSeeds([...seeds, newSeed])
    setShowAddForm(false)
    showToast(`${newSeed.name} added successfully`, 'success')
  }

  const handleEditSuccess = (updatedSeed: Seed) => {
    setSeeds(seeds.map(s => s.id === updatedSeed.id ? updatedSeed : s))
    setEditingSweet(null)
    showToast(`${updatedSeed.name} updated successfully`, 'success')
  }

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    const toast = document.createElement('div')
    toast.className = `toast toast-${type}`
    toast.innerHTML = `
      <span class="toast-icon">${type === 'success' ? '✅' : '⚠️'}</span>
      <span class="toast-message">${message}</span>
    `
    document.body.appendChild(toast)
    setTimeout(() => {
      toast.style.animation = 'slideInRight 0.3s ease-out reverse'
      setTimeout(() => toast.remove(), 300)
    }, 3000)
  }

  const filteredSeeds = seeds.filter(seed => {
    const matchesSearch = seed.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !categoryFilter || seed.category.toLowerCase() === categoryFilter.toLowerCase()
    return matchesSearch && matchesCategory
  })

  const categories = Array.from(new Set(seeds.map(s => s.category)))

  if (loading) {
    return (
      <div className="app">
        <header className="app-header">
          <div className="header-content">
            <h1 className="app-title">🌱 Admin Dashboard</h1>
            <div className="header-actions">
              <span className="welcome-text">Admin: {user?.email}</span>
              <button onClick={logout} className="btn btn-danger">Logout</button>
            </div>
          </div>
        </header>
        <div className="container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <div className="loading-text">Loading seeds...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">🌱 Admin Dashboard</h1>
          <div className="header-actions">
            <span className="welcome-text">Admin: {user?.email}</span>
            <Link to="/dashboard" className="btn btn-outline" style={{ textDecoration: 'none', marginRight: '12px' }}>
              View Shop
            </Link>
            <button onClick={logout} className="btn btn-danger">Logout</button>
          </div>
        </div>
      </header>

      <div className="container">
        {error && (
          <div className="card error fade-in">
            <strong>Error:</strong> {error}
            <button onClick={fetchSweets} className="btn btn-primary" style={{ marginTop: '12px' }}>
              Retry
            </button>
          </div>
        )}

        {/* Action Bar */}
        <div className="card fade-in" style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <h2 style={{ margin: 0 }}>Seed Management</h2>
            <button
              onClick={() => setShowAddForm(true)}
              className="btn btn-success"
              disabled={showAddForm || editingSweet !== null}
            >
              ➕ Add New Seed
            </button>
          </div>
        </div>

        {/* Add Form Modal */}
        {showAddForm && (
          <div className="modal-overlay" onClick={() => setShowAddForm(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Add New Seed</h2>
                <button className="modal-close" onClick={() => setShowAddForm(false)}>×</button>
              </div>
              <AddSeedForm
                onSuccess={handleAddSuccess}
                onCancel={() => setShowAddForm(false)}
              />
            </div>
          </div>
        )}

        {/* Edit Form Modal */}
        {editingSweet && (
          <div className="modal-overlay" onClick={() => setEditingSweet(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Edit Seed</h2>
                <button className="modal-close" onClick={() => setEditingSweet(null)}>×</button>
              </div>
              <EditSeedForm
                seed={editingSweet as any}
                onSuccess={handleEditSuccess}
                onCancel={() => setEditingSweet(null)}
              />
            </div>
          </div>
        )}

        {/* Search and Filter */}
        <div className="search-filter-container fade-in">
          <h2 className="search-filter-title">Search & Filter</h2>
          <div className="search-filter-controls">
            <div className="form-group search-input">
              <input
                type="text"
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="form-group" style={{ minWidth: '200px' }}>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Sweets Table */}
        <div className="card fade-in">
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-tertiary)', borderBottom: '2px solid var(--border-color)' }}>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '700' }}>Name</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '700' }}>Category</th>
                  <th style={{ padding: '12px', textAlign: 'right', fontWeight: '700' }}>Price</th>
                  <th style={{ padding: '12px', textAlign: 'right', fontWeight: '700' }}>Stock</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontWeight: '700' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSeeds.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      {seeds.length === 0 ? 'No seeds found. Add your first seed!' : 'No seeds match your search.'}
                    </td>
                  </tr>
                ) : (
                  filteredSeeds.map((seed) => (
                    <tr key={seed.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '12px', fontWeight: '600' }}>{seed.name}</td>
                      <td style={{ padding: '12px' }}>
                        <span className="seed-card-category">{seed.category}</span>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right', fontWeight: '700', color: 'var(--success-color)' }}>
                        ₹{seed.price.toFixed(2)}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        <span className={`stock-badge ${seed.quantity === 0 ? 'out-of-stock' :
                            seed.quantity < 10 ? 'low-stock' : 'in-stock'
                          }`}>
                          {seed.quantity}
                        </span>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                          <button
                            onClick={() => setEditingSweet(seed as any)}
                            className="btn btn-primary"
                            style={{ padding: '6px 12px', fontSize: '14px' }}
                            title="Edit"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleRestock(seed.id, seed.quantity, seed.name)}
                            className="btn btn-success"
                            style={{ padding: '6px 12px', fontSize: '14px' }}
                            title="Restock"
                          >
                            📦 Restock
                          </button>
                          <button
                            onClick={() => handleDelete(seed.id, seed.name)}
                            className="btn btn-danger"
                            style={{ padding: '6px 12px', fontSize: '14px' }}
                            title="Delete"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard

