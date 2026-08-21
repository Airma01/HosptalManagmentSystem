import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import API from '../../../../Config/API';

const CreatePrescription = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preFilledPatientId = searchParams.get('patientId') || '';

  const [prescription, setPrescription] = useState({
    patientId: preFilledPatientId,
    branchPharmacyId: ''
  });
  const [medicines, setMedicines] = useState([]);
  const [branchPharmacies, setBranchPharmacies] = useState([]);
  const [currentMedicine, setCurrentMedicine] = useState({
    medicineId: '',
    dosage: '',
    frequency: '',
    duration: '',
    quantity: ''
  });
  const [addedMedicines, setAddedMedicines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (preFilledPatientId) {
      setPrescription(prev => ({ ...prev, patientId: preFilledPatientId }));
    }
  }, [preFilledPatientId]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [branchesRes, medsRes] = await Promise.all([
          API.get('/Hospital/nurse/Nurse/branch-pharmacies'),
          API.get('/Hospital/nurse/Nurse/medicines')
        ]);
        setBranchPharmacies(branchesRes.data);
        setMedicines(medsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setFetching(false);
      }
    };
    fetchData();
  }, []);

  const handlePrescriptionChange = (e) => {
    setPrescription({ ...prescription, [e.target.name]: e.target.value });
  };

  const handleMedicineChange = (e) => {
    setCurrentMedicine({ ...currentMedicine, [e.target.name]: e.target.value });
  };

  const addMedicine = () => {
    if (!currentMedicine.medicineId || !currentMedicine.dosage) {
      return alert('Select a medicine and enter dosage');
    }
    const med = medicines.find(m => m.medicineId === parseInt(currentMedicine.medicineId));
    const displayName = med ? med.medicineName : currentMedicine.medicineId;
    setAddedMedicines([
      ...addedMedicines,
      { ...currentMedicine, medicineDisplayName: displayName }
    ]);
    setCurrentMedicine({
      medicineId: '',
      dosage: '',
      frequency: '',
      duration: '',
      quantity: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (addedMedicines.length === 0) return alert('Add at least one medicine');
    setLoading(true);
    setError('');
    try {
      const res = await API.post('/Hospital/nurse/Nurse/prescription/create', prescription);
      const newId = res.data.prescriptionId;
      for (const med of addedMedicines) {
        await API.post(`/Hospital/nurse/Nurse/prescription/${newId}/medicine`, {
          prescriptionId: newId,
          medicineId: parseInt(med.medicineId),
          dosage: med.dosage,
          frequency: parseFloat(med.frequency) || 0,
          duration: parseFloat(med.duration) || 0,
          quantity: parseFloat(med.quantity) || 0
        });
      }
      alert('Prescription created with all medicines');
      navigate(`/nurse/prescriptions/${newId}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Creation failed');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="p-4 text-center">Loading data...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Create Prescription</h1>
      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow border">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium">Patient ID *</label>
            <input
              name="patientId"
              value={prescription.patientId}
              onChange={handlePrescriptionChange}
              required
              className="border p-2 w-full rounded"
            />
          </div>
          <div>
            <label className="block font-medium">Branch Pharmacy *</label>
            <select
              name="branchPharmacyId"
              value={prescription.branchPharmacyId}
              onChange={handlePrescriptionChange}
              required
              className="border p-2 w-full rounded"
            >
              <option value="">Select Pharmacy</option>
              {branchPharmacies.map((b) => (
                <option key={b.branchPharmacyID} value={b.branchPharmacyID}>
                  {b.branchName}
                </option>
              ))}
            </select>
          </div>
        </div>

        <h2 className="text-lg font-semibold mt-6">Add Medicines</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mt-2">
          <div>
            <label className="block text-sm font-medium">Medicine</label>
            <select
              name="medicineId"
              value={currentMedicine.medicineId}
              onChange={handleMedicineChange}
              className="border p-2 w-full rounded"
            >
              <option value="">Select Medicine</option>
              {medicines.map((m) => (
                <option key={m.medicineID} value={m.medicineID}>
                  {m.medicineName} {m.genericName ? `(${m.genericName})` : ''}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Dosage</label>
            <input
              name="dosage"
              placeholder="e.g., 500mg"
              value={currentMedicine.dosage}
              onChange={handleMedicineChange}
              className="border p-2 w-full rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Frequency</label>
            <input
              name="frequency"
              placeholder="e.g., 2"
              value={currentMedicine.frequency}
              onChange={handleMedicineChange}
              className="border p-2 w-full rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Duration</label>
            <input
              name="duration"
              placeholder="e.g., 7"
              value={currentMedicine.duration}
              onChange={handleMedicineChange}
              className="border p-2 w-full rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Quantity</label>
            <input
              name="quantity"
              placeholder="e.g., 10"
              value={currentMedicine.quantity}
              onChange={handleMedicineChange}
              className="border p-2 w-full rounded"
            />
          </div>
        </div>
        <button
          type="button"
          onClick={addMedicine}
          className="mt-2 bg-gray-500 text-white px-4 py-1 rounded hover:bg-gray-600"
        >
          Add Medicine
        </button>

        {addedMedicines.length > 0 && (
          <div className="mt-4">
            <h3 className="font-semibold">Medicines added:</h3>
            <ul className="list-disc pl-5">
              {addedMedicines.map((m, i) => (
                <li key={i}>
                  {m.medicineDisplayName} - {m.dosage}
                </li>
              ))}
            </ul>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Prescription'}
        </button>
      </form>
    </div>
  );
};

export default CreatePrescription;