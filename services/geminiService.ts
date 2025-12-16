import { GoogleGenAI, Modality } from "@google/genai";
import { AgentType, Message, UserProfile } from '../types';
import { MOCK_TRANSACTIONS, MOCK_SUPPORT_DOCS } from '../constants';
import { decodeAudioData } from './audioUtils';

const genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });

interface GenerationResult {
  text: string;
  groundingUrls?: Array<{ title: string; uri: string }>;
  audioBuffer?: AudioBuffer;
}

const formatProfileContext = (profile?: UserProfile): string => {
  if (!profile) return "";
  return `
  [ユーザープロファイル情報]
  - 年齢: ${profile.ageGroup || "未設定"}
  - 居住地: ${profile.prefecture || "未設定"}
  - 職業: ${profile.occupation || "未設定"}
  - 興味・関心: ${profile.interests.length > 0 ? profile.interests.join(', ') : "未設定"}
  
  回答はこのプロファイル情報を考慮してパーソナライズしてください。
  例えば、年齢層に合わせた言葉遣いや、興味関心に基づいたトピックの選定、職業に関連するアドバイスなどを含めてください。
  `;
};

export const generateAgentResponse = async (
  agentType: AgentType,
  userMessage: string,
  userProfile?: UserProfile
): Promise<GenerationResult> => {

  const profileContext = formatProfileContext(userProfile);

  try {
    switch (agentType) {
      /* -------------------------------------------------------------------------- */
      /* AGENT 1: General Purpose (Grounding with Google Search)                    */
      /* -------------------------------------------------------------------------- */
      case AgentType.GENERAL: {
        const response = await genAI.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: userMessage,
          config: {
            tools: [{ googleSearch: {} }],
            systemInstruction: `You are a helpful general concierge for a banking app. You can answer any questions using Google Search. Always answer in Japanese.\n${profileContext}`
          }
        });

        const text = response.text || "申し訳ありません。回答を生成できませんでした。";
        
        // Extract Grounding Metadata
        const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        const groundingUrls = chunks
          .filter((c: any) => c.web?.uri)
          .map((c: any) => ({ title: c.web.title || '参照元', uri: c.web.uri }));

        return { text, groundingUrls };
      }

      /* -------------------------------------------------------------------------- */
      /* AGENT 2: Customer Support (RAG Simulation)                                 */
      /* -------------------------------------------------------------------------- */
      case AgentType.SUPPORT: {
        // Simulating RAG by injecting docs into system instruction
        const systemPrompt = `
          あなたはGENESIS APPの厳格なカスタマーサポートエージェントです。
          以下のコンテキスト情報のみを使用して質問に答えてください。
          
          ${profileContext}

          コンテキスト:
          ${MOCK_SUPPORT_DOCS}
          
          ルール:
          1. コンテキストに答えがある場合は、丁寧な日本語で答えてください。
          2. コンテキストにない質問や関係ない問い合わせについては、正確に「申し訳ありませんが、対応できません。」とだけ答えてください。
          3. コンテキスト外の一般知識や幻覚を含めないでください。
        `;

        const response = await genAI.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: userMessage,
          config: {
            systemInstruction: systemPrompt,
            temperature: 0.1 // Low temperature for strict adherence
          }
        });

        return { text: response.text || "エラーが発生しました。" };
      }

      /* -------------------------------------------------------------------------- */
      /* AGENT 3: News Analyst (Article + TTS)                                      */
      /* -------------------------------------------------------------------------- */
      case AgentType.NEWS: {
        // Step 1: Search and Generate Text Article
        const searchPrompt = `
          今日の株、債券、不動産、経済指標に関する最新の金融ニュースを探してください。
          これに基づき、包括的な記事（読むのに15分程度かかるボリューム感で、このデモ出力用には500〜800文字程度に要約）を日本語で作成してください。
          明確な見出しを付けて構成してください。

          ユーザーの興味関心: ${userProfile?.interests.join(', ') || '一般'}
          ${profileContext}
          
          ユーザーのクエリ: ${userMessage}
        `;

        const textResponse = await genAI.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: searchPrompt,
          config: {
            tools: [{ googleSearch: {} }],
          }
        });

        const articleText = textResponse.text || "ニュースを取得できませんでした。";
         // Extract Grounding Metadata for the article
         const chunks = textResponse.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
         const groundingUrls = chunks
           .filter((c: any) => c.web?.uri)
           .map((c: any) => ({ title: c.web.title || 'ニュースソース', uri: c.web.uri }));


        // Step 2: Generate Audio Summary (TTS)
        // We summarize the article first for the audio to keep it listenable
        const summaryPrompt = `以下の記事をリスナー向けに1分程度の短い音声スクリプトとして日本語で要約してください:\n\n${articleText}`;
        const summaryResponse = await genAI.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: summaryPrompt
        });
        const summaryText = summaryResponse.text || articleText.substring(0, 500);

        const ttsResponse = await genAI.models.generateContent({
          model: 'gemini-2.5-flash-preview-tts',
          contents: [{ parts: [{ text: summaryText }] }],
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: 'Kore' }, // Kore works for Japanese too usually, or it will fallback gracefully
              },
            },
          },
        });

        const base64Audio = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        let audioBuffer: AudioBuffer | undefined;
        
        if (base64Audio) {
            audioBuffer = await decodeAudioData(base64Audio);
        }

        return { text: articleText, groundingUrls, audioBuffer };
      }

      /* -------------------------------------------------------------------------- */
      /* AGENT 4: Transaction Analyst (BigQuery Data Analysis)                      */
      /* -------------------------------------------------------------------------- */
      case AgentType.ANALYST: {
        const transactionsStr = JSON.stringify(MOCK_TRANSACTIONS, null, 2);
        
        const systemPrompt = `
          あなたはGENESIS APPのファイナンシャルアナリストです。
          BigQueryから取得したユーザーの取引データ（以下に提供）にアクセスし、ユーザーの質問に日本語で答えてください。
          支出の傾向を分析し、経費を分類し、節約に関する具体的なアドバイスを行ってください。

          ${profileContext}
          
          ユーザー取引データ:
          ${transactionsStr}
        `;

        const response = await genAI.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: userMessage,
          config: {
            systemInstruction: systemPrompt
          }
        });

        return { text: response.text || "取引データを分析できませんでした。" };
      }

      default:
        return { text: "不明なエージェントタイプです。" };
    }

  } catch (error) {
    console.error("Gemini API Error:", error);
    return { text: "申し訳ありません。AIコンシェルジュへの接続中にエラーが発生しました。" };
  }
};
