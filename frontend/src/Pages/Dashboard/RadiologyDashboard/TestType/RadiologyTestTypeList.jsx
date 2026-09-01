import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../../../../Config/API';
import LoadingSpinner from '../Components/LoadingSpinner';

export default function RadiologyTestTypeList() {
  const [rows, setRows] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [departmentId, setDepartmentId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    API.get('/radiology/RadiologyDepartment').then((res) => setDepartments(res.data || [])).catch(() => {});
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const url = departmentId
        ? `/radiology/RadiologyTestType/by-department/${departmentId}`
        : '/radiology/RadiologyTestType';
      const res = await API.get(url);
      setRows(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load test types.');
    } finally {
      setLoading(false);
    }
  }, [departmentId]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-between gap-3">
        <h2 className="text-xl font-bold">Radiology Test Types</h2>
        <Link to="/radiology/test-types/create" className="px-3 py-2 rounded-lg bg-indigo-600 text-white text-sm">Add Test Type</Link>
      </div>
      <select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
        <option value="">All departments</option>
        {departments.map((d) => (
          <option key={d.radiologyDepartmentID} value={d.radiologyDepartmentID}>{d.departmentName}</option>
        ))}
      </select>
      {loading ? <LoadingSpinner /> : error ? (
        <div className="text-sm text-red-600">{error}</div>
      ) : (
        <div className="bg-white border rounded-xl overflow-hidden">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((t) => (
                <tr key={t.radiologyTestTypeID}>
                  <td className="px-4 py-3 font-medium">{t.testName}</td>
                  <td className="px-4 py-3">{t.departmentName}</td>
                  <td className="px-4 py-3">{t.price}</td>
                  <td className="px-4 py-3">
                    <Link to={`/radiology/test-types/${t.radiologyTestTypeID}/edit`} className="text-indigo-600">Edit</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
