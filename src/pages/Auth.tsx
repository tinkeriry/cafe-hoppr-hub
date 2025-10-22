import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const Auth = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [hobbyAnswer, setHobbyAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/admin");
      }
    });
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("hobby_answer")
          .eq("id", data.user.id)
          .single();

        if (profileData?.hobby_answer !== hobbyAnswer) {
          await supabase.auth.signOut();
          toast.error("Incorrect hobby answer!");
          setLoading(false);
          return;
        }

        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", data.user.id)
          .eq("role", "admin")
          .maybeSingle();

        if (!roleData) {
          await supabase.auth.signOut();
          toast.error("You are not an admin!");
          setLoading(false);
          return;
        }

        toast.success("Welcome back, admin!");
        navigate("/admin");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background-gradient-start to-background-gradient-end flex items-center justify-center p-4">
      <Button
        variant="cafe"
        onClick={() => navigate("/")}
        className="absolute top-4 right-4"
      >
        Back to Home
      </Button>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-[inset_0_-8px_8px_rgba(248,246,244,0.8)] p-8">
        <div className="flex justify-center mb-6">
          <div className="w-32 h-32 bg-green-200 rounded-lg flex items-center justify-center">
            <span className="text-6xl">🧌</span>
          </div>
        </div>

        <p className="text-center text-muted-foreground mb-8">
          Heh, you thought ur the admin aren't cha? Prove me!
        </p>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <Label htmlFor="email" className="text-foreground">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Nom nom"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="password" className="text-foreground">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Nom nom"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="hobby" className="text-foreground">What's ur hobby?</Label>
            <Input
              id="hobby"
              type="text"
              placeholder="Nom nom"
              value={hobbyAnswer}
              onChange={(e) => setHobbyAnswer(e.target.value)}
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
            {loading ? "Verifying..." : "Here you go, troll"}
          </Button>
        </form>
      </div>

      <p className="absolute bottom-4 text-sm text-muted-foreground">
        Made with ☕ from Banung
      </p>
    </div>
  );
};

export default Auth;