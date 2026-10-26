/** Editor values for the Phase 7 record-type admin pages (FAQs, testimonials). */

export interface AdminFaqEditorValue {
  question: string;
  answer: string;
  sortOrder: number | null;
  isActive: boolean;
}

export interface AdminTestimonialEditorValue {
  name: string;
  designation: string;
  body: string;
  rating: number | null;
  sortOrder: number | null;
  isActive: boolean;
}

export interface AdminBrandEditorValue {
  name: string;
  styleKey: string;
  linkUrl: string;
  sortOrder: number | null;
  isActive: boolean;
}
