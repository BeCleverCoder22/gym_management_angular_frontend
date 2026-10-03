export interface Pack {
    id?: number;
    offerName: string;
    description?: string;
    durationMonths: number;
    monthlyPrice: number;
    active?: boolean;
    createdAt?: string;
  }