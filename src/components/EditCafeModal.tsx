import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { sql } from "@/integrations/neon/client";
import { toast } from "sonner";
import { CafeFormProvider, useCafeForm } from '@/contexts/CafeFormContext';
import { Cafe } from '@/integrations/neon/types';
import EditBasicInfoPage from './EditCafeModal/EditBasicInfoPage';
import EditDetailsPage from './EditCafeModal/EditDetailsPage';

interface EditCafeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cafe: Cafe | null;
  onSuccess: () => void;
}

const EditCafeModalContent = ({ open, onOpenChange, cafe, onSuccess }: EditCafeModalProps) => {
  const { formData, resetFormData, updateFormData, currentPage, setCurrentPage } = useCafeForm();
  const [loading, setLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Fetch cafe and review data when modal opens
  useEffect(() => {
    if (open && cafe?.cafe_id) {
      // Reset form first to clear any previous data
      resetFormData();
      fetchCafeData();
    } else if (!open) {
      // Reset form when modal closes
      resetFormData();
    }
  }, [open, cafe?.cafe_id]);

  const fetchCafeData = async () => {
    if (!cafe?.cafe_id) return;
    
    setIsLoadingData(true);
    try {
      // Fetch cafe data
      const cafeData = await sql`
        SELECT 
          cafe_id, name, cafe_photo, cafe_location_link,
          operational_days, opening_hour, closing_hour,
          status, created_at, updated_at
        FROM cafes
        WHERE cafe_id = ${cafe.cafe_id}
      ` as Cafe[];

      if (cafeData.length === 0) {
        toast.error("Cafe not found");
        onOpenChange(false);
        return;
      }

      const cafeInfo = cafeData[0];

      // Fetch the latest review for this cafe
      const reviewData = await sql`
        SELECT *
        FROM reviews
        WHERE cafe_id = ${cafe.cafe_id}
        ORDER BY created_at DESC
        LIMIT 1
      ` as {
        review_id?: string;
        review?: string;
        star_rating?: number;
        price?: number;
        wifi?: number;
        seat_comfort?: number;
        electricity_socket?: number;
        food_beverage?: number;
        praying_room?: number;
        hospitality?: number;
        toilet?: number;
        noise?: number;
        parking?: number;
        created_by?: string;
      }[];

      const latestReview = reviewData[0] || {};

      // Parse operational_days - handle different formats from database
      let operationalDays: string[] = [];
      if (cafeInfo.operational_days) {
        if (Array.isArray(cafeInfo.operational_days)) {
          // Already an array, create a copy
          operationalDays = [...cafeInfo.operational_days];
        } else if (typeof cafeInfo.operational_days === 'string') {
          // Try to parse as JSON if it's a string
          try {
            const parsed = JSON.parse(cafeInfo.operational_days);
            operationalDays = Array.isArray(parsed) ? parsed : [];
          } catch {
            // If not JSON, might be a PostgreSQL array format like "{MON,TUE}"
            const cleaned = cafeInfo.operational_days.replace(/[{}"]/g, '');
            operationalDays = cleaned ? cleaned.split(',').map(d => d.trim()) : [];
          }
        }
      }

      console.log('Fetched operational_days:', cafeInfo.operational_days);
      console.log('Parsed operational_days:', operationalDays);

      // Populate form data - ensure all fields are set including operational_days
      updateFormData({
        name: cafeInfo.name || '',
        cafe_photo: cafeInfo.cafe_photo || '',
        cafe_location_link: cafeInfo.cafe_location_link || '',
        review: latestReview.review || '',
        star_rating: latestReview.star_rating || 6,
        operational_days: operationalDays,
        opening_hour: cafeInfo.opening_hour || '08:00',
        closing_hour: cafeInfo.closing_hour || '18:00',
        contributor_name: latestReview.created_by || '',
        price: latestReview.price || 0,
        wifi: latestReview.wifi || 0,
        seat_comfort: latestReview.seat_comfort || 0,
        electricity_socket: latestReview.electricity_socket || 0,
        food_beverage: latestReview.food_beverage || 0,
        praying_room: latestReview.praying_room || 0,
        hospitality: latestReview.hospitality || 0,
        toilet: latestReview.toilet || 0,
        noise: latestReview.noise || 0,
        parking: latestReview.parking || 0,
      });

      setCurrentPage(1);
    } catch (error) {
      console.error('Error fetching cafe data:', error);
      toast.error("Error loading cafe data");
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleSubmit = async () => {
    if (!cafe?.cafe_id) return;
    
    setLoading(true);

    try {
      const now = new Date().toISOString();

      // Update cafe
      await sql`
        UPDATE cafes SET
          name = ${formData.name},
          cafe_photo = ${formData.cafe_photo},
          cafe_location_link = ${formData.cafe_location_link},
          operational_days = ${formData.operational_days},
          opening_hour = ${formData.opening_hour},
          closing_hour = ${formData.closing_hour},
          updated_at = ${now}
        WHERE cafe_id = ${cafe.cafe_id}
      `;

      // Update the latest review (or create if none exists)
      const existingReview = await sql`
        SELECT review_id FROM reviews
        WHERE cafe_id = ${cafe.cafe_id}
        ORDER BY created_at DESC
        LIMIT 1
      ` as { review_id?: string }[];

      if (existingReview.length > 0 && existingReview[0].review_id) {
        // Update existing review
        await sql`
          UPDATE reviews SET
            review = ${formData.review},
            star_rating = ${formData.star_rating},
            price = ${formData.price},
            wifi = ${formData.wifi},
            seat_comfort = ${formData.seat_comfort},
            electricity_socket = ${formData.electricity_socket},
            food_beverage = ${formData.food_beverage},
            praying_room = ${formData.praying_room},
            hospitality = ${formData.hospitality},
            toilet = ${formData.toilet},
            noise = ${formData.noise},
            parking = ${formData.parking},
            created_by = ${formData.contributor_name},
            updated_at = ${now}
          WHERE review_id = ${existingReview[0].review_id}
        `;
      } else {
        // Create new review if none exists
        await sql`
          INSERT INTO reviews (
            cafe_id, review, star_rating,
            price, wifi, seat_comfort, electricity_socket, food_beverage,
            praying_room, hospitality, toilet, noise, parking,
            created_by, created_at, updated_at
          ) VALUES (
            ${cafe.cafe_id}, ${formData.review}, ${formData.star_rating},
            ${formData.price}, ${formData.wifi}, ${formData.seat_comfort}, 
            ${formData.electricity_socket}, ${formData.food_beverage},
            ${formData.praying_room}, ${formData.hospitality}, ${formData.toilet}, 
            ${formData.noise}, ${formData.parking},
            ${formData.contributor_name}, ${now}, ${now}
          )
        `;
      }

      toast.success("Cafe updated successfully!");
      resetFormData();
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating cafe:', error);
      toast.error("Error updating cafe. Please try again.");
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

  if (!cafe?.cafe_id) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Cafe</DialogTitle>
        </DialogHeader>
        
        {isLoadingData ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin text-4xl mb-4">☕</div>
              <p className="text-muted-foreground">Loading cafe data...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Pagination Indicators */}
            <div className="flex items-center justify-center gap-2 my-2">
              <div className={`w-2 h-2 rounded-full ${currentPage === 1 ? 'bg-[#746650]' : 'bg-[#e5d8c2]'}`} />
              <div className={`w-2 h-2 rounded-full ${currentPage === 2 ? 'bg-[#746650]' : 'bg-[#e5d8c2]'}`} />
            </div>

            <div className="flex flex-col">
              {currentPage === 1 && (
                <EditBasicInfoPage 
                  onNext={handleNext} 
                  cafeId={cafe.cafe_id}
                />
              )}
              {currentPage === 2 && (
                <EditDetailsPage 
                  onPrevious={handlePrevious} 
                  onSubmit={handleSubmit}
                  loading={loading}
                />
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

const EditCafeModal = (props: EditCafeModalProps) => {
  return (
    <CafeFormProvider>
      <EditCafeModalContent {...props} />
    </CafeFormProvider>
  );
};

export default EditCafeModal;
