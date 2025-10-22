import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CafeCard from "@/components/CafeCard";
import AddCafeModal from "@/components/AddCafeModal";
import EditCafeModal from "@/components/EditCafeModal";
import DeleteCafeModal from "@/components/DeleteCafeModal";
import AccessCodeModal from "@/components/AccessCodeModal";
import { toast } from "sonner";

interface Cafe {
  id: string;
  name: string;
  image_url: string;
  location_link: string;
  comment: string;
  price: string;
  food_taste: string;
  seating: string;
  signal_strength: string;
  noise: string;
  electricity: string;
  lighting: string;
  mushola: string;
  smoking_room: string;
  parking: string;
}

const Index = () => {
  const navigate = useNavigate();
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [filteredCafes, setFilteredCafes] = useState<Cafe[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasVerifiedCode, setHasVerifiedCode] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [selectedCafe, setSelectedCafe] = useState<Cafe | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkAuth();
    fetchCafes();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = cafes.filter((cafe) =>
        cafe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cafe.comment?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCafes(filtered);
    } else {
      setFilteredCafes(cafes);
    }
  }, [searchQuery, cafes]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setIsAuthenticated(!!session);
    setUser(session?.user || null);
  };

  const fetchCafes = async () => {
    const { data, error } = await supabase.from("cafes").select("*").order("created_at", { ascending: false });

    if (error) {
      toast.error("Error loading cafes");
      return;
    }

    setCafes(data || []);
    setFilteredCafes(data || []);
  };

  const handleAddCafe = () => {
    if (!isAuthenticated) {
      setShowAccessModal(true);
    } else if (!hasVerifiedCode) {
      setShowAccessModal(true);
    } else {
      setShowAddModal(true);
    }
  };

  const handleEditCafe = (cafe: Cafe) => {
    setSelectedCafe(cafe);
    setShowEditModal(true);
  };

  const handleDeleteCafe = (cafe: Cafe) => {
    setSelectedCafe(cafe);
    setShowDeleteModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background-gradient-start to-background-gradient-end">
      {/* Navbar */}
      <nav className="bg-white shadow-[inset_0_-8px_8px_rgba(248,246,244,0.8)] px-4 py-3 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-8">
            <span className="text-3xl">☘️</span>
            <span className="text-3xl">☕</span>
          </div>
          
          <div className="flex items-center gap-8">
            <span className="text-3xl">🧑‍💻</span>
            <span className="text-3xl">🥐</span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Button
          variant="cafe"
          onClick={handleAddCafe}
          className="absolute top-20 right-8"
        >
          Add Cafe
        </Button>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-pixel text-5xl md:text-6xl mb-4 text-foreground">
            Cafe Hoppr
          </h1>
          <p className="text-muted-foreground mb-8">
            See our catalogue to find your WFC spot or simply "nyari angin" around Bandung
          </p>

          {/* Search */}
          <div className="max-w-2xl mx-auto relative">
            <Input
              type="search"
              placeholder="Where will you land today?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-12 h-12 text-base"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xl">
              🔍
            </span>
          </div>
        </div>

        {/* Cafe Cards */}
        {filteredCafes.length === 0 ? (
          <div className="text-center py-20">
            <div className="flex justify-center items-center gap-4 mb-4 text-6xl">
              <span>🏍️</span>
              <span>💨</span>
            </div>
            <p className="text-xl text-muted-foreground mb-8">
              Whoops! Nothing here yet. Try add some!
            </p>
            <Button variant="cafe" onClick={handleAddCafe}>
              Add Cafe
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCafes.map((cafe) => (
              <CafeCard
                key={cafe.id}
                cafe={cafe}
                onEdit={() => handleEditCafe(cafe)}
                onDelete={() => handleDeleteCafe(cafe)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <p className="text-center py-8 text-sm text-muted-foreground">
        Made with ☕ from Banung
      </p>

      {/* Modals */}
      <AccessCodeModal
        open={showAccessModal}
        onOpenChange={setShowAccessModal}
        onSuccess={() => {
          setHasVerifiedCode(true);
          setShowAddModal(true);
        }}
      />

      <AddCafeModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        onSuccess={fetchCafes}
      />

      <EditCafeModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        cafe={selectedCafe}
        onSuccess={fetchCafes}
      />

      <DeleteCafeModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        cafeId={selectedCafe?.id || null}
        cafeName={selectedCafe?.name || ""}
        onSuccess={fetchCafes}
      />

      {/* Admin Link */}
      {user && (
        <button
          onClick={() => navigate("/auth")}
          className="fixed bottom-4 right-4 text-xs text-muted-foreground hover:text-foreground opacity-30 hover:opacity-100 transition-opacity"
        >
          Admin
        </button>
      )}
    </div>
  );
};

export default Index;