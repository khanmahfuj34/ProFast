import { useContext } from 'react';
import { ParcelContext } from '../contexts/ParcelContext';

export const useParcel = () => {
  const context = useContext(ParcelContext);
  if (!context) {
    throw new Error('useParcel must be used within ParcelProvider');
  }
  return context;
};
