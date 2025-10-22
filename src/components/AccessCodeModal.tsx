import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AccessCodeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const AccessCodeModal = ({ open, onOpenChange, onSuccess }: AccessCodeModalProps) => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("access_codes")
        .select("code")
        .limit(1)
        .single();

      if (error) throw error;

      if (data.code === code) {
        toast.success("Access granted!");
        setCode("");
        onSuccess();
        onOpenChange(false);
      } else {
        toast.error("Access denied! Incorrect code.");
      }
    } catch (error: any) {
      toast.error("Error verifying code");
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

        <div className="flex justify-center mb-6">
          <div className="w-32 h-32 bg-green-200 rounded-lg flex items-center justify-center">
            <span className="text-6xl">🧌</span>
          </div>
        </div>

        <DialogHeader>
          <DialogTitle className="text-center text-foreground">
            Not so fast, gimme your email and password before u change the access code
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <Label htmlFor="access-code" className="text-foreground">Access Code</Label>
            <Input
              id="access-code"
              type="text"
              placeholder="Enter access code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              className="mt-2"
            />
          </div>

          <Button
            type="submit"
            variant="cafe"
            className="w-full"
            disabled={loading}
          >
            {loading ? "Verifying..." : "Verify Access"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AccessCodeModal;