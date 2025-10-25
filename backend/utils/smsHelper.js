import fetch from 'node-fetch';

export const sendSMS = async (phone, message) => {
  try {
    const response = await fetch('https://sms.iprogtech.com/api/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        apikey: process.env.SMS_API_KEY,
        number: phone,
        message: message,
      })
    });

    const data = await response.json();
    console.log('SMS sent successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('SMS sending failed:', error);
    return { success: false, error: error.message };
  }
};

export const formatAppointmentConfirmationSMS = (patientName, doctorName, serviceName, date, time, price) => {
  return `Hello ${patientName}!\n\nYour appointment has been confirmed:\n\n📅 Date: ${date}\n⏰ Time: ${time}\n👨‍⚕️ Doctor: ${doctorName}\n💉 Service: ${serviceName}\n💰 Payment: ₱${price}\n\nThank you for choosing our clinic!`;
};

export const formatPaymentUpdateSMS = (patientName, additionalAmount, totalAmount, note) => {
  return `Hello ${patientName}!\n\nPayment Update:\n\n💰 Additional Charge: ₱${additionalAmount}\n${note ? `📝 Note: ${note}\n` : ''}💳 Total Amount: ₱${totalAmount}\n\nThank you!`;
};