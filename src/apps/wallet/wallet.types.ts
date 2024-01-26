export type Payload_Type = {
  forWhat: 'WITHDRAWAL' | 'ESCROW' | 'DEPOSIT';
  transaction_ref: string;
  amount: number;
  email: string;
};
