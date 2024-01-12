export type CreateRecipientType = {
  status: boolean;
  message: string;
  data: {
    active: boolean;
    createdAt: string;
    currency: string;
    domain: string;
    id: number;
    integration: number;
    name: string;
    recipient_code: string;
    type: string;
    updatedAt: string;
    is_deleted: boolean;
    isDeleted: boolean;
    details: {
      authorization_code: string | null;
      account_number: string;
      account_name: string;
      bank_code: string;
      bank_name: string;
    };
  };
};

export type WebHookEventType =
  | 'charge.dispute.create'
  | 'charge.dispute.remind'
  | 'charge.dispute.resolve'
  | 'charge.success'
  | 'customeridentification.failed'
  | 'customeridentification.success'
  | 'dedicatedaccount.assign.failed'
  | 'dedicatedaccount.assign.success'
  | 'invoice.create'
  | 'invoice.payment_failed'
  | 'invoice.update'
  | 'paymentrequest.pending'
  | 'paymentrequest.success'
  | 'refund.failed'
  | 'refund.pending'
  | 'refund.processed'
  | 'refund.processing'
  | 'subscription.create'
  | 'subscription.disable'
  | 'subscription.expiring_cards'
  | 'subscription.not_renew'
  | 'transfer.failed'
  | 'transfer.success'
  | 'transfer.reversed';
