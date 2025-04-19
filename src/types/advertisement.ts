
export interface Advertisement {
  id: string;
  title: string;
  imageUrl: string;
  targetUrl: string;
  clicks: number;
  impressions: number;
  isActive: boolean;
  startDate: Date;
  endDate?: Date;
  createdAt: Date;
}
