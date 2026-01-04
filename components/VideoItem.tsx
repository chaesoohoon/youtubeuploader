
import React from 'react';
import { VideoFile } from '../types';

interface VideoItemProps {
  video: VideoFile;
  accessToken: string | null;
  onOptimize: () => void;
  onRemove: () => void;
  onUpdate: (updates: Partial<VideoFile['metadata']>) => void;
}

const VideoItem: React.FC<VideoItemProps> = ({ video, accessToken, onOptimize, onRemove, onUpdate }) => {
  const isOptimizing = video.status === 'optimizing';
  const isReady = video.status === 'ready';
  const isUploading = video.status === 'uploading';
  const isCompleted = video.status === 'completed';

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    alert(`${label}가 클립보드에 복사되었습니다!`);
  };

  return (
    <div className={`bg-zinc-900 border ${isCompleted ? 'border-emerald-500/30 shadow-emerald-500/5' : 'border-zinc-800'} rounded-2xl overflow-hidden transition-all duration-500 shadow-2xl`}>
      <div className="p-5 flex flex-col md:flex-row gap-8 items-start">
        {/* Preview Thumbnail */}
        <div className="w-full md:w-56 aspect-video bg-zinc-800 rounded-xl overflow-hidden relative group shrink-0 shadow-lg">
          <video 
            src={video.previewUrl} 
            className="w-full h-full object-cover"
          />
          {isUploading && (
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden mb-3 border border-zinc-700">
                <div 
                  className="bg-blue-500 h-full transition-all duration-500" 
                  style={{ width: `${video.progress}%` }}
                ></div>
              </div>
              <p className="text-xl font-black text-white">{video.progress}%</p>
              <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mt-1">업로드 중...</p>
            </div>
          )}
          {isCompleted && (
            <div className="absolute inset-0 bg-emerald-900/40 backdrop-blur-[2px] flex items-center justify-center">
              <div className="bg-white p-2 rounded-full shadow-2xl animate-bounce">
                <svg className="w-8 h-8 text-emerald-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                </svg>
              </div>
            </div>
          )}
        </div>

        {/* Content Info */}
        <div className="flex-1 min-w-0 w-full space-y-4">
          <div className="flex justify-between items-start">
            <div className="min-w-0">
              <h4 className="font-bold text-xl truncate pr-4 text-white">
                {video.metadata.optimizedTitle || video.metadata.originalTitle}
              </h4>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-zinc-500 text-xs font-medium">{Math.round(video.file.size / 1024 / 1024)} MB</span>
                <span className="w-1 h-1 bg-zinc-700 rounded-full"></span>
                <span className="text-zinc-500 text-xs font-medium uppercase">{video.file.type.split('/')[1]}</span>
              </div>
            </div>
            {!isUploading && !isCompleted && (
              <button onClick={onRemove} className="text-zinc-600 hover:text-red-500 transition-colors p-1 bg-zinc-800 rounded-full">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {!isReady && !isOptimizing && !isUploading && !isCompleted && (
              <button 
                onClick={onOptimize}
                className="px-5 py-2 bg-white hover:bg-zinc-200 text-black text-xs font-bold rounded-full flex items-center gap-2 transition-all active:scale-95"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Gemini SEO 분석
              </button>
            )}
            
            {isOptimizing && (
              <div className="flex items-center gap-3 text-xs text-red-500 font-bold bg-red-500/10 px-4 py-2 rounded-full border border-red-500/20">
                <div className="w-3.5 h-3.5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                AI 엔진 가동 중...
              </div>
            )}

            {isReady && !isUploading && !isCompleted && (
              <span className="flex items-center gap-2 text-emerald-500 text-xs font-bold px-4 py-2 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
                분석 데이터 준비 완료
              </span>
            )}

            {isUploading && (
              <div className="flex items-center gap-3 text-xs text-blue-400 font-bold bg-blue-400/10 px-4 py-2 rounded-full border border-blue-400/20">
                <div className="w-3.5 h-3.5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                유튜브 서버 전송 중 ({video.progress}%)
              </div>
            )}
            
            {isCompleted && (
              <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold bg-emerald-400/10 px-4 py-2 rounded-full border border-emerald-400/30">
                게시 성공
              </div>
            )}
          </div>
        </div>
      </div>

      {isReady && !isCompleted && (
        <div className="border-t border-zinc-800 p-8 bg-zinc-950/40">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">분석된 최적 제목</label>
                  <button onClick={() => copyToClipboard(video.metadata.optimizedTitle, '제목')} className="text-[10px] text-zinc-500 hover:text-white transition-colors">복사</button>
                </div>
                <input 
                  type="text"
                  value={video.metadata.optimizedTitle}
                  onChange={(e) => onUpdate({ optimizedTitle: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white focus:border-red-600 outline-none transition-all shadow-inner"
                />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">SEO 상세 설명</label>
                  <button onClick={() => copyToClipboard(video.metadata.optimizedDescription, '설명')} className="text-[10px] text-zinc-500 hover:text-white transition-colors">복사</button>
                </div>
                <textarea 
                  rows={8}
                  value={video.metadata.optimizedDescription}
                  onChange={(e) => onUpdate({ optimizedDescription: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white focus:border-red-600 outline-none resize-none leading-relaxed shadow-inner"
                />
              </div>
            </div>

            <div className="flex flex-col justify-between">
              <div className="space-y-6">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-3">검색 태그</label>
                  <div className="flex flex-wrap gap-2 bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 min-h-[100px] content-start">
                    {video.metadata.tags.map((tag, idx) => (
                      <span key={idx} className="bg-zinc-800 text-zinc-300 px-3 py-1.5 rounded-lg text-[11px] font-medium border border-zinc-700">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-3">콘텐츠 카테고리</label>
                  <select 
                    value={video.metadata.category}
                    onChange={(e) => onUpdate({ category: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white focus:border-red-600 outline-none transition-all"
                  >
                    <option value="22">피플/블로그</option>
                    <option value="20">게임</option>
                    <option value="24">엔터테인먼트</option>
                    <option value="1">영화/애니메이션</option>
                    <option value="27">교육</option>
                    <option value="10">음악</option>
                  </select>
                </div>
              </div>

              <div className="pt-8">
                <button 
                  disabled={isUploading}
                  onClick={() => onUpdate({} as any)} 
                  className={`w-full font-bold py-5 rounded-2xl flex items-center justify-center gap-4 transition-all shadow-2xl ${
                    accessToken 
                    ? 'bg-red-600 hover:bg-red-700 text-white hover:scale-[1.02] active:scale-[0.98]' 
                    : 'bg-zinc-800 text-zinc-500 cursor-not-allowed opacity-50'
                  }`}
                >
                  {isUploading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14h2v-4h3l-4-4-4 4h3v4z" />
                    </svg>
                  )}
                  <span className="text-lg">내 유튜브 채널에 전송</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isCompleted && (
        <div className="p-8 bg-emerald-950/20 border-t border-emerald-500/20 flex flex-col items-center gap-5 text-center">
          <div className="space-y-1">
            <h5 className="text-emerald-400 font-black text-xl tracking-tight">영상이 유튜브에 성공적으로 올라갔습니다!</h5>
            <p className="text-zinc-500 text-sm">현재 '일부 공개' 상태로 업로드되었습니다. 유튜브 스튜디오에서 검토 후 공개하세요.</p>
          </div>
          <div className="flex gap-4">
            <a 
              href={`https://youtu.be/${video.youtubeId}`} 
              target="_blank" 
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-emerald-600/20"
            >
              영상 보러가기
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
            <a 
              href="https://studio.youtube.com" 
              target="_blank" 
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-8 py-3 rounded-xl font-bold transition-all"
            >
              유튜브 스튜디오
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoItem;
