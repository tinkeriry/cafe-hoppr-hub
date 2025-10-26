import React, { createContext, useContext, useState, ReactNode } from 'react';

interface CafeFormData {
  // Page 1 - Basic Info
  name: string;
  cafe_photo: string;
  cafe_location_link: string;
  review: string;
  star_rating: number;
  
  // Page 2 - Details
  price: number;
  wifi: number;
  seat_comfort: number;
  electricity_socket: number;
  food_beverage: number;
  praying_room: number;
  hospitality: number;
  toilet: number;
  noise: number;
  parking: number;
}

interface CafeFormContextType {
  formData: CafeFormData;
  updateFormData: (data: Partial<CafeFormData>) => void;
  resetFormData: () => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
}

const initialFormData: CafeFormData = {
  name: "",
  cafe_photo: "",
  cafe_location_link: "",
  review: "",
  star_rating: 0,
  price: 0,
  wifi: 0,
  seat_comfort: 0,
  electricity_socket: 0,
  food_beverage: 0,
  praying_room: 0,
  hospitality: 0,
  toilet: 0,
  noise: 0,
  parking: 0,
};

const CafeFormContext = createContext<CafeFormContextType | undefined>(undefined);

export const useCafeForm = () => {
  const context = useContext(CafeFormContext);
  if (!context) {
    throw new Error('useCafeForm must be used within a CafeFormProvider');
  }
  return context;
};

interface CafeFormProviderProps {
  children: ReactNode;
}

export const CafeFormProvider: React.FC<CafeFormProviderProps> = ({ children }) => {
  const [formData, setFormData] = useState<CafeFormData>(initialFormData);
  const [currentPage, setCurrentPage] = useState(1);

  const updateFormData = (data: Partial<CafeFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const resetFormData = () => {
    setFormData(initialFormData);
    setCurrentPage(1);
  };

  return (
    <CafeFormContext.Provider value={{
      formData,
      updateFormData,
      resetFormData,
      currentPage,
      setCurrentPage,
    }}>
      {children}
    </CafeFormContext.Provider>
  );
};
