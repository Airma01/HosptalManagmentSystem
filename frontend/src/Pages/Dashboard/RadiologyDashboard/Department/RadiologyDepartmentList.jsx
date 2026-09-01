import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../../../../Config/API';
import LoadingSpinner from '../Components/LoadingSpinner';

export default function RadiologyDepartmentList() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get('/radiology/RadiologyDepartment');
      setRows(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load departments.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center gap-3">
        <h2 className="text-xl font-bold">Radiology Departments</h2>
        <Link to="/radiology/departments/create" className="px-3 py-2 rounded-lg bg-indigo-600 text-white text-sm">Add Department</Link>
      </div>
      {loading ? <LoadingSpinner /> : error ? (
        <div className="text-sm text-red-600">{error}</div>
      ) : (
        <div className="bg-white border rounded-xl overflow-hidden">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Test Types</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((d) => (
                <tr key={d.radiologyDepartmentID}>
                  <td className="px-4 py-3">{d.radiologyDepartmentID}</td>
                  <td className="px-4 py-3 font-medium">{d.departmentName}</td>
                  <td className="px-4 py-3">{d.description}</td>
                  <td className="px-4 py-3">{d.testTypeCount}</td>
                  <td className="px-4 py-3 space-x-2">
                    <Link to={`/radiology/departments/${d.radiologyDepartmentID}`} className="text-indigo-600">View</Link>
                    <Link to={`/radiology/departments/${d.radiologyDepartmentID}/edit`} className="text-gray-600">Edit</Link>
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
