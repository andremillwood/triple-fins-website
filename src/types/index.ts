export type ProductTier = 'athlete' | 'supporter' | 'everyday';

export interface Product {
  id?: string;
  n: string; // name
  cat: string; // category
  tier: ProductTier;
  p: number; // price in JMD
  image?: string;
}

export interface CartItem {
  index: number;
  product: Product;
  quantity: number;
}

export interface InquirySubmission {
  name: string;
  email: string;
  phone?: string;
  message: string;
  program_interest?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}
