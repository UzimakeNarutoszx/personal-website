export interface Project {
  id: string;
  slug: string;
  title: string;
  category: string;
  summary: string;
  tags: string[];
  featured: boolean;
  cover: string;
  coverAlt: string;
  role: string;
  status: string;
  problem: string;
  approach: string[];
  highlights: string[];
  boundaries: string;
  repoName: string;
  website?: string;
  gallery?: { src: string; alt: string }[];
  video?: { src: string; poster: string; title: string; caption: string };
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  src: string;
  cover: string;
  duration: number;
  description: string;
  credit: string;
}

export interface Score {
  id: string;
  title: string;
  kind: '动态鼓谱' | '动态伴奏';
  src: string;
  poster: string;
  duration: number;
  credit: string;
}
