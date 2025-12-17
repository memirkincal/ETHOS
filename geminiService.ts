
import { GoogleGenAI } from "@google/genai";
import { AppIntent } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Added missing CUSTOM property to SYSTEM_INSTRUCTIONS to satisfy Record<AppIntent, string>
const SYSTEM_INSTRUCTIONS: Record<AppIntent, string> = {
  [AppIntent.ACADEMIC]: "Sen titiz bir akademik hakemsin. Argümanları eleştir, literatür tutarlılığını kontrol et ve resmi, eleştirel bir üslup koru.",
  [AppIntent.CV]: "Sen uzman bir İK işe alım uzmanı ve ATS (Aday Takip Sistemi) uzmanısın. Anahtar kelimelere, profesyonel etkiye ve özlü formatlamaya odaklan.",
  [AppIntent.HOMEWORK]: "Sen bir eğitim mentorusun. Ödevlerin açıklığına, doğruluğuna ve öğrenci seviyesine uygunluğuna odaklan.",
  [AppIntent.REPORT]: "Sen profesyonel bir rapor hazırlama asistanısın. Veri sunumu, özetleme ve profesyonel dil kullanımına odaklan.",
  [AppIntent.CUSTOM]: "Sen esnek bir yazım asistanısın. Kullanıcının özel şablonu ve tercihleri doğrultusunda rehberlik edersin.",
  [AppIntent.NONE]: "Sen yardımcı bir yazım asistanısın."
};

export const generateAIResponse = async (prompt: string, intent: AppIntent) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTIONS[intent],
        temperature: 0.7,
      },
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Hatası:", error);
    return "Şu anda sinirsel çekirdeğime bağlanmakta sorun yaşıyorum. Lütfen tekrar deneyin.";
  }
};
