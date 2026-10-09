export type ProductTier = 'athlete' | 'supporter' | 'everyday';

export interface Product {
  id?: string;
  n: string; // name
  cat: string; // category
  tier: ProductTier;
  p: number; // price in JMD
  image?: string;
  images?: string[];
  description?: string;
  provisional?: boolean;
}

export interface CartItem {
  index: string;
  product: Product;
  quantity: number;
}

export type ProgramType = 'sunday_swim' | 'summer_camp' | 'private_coaching';
export type PaymentMethod = 'stripe' | 'bank_transfer' | 'pay_on_site';

export interface RegistrationSubmission {
  program_type: ProgramType;
  participant_name: string;
  participant_age?: number;
  parent_name?: string;
  email: string;
  phone: string;
  swimming_level: 'beginner' | 'intermediate' | 'advanced';
  medical_notes?: string;
  preferred_session?: string;
  consent: boolean;
  payment_method: PaymentMethod;
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
