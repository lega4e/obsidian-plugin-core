import { Page } from './page';

export interface DvApi {
  pages(path: string): Page[];
  table(headers: string[], rows: any[]): void;
  paragraph(text: string): void;
  span(text: string): void;
  el(tag: string, content: any, attrs: Record<string, any>): void;
} 