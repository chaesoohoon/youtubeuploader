
import React, { useState, useCallback, useEffect } from 'react';
import { VideoFile } from './types';
import DropZone from './components/DropZone';
import VideoItem from './components/VideoItem';
import Header from './components/Header';
import { optimizeMetadata } from './services/gemini';
import { uploadToYouTube, UploadProgress } from './services/youtube';

const App: React.FC = () => {
  const [user, setUser] = useState<{ name: string; email: string; photo: string } | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [clientId, setClientId] = useState<string>(localStorage.getItem('yt_client_id') || '');
  const [videos, setVideos] = useState<VideoFile[]>([]);
  const [showConfig, setShowConfig] = useState(!localStorage.getItem('yt_client_id'));
  const [currentOrigin, setCurrentOrigin] = useState('');

  useEffect(() => {
    setCurrentOrigin(window.location.origin);
  }, []);

  const handleLogin = () => {
    if (!clientId) {
      alert("먼저 Google Cloud Console에서 발급받은 Client ID를 입력해주세요.");
      setShowConfig(true);
      return;
    }

    if (!(window as any).google) {
      alert("Google 인증 라이브러리가 아직 로드되지 않았습니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    try {
      const client = (window as any).google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
        callback: (response: any) => {
          if (response.error) {
            console.error("OAuth Error:", response.error);
            alert(`로그인 오류: ${response.error_description || response.error}`);
            return;
          }
          if (response.access_token) {
            setAccessToken(response.access_token);
            setUser({
              name: "YouTube 크리에이터",
              email: "계정 연동됨",
              photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=verified"
            });
          }
        },
      });
      client.requestAccessToken();
    } catch (e) {
      console.error("OAuth 초기화 실패", e);
      alert("Client ID가 올바르지 않거나 허용된 도메인이 아닙니다. 설정을 확인해주세요.");
    }
  };

  const handleLogout = () => {
    setUser(null);
    setAccessToken(null);
  };

  const saveClientId = (id: string) => {
    const trimmedId = id.trim();
    setClientId(trimmedId);
    localStorage.setItem('yt_client_id', trimmedId);
    setShowConfig(false);
  };

  const handleFilesAdded = useCallback((files: FileList) => {
    const newVideos: VideoFile[] = Array.from(files).map(file => ({
      id: Math.random().toString(36).substring(7),
      file,
      previewUrl: URL.createObjectURL(file),
      status: 'idle',
      progress: 0,
      metadata: {
        originalTitle: file.name.replace(/\.[^/.]+$/, ""),
        optimizedTitle: '',
        optimizedDescription: '',
        tags: [],
        category: '22',
      }
    }));
    setVideos(prev => [...prev, ...newVideos]);
  }, []);

  const startOptimization = async (id: string) => {
    setVideos(prev => prev.map(v => v.id === id ? { ...v, status: 'optimizing' } : v));
    const video = videos.find(v => v.id === id);
    if (!video) return;

    try {
      const suggestion = await optimizeMetadata(video.file.name);
      setVideos(prev => prev.map(v => v.id === id ? {
        ...v,
        status: 'ready',
        metadata: {
          ...v.metadata,
          optimizedTitle: suggestion.title,
          optimizedDescription: suggestion.description,
          tags: suggestion.tags
        }
      } : v));
    } catch (error) {
      setVideos(prev => prev.map(v => v.id === id ? { ...v, status: 'error' } : v));
    }
  };

  const startRealUpload = async (id: string) => {
    if (!accessToken) {
      handleLogin();
      return;
    }

    const video = videos.find(v => v.id === id);
    if (!video) return;

    setVideos(prev => prev.map(v => v.id === id ? { ...v, status: 'uploading', progress: 0 } : v));

    try {
      const videoId = await uploadToYouTube(video, accessToken, (progress: UploadProgress) => {
        setVideos(prev => prev.map(v => v.id === id ? { ...v, progress: progress.percentage } : v));
      });
      
      setVideos(prev => prev.map(v => v.id === id ? { ...v, status: 'completed', youtubeId: videoId } : v));
    } catch (error: any) {
      console.error("Upload failed", error);
      alert(`업로드 중 오류 발생: ${error.message}`);
      setVideos(prev => prev.map(v => v.id === id ? { ...v, status: 'ready', progress: 0 } : v));
    }
  };

  const removeVideo = (id: string) => {
    setVideos(prev => {
      const video = prev.find(v => v.id === id);
      if (video) URL.revokeObjectURL(video.previewUrl);
      return prev.filter(v => v.id !== id);
    });
  };

  const handleUpdateMetadata = (id: string, updates: Partial<VideoFile['metadata']>) => {
    if (Object.keys(updates).length === 0) {
      startRealUpload(id);
      return;
    }
    setVideos(prev => prev.map(v => v.id === id ? {
      ...v,
      metadata: { ...v.metadata, ...updates }
    } : v));
  };

  return (
    <div className="min-h-screen flex flex-col selection:bg-red-500/30 pb-12">
      <Header user={user} onLogin={handleLogin} onLogout={handleLogout} />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
        {showConfig && (
          <div className="mb-8 p-6 bg-red-900/10 border border-red-900/30 rounded-2xl animate-in fade-in duration-500">
            <h3 className="text-lg font-bold text-red-500 mb-2">실제 연동을 위한 최종 체크</h3>
            <div className="text-sm text-zinc-400 space-y-2 mb-6">
              <p>1. <strong>Google Cloud Console</strong>에서 '승인된 자바스크립트 원본'에 아래 주소를 등록했는지 확인하세요:</p>
              <code className="block bg-zinc-950 p-2 rounded border border-zinc-800 text-red-400 select-all">{currentOrigin}</code>
              <p>2. Client ID가 정확히 <code>.apps.googleusercontent.com</code>으로 끝나는지 확인하세요.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <input 
                type="text" 
                placeholder="Client ID 입력" 
                className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-sm outline-none focus:border-red-600 transition-colors"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
              />
              <button 
                onClick={() => saveClientId(clientId)}
                className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg text-sm font-bold transition-all shadow-lg shadow-red-600/20"
              >
                설정 저장
              </button>
            </div>
          </div>
        )}

        <div className="mb-10 text-center space-y-4">
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter">
            YouTube <span className="text-red-600 italic">Live</span> Studio
          </h2>
          <p className="text-zinc-500 text-lg max-w-2xl mx-auto">
            API 연동을 통해 내 채널로 영상을 즉시 쏘아 올립니다.<br/>
            업로드 상태를 실시간으로 확인하세요.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-12">
          <DropZone onFilesAdded={handleFilesAdded} />

          {videos.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                <h3 className="text-2xl font-bold tracking-tight">대기열 <span className="text-zinc-600 text-lg font-normal ml-2">{videos.length}</span></h3>
                <button onClick={() => setShowConfig(true)} className="text-xs text-zinc-500 hover:text-white underline">API 설정 다시보기</button>
              </div>
              
              <div className="grid grid-cols-1 gap-6">
                {videos.map(video => (
                  <VideoItem 
                    key={video.id} 
                    video={video} 
                    accessToken={accessToken}
                    onOptimize={() => startOptimization(video.id)}
                    onRemove={() => removeVideo(video.id)}
                    onUpdate={(updates) => handleUpdateMetadata(video.id, updates)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="py-12 border-t border-zinc-900 text-center text-zinc-600 text-xs">
        <p>OAuth 연동 시 실제 내 채널에 영상이 업로드됩니다. API 할당량과 보안에 유의하세요.</p>
      </footer>
    </div>
  );
};

export default App;
