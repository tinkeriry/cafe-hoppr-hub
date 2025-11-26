import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";

interface DeleteCafeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cafeName: string;
  cafeId: string;
  onSuccess: () => void;
}

const DeleteCafeModal = ({
  open,
  onOpenChange,
  cafeName,
  cafeId,
  onSuccess,
}: DeleteCafeModalProps) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      // Delete functionality is not available in the API yet
      toast.error("Delete functionality is not available yet");
      onOpenChange(false);
    } catch (error) {
      console.error("Error:", error);
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <div className="space-y-4">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-[#746650] mb-2">Delete Cafe</h2>
            <p className="text-gray-600">
              Delete functionality for <span className="font-semibold">{cafeName}</span> is not
              available yet.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              This feature will be added in a future update.
            </p>
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteCafeModal;
