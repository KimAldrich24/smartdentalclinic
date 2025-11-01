import fetch from 'node-fetch';

export const sendSMS = async (phone, message) => {
  try {
    // Format number (e.g., 0928... → 63928...)
    const formattedNumber = phone.replace(/^0/, "63");

    const token = process.env.IPROGTECH_API_KEY;
    if (!token) throw new Error("Missing SMS API key (check your .env)");

    const url = `https://sms.iprogtech.com/api/v1/sms_messages?api_token=${token}&message=${encodeURIComponent(
      message
    )}&phone_number=${formattedNumber}`;

    // ✅ iProgTech expects POST with NO body or JSON — only query params
    const response = await fetch(url, { method: "POST" });
    const data = await response.json();

    console.log("📩 SMS API Response:", data);

    if (data.status === 200) {
      console.log(`✅ SMS sent successfully to: ${formattedNumber}`);
      return { success: true, data };
    } else {
      console.error("❌ SMS API returned error:", data);
      return { success: false, data };
    }
  } catch (error) {
    console.error("❌ SMS sending failed:", error.message);
    return { success: false, error: error.message };
  }
};


export const formatAppointmentConfirmationSMS = (
  patientName,
  doctorName,
  serviceName,
  date,
  time,
  price
) => {
  return `Hi ${patientName},\n\nThis is Dr. ${doctorName} from Smart Dental Clinic.\nYour appointment has been successfully booked!\n\nDate: ${date}\nTime: ${time}\nService: ${serviceName}\nFee: ₱${price}\n\nWe're excited to see you soon. Thank you for choosing Smart Dental Clinic!`;
};


export const formatPaymentUpdateSMS = (
  patientName,
  additionalAmount,
  totalAmount,
  note
) => {
  return `Hi ${patientName},\n\nThis is Smart Dental Clinic with an update on your payment:\n\nAdditional Charge: ₱${additionalAmount}\n${note ? `Note: ${note}\n` : ''}Total Amount Due: ₱${totalAmount}\n\nThank you for your continued trust in our care!`;
};


