/**
 * Category Types
 * Type definitions for category-related data structures
 */

export interface Category {
  id: number;
  name: string;
  color: string;
  createdAt: string;
}

export interface CategoryInput {
  name: string;
  color: string;
}

export interface CategoryUpdate extends CategoryInput {
  id: number;
}
