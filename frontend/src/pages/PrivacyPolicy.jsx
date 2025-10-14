import React from "react";
import Modal from "../components/Modal.jsx";

const PrivacyPolicy = ({ isOpen, onClose }) => {
    return (
      <Modal isOpen={isOpen} onClose={onClose}>
        <div className="text-gray-700">
          <h1 className="text-2xl font-semibold mb-6 text-gray-800">
            Privacy Policy
          </h1>
          <p className="mb-4">
            At <strong>Smart Dental Clinic</strong>, we value your privacy. This
            policy outlines how we collect, use, and protect your information when
            you use our services.
          </p>
          <h2 className="text-lg font-semibold mt-6 mb-2">1. Information We Collect</h2>
          <p className="mb-4">
            We may collect personal details such as your name, contact information,
            and medical history to provide better care and manage your appointments.
          </p>
          <h2 className="text-lg font-semibold mt-6 mb-2">2. How We Use Your Information</h2>
          <p className="mb-4">
            Your information is used strictly for appointment scheduling, medical
            care, and communication between patients and doctors. We never sell your
            data to third parties.
          </p>
          <h2 className="text-lg font-semibold mt-6 mb-2">3. Data Protection</h2>
          <p className="mb-4">
            We use secure systems and encrypted connections to protect your data
            from unauthorized access or misuse.
          </p>
          <h2 className="text-lg font-semibold mt-6 mb-2">4. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at{" "}
            <a
              href="mailto:kimaldrichordiz@gmail.com"
              className="text-secondary hover:underline"
            >
              kimaldrichordiz@gmail.com
            </a>.
          </p>
        </div>
      </Modal>
    );
  };
  
  export default PrivacyPolicy;