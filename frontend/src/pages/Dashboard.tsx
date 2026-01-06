import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import CartSidebar from '../components/CartSidebar'
import api from '../services/api'
import '../App.css'

interface Seed {
  id: number
  name: string
  category: string
  price: number
  quantity: number
  image?: string
}

const Dashboard = () => {
  const { user, logout } = useAuth()
  const { addToCart, cartItems, getTotalItems } = useCart()
  const [seeds, setSeeds] = useState<Seed[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [showCart, setShowCart] = useState(false)

  useEffect(() => {
    fetchSeeds()
  }, [])

  const fetchSeeds = async () => {
    try {
      setLoading(true)
      setError('')

      // Check token before making request
      const token = localStorage.getItem('token')
      if (!token) {
        console.error('No token found in localStorage')
        setError('Not authenticated. Please login.')
        setTimeout(() => {
          window.location.href = '/login'
        }, 1000)
        return
      }

      console.log('Fetching seeds from API...')
      console.log('Token present (first 20 chars):', token.substring(0, 20) + '...')

      const response = await api.get('/seeds')
      console.log('Seeds response:', response.data)

      if (response.data && Array.isArray(response.data)) {
        // Deduplicate seeds by name (case-insensitive) to avoid repeated entries
        const uniq = Array.from(
          new Map(response.data.map((s: any) => [s.name.toLowerCase(), s])).values()
        )
        setSeeds(uniq)
        console.log(`✅ Loaded ${uniq.length} unique seeds successfully`)
      } else {
        console.error('Invalid response format:', response.data)
        setError('Invalid response from server')
      }
    } catch (err: any) {
      console.error('❌ Error fetching seeds:', err)
      console.error('Error details:', {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        message: err.message,
        config: {
          url: err.config?.url,
          method: err.config?.method,
          headers: err.config?.headers
        }
      })

      // Handle 401 errors - token might be invalid
      if (err.response?.status === 401) {
        const errorDetail = err.response?.data?.detail || 'Unauthorized'
        console.error('❌ 401 Unauthorized:', errorDetail)
        console.error('Token from localStorage:', localStorage.getItem('token')?.substring(0, 30) + '...')

        setError(`Authentication failed: ${errorDetail}. Please login again.`)
        // Clear token and user state
        localStorage.removeItem('token')
        // Redirect to login after a short delay
        setTimeout(() => {
          window.location.href = '/login'
        }, 3000)
        return
      }
      // For other errors, show the error message
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to fetch seeds'
      setError(errorMsg)
      console.error('Error message:', errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const handlePurchase = async (seedId: number) => {
    try {
      const response = await api.post(`/seeds/${seedId}/purchase`)
      // Update the seed in the list
      setSeeds(seeds.map(s => s.id === seedId ? response.data : s))
      const seed = seeds.find(s => s.id === seedId)
      showToast(`${seed?.name || 'Item'} purchased successfully!`, 'success')
    } catch (err: any) {
      showToast(err.response?.data?.detail || 'Purchase failed', 'error')
    }
  }

  const handleAddToCart = (seed: Seed) => {
    if (seed.quantity === 0) {
      showToast('This seed is out of stock!', 'error')
      return
    }
    addToCart(seed)
    showToast(`${seed.name} added to cart!`, 'success')
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

  const getCartQuantity = (seedId: number) => {
    const cartItem = cartItems.find(item => item.id === seedId)
    return cartItem ? cartItem.cartQuantity : 0
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
            <h1 className="app-title">🌱 Seed Shop</h1>
            <div className="header-actions">
              <span className="welcome-text">Welcome, {user?.email}</span>
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
          <h1 className="app-title">🌱 Seed Shop</h1>
          <div className="header-actions">
            <span className="welcome-text">Welcome, {user?.email}</span>
            {user?.role === 'admin' && (
              <Link
                to="/admin"
                className="btn btn-outline"
                style={{ textDecoration: 'none', marginRight: '12px' }}
              >
                ⚙️ Admin Panel
              </Link>
            )}
            <button
              onClick={() => setShowCart(!showCart)}
              className="btn cart-button"
            >
              🛒 Cart
              {getTotalItems() > 0 && (
                <span className="cart-badge">
                  {getTotalItems()}
                </span>
              )}
            </button>
            <button onClick={logout} className="btn btn-danger">Logout</button>
          </div>
        </div>
      </header>

      <div className="container">
        {showCart && (
          <CartSidebar
            onClose={() => setShowCart(false)}
            seeds={seeds}
            setSeeds={setSeeds}
          />
        )}

        {error && (
          <div className="card error fade-in">
            <strong>Error:</strong> {error}
            {error.includes('Session expired') || error.includes('Authentication failed') ? (
              <div style={{ marginTop: '16px' }}>
                <p>Redirecting to login page...</p>
                <button
                  onClick={() => {
                    localStorage.removeItem('token')
                    window.location.href = '/login'
                  }}
                  className="btn btn-primary"
                  style={{ marginTop: '12px' }}
                >
                  Go to Login
                </button>
              </div>
            ) : (
              <button
                onClick={fetchSeeds}
                className="btn btn-primary"
                style={{ marginTop: '12px' }}
              >
                Retry
              </button>
            )}
          </div>
        )}

        {!error && seeds.length === 0 && (
          <div className="empty-state fade-in">
            <div className="empty-state-icon">🌱</div>
            <h2 className="empty-state-title">No Seeds Available</h2>
            <p className="empty-state-description">
              The database might be empty or there was an issue loading seeds.
            </p>
            <button onClick={fetchSeeds} className="btn btn-primary">
              Refresh
            </button>
          </div>
        )}

        {!error && seeds.length > 0 && (
          <>
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

            <div className="seeds-grid">
              {filteredSeeds.map((seed, index) => (
                <div
                  key={seed.id}
                  className="seed-card fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="seed-card-header">
                    <div className="seed-card-image">
                      {seed.image ? (
                        <img src={seed.image} alt={seed.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                      ) : (
                        <span>🌱</span>
                      )}
                    </div>
                    <div>
                      <h3 className="seed-card-title">{seed.name}</h3>
                      <div className="seed-card-category">{seed.category}</div>
                    </div>
                  </div>

                  <div className="seed-card-price">
                    <span>₹</span>
                    <span>{seed.price.toFixed(2)}</span>
                  </div>

                  <div className={`seed-card-stock stock-badge ${seed.quantity === 0 ? 'out-of-stock' :
                    seed.quantity < 10 ? 'low-stock' : 'in-stock'
                    }`}>
                    <span>Stock:</span>
                    <strong>{seed.quantity}</strong>
                  </div>

                  <div className="seed-card-actions">
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <button
                        onClick={() => handleAddToCart(seed)}
                        className="btn btn-primary"
                        disabled={seed.quantity === 0}
                        style={{ flex: 1 }}
                      >
                        {seed.quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                      </button>
                      {getCartQuantity(seed.id) > 0 && (
                        <span className="cart-quantity-badge">
                          {getCartQuantity(seed.id)} in cart
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handlePurchase(seed.id)}
                      className="btn btn-success"
                      disabled={seed.quantity === 0}
                      style={{ width: '100%' }}
                    >
                      {seed.quantity === 0 ? 'Out of Stock' : '⚡ Order Now'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredSeeds.length === 0 && seeds.length > 0 && (
              <div className="empty-state fade-in">
                <div className="empty-state-icon">🔍</div>
                <h2 className="empty-state-title">No Seeds Found</h2>
                <p className="empty-state-description">
                  Try clearing your search or selecting a different category.
                </p>
                <button
                  onClick={() => {
                    setSearchTerm('')
                    setCategoryFilter('')
                  }}
                  className="btn btn-primary"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Dashboard

