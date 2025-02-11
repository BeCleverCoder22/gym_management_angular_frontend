import { Customer } from "./customer";
import { Pack } from "./pack";

export interface Subscription {
    id?: number;
    customerId: number;
    packId: number;
    startDate: Date;
    customer?: Customer;
    pack?: Pack;
  }