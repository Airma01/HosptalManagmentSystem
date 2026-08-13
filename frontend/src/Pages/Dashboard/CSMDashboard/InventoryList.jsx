import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../../Config/API';

const InventoryList = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const managerID = user?.managerID;

  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pharmacyId, setPharmacyId] = useState(null);

  useEffect(() => {
    const fetchPharmacyAndInventory = async () => {
      if (!managerID) {
        setLoading(false);
        return;
      }
      try {
        const pharmRes = await API.get(`/Hospital/Admin/get_central_pharmacy_by_manager/${managerID}`);
        const pharm = pharmRes.data;
        if (!pharm) {
          setLoading(false);
          return;
        }
        setPharmacyId(pharm.centralPharmacyID);

        const invRes = await API.get(`/Hospital/Admin/Get_Stock/${pharm.centralPharmacyID}`);
        setInventory(invRes.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPharmacyAndInventory();
  }, [managerID]);

  const handleDelete = async (inventoryId) => {
    if (!window.confirm('Delete this inventory item?')) return;
    try {
      await API.delete(`/Hospital/Admin/delete_inventory/${inventoryId}`);
      setInventory(inventory.filter(item => item.centralInventoryID !== inventoryId));
      alert('Deleted.');
    } catch (err) {
      console.error(err);
      alert('Failed to delete.');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (inventory.length === 0) return <p>No inventory items found.</p>;

  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">Inventory</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th>Medicine</th>
              <th>Quantity</th>
              <th>Expiry</th>
              <th>Batch</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((item) => (
              <tr key={item.centralInventoryID}>
                <td>{item.medicine?.medicineName || 'N/A'}</td>
                <td>{item.quantityAvailable}</td>
                <td>{item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : '—'}</td>
                <td>{item.batchNumber || '—'}</td>
                <td>
                  <button
                    onClick={() => handleDelete(item.centralInventoryID)}
                    className="text-red-600 hover:underline mr-2"
                  >
                    Delete
                  </button>
                  <Link
                    to={`/csm/update-inventory/${item.centralInventoryID}`}
                    className="text-blue-600 hover:underline"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryList;