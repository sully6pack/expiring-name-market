
import { useEffect, useState } from "react";
import { Advertisement } from "@/types/advertisement";
import AdvertisementBanner from "./AdvertisementBanner";
import { supabase } from "@/lib/supabase";

const AdvertisementSection = () => {
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAdvertisements = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('advertisements')
          .select('*')
          .eq('is_active', true)
          .lte('start_date', new Date().toISOString())
          .or(`end_date.gt.${new Date().toISOString()},end_date.is.null`)
          .order('created_at', { ascending: false })
          .limit(4);

        if (error) {
          console.error("Error fetching advertisements:", error);
          return;
        }

        if (data) {
          // Map database fields to our Advertisement type
          const formattedAds: Advertisement[] = data.map(ad => ({
            id: ad.id,
            title: ad.title,
            imageUrl: ad.image_url,
            targetUrl: ad.target_url,
            clicks: ad.clicks || 0,
            impressions: ad.impressions || 0,
            isActive: ad.is_active || false,
            startDate: new Date(ad.start_date),
            endDate: ad.end_date ? new Date(ad.end_date) : undefined,
            createdAt: ad.created_at ? new Date(ad.created_at) : new Date(),
          }));
          
          setAdvertisements(formattedAds);
        }
      } catch (error) {
        console.error("Unexpected error fetching advertisements:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdvertisements();
  }, []);

  if (isLoading) return <div className="py-4 text-center">Loading advertisements...</div>;
  if (advertisements.length === 0) return null;

  return (
    <section className="py-8 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-center gap-6">
          {advertisements.map((ad) => (
            <AdvertisementBanner key={ad.id} advertisement={ad} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default AdvertisementSection;
