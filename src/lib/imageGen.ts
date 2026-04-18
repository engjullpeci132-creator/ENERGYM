import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateGymImage(prompt: string) {
  const fetchWithTimeout = async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-image-preview',
      contents: {
        parts: [{ text: `A high-end, professional, ultra-realistic photograph for a luxury gym. ${prompt}. Cinematic lighting, 8k resolution, photorealistic detail, intense atmosphere.` }]
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9"
        }
      }
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data && part.inlineData.data.length > 100) {
          console.log(`Generated AI image for: ${prompt.slice(0, 20)}...`);
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    throw new Error("No valid binary image data");
  };

  try {
    // 30s internal timeout for AI generation before returning fallback
    return await Promise.race([
      fetchWithTimeout(),
      new Promise<string>((resolve) => 
        setTimeout(() => {
          console.warn("AI Generation timed out, using fallback for:", prompt.slice(0, 20));
          const gymPhotoIds = [
            "1534438327276-14e5300c3a48", "1540497077202-7c8a3999166f", 
            "1593079831268-3381b0db4a77", "1571019613454-1cb2f99b2d8b", 
            "1517836357463-d25dfeac3438", "1544033527-b192daee1f5b"
          ];
          const photoId = gymPhotoIds[Math.floor(Math.random() * gymPhotoIds.length)];
          resolve(`https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&q=80&w=1920&h=1080`);
        }, 30000)
      )
    ]);
  } catch (error) {
    console.error("AI Image Generation Error:", error);
    const gymPhotoIds = [
      "1534438327276-14e5300c3a48", "1540497077202-7c8a3999166f", 
      "1593079831268-3381b0db4a77", "1571019613454-1cb2f99b2d8b", 
      "1517836357463-d25dfeac3438", "1544033527-b192daee1f5b"
    ];
    const photoId = gymPhotoIds[Math.floor(Math.random() * gymPhotoIds.length)];
    return `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&q=80&w=1920&h=1080`;
  }
}
