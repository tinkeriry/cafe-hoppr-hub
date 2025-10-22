import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";

interface DeleteCafeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cafeId: string | null;
  cafeName: string;
  onSuccess: () => void;
}

const DeleteCafeModal = ({ open, onOpenChange, cafeId, cafeName, onSuccess }: DeleteCafeModalProps) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!cafeId) return;
    setLoading(true);

    try {
      const { error } = await supabase.from("cafes").delete().eq("id", cafeId);

      if (error) throw error;

      toast.success("Cafe deleted successfully!");
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100"
        >
          <span className="text-2xl">✕</span>
        </button>

        <DialogHeader>
          <DialogTitle>Delete Cafe</DialogTitle>
          <DialogDescription className="pt-4">
            Are you sure you want to delete "{cafeName}"? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-3 justify-end pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            No, Keep it
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? "Deleting..." : "Yes, Delete"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteCafeModal;