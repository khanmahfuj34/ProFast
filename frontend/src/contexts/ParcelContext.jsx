import React, { createContext, useState } from 'react';

export const ParcelContext = createContext();

export const ParcelProvider = ({ children }) => {
  const [parcelData, setParcelData] = useState(null);

  return (
    <ParcelContext.Provider value={{ parcelData, setParcelData }}>
      {children}
    </ParcelContext.Provider>
  );
};
