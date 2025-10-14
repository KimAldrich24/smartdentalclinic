import React, { useContext } from "react";
import { AdminContext } from "../../context/AdminContext";
import { User, Mail, Calendar, Shield } from "lucide-react";

const AdminProfile = () => {
  const { admin } = useContext(AdminContext) || {};

  return (
    <div className="bg-white shadow-md rounded-xl p-6 max-w-2xl mx-auto mt-6">
      <div className="flex flex-col items-center mb-6">
        <div className="bg-gray-100 p-4 rounded-full mb-3">
          <User size={64} className="text-gray-500" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-800">
          {admin?.name || "Admin User"}
        </h2>
        <p className="text-gray-500">{admin?.email || "admin@smartdental.com"}</p>
      </div>

      <div className="border-t pt-4 space-y-3 text-gray-700">
        <div className="flex items-center gap-2">
          <Mail className="text-blue-500" size={18} />
          <span><strong>Email:</strong> {admin?.email || "admin@smartdental.com"}</span>
        </div>
        <div className="flex items-center gap-2">
          <Shield className="text-green-500" size={18} />
          <span><strong>Role:</strong> Administrator</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="text-purple-500" size={18} />
          <span><strong>Joined:</strong> January 2025</span>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
