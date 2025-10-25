import React, { useState, useEffect, useContext } from "react";
import { AdminContext } from "../../context/AdminContext";
import { toast } from "react-toastify";
import { Users, Plus, Edit2, Trash2, Eye, EyeOff } from "lucide-react";

const StaffManagement = () => {
  const { aToken, backendUrl } = useContext(AdminContext);
  const [staffList, setStaffList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentStaff, setCurrentStaff] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    status: "active"
  });

  useEffect(() => {
    if (aToken) {
      fetchStaffList();
    }
  }, [aToken]);

  const fetchStaffList = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/admin/staff`, {
        headers: { Authorization: `Bearer ${aToken}` }
      });
      const data = await res.json();
      if (data.success) {
        setStaffList(data.staff);
      }
    } catch (error) {
      console.error("Error fetching staff:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const url = editMode 
        ? `${backendUrl}/api/admin/staff/${currentStaff._id}`
        : `${backendUrl}/api/admin/staff`;
      
      const method = editMode ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${aToken}`
        },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      
      if (data.success) {
        toast.success(data.message);
        fetchStaffList();
        closeModal();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to deactivate this staff member?")) {
      return;
    }
    
    try {
      const res = await fetch(`${backendUrl}/api/admin/staff/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${aToken}` }
      });
      
      const data = await res.json();
      
      if (data.success) {
        toast.success(data.message);
        fetchStaffList();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const openAddModal = () => {
    setEditMode(false);
    setCurrentStaff(null);
    setFormData({
      name: "",
      email: "",
      password: "",
      phone: "",
      status: "active"
    });
    setShowModal(true);
  };

  const openEditModal = (staff) => {
    setEditMode(true);
    setCurrentStaff(staff);
    setFormData({
      name: staff.name,
      email: staff.email,
      password: "",
      phone: staff.phone || "",
      status: staff.status
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditMode(false);
    setCurrentStaff(null);
    setShowPassword(false);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Staff Management</h1>
          <p className="text-gray-600 mt-1">Manage clinic staff accounts</p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-700 transition"
        >
          <Plus size={20} />
          Add Staff
        </button>
      </div>

      {/* Staff List Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-4 font-semibold text-gray-700">Name</th>
              <th className="text-left p-4 font-semibold text-gray-700">Email</th>
              <th className="text-left p-4 font-semibold text-gray-700">Phone</th>
              <th className="text-left p-4 font-semibold text-gray-700">Status</th>
              <th className="text-left p-4 font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {staffList.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center p-8 text-gray-500">
                  No staff members found. Add your first staff member!
                </td>
              </tr>
            ) : (
              staffList.map((staff) => (
                <tr key={staff._id} className="border-b hover:bg-gray-50">
                  <td className="p-4">{staff.name}</td>
                  <td className="p-4">{staff.email}</td>
                  <td className="p-4">{staff.phone || "N/A"}</td>
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        staff.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {staff.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(staff)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(staff._id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editMode ? "Edit Staff Member" : "Add New Staff Member"}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Password {editMode && "(leave empty to keep current)"}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required={!editMode}
                    className="w-full border rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-purple-400 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-400 outline-none"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700"
                >
                  {editMode ? "Update" : "Create"}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManagement;