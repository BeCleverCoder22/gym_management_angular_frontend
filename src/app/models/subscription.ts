import { Customer } from './customer';
import { Pack } from './pack';

export type SubscriptionStatus = 'SCHEDULED' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED';

export interface Subscription {
    id?: number;
    customerId: number;
    packId: number;
  startDate: string | Date;
  endDate?: string;
  status?: SubscriptionStatus;
  packName?: string;
  monthlyPrice?: number;
  durationMonths?: number;
    customer?: Customer;
    pack?: Pack;
  }