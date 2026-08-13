import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../../Config/API';

const UpdateInventory = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [inventoryItem, setInventoryItem] = useState(null);
  const [formData, setFormData] = useState({
    quantityAvailable: '',
    expiryDate: '',
    batchNumber: '',
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const res = await API.get(`/Hospital/Admin/get_inventory_item/${id}`);
        const item = res.data;
        setInventoryItem(item);
        setFormData({
          quantityAvailable: item.quantityAvailable,
          expiryDate: item.expiryDate?.split('T')[0] || '',
          batchNumber: item.batchNumber || '',
        });
      } catch (err) {
        console.error(err);
        setMessage('Failed to load item.');
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');
    try {
      await API.put(`/Hospital/Admin/update_inventory/${id}`, {
        quantityAvailable: parseInt(formData.quantityAvailable),
        expiryDate: formData.expiryDate,
        batchNumber: formData.batchNumber,
      });
      setMessage('Inventory updated!');
      setTimeout(() => navigate('/csm/inventory'), 1500);
    } catch (err) {
      console.error(err);
      setMessage('Failed to update.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!inventoryItem) return <div>Item not found.</div>;

  return (
    <div className="max-w-lg mx-auto">
      <h3 className="text-lg font-semibold mb-4">Update Inventory Item</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="number"
          name="quantityAvailable"
          placeholder="Quantity"
          value={formData.quantityAvailable}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-lg"
          required
        />
        <input
          type="date"
          name="expiryDate"
          value={formData.expiryDate}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-lg"
          required
        />
        <input
          type="text"
          name="batchNumber"
          placeholder="Batch Number"
          value={formData.batchNumber}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-lg"
        />
        {message && (
          <div className={`p-2 rounded ${message.includes('success') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
            {message}
          </div>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="w-full btn btn-primary py-2 text-white rounded-lg"
          style={{ backgroundColor: '#4f46e5', border: 'none' }}
        >
          {submitting ? 'Updating...' : 'Update'}
        </button>
      </form>
    </div>
  );
};

export default UpdateInventory;