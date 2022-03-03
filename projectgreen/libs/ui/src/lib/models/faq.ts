export interface FAQ {
  question: string;
  answer: string;
  order: number;
}

export interface FAQS extends Array<FAQ> { }
