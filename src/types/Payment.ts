import { User } from ".";

export interface Payment {
  id: number;
  user_id: number;
  fawaterak_invoice_id: string;
  amount: string;
  games_purchased: number;
  status: "pending" | "successful" | "failed";
  created_at: string;
  updated_at: string;
  user: User;
}
