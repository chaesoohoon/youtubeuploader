
export interface VideoFile {
  id: string;
  file: File;
  previewUrl: string;
  status: 'idle' | 'optimizing' | 'ready' | 'uploading' | 'completed' | 'error';
  progress: number; // 0 to 100
  youtubeId?: string;
  metadata: {
    originalTitle: string;
    optimizedTitle: string;
    optimizedDescription: string;
    tags: string[];
    category: string;
  };
}

export interface SEOSuggestion {
  title: string;
  description: string;
  tags: string[];
  justification: string;
}
