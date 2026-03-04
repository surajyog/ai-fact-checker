export enum VerdictType {
  TRUE = 'TRUE',
  FALSE = 'FALSE',
  MISLEADING = 'MISLEADING',
  UNVERIFIED = 'UNVERIFIED',
  COMPLEX = 'COMPLEX'
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

export interface FactCheckResponse {
  text: string;
  verdict: VerdictType;
  groundingChunks: GroundingChunk[];
}

export interface NewsSource {
  name: string;
  url: string;
  trusted: boolean;
}

export interface TrendingTopic {
  id: string;
  title: string;
  category: string;
}