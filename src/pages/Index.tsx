import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { sql } from "@/integrations/neon/client";
import { Cafe } from "@/integrations/neon/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CafeCard from "@/components/CafeCard";
import AddCafeModal from "@/components/AddCafeModal";
import EditCafeModal from "@/components/EditCafeModal";
import DeleteCafeModal from "@/components/DeleteCafeModal";
import Footer from "@/components/Footer";
import SortIcon from "@/components/icons/SortIcon";
import SortModal from "@/components/SortModal";
import { toast } from "sonner";

const Index = () => {
  const navigate = useNavigate();
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [filteredCafes, setFilteredCafes] = useState<Cafe[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);
  const [activeSort, setActiveSort] = useState<string>("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedCafe, setSelectedCafe] = useState<Cafe | null>(null);

  useEffect(() => {
    fetchCafes();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = cafes.filter((cafe) =>
        cafe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cafe.review?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCafes(filtered);
    } else {
      setFilteredCafes(cafes);
    }
  }, [searchQuery, cafes]);

  const fetchCafes = async () => {
    try {
      const cafes = await sql`
        SELECT * FROM cafes 
        WHERE status = 'active' 
        ORDER BY created_at DESC
      ` as Cafe[];
      setCafes(cafes);
      setFilteredCafes(cafes);
    } catch (error) {
      console.error('Error fetching cafes:', error);
      toast.error("Error loading cafes");
    }
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

  const handleSort = (sortType: string) => {
    const sortedCafes = [...filteredCafes];
    
    switch (sortType) {
      case "Sort by Highest Rating":
        sortedCafes.sort((a, b) => b.star_rating - a.star_rating);
        break;
      case "Sort by Lowest Rating":
        sortedCafes.sort((a, b) => a.star_rating - b.star_rating);
        break;
      case "Sort by A-Z":
        sortedCafes.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "Sort by Z-A":
        sortedCafes.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        break;
    }
    
    setFilteredCafes(sortedCafes);
    setActiveSort(sortType);
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
          <div className="flex flex-row gap-2 justify-center items-center relative max-w-xl mx-auto">
            <div className={`flex justify-start items-center relative gap-2 px-4 py-1 rounded-full border-2 bg-white w-full transition-all duration-300 ease-in-out ${isSearchFocused ? 'border-[#668D61]' : 'border-[#e5d8c2]'}`}>
              <Input
                type="search"
                placeholder="Where will you land today?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-auto !text-lg flex-1 bg-transparent"
              />

              <div className="flex items-center gap-2">
                <span className="text-2xl">🔍</span>
              </div>

              {/* No Cafe Message when search is focused */}
              {isSearchFocused && cafes.length === 0 && (
                <div className="absolute top-full left-0 right-0 z-40 mt-0.5">
                  <div className="flex justify-start px-4 py-2 rounded-md border border-[#e5d8c2] bg-white w-full">
                    <p className="text-[#604926] text-lg w-full text-left font-medium">Gasp! There's no cafe yet 😱</p>
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center cursor-pointer relative gap-2 p-3 rounded-full border-2 border-[#746650]" data-sort-icon onClick={(e) => {
              e.stopPropagation();
              setShowSortModal(!showSortModal);
            }}>
              <SortIcon className="w-6 h-6 text-[#746650]" />
              <SortModal 
                isOpen={showSortModal}
                onClose={() => setShowSortModal(false)}
                onSort={handleSort}
                activeSort={activeSort}
              />
            </div>

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
                key={cafe.cafe_id}
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
        cafeId={selectedCafe?.cafe_id || null}
        cafeName={selectedCafe?.name || ""}
        onSuccess={fetchCafes}
      />

    </div>
  );
};

export default Index;