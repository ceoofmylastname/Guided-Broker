/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ResourceCategory = 'administrative' | 'support_training' | 'directory' | 'important_links';

export interface ResourceItem {
  id: string;
  title: string;
  category: ResourceCategory;
  url: string;
  description: string;
  iconName: string; // references lucide-react icons by name
  isExternal?: boolean; // important links are external carrier portals
}

export interface SearchResponse {
  answer: string;
  top_link: {
    title: string;
    url: string;
    category: string;
    directions: string;
  } | null;
  matches: Array<{
    id: string;
    title: string;
    url: string;
    category: ResourceCategory;
    score: number;
    snippet: string;
  }>;
}
