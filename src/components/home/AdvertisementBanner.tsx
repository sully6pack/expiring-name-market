
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
      await supabase
        .from('advertisements')
        .update({ impressions: advertisement.impressions + 1 })
        .eq('id', advertisement.id);
    };
    
    recordImpression();
  }, [advertisement.id, advertisement.impressions]);

  const handleClick = async () => {
    // Record click
    await supabase
      .from('advertisements')
      .update({ clicks: advertisement.clicks + 1 })
      .eq('id', advertisement.id);
    
    // Open link in new tab
    window.open(advertisement.targetUrl, '_blank');
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
