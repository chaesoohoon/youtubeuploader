
import { VideoFile } from "../types";

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export const uploadToYouTube = async (
  video: VideoFile,
  accessToken: string,
  onProgress: (progress: UploadProgress) => void
): Promise<string> => {
  const metadata = {
    snippet: {
      title: video.metadata.optimizedTitle || video.metadata.originalTitle,
      description: video.metadata.optimizedDescription,
      tags: video.metadata.tags,
      categoryId: video.metadata.category || "22",
    },
    status: {
      privacyStatus: "unlisted", // 기본적으로 '일부 공개'로 업로드 (검토 후 공개 권장)
      selfDeclaredMadeForKids: false,
    },
  };

  // 1. 초기화 요청: 업로드 URL 받기
  const initResponse = await fetch(
    "https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "X-Upload-Content-Length": video.file.size.toString(),
        "X-Upload-Content-Type": video.file.type,
      },
      body: JSON.stringify(metadata),
    }
  );

  if (!initResponse.ok) {
    const errorData = await initResponse.json();
    throw new Error(errorData.error?.message || "업로드 초기화 실패");
  }

  const uploadUrl = initResponse.headers.get("Location");
  if (!uploadUrl) throw new Error("업로드 URL을 받지 못했습니다.");

  // 2. 실제 파일 바이너리 업로드 (XHR 사용 - 진행률 추적을 위함)
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadUrl);
    xhr.setRequestHeader("Content-Type", video.file.type);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentage = Math.round((event.loaded / event.total) * 100);
        onProgress({
          loaded: event.loaded,
          total: event.total,
          percentage,
        });
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const response = JSON.parse(xhr.responseText);
        resolve(response.id); // YouTube Video ID 반환
      } else {
        reject(new Error(`업로드 실패: ${xhr.statusText}`));
      }
    };

    xhr.onerror = () => reject(new Error("네트워크 오류 발생"));
    xhr.send(video.file);
  });
};
