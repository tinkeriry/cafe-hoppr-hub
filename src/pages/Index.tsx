import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CafeCard from "@/components/CafeCard";
import AddCafeModal from "@/components/AddCafeModal";
import EditCafeModal from "@/components/EditCafeModal";
import DeleteCafeModal from "@/components/DeleteCafeModal";
import Footer from "@/components/Footer";
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
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCafe, setSelectedCafe] = useState<Cafe | null>(null);

  useEffect(() => {
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
    setShowAddModal(true);
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
    <div className="min-h-screen bg-gradient-to-b from-background-gradient-start to-background-gradient-end flex flex-col">
      {/* Navbar */}
      <nav className="bg-white shadow-[inset_0_-8px_8px_rgba(248,246,244,0.8)] px-4 py-3 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-end">
          <Button
            variant="cafe"
            onClick={handleAddCafe}
            className="text-sm"
          >
            Be a Contributor
          </Button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="text-center mb-12 relative mt-16">
          {/* Floating Emojis */}
          <div className="absolute inset-4 pointer-events-none">
            <span className="absolute -top-5 left-36 text-6xl animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }}>☘️</span>
            <span className="absolute -top-4 right-36 text-6xl animate-bounce" style={{ animationDelay: '1s', animationDuration: '3.5s' }}>🧑‍💻</span>
            <span className="absolute -bottom-1 left-16 text-6xl animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '2.5s' }}>☕</span>
            <span className="absolute -bottom-2 right-16 text-6xl animate-bounce" style={{ animationDelay: '1.5s', animationDuration: '2.8s' }}>🥐</span>
          </div>
          
          <h1 className="font-pixel text-5xl md:text-6xl mb-4 text-foreground relative z-10">
            Cafe Hoppr
          </h1>
          <p className="text-muted-foreground mb-8 text-lg max-w-lg mx-auto">
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
              Be a Contributor
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
      </div>

      {/* Footer */}
      <Footer />

      {/* Modals */}
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
    </div>
  );
};

export default Index;