import { Page } from "./page";

export interface DvApi {
	page(path: string): Page;
	pages(path: string): Page[];
	table(headers: string[], rows: any[]): void;
	paragraph(text: string): void;
	span(text: string): void;
	el(tag: string, content: any, attrs: Record<string, any>): void;
}
