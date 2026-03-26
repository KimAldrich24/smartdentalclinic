export const USE_LOCAL_BACKEND = true; // Set to true for local development, false for production

export const backendUrl = USE_LOCAL_BACKEND
  ? "http://localhost:4000"
  : "https://smartclinic-backend-1.onrender.com";