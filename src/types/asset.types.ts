/**
 * Asset Types
 * Type definitions for asset-related data structures
 */

export interface Asset {
  id: number;
  title: string;
  image: string;
  unity: string;
  unreal: string;
  link: string;
  createdAt: string;
}

export interface AssetInput {
  title: string;
  image: string;
  unity: string;
  unreal: string;
  link: string;
}

export interface AssetUpdate extends AssetInput {
  id: number;
}
