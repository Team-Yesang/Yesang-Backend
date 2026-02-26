export interface CreateTransactionDto {
  personId: string;
  eventId?: string | null;
  amount: number;
  date: string;
  memo?: string;
}
