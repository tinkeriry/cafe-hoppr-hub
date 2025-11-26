import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useTokenValidation } from "@/hooks/useCafeApi";
import { TokenValidationResponse } from "@/integrations/server/types";
import AddCafeModal from "@/components/AddCafeModal";
import EditCafeModal from "@/components/EditCafeModal";
import { toast } from "sonner";
import AddReviewModal from "@/components/AddReviewModal";

const UpsertCafe = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const {
    data: tokenData,
    isLoading: isValidating,
    error: validationError,
  } = useTokenValidation(token);

  useEffect(() => {
    if (!token) {
      toast.error("No token provided");
      setTimeout(() => navigate("/"), 2000);
      return;
    }

    if (validationError) {
      console.error("Error validating token:", validationError);
      toast.error("Invalid or expired token");
      setTimeout(() => navigate("/"), 2000);
    } else if (tokenData === null && !isValidating) {
      // Handle case where token is invalid but no error thrown (if API returns null)
      toast.error("Invalid or expired token");
      setTimeout(() => navigate("/"), 2000);
    }
  }, [token, validationError, tokenData, isValidating, navigate]);

  const handleSuccess = () => {
    toast.success("Operation completed successfully!");
    navigate("/");
  };

  const handleModalClose = () => {
    navigate("/");
  };

  if (isValidating) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background-gradient-start to-background-gradient-end flex items-center justify-center">
        <div className="text-center">
          <div className="flex justify-center items-center gap-4 mb-4 text-6xl">
            <span className="animate-spin">☕</span>
          </div>
          <p className="text-xl text-muted-foreground">Validating token...</p>
        </div>
      </div>
    );
  }

  if (validationError || (!isValidating && !tokenData)) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background-gradient-start to-background-gradient-end flex items-center justify-center">
        <div className="text-center">
          <div className="flex justify-center items-center gap-4 mb-4 text-6xl">
            <span>❌</span>
          </div>
          <p className="text-xl text-muted-foreground mb-4">
            {validationError ? "Invalid or expired token" : "Invalid token"}
          </p>
          <p className="text-sm text-muted-foreground">Redirecting to home...</p>
        </div>
      </div>
    );
  }

  // Render the appropriate modal based on token type
  if (tokenData.type === "add_cafe") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background-gradient-start to-background-gradient-end">
        <AddCafeModal
          open={true}
          onOpenChange={(open) => {
            if (!open) handleModalClose();
          }}
          onSuccess={handleSuccess}
          token={token || undefined}
        />
      </div>
    );
  }

  if (tokenData.type === "edit_cafe") {
    // Convert the cafe data from token to the Cafe type expected by EditCafeModal
    const cafeData = tokenData.cafe_id
      ? {
          cafe_id: tokenData.cafe_id,
          name: tokenData.cafe?.name || "",
          cafe_photo: tokenData.cafe?.cafe_photo || "",
          cafe_location_link: tokenData.cafe?.cafe_location_link || "",
          status: "approved",
          operational_days: tokenData.cafe?.operational_days || [],
          opening_hour: tokenData.cafe?.opening_hour || "08:00",
          closing_hour: tokenData.cafe?.closing_hour || "18:00",
          location_id: tokenData.cafe?.location_id || "",
        }
      : null;

    return (
      <div className="min-h-screen bg-gradient-to-b from-background-gradient-start to-background-gradient-end">
        <EditCafeModal
          open={true}
          onOpenChange={(open) => {
            if (!open) handleModalClose();
          }}
          cafe={cafeData}
          onSuccess={handleSuccess}
          token={token || undefined}
        />
      </div>
    );
  }

  if (tokenData.type === "add_review") {
    // Convert the cafe data from token to the Cafe type expected by EditCafeModal
    const cafeData = tokenData.cafe_id
      ? {
          cafe_id: tokenData.cafe_id,
          name: tokenData.cafe?.name || "",
          cafe_photo: tokenData.cafe?.cafe_photo || "",
          cafe_location_link: tokenData.cafe?.cafe_location_link || "",
          status: "approved",
          operational_days: tokenData.cafe?.operational_days || [],
          opening_hour: tokenData.cafe?.opening_hour || "08:00",
          closing_hour: tokenData.cafe?.closing_hour || "18:00",
          location_id: tokenData.cafe?.location_id || "",
        }
      : null;

    return (
      <div className="min-h-screen bg-gradient-to-b from-background-gradient-start to-background-gradient-end">
        <AddReviewModal
          open={true}
          onOpenChange={(open) => {
            if (!open) handleModalClose();
          }}
          cafe={cafeData}
          onSuccess={handleSuccess}
          token={token || undefined}
        />
      </div>
    );
  }

  return null;
};

export default UpsertCafe;
