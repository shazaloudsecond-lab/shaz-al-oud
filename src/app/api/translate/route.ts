import { NextRequest, NextResponse } from "next/server";

// In-memory server cache for fast subsequent responses
const serverTranslationCache: Record<string, string> = {};

async function translateSingleText(text: string, targetLang: string = "ar"): Promise<string> {
  if (!text || !text.trim()) return text;
  const trimmed = text.trim();

  // If text already contains Arabic characters, return as is
  if (/[\u0600-\u06FF]/.test(trimmed)) {
    return trimmed;
  }

  // Return from server cache if exists
  const cacheKey = `${targetLang}:${trimmed}`;
  if (serverTranslationCache[cacheKey]) {
    return serverTranslationCache[cacheKey];
  }

  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${encodeURIComponent(
      targetLang
    )}&dt=t&q=${encodeURIComponent(trimmed)}`;

    const response = await fetch(url);

    if (response.ok) {
      const data = await response.json();
      if (data && Array.isArray(data[0])) {
        const translated = data[0].map((item: any) => item[0]).filter(Boolean).join("");
        if (translated) {
          serverTranslationCache[cacheKey] = translated;
          return translated;
        }
      }
    }

    // Secondary fallback: MyMemory Translation API
    const fallbackUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
      trimmed
    )}&langpair=en|${encodeURIComponent(targetLang)}`;
    const fbRes = await fetch(fallbackUrl);
    if (fbRes.ok) {
      const fbData = await fbRes.json();
      if (fbData?.responseData?.translatedText) {
        const translated = fbData.responseData.translatedText;
        serverTranslationCache[cacheKey] = translated;
        return translated;
      }
    }

    return trimmed;
  } catch (error) {
    console.error("Translation API error for text:", trimmed, error);
    return trimmed;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const targetLang = body?.targetLang || "ar";

    if (body?.texts && Array.isArray(body.texts)) {
      const results: Record<string, string> = {};
      const uniqueTexts = Array.from(
        new Set(body.texts.filter((t: any) => typeof t === "string" && t.trim()))
      ) as string[];

      await Promise.all(
        uniqueTexts.map(async (t) => {
          results[t] = await translateSingleText(t, targetLang);
        })
      );

      return NextResponse.json({ translations: results });
    }

    if (body?.text && typeof body.text === "string") {
      const translatedText = await translateSingleText(body.text, targetLang);
      return NextResponse.json({ translatedText });
    }

    return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
  } catch (error: any) {
    console.error("Translate route error:", error);
    return NextResponse.json({ error: error?.message || "Failed to translate" }, { status: 500 });
  }
}
