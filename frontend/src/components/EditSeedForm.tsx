import { useState, useEffect } from 'react'
import api from '../services/api'
import '../App.css'

interface Seed {
    id: number
    name: string
    category: string
    price: number
    quantity: number
}

interface EditSeedFormProps {
    seed: Seed
    onSuccess: (seed: Seed) => void
    onCancel: () => void
}

const EditSeedForm = ({ seed, onSuccess, onCancel }: EditSeedFormProps) => {
    const [formData, setFormData] = useState({
        name: seed.name,
        category: seed.category,
        price: seed.price.toString(),
        quantity: seed.quantity.toString()
    })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        setFormData({
            name: seed.name,
            category: seed.category,
            price: seed.price.toString(),
            quantity: seed.quantity.toString()
        })
    }, [seed])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            if (!formData.name || !formData.category || !formData.price) {
                setError('Please fill in all required fields')
                setLoading(false)
                return
            }

            const price = parseFloat(formData.price)
            const quantity = parseInt(formData.quantity) || 0

            if (isNaN(price) || price <= 0) {
                setError('Price must be a positive number')
                setLoading(false)
                return
            }

            if (quantity < 0) {
                setError('Quantity cannot be negative')
                setLoading(false)
                return
            }

            const payload = {
                name: formData.name.trim(),
                category: formData.category.trim(),
                price: price,
                quantity: quantity
            }

            const response = await api.put(`/seeds/${seed.id}`, payload)
            onSuccess(response.data)
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to update seed')
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    return (
        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
            <div className="form-group">
                <label>Seed Name *</label>
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g., Sunflower Seed"
                    required
                    disabled={loading}
                />
            </div>

            <div className="form-group">
                <label>Category *</label>
                <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    disabled={loading}
                >
                    <option value="">Select Category</option>
                    <option value="Flower">Flower</option>
                    <option value="Vegetable">Vegetable</option>
                    <option value="Herb">Herb</option>
                    <option value="Spice">Spice</option>
                    <option value="Superfood">Superfood</option>
                </select>
            </div>

            <div className="form-group">
                <label>Price (₹) *</label>
                <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="e.g., 30.00"
                    step="0.01"
                    min="0.01"
                    required
                    disabled={loading}
                />
            </div>

            <div className="form-group">
                <label>Stock Quantity</label>
                <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    placeholder="e.g., 50"
                    min="0"
                    disabled={loading}
                />
            </div>

            {error && <div className="error">{error}</div>}

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button
                    type="submit"
                    className="btn btn-success"
                    disabled={loading}
                    style={{ flex: 1 }}
                >
                    {loading ? (
                        <>
                            <span className="loading-spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></span>
                            Updating...
                        </>
                    ) : (
                        '💾 Save Changes'
                    )}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="btn btn-outline"
                    disabled={loading}
                >
                    Cancel
                </button>
            </div>
        </form>
    )
}

export default EditSeedForm
