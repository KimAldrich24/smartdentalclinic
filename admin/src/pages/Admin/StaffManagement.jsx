import React, { useState, useEffect, useContext } from "react";
import { AdminContext } from "../../context/AdminContext";
import { toast } from "react-toastify";
import { Plus, Edit2, Trash2, Eye, EyeOff } from "lucide-react";

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
    status: "active",
  });

  /* ================= FETCH STAFF ================= */
  useEffect(() => {
    if (aToken) fetchStaffList();
  }, [aToken]);

  const fetchStaffList = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/admin/staff`, {
        headers: { Authorization: `Bearer ${aToken}` },
      });
      const data = await res.json();
      if (data.success) setStaffList(data.staff);
    } catch (err) {
      toast.error("Failed to fetch staff");
    }
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Required fields
    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.phone.trim()
    ) {
      toast.error("All fields are required");
      return;
    }

    // Password required only on create
    if (!editMode && !formData.password.trim()) {
      toast.error("Password is required");
      return;
    }

    // Phone validation
    if (!/^[0-9]+$/.test(formData.phone)) {
      toast.error("Phone number must contain only digits");
      return;
    }

    // Gmail-only validation
    if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(formData.email)) {
      toast.error("Email must be a valid @gmail.com address");
      return;
    }

    try {
      const url = editMode
        ? `${backendUrl}/api/admin/staff/${currentStaff._id}`
        : `${backendUrl}/api/admin/staff`;

      const method = editMode ? "PUT" : "POST";

      const payload = { ...formData };

      // Do not send empty password on edit
      if (editMode && !payload.password) {
        delete payload.password;
      }

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${aToken}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(data.message);
        fetchStaffList();
        closeModal();
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("An error occurred");
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to deactivate this staff member?")) return;

    try {
      const res = await fetch(`${backendUrl}/api/admin/staff/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${aToken}` },
      });

      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        fetchStaffList();
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("An error occurred");
    }
  };

  /* ================= MODAL ================= */
  const openAddModal = () => {
    setEditMode(false);
    setCurrentStaff(null);
    setFormData({
      name: "",
      email: "",
      password: "",
      phone: "",
      status: "active",
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
      status: staff.status,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditMode(false);
    setCurrentStaff(null);
    setShowPassword(false);
  };

  /* ================= UI ================= */
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Receptionist Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage Clinic Receptionist Accounts
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-700"
        >
          <Plus size={18} /> Add Staff
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 text-left">Name</th>
              <th className="p-4 text-left">Email</th>
              <th className="p-4 text-left">Phone</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {staffList.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-gray-500">
                  No staff members found
                </td>
              </tr>
            ) : (
              staffList.map((staff) => (
                <tr key={staff._id} className="border-b hover:bg-gray-50">
                  <td className="p-4">{staff.name}</td>
                  <td className="p-4">{staff.email}</td>
                  <td className="p-4">{staff.phone}</td>
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${staff.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                        }`}
                    >
                      {staff.status}
                    </span>
                  </td>
                  <td className="p-4 flex gap-2">
                    <button onClick={() => openEditModal(staff)}>
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => handleDelete(staff._id)}>
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editMode ? "Edit Staff Member" : "Add New Staff Member"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Name"
                value={formData.name}
                onChange={(e) => {
                  const lettersOnly = e.target.value.replace(/[^a-zA-Z\s]/g, "");
                  setFormData({ ...formData, name: lettersOnly });
                }}
                onKeyDown={(e) => {
                  if (
                    !/[a-zA-Z\s]/.test(e.key) &&
                    e.key !== "Backspace" &&
                    e.key !== "Delete" &&
                    e.key !== "ArrowLeft" &&
                    e.key !== "ArrowRight" &&
                    e.key !== "Tab"
                  ) {
                    e.preventDefault();
                  }
                }}
                required
                className="w-full border px-3 py-2 rounded"
              />

              <input
                type="email"
                placeholder="Email (@gmail.com)"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
                className="w-full border px-3 py-2 rounded"
              />

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder={
                    editMode ? "Leave empty to keep password" : "Password"
                  }
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required={!editMode}
                  className="w-full border px-3 py-2 rounded pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <input
                type="tel"
                placeholder="Phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    phone: e.target.value.replace(/[^0-9]/g, ""),
                  })
                }
                required
                className="w-full border px-3 py-2 rounded"
              />

              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                className="w-full border px-3 py-2 rounded"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-purple-600 text-white py-2 rounded"
                >
                  {editMode ? "Update" : "Create"}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 bg-gray-200 py-2 rounded"
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