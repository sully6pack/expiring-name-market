
import { useEffect, useState } from "react";
import { Advertisement } from "@/types/advertisement";
import AdvertisementBanner from "./AdvertisementBanner";
import { supabase } from "@/lib/supabase";

const AdvertisementSection = () => {
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);

  useEffect(() => {
    const fetchAdvertisements = async () => {
      const { data } = await supabase
        .from('advertisements')
        .select('*')
        .eq('isActive', true)
        .lte('startDate', new Date().toISOString())
        .gte('endDate', new Date().toISOString())
        .order('createdAt', { ascending: false })
        .limit(4);

      if (data) {
        setAdvertisements(data.map(ad => ({
          ...ad,
          startDate: new Date(ad.startDate),
          endDate: ad.endDate ? new Date(ad.endDate) : undefined,
          createdAt: new Date(ad.createdAt)
        })));
      }
    };

    fetchAdvertisements();
  }, []);

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
