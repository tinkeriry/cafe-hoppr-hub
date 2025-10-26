import React, { createContext, useContext, useState, ReactNode } from 'react';

interface CafeFormData {
  // Page 1 - Basic Info
  name: string;
  image_url: string;
  location_link: string;
  opening_hour: string;
  closing_hour: string;
  rating: number;
  comment: string;
  
  // Page 2 - Details
  price: string;
  food_taste: string;
  seating: string;
  signal_strength: string;
  noise: string;
  electricity: string;
  lighting: string;
  mushola: string;
  smoking_room: string;
  parking: string;
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
  image_url: "",
  location_link: "",
  opening_hour: "",
  closing_hour: "",
  rating: 0,
  comment: "",
  price: "",
  food_taste: "",
  seating: "",
  signal_strength: "",
  noise: "",
  electricity: "",
  lighting: "",
  mushola: "",
  smoking_room: "",
  parking: "",
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
