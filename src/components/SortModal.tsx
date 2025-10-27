import { useEffect, useRef } from "react";

interface SortModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSort: (sortType: string) => void;
  activeSort?: string;
}

const SortModal = ({ isOpen, onClose, onSort, activeSort }: SortModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        // Check if the click is not on the sort icon
        const sortIcon = document.querySelector('[data-sort-icon]');
        if (sortIcon && sortIcon.contains(event.target as Node)) {
          return; // Don't close if clicking on the sort icon
        }
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sortOptions = [
    "Sort by Highest Rating",
    "Sort by Lowest Rating", 
    "Sort by A-Z",
    "Sort by Z-A"
  ];

  const handleSort = (option: string, event: React.MouseEvent) => {
    event.stopPropagation();
    onSort(option);
  };

  return (
    <div 
      ref={modalRef}
      className="absolute top-full right-0 mt-2 z-50 animate-in slide-in-from-top-2 duration-200"
    >
      <div
        className="flex flex-col justify-start items-end relative rounded-2xl bg-white"
        style={{ boxShadow: "0px 8px 16px 0 rgba(88,60,49,0.2)" }}
      >
        {sortOptions.map((option, index) => (
          <div 
            key={index}
            className="self-stretch flex-grow-0 flex-shrink-0 w-52 text-base font-medium text-left text-[#604926] cursor-pointer hover:text-[#746650] hover:bg-gray-50 px-3 py-2 rounded-lg transition-all duration-200 ease-in-out flex items-center justify-between"
            onClick={(e) => handleSort(option, e)}
          >
            <span>{option}</span>
            {activeSort === option && (
              <span className="text-green-600 text-base">✓</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SortModal;
