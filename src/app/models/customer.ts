export interface Customer {
    id?: number;
    lastName: string;
    firstName: string;
    registrationDate: Date;
    phoneNumber: string;
    activeSubscription: boolean;
    enabled?: boolean;
  }