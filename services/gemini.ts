
import { GoogleGenAI, Type } from "@google/genai";
import { SEOSuggestion } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const optimizeMetadata = async (
  filename: string, 
  userNotes: string = ""
): Promise<SEOSuggestion> => {
  // 사용자가 모델을 지정하지 않았으므로 복잡한 코딩/추론 작업에 적합한 gemini-3-pro-preview 사용
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `비디오 파일명: "${filename}"
               사용자 추가 메모: "${userNotes}"
               위 정보를 바탕으로 유튜브 검색 노출(SEO)을 극대화할 수 있는 정보를 한국어로 생성해주세요.`,
    config: {
      systemInstruction: `당신은 대한민국 최고의 유튜브 성장 컨설턴트입니다. 
      사용자가 올린 영상이 한국 유튜브 검색 및 추천 알고리즘(알고리즘의 선택)을 받을 수 있도록 다음을 생성하세요:
      1. 클릭을 유도하는 '어그로'가 아닌 '매력적인' 제목 (100자 이내)
      2. 검색량이 많은 키워드가 자연스럽게 포함된 상세 설명 (해시태그 3개 포함)
      3. 관련도가 높은 태그 15개
      4. 이 메타데이터가 왜 효과적인지에 대한 간단한 이유`,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "최적화된 유튜브 제목" },
          description: { type: Type.STRING, description: "SEO가 반영된 상세 설명 및 해시태그" },
          tags: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "검색용 태그 리스트"
          },
          justification: { type: Type.STRING, description: "SEO 전략 설명" }
        },
        required: ["title", "description", "tags", "justification"]
      }
    }
  });

  return JSON.parse(response.text || '{}') as SEOSuggestion;
};
