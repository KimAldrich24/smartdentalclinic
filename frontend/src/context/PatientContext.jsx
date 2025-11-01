import { createContext, useState } from "react";

export const PatientContext = createContext();

const PatientContextProvider = ({ children }) => {
  const [aToken, setAToken] = useState(localStorage.getItem("aToken") || null);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  return (
    <PatientContext.Provider value={{ aToken, backendUrl }}>
      {children}
    </PatientContext.Provider>
  );
};

export default PatientContextProvider;
