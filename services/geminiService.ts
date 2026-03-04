import { GoogleGenAI, Tool, Part } from "@google/genai";
import { FactCheckResponse, VerdictType } from "../types";

const STORAGE_KEY = 'factchecker_gemini_key';

const getClient = () => {
  const apiKey = localStorage.getItem(STORAGE_KEY);
  if (!apiKey) {
    throw new Error("No API key found. Please add your Gemini API key using the key icon in the header.");
  }
  return new GoogleGenAI({ apiKey });
};


/**
 * Converts a File object to a GoogleGenAI Part object (base64)
 */
const fileToPart = (file: File): Promise<Part> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve({
        inlineData: {
          data: base64String,
          mimeType: file.type
        }
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Extracts frames from a video file at regular intervals.
 * Returns an array of Parts containing inline image data.
 */
const extractFramesFromVideo = async (videoFile: File, maxFrames = 8): Promise<Part[]> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const parts: Part[] = [];
    const url = URL.createObjectURL(videoFile);

    video.src = url;
    video.muted = true;
    video.playsInline = true;
    video.crossOrigin = "anonymous";

    const captureFrame = () => {
      if (!ctx) return;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const base64 = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
      parts.push({
        inlineData: {
          mimeType: 'image/jpeg',
          data: base64
        }
      });
    };

    video.onloadedmetadata = async () => {
      try {
        const duration = video.duration;
        // Extract a frame every (duration / maxFrames) seconds
        const interval = Math.max(1, duration / maxFrames);

        let currentTime = 0;
        while (currentTime < duration && parts.length < maxFrames) {
          video.currentTime = currentTime;
          await new Promise<void>((r) => {
            const onSeek = () => {
              video.removeEventListener('seeked', onSeek);
              r();
            };
            video.addEventListener('seeked', onSeek);
          });
          captureFrame();
          currentTime += interval;
        }
        resolve(parts);
      } catch (e) {
        reject(e);
      } finally {
        URL.revokeObjectURL(url);
        video.remove();
        canvas.remove();
      }
    };

    video.onerror = (e) => {
      reject(new Error("Could not load video"));
    };
  });
};

const parseResponseText = (text: string, groundingChunks: any[]): FactCheckResponse => {
  let verdict = VerdictType.UNVERIFIED;
  const firstLine = text.split('\n')[0].trim().toUpperCase();

  if (firstLine.includes("VERDICT: TRUE")) verdict = VerdictType.TRUE;
  else if (firstLine.includes("VERDICT: FALSE")) verdict = VerdictType.FALSE;
  else if (firstLine.includes("VERDICT: MISLEADING")) verdict = VerdictType.MISLEADING;
  else if (firstLine.includes("VERDICT: COMPLEX")) verdict = VerdictType.COMPLEX;

  // Remove the verdict line from the display text
  const displayText = text.replace(/^VERDICT:.*\n?/, '').trim();

  return {
    text: displayText,
    verdict,
    groundingChunks,
  };
};

export const verifyClaim = async (claim: string): Promise<FactCheckResponse> => {
  const ai = getClient();
  const modelId = "gemini-2.5-flash";

  const systemInstruction = `
    You are RUJU, Nepal's premier independent fact-checking AI. 
    Your goal is to verify public information, promote truth, and debunk misinformation spread in Nepal.
    
    When analyzing a claim:
    1. Rigorous fact-checking using Google Search.
    2. Check against known reliable Nepali sources (e.g., Kantipur, Setopati, Kathmandu Post, Himalayan Times, OnlineKhabar).
    3. Be objective, non-partisan, and clear.
    
    FORMATTING OUTPUT:
    Your response must start with a single line containing exactly one of these tags:
    VERDICT: TRUE
    VERDICT: FALSE
    VERDICT: MISLEADING
    VERDICT: UNVERIFIED
    VERDICT: COMPLEX
    
    After the verdict line, provide a comprehensive analysis in Markdown format. 
    - Summarize the claim.
    - Provide the evidence found.
    - Explain the reasoning for the verdict.
  `;

  const tools: Tool[] = [{ googleSearch: {} }];

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: `Fact check this claim: "${claim}"`,
      config: {
        tools: tools,
        systemInstruction: systemInstruction,
      },
    });

    const text = response.text || "No analysis generated.";
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    return parseResponseText(text, groundingChunks);

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to verify claim. Please try again later.");
  }
};

export const verifyMediaClaim = async (file: File, caption: string): Promise<FactCheckResponse> => {
  const ai = getClient();
  const modelId = "gemini-2.5-flash";
  const isVideo = file.type.startsWith('video/');

  const systemInstruction = `
    You are RUJU. You have been provided with ${isVideo ? 'frames from a video' : 'an image'} and a user caption/claim.
    
    Your tasks:
    1. Analyze the visual content carefully.
    2. ${isVideo ? 'Generate a transcript/description of the events in the video frames.' : 'Describe the image context.'}
    3. Use Google Search to find if this image/video is existing footage being misused, a deepfake, or genuine news.
    4. Verify the user's caption against the visual evidence and search results.

    FORMATTING OUTPUT:
    First line: VERDICT: [TRUE | FALSE | MISLEADING | UNVERIFIED | COMPLEX]
    Then provide:
    - **Visual Analysis**: What is happening in the media?
    - **Fact Check**: Verification of the claim/caption.
    - **Source Check**: Origin of the footage if found.
  `;

  const tools: Tool[] = [{ googleSearch: {} }];

  try {
    let mediaParts: Part[] = [];

    if (isVideo) {
      // Extract frames for video analysis
      mediaParts = await extractFramesFromVideo(file);
    } else {
      // Single image analysis
      mediaParts = [await fileToPart(file)];
    }

    const response = await ai.models.generateContent({
      model: modelId,
      contents: [
        ...mediaParts,
        { text: `User Claim/Caption: "${caption || 'Verify the authenticity of this content.'}"` }
      ],
      config: {
        tools: tools,
        systemInstruction: systemInstruction,
      },
    });

    const text = response.text || "No analysis generated.";
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    return parseResponseText(text, groundingChunks);

  } catch (error) {
    console.error("Gemini Media API Error:", error);
    throw new Error("Failed to verify media. " + (error instanceof Error ? error.message : ""));
  }
};

export const findAndVerifyRecentNews = async (): Promise<FactCheckResponse> => {
  const ai = getClient();
  const modelId = "gemini-2.5-flash";

  const prompt = "Find the most trending controversial news topic or rumor currently circulating in Nepal today. State the rumor clearly, then perform a deep fact check on it using Google Search.";

  const systemInstruction = `
    You are RUJU. Find a trending topic in Nepal.
    Your response must start with a single line containing exactly one of these tags:
    VERDICT: TRUE
    VERDICT: FALSE
    VERDICT: MISLEADING
    VERDICT: UNVERIFIED
    VERDICT: COMPLEX
    
    After the verdict, start with a header "# Claim: [The Claim Title]" and then proceed with the analysis.
   `;

  const tools: Tool[] = [{ googleSearch: {} }];

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        tools: tools,
        systemInstruction: systemInstruction,
      },
    });

    const text = response.text || "No analysis generated.";
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    return parseResponseText(text, groundingChunks);

  } catch (error) {
    console.error("Gemini Trending Error", error);
    throw error;
  }
};

export const translateContent = async (text: string, targetLanguage: string): Promise<string> => {
  const ai = getClient();
  const modelId = "gemini-2.5-flash";

  const prompt = `
      Translate the following Fact Check analysis into ${targetLanguage}.
      
      IMPORTANT INSTRUCTIONS:
      1. Maintain ALL Markdown formatting (bolding, headers, bullet points) exactly as is.
      2. Do not summarize or shorten the content. Translate it fully.
      3. Keep the tone objective, journalistic, and formal.
      4. Ensure technical terms like "Verdict" or "Fact Check" are translated appropriately for the context of Nepal media if the target is Nepali.
      
      Text to translate:
      ${text}
    `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
    });
    return response.text || text;
  } catch (e) {
    console.error("Translation failed", e);
    return text; // Fallback to original if translation fails
  }
};