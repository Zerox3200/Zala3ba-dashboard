import { User } from ".";

export interface Payment {
  id: number;
  user_id: number;
  paymob_order_id: number;
  amount: number;
  games_purchased: number;
  status: "pending" | "successful";
  created_at: string;
  updated_at: string;
  user: User;
}
