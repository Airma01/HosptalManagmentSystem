import PatientInfo from '../Components/PatientInfo';

/** Thin wrapper — patient block is rendered from request/result DTOs */
export default function RadiologistPatient({ data }) {
  return <PatientInfo data={data} />;
}
