/**
 * This file was automatically generated by joi-to-typescript
 * Do not modify this file manually
 */

export interface createContactDTO {
  availableFrom?: string;
  availableUntil?: string;
  base64Image?: string | null;
  email?: string;
  name: string;
  phone: string;
  status?: 'normal' | 'emergency' | 'hot_line';
}
