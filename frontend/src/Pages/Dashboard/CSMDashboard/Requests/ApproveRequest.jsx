import React from "react";
import { useNavigate } from "react-router-dom";

const ApproveRequest = () => {
  const navigate = useNavigate();
  React.useEffect(() => {
    navigate("/csm/requests", { replace: true });
  }, [navigate]);

  return (
    <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 rounded">
      Approval is handled from the Request Details page.
    </div>
  );
};

export default ApproveRequest;