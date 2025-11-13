import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { CafeFormProvider, useCafeForm } from "@/contexts/CafeFormContext";
import AddBasicInfo from "./AddCafeModal/AddBasicInfo";
import AddCafeDetails from "./AddCafeModal/AddCafeDetails";
import { createCafe } from "@/integrations/server/cafe";
import { createReview } from "@/integrations/server/reviews";

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
      const cafeId = crypto.randomUUID();
      const now = new Date().toISOString();

      // Create cafe via API
      await createCafe({
        cafe_id: cafeId,
        name: formData.name,
        cafe_photo: formData.cafe_photo,
        cafe_location_link: formData.cafe_location_link,
        location_id: formData.location_id || null,
        operational_days: formData.operational_days,
        opening_hour: formData.opening_hour,
        closing_hour: formData.closing_hour,
        status: "approved",
        created_at: now,
        updated_at: now,
      });

      // Create initial review via API
      await createReview({
        cafe_id: cafeId,
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
        created_by: formData.contributor_name,
        created_at: now,
        updated_at: now,
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

  const handleClose = () => {
    onOpenChange(false);
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
