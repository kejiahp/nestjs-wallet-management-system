export type Payload_Type = {
  forWhat: 'WITHDRAWAL' | 'ESCROW' | 'DEPOSIT';
  transaction_ref: string;
  amount: number;
  email: string;
};

export type PaystackTransferExecptionType = {
  status: boolean;
  message: string;
  meta: {
    nextStep: string;
  };
  type: string;
  code: string;
};
