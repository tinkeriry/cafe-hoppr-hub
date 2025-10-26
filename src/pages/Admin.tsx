import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Footer from "@/components/Footer";
import { toast } from "sonner";

const Admin = () => {
  const navigate = useNavigate();
  const [currentCode, setCurrentCode] = useState("");
  const [newCode, setNewCode] = useState("");
  const [actualCode, setActualCode] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCode = async () => {
      const { data: codeData } = await supabase
        .from("access_codes")
        .select("code")
        .limit(1)
        .single();

      if (codeData) {
        setActualCode(codeData.code);
      }
    };

    fetchCode();
  }, []);

  const handleBackToHome = () => {
    navigate("/");
  };

  const handleUpdateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (currentCode !== actualCode) {
        toast.error("Current access code is incorrect!");
        setLoading(false);
        return;
      }

      if (!newCode || newCode.length < 4) {
        toast.error("New access code must be at least 4 characters!");
        setLoading(false);
        return;
      }

      const { data: codeRecord } = await supabase
        .from("access_codes")
        .select("id")
        .limit(1)
        .single();

      if (codeRecord) {
        const { error } = await supabase
          .from("access_codes")
          .update({ code: newCode })
          .eq("id", codeRecord.id);

        if (error) throw error;

        setActualCode(newCode);
        setCurrentCode("");
        setNewCode("");
        toast.success("Access code updated successfully!");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background-gradient-start to-background-gradient-end flex flex-col">
      <Button
        variant="cafe"
        onClick={handleBackToHome}
        className="absolute top-4 right-4 z-10"
      >
        Back to Home
      </Button>

      <div className="flex-1 p-4">
        <div className="max-w-4xl mx-auto pt-20">
          <div className="bg-white rounded-2xl shadow-[inset_0_-8px_8px_rgba(248,246,244,0.8)] p-8">
            <h2 className="text-2xl font-semibold mb-8">Access Code Setting</h2>

            <form onSubmit={handleUpdateCode} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="current-code" className="text-foreground">
                    Enter Current Access Code
                  </Label>
                  <Input
                    id="current-code"
                    type="text"
                    placeholder="Nom nom"
                    value={currentCode}
                    onChange={(e) => setCurrentCode(e.target.value)}
                    required
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="new-code" className="text-foreground">
                    Enter New Access Code
                  </Label>
                  <Input
                    id="new-code"
                    type="text"
                    placeholder="Nom nom"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    required
                    className="mt-2"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  variant="cafe"
                  disabled={loading}
                  className="px-8"
                >
                  {loading ? "Saving..." : "Save New Access Code"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Admin;