import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CafeFormProvider, useCafeForm } from '@/contexts/CafeFormContext';
import BasicInfoPage from './AddCafeModal/BasicInfoPage';
import DetailsPage from './AddCafeModal/DetailsPage';

interface AddCafeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const AddCafeModalContent = ({ open, onOpenChange, onSuccess }: AddCafeModalProps) => {
  const { formData, resetFormData, currentPage, setCurrentPage } = useCafeForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const { error } = await supabase.from("cafes").insert([formData]);

      if (error) throw error;

      toast.success("Cafe added successfully!");
      resetFormData();
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    setCurrentPage(2);
  };

  const handlePrevious = () => {
    setCurrentPage(1);
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add a Cafe</DialogTitle>
        </DialogHeader>
          {/* Pagination Indicators */}
          <div className="flex items-center justify-center gap-2 my-4">
            <div className={`w-2 h-2 rounded-full ${currentPage === 1 ? 'bg-[#746650]' : 'bg-[#e5d8c2]'}`} />
            <div className={`w-2 h-2 rounded-full ${currentPage === 2 ? 'bg-[#746650]' : 'bg-[#e5d8c2]'}`} />
          </div>

        <div className="flex flex-col">
          {currentPage === 1 && <BasicInfoPage onNext={handleNext} />}
          {currentPage === 2 && (
            <DetailsPage 
              onPrevious={handlePrevious} 
              onSubmit={handleSubmit}
              loading={loading}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

const AddCafeModal = (props: AddCafeModalProps) => {
  return (
    <CafeFormProvider>
      <AddCafeModalContent {...props} />
    </CafeFormProvider>
  );
};

export default AddCafeModal;