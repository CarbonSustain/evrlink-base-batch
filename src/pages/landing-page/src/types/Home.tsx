export interface CategoryItem {
  icon: string;
  title: string;
  description: string;
  bgColor: string;
}

export interface ProcessStep {
  icon: string;
  title: string;
  description: string;
  bgColor: string;
  actionText?: string;
  actionIcon?: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface TestimonialCard {
  title: string;
  message: string;
  author: string;
  date: string;
  from: string;
}