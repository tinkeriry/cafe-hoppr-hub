import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { CafeFormProvider, useCafeForm } from "@/contexts/CafeFormContext";
import { Cafe } from "@/integrations/server/types";
import EditBasicInfo from "./EditCafeModal/EditBasicInfo";
import { getCafeById, updateCafe } from "@/integrations/server/cafe";

interface EditCafeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cafe: Cafe | null;
  onSuccess: () => void;
}

const EditCafeModalContent = ({ open, onOpenChange, cafe, onSuccess }: EditCafeModalProps) => {
  const { formData, resetFormData, updateFormData } = useCafeForm();
  const [loading, setLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);

  const fetchCafeData = useCallback(async () => {
    if (!cafe?.cafe_id) return;

    setIsLoadingData(true);
    try {
      // Fetch cafe data via API
      const cafeInfo = await getCafeById(cafe.cafe_id);
      if (!cafeInfo) {
        toast.error("Cafe not found");
        onOpenChange(false);
        return;
      }

      // Parse operational_days - handle different formats from database
      let operationalDays: string[] = [];
      if (cafeInfo.operational_days) {
        if (Array.isArray(cafeInfo.operational_days)) {
          // Already an array, create a copy
          operationalDays = [...cafeInfo.operational_days];
        } else if (typeof cafeInfo.operational_days === "string") {
          // Try to parse as JSON if it's a string
          const operationalDaysStr = cafeInfo.operational_days as string;
          try {
            const parsed = JSON.parse(operationalDaysStr);
            operationalDays = Array.isArray(parsed) ? parsed : [];
          } catch {
            // If not JSON, might be a PostgreSQL array format like "{MON,TUE}"
            const cleaned = operationalDaysStr.replace(/[{}"]/g, "");
            operationalDays = cleaned ? cleaned.split(",").map((d) => d.trim()) : [];
          }
        }
      }

      // Populate form data - only cafe information
      updateFormData({
        name: cafeInfo.name || "",
        cafe_photo: cafeInfo.cafe_photo || "",
        cafe_location_link: cafeInfo.cafe_location_link || "",
        location_id: cafeInfo.location_id || "",
        operational_days: operationalDays,
        opening_hour: cafeInfo.opening_hour || "08:00",
        closing_hour: cafeInfo.closing_hour || "18:00",
      });
    } catch (error) {
      console.error("Error fetching cafe data:", error);
      toast.error("Error loading cafe data");
    } finally {
      setIsLoadingData(false);
    }
  }, [cafe?.cafe_id, updateFormData, onOpenChange]);

  // Fetch cafe data when modal opens
  useEffect(() => {
    if (!open || !cafe?.cafe_id) {
      if (!open) {
        // Reset form when modal closes
        resetFormData();
      }
      return;
    }

    // Only fetch when modal opens and we have a cafe_id
    resetFormData();
    fetchCafeData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, cafe?.cafe_id]);

  const handleSubmit = async () => {
    if (!cafe?.cafe_id) return;

    setLoading(true);

    try {
      const now = new Date().toISOString();

      // Update cafe
      await updateCafe(cafe.cafe_id, {
        name: formData.name,
        cafe_photo: formData.cafe_photo,
        cafe_location_link: formData.cafe_location_link,
        location_id: formData.location_id || null,
        operational_days: formData.operational_days,
        opening_hour: formData.opening_hour,
        closing_hour: formData.closing_hour,
        updated_at: now,
      });

      toast.success("Cafe updated successfully!");
      resetFormData();
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating cafe:", error);
      toast.error("Error updating cafe. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!cafe?.cafe_id) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
          <EditBasicInfo onSubmit={handleSubmit} loading={loading} cafeId={cafe.cafe_id} />
        )}
      </DialogContent>
    </Dialog>
  );
};

const EditCafeModal = (props: EditCafeModalProps) => {
  // Use key to force remount when cafe changes to prevent stale references
  return (
    <CafeFormProvider key={props.cafe?.cafe_id || "default"}>
      <EditCafeModalContent {...props} />
    </CafeFormProvider>
  );
};

export default EditCafeModal;
