import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface Seed {
  id: number
  name: string
  category: string
  price: number
  quantity: number
}

interface CartItem extends Seed {
  cartQuantity: number // Quantity in cart
}

interface CartContextType {
  cartItems: CartItem[]
  addToCart: (seed: Seed) => void
  removeFromCart: (seedId: number) => void
  updateCartQuantity: (seedId: number, quantity: number) => void
  clearCart: () => void
  getTotalPrice: () => number
  getTotalItems: () => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([])

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart))
      } catch (error) {
        console.error('Error loading cart from localStorage:', error)
      }
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems))
  }, [cartItems])

  const addToCart = (seed: Seed) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === seed.id)

      if (existingItem) {
        // If item exists, increase quantity (but don't exceed available stock)
        const newQuantity = Math.min(
          existingItem.cartQuantity + 1,
          seed.quantity // Don't exceed available stock
        )
        if (newQuantity > existingItem.cartQuantity) {
          return prevItems.map((item) =>
            item.id === seed.id
              ? { ...item, cartQuantity: newQuantity }
              : item
          )
        }
        return prevItems
      } else {
        // Add new item to cart
        if (seed.quantity > 0) {
          return [...prevItems, { ...seed, cartQuantity: 1 }]
        }
        return prevItems
      }
    })
  }
  const removeFromCart = (seedId: number) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== seedId))
  }

  const updateCartQuantity = (seedId: number, quantity: number) => {
    setCartItems((prevItems) => {
      return prevItems
        .map((item) => {
          if (item.id === seedId) {
            // Don't allow quantity more than available stock
            const maxQuantity = item.quantity
            const newQuantity = Math.min(Math.max(0, quantity), maxQuantity)
            return { ...item, cartQuantity: newQuantity }
          }
          return item
        })
        .filter((item) => item.cartQuantity > 0) // Remove items with 0 quantity
    })
  }

  const clearCart = () => {
    setCartItems([])
    localStorage.removeItem('cart')
  }

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + item.price * item.cartQuantity, 0)
  }

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.cartQuantity, 0)
  }

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        getTotalPrice,
        getTotalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}

