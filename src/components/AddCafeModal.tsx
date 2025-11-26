import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { CafeFormProvider, useCafeForm } from "@/contexts/CafeFormContext";
import AddBasicInfo from "./AddCafeModal/AddBasicInfo";
import AddCafeDetails from "./AddCafeModal/AddCafeDetails";
import { useCreateCafe } from "@/hooks/useCafeApi";

interface AddCafeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  token?: string;
}

const AddCafeModalContent = ({ open, onOpenChange, onSuccess, token }: AddCafeModalProps) => {
  const { formData, resetFormData, currentPage, setCurrentPage } = useCafeForm();
  const createCafeMutation = useCreateCafe();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);

    try {
      // Create cafe with review fields via API
      await createCafeMutation.mutateAsync({
        token: token || "dummy-token", // Use provided token or fallback to dummy
        name: formData.name,
        cafe_photos: formData.cafe_photos_file || undefined,
        cafe_location_link: formData.cafe_location_link,
        location_id: formData.location_id || "",
        operational_days: formData.operational_days,
        opening_hour: formData.opening_hour,
        closing_hour: formData.closing_hour,
        // Review fields
        review: formData.review,
        price: formData.price,
        wifi: formData.wifi,
        seat_comfort: formData.seat_comfort,
        electricity_socket: formData.electricity_socket,
        food_beverage: formData.food_beverage,
        praying_room: formData.praying_room,
        hospitality: formData.hospitality,
        toilet: formData.toilet,
        noise: formData.noise,
        parking: formData.parking,
        contributor_name: formData.contributor_name,
      });

      toast.success("Cafe added successfully!");
      resetFormData();
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error adding cafe:", error);
      toast.error("Error adding cafe. Please try again.");
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add a Cafe</DialogTitle>
        </DialogHeader>
        {/* Pagination Indicators */}
        <div className="flex items-center justify-center gap-2 my-2">
          <div
            className={`w-2 h-2 rounded-full ${currentPage === 1 ? "bg-[#746650]" : "bg-[#e5d8c2]"}`}
          />
          <div
            className={`w-2 h-2 rounded-full ${currentPage === 2 ? "bg-[#746650]" : "bg-[#e5d8c2]"}`}
          />
        </div>

        <div className="flex flex-col">
          {currentPage === 1 && <AddBasicInfo onNext={handleNext} />}
          {currentPage === 2 && (
            <AddCafeDetails onPrevious={handlePrevious} onSubmit={handleSubmit} loading={loading} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

const AddCafeModal = (props: AddCafeModalProps) => {
  // Use key to force remount when modal opens to prevent stale references
  return (
    <CafeFormProvider key={props.open ? "open" : "closed"}>
      <AddCafeModalContent {...props} />
    </CafeFormProvider>
  );
};

export default AddCafeModal;
