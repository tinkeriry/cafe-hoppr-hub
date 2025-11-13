import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { deleteCafe } from "@/integrations/server/cafe";
import { toast } from "sonner";
import { useState } from "react";

interface DeleteCafeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cafeId: string | null;
  cafeName: string;
  onSuccess: () => void;
}

const DeleteCafeModal = ({
  open,
  onOpenChange,
  cafeId,
  cafeName,
  onSuccess,
}: DeleteCafeModalProps) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!cafeId) return;
    setLoading(true);

    try {
      await deleteCafe(cafeId);

      toast.success("Cafe deleted successfully!");
      onSuccess();
      onOpenChange(false);
    } catch (error: unknown) {
      console.error("Error deleting cafe:", error);
      toast.error("Error deleting cafe. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md min-h-[300px] gap-12">
        <div className="mt-16 flex flex-col justify-center items-center">
          <p className="text-center text-lg font-medium text-[#604926] leading-relaxed">
            Are you sure to delete "{cafeName}" from the list?
          </p>
        </div>

        <div className="flex gap-3 justify-center pt-2">
          <Button
            variant="cafe"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="px-8 py-2 bg-[#E2DACF] text-white hover:bg-[#d4c4a8] border-none rounded-full"
          >
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={loading} className="px-8 py-2">
            {loading ? "Deleting..." : "Yep"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteCafeModal;
