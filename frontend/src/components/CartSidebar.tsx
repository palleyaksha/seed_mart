import { useState } from 'react'
import { useCart } from '../context/CartContext'
import api from '../services/api'
import './CartSidebar.css'

interface Seed {
  id: number
  name: string
  category: string
  price: number
  quantity: number
}

interface CartSidebarProps {
  onClose: () => void
  seeds: Seed[]
  setSeeds: React.Dispatch<React.SetStateAction<Seed[]>>
}

const CartSidebar = ({ onClose, seeds: _seeds, setSeeds }: CartSidebarProps) => {
  const { cartItems, removeFromCart, updateCartQuantity, clearCart, getTotalPrice, getTotalItems } = useCart()
  const [ordering, setOrdering] = useState(false)

  const handleOrder = async () => {
    if (cartItems.length === 0) {
      alert('Your cart is empty!')
      return
    }

    setOrdering(true)
    try {
      // Process each item in cart
      const orderPromises = cartItems.map(async (item) => {
        // Purchase each item based on cart quantity
        for (let i = 0; i < item.cartQuantity; i++) {
          await api.post(`/seeds/${item.id}/purchase`)
        }
      })

      await Promise.all(orderPromises)

      // Refresh seeds list
      const response = await api.get('/seeds')
      setSeeds(response.data)

      // Clear cart
      clearCart()

      alert(`Order placed successfully! Total: ₹${getTotalPrice().toFixed(2)}`)
      onClose()
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Order failed. Please try again.')
    } finally {
      setOrdering(false)
    }
  }

  return (
    <div className="cart-overlay" onClick={onClose}>
      <div className="cart-sidebar" onClick={(e) => e.stopPropagation()}>
        <div className="cart-header">
          <h2>🛒 Shopping Cart</h2>
          <button onClick={onClose} className="cart-close-btn">×</button>
        </div>

        <div className="cart-content">
          {cartItems.length === 0 ? (
            <div className="cart-empty">
              <div className="cart-empty-icon">🛒</div>
              <h3 className="cart-empty-title">Your Cart is Empty</h3>
              <p className="cart-empty-description">Add some lovely seeds to get started!</p>
            </div>
          ) : (
            <>
              <div className="cart-items">
                {cartItems.map((item) => (
                  <div key={item.id} className="cart-item">
                    <div className="cart-item-info">
                      <h4>{item.name}</h4>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{item.category}</p>
                      <p className="cart-item-price">
                        ₹{item.price.toFixed(2)} each
                      </p>
                    </div>
                    <div className="cart-item-controls">
                      <div className="quantity-controls">
                        <button
                          onClick={() => updateCartQuantity(item.id, item.cartQuantity - 1)}
                          className="qty-btn"
                        >
                          −
                        </button>
                        <span className="qty-value">{item.cartQuantity}</span>
                        <button
                          onClick={() => updateCartQuantity(item.id, item.cartQuantity + 1)}
                          className="qty-btn"
                          disabled={item.cartQuantity >= item.quantity}
                        >
                          +
                        </button>
                      </div>
                      <p className="cart-item-total">
                        ₹{(item.price * item.cartQuantity).toFixed(2)}
                      </p>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="remove-btn"
                        title="Remove from cart"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="cart-summary">
                <div className="cart-summary-row">
                  <span>Total Items:</span>
                  <span>{getTotalItems()}</span>
                </div>
                <div className="cart-summary-row">
                  <span>Total Price:</span>
                  <span>₹{getTotalPrice().toFixed(2)}</span>
                </div>
              </div>

              <div className="cart-actions">
                <button onClick={clearCart} className="btn btn-danger">
                  🗑️ Clear Cart
                </button>
                <button
                  onClick={handleOrder}
                  className="btn btn-success"
                  disabled={ordering || cartItems.length === 0}
                >
                  {ordering ? (
                    <>
                      <span className="loading-spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></span>
                      Placing Order...
                    </>
                  ) : (
                    `💳 Place Order (₹${getTotalPrice().toFixed(2)})`
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default CartSidebar

