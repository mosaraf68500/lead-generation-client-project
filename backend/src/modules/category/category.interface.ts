import type { Document, Types } from 'mongoose';

/**
 * Course taxonomy. Each course references a category by `name` (string,
 * not ObjectId) so legacy seeded data and string-typed filter queries
 * keep working. The Category collection only acts as the source of
 * truth for *which* category names exist + their UI metadata.
 */
export interface ICategory {
  _id: Types.ObjectId | string;
  name: string;
  slug: string;
  description?: string;
  iconKey?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type ICategoryDocument = ICategory & Document;
