/**
 * Asset Types
 * Type definitions for asset-related data structures
 */

/** Link source type — detected automatically from the link value */
export type LinkType = 'local' | 'cloud' | '';

export interface Asset {
  id: number;
  title: string;
  image: string;
  version: string;
  unity: string;
  unreal: string;
  link: string;
  linkType: LinkType;
  createdAt: string;
}

export interface AssetInput {
  title: string;
  image: string;
  version: string;
  unity: string;
  unreal: string;
  link: string;
  linkType: LinkType;
}

export interface AssetUpdate extends AssetInput {
  id: number;
}
