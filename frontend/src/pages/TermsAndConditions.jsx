import React from "react";

const TermsAndConditions = () => {
  return (
    <div className="max-w-3xl mx-auto py-10 text-gray-700">
      <h1 className="text-2xl font-semibold mb-6 text-gray-800">
        Terms and Conditions
      </h1>

      <p className="mb-4">
        Welcome to <strong>Smart Dental Clinic</strong>. By accessing or using
        our website and services, you agree to comply with these Terms and
        Conditions. Please read them carefully before using our platform.
      </p>

      <h2 className="text-lg font-semibold mt-6 mb-2">1. Use of Our Website</h2>
      <p className="mb-4">
        Our website is designed to provide information about our dental services
        and allow patients to schedule appointments. You agree to use it only
        for lawful purposes and not to disrupt its operation.
      </p>

      <h2 className="text-lg font-semibold mt-6 mb-2">2. Appointments and Payments</h2>
      <p className="mb-4">
        Appointments can be booked through our online system. Any cancellations
        or rescheduling should be done in accordance with our clinic’s policy.
        Payments made for services are non-refundable unless otherwise stated.
      </p>

      <h2 className="text-lg font-semibold mt-6 mb-2">3. Intellectual Property</h2>
      <p className="mb-4">
        All content, including text, images, logos, and design elements, are the
        property of Smart Dental Clinic. You may not copy, reproduce, or
        distribute any content without our written permission.
      </p>

      <h2 className="text-lg font-semibold mt-6 mb-2">4. Limitation of Liability</h2>
      <p className="mb-4">
        Smart Dental Clinic will not be held responsible for any damages
        resulting from the use of our website, including technical errors or
        service interruptions.
      </p>

      <h2 className="text-lg font-semibold mt-6 mb-2">5. Privacy Policy</h2>
      <p className="mb-4">
        Please review our <strong>Privacy Policy</strong> to understand how we
        collect and use your personal information.
      </p>

      <h2 className="text-lg font-semibold mt-6 mb-2">6. Changes to These Terms</h2>
      <p className="mb-4">
        We may update these Terms and Conditions from time to time. Continued
        use of our website after changes indicates your acceptance of the new
        terms.
      </p>

      <h2 className="text-lg font-semibold mt-6 mb-2">7. Contact Us</h2>
      <p>
        For any questions regarding these Terms, please contact us at{" "}
        <a
          href="mailto:kimaldrichordiz@gmail.com"
          className="text-secondary hover:underline"
        >
          kimaldrichordiz@gmail.com
        </a>.
      </p>
    </div>
  );
};

export default TermsAndConditions;
