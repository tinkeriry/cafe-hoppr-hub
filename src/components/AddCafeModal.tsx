import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { sql } from "@/integrations/neon/client";
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
      const cafeData = {
        cafe_id: crypto.randomUUID(),
        name: formData.name,
        cafe_photo: formData.cafe_photo,
        cafe_location_link: formData.cafe_location_link,
        review: formData.review,
        star_rating: formData.star_rating,
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
        created_by: 'user', // You can replace this with actual user ID
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      await sql`
        INSERT INTO cafes (
          cafe_id, name, cafe_photo, cafe_location_link, review, star_rating,
          price, wifi, seat_comfort, electricity_socket, food_beverage,
          praying_room, hospitality, toilet, noise, parking,
          created_by, status, created_at, updated_at
        ) VALUES (
          ${cafeData.cafe_id}, ${cafeData.name}, ${cafeData.cafe_photo}, 
          ${cafeData.cafe_location_link}, ${cafeData.review}, ${cafeData.star_rating},
          ${cafeData.price}, ${cafeData.wifi}, ${cafeData.seat_comfort}, 
          ${cafeData.electricity_socket}, ${cafeData.food_beverage},
          ${cafeData.praying_room}, ${cafeData.hospitality}, ${cafeData.toilet}, 
          ${cafeData.noise}, ${cafeData.parking},
          ${cafeData.created_by}, ${cafeData.status}, ${cafeData.created_at}, ${cafeData.updated_at}
        )
      `;

      toast.success("Cafe added successfully!");
      resetFormData();
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error adding cafe:', error);
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