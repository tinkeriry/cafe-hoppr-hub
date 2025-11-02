import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { sql } from "@/integrations/neon/client";
import { toast } from "sonner";
import { CafeFormProvider, useCafeForm } from "@/contexts/CafeFormContext";
import AddBasicInfo from "./AddCafeModal/AddBasicInfo";
import AddCafeDetails from "./AddCafeModal/AddCafeDetails";

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

      // Insert cafe
      await sql`
        INSERT INTO cafes (
          cafe_id, name, cafe_photo, cafe_location_link, location_id,
          operational_days, opening_hour, closing_hour,
          status, created_at, updated_at
        ) VALUES (
          ${cafeId}, ${formData.name}, ${formData.cafe_photo}, 
          ${formData.cafe_location_link}, ${formData.location_id || null},
          ${formData.operational_days}, ${formData.opening_hour}, ${formData.closing_hour},
          'approved', ${now}, ${now}
        )
      `;

      // Insert review
      await sql`
        INSERT INTO reviews (
          cafe_id, review, star_rating,
          price, wifi, seat_comfort, electricity_socket, food_beverage,
          praying_room, hospitality, toilet, noise, parking,
          created_by, created_at, updated_at
        ) VALUES (
          ${cafeId}, ${formData.review}, ${formData.star_rating},
          ${formData.price}, ${formData.wifi}, ${formData.seat_comfort}, 
          ${formData.electricity_socket}, ${formData.food_beverage},
          ${formData.praying_room}, ${formData.hospitality}, ${formData.toilet}, 
          ${formData.noise}, ${formData.parking},
          ${formData.contributor_name}, ${now}, ${now}
        )
      `;

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
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
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
