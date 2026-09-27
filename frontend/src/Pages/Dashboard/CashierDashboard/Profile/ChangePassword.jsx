import React, { useEffect } from "react";
import { useOutletContext } from "react-router-dom";

const ChangePassword = () => {
  const { setPageTitle } = useOutletContext() || {};
  useEffect(() => {
    setPageTitle?.("Change Password");
  }, []);

  return (
    <div className="max-w-md bg-white rounded-xl border shadow-sm p-6">
      <p className="text-sm text-gray-500">
        Password change will be available when the shared account API is ready.
        Contact admin to reset your password for now.
      </p>
    </div>
  );
};

export default ChangePassword;
