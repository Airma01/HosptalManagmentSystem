import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import API from '../../../../Config/API';
import LoadingSpinner from '../Components/LoadingSpinner';

export default function RadiologyTestTypeDetails() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get(`/radiology/RadiologyTestType/${id}`)
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (!data) return <div className="text-sm text-red-600">Not found</div>;
  return (
    <div className="bg-white border rounded-xl p-5 space-y-2 text-sm">
      <h2 className="text-xl font-bold">{data.testName}</h2>
      <p>Department: {data.departmentName}</p>
      <p>Price: {data.price}</p>
      <p>{data.description}</p>
    </div>
  );
}
