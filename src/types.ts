export interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string | null;
  is_available: boolean;
  created_at: string;
}

export interface Order {
  id: string;
  total_amount: number;
  payment_method: 'cash' | 'card';
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string | null;
  item_name: string;
  item_price: number;
  quantity: number;
  created_at: string;
}

export interface CartLine {
  item: MenuItem;
  quantity: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  unit: string;
  quantity: number;
  low_stock_threshold: number;
  created_at: string;
  updated_at: string;
}
