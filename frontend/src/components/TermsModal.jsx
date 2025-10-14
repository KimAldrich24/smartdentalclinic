import React, { useEffect, useState } from "react";

const TermsModal = ({ isOpen, onClose }) => {
  const [showModal, setShowModal] = useState(isOpen);

  // Animate open/close transition
  useEffect(() => {
    if (isOpen) {
      setShowModal(true);
    } else {
      const timer = setTimeout(() => setShowModal(false), 250);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!showModal && !isOpen) return null;

  return (
    <div
      className={`fixed inset-0 flex justify-center items-center z-50 transition-opacity duration-300 ${
        isOpen ? "bg-black bg-opacity-50 opacity-100" : "opacity-0"
      }`}
    >
      <div
        className={`bg-white max-w-3xl w-full mx-4 rounded-2xl shadow-xl overflow-y-auto max-h-[85vh] p-6 transform transition-all duration-300 ${
          isOpen ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h2 className="text-2xl font-semibold text-gray-800">
            Terms and Conditions
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 text-2xl font-bold transition-transform hover:scale-110"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="text-gray-700 space-y-5 leading-relaxed">
          <p>
            Welcome to <strong>Smart Dental Clinic</strong>. By accessing or
            using our website and services, you agree to comply with these Terms
            and Conditions. Please read them carefully before using our
            platform.
          </p>

          <h3 className="font-semibold text-lg">1. Use of Our Website</h3>
          <p>
            Our website is designed to provide information about our dental
            services and allow patients to schedule appointments. You agree to
            use it only for lawful purposes and not to disrupt its operation.
          </p>

          <h3 className="font-semibold text-lg">2. Appointments and Payments</h3>
          <p>
            Appointments can be booked through our online system. Any
            cancellations or rescheduling should follow our clinic’s policy.
            Payments made for services are non-refundable unless otherwise
            stated.
          </p>

          <h3 className="font-semibold text-lg">3. Intellectual Property</h3>
          <p>
            All content, including text, images, logos, and design elements, are
            the property of Smart Dental Clinic. You may not copy, reproduce, or
            distribute any content without our written permission.
          </p>

          <h3 className="font-semibold text-lg">4. Limitation of Liability</h3>
          <p>
            Smart Dental Clinic will not be held responsible for any damages
            resulting from the use of our website, including technical errors or
            service interruptions.
          </p>

          <h3 className="font-semibold text-lg">5. Privacy Policy</h3>
          <p>
            Please review our <strong>Privacy Policy</strong> to understand how
            we collect and use your personal information.
          </p>

          <h3 className="font-semibold text-lg">6. Changes to These Terms</h3>
          <p>
            We may update these Terms and Conditions from time to time.
            Continued use of our website after changes indicates your acceptance
            of the new terms.
          </p>

          <h3 className="font-semibold text-lg">7. Contact Us</h3>
          <p>
            For any questions regarding these Terms, please contact us at{" "}
            <a
              href="mailto:kimaldrichordiz@gmail.com"
              className="text-blue-600 hover:underline font-medium"
            >
              kimaldrichordiz@gmail.com
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsModal;
