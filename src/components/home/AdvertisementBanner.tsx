
import { Advertisement } from "@/types/advertisement";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface AdvertisementBannerProps {
  advertisement: Advertisement;
}

const AdvertisementBanner = ({ advertisement }: AdvertisementBannerProps) => {
  useEffect(() => {
    // Record impression
    const recordImpression = async () => {
      try {
        await supabase
          .from('advertisements')
          .update({ impressions: (advertisement.impressions || 0) + 1 })
          .eq('id', advertisement.id);
      } catch (error) {
        console.error("Error recording impression:", error);
      }
    };
    
    recordImpression();
  }, [advertisement.id, advertisement.impressions]);

  const handleClick = async () => {
    try {
      // Record click
      await supabase
        .from('advertisements')
        .update({ clicks: (advertisement.clicks || 0) + 1 })
        .eq('id', advertisement.id);
      
      // Open link in new tab
      window.open(advertisement.targetUrl, '_blank');
    } catch (error) {
      console.error("Error recording click:", error);
      // Still open the link even if recording the click fails
      window.open(advertisement.targetUrl, '_blank');
    }
  };

  return (
    <div 
      onClick={handleClick}
      className="w-[250px] h-[250px] rounded-lg overflow-hidden shadow-md cursor-pointer hover:shadow-lg transition-shadow"
    >
      <img 
        src={advertisement.imageUrl} 
        alt={advertisement.title}
        className="w-full h-full object-cover"
      />
    </div>
  );
};

export default AdvertisementBanner;
