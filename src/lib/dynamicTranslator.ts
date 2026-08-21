/**
 * Dynamic Content Translation Manager
 * Automatically translates database content (products, banners, hero slides, badges, about stories, etc.)
 * from English to Arabic at runtime when Arabic language is selected.
 * 
 * Features:
 * - Real-time dynamic translation via /api/translate
 * - In-memory and localStorage persistence
 * - Debounced batch requests for optimal performance
 * - Reactive listener triggering UI updates as translations resolve
 */

const STORAGE_CACHE_KEY = "shaz_dynamic_translations_ar";

// In-memory translation map
let dynamicCache: Record<string, string> = {};

// Translation subscribers
type Listener = () => void;
const listeners = new Set<Listener>();

// Initialize cache from localStorage on client
if (typeof window !== "undefined") {
  try {
    const saved = localStorage.getItem(STORAGE_CACHE_KEY);
    if (saved) {
      dynamicCache = JSON.parse(saved);
    }
  } catch (e) {
    console.warn("Failed to load translation cache from localStorage", e);
  }
}

// Queue of texts waiting to be translated
const pendingQueue = new Set<string>();
let batchTimeout: NodeJS.Timeout | null = null;

function saveCacheToStorage() {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_CACHE_KEY, JSON.stringify(dynamicCache));
    } catch (e) {
      console.warn("Failed to save translation cache to localStorage", e);
    }
  }
}

function notifySubscribers() {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch (err) {
      console.error("Translation listener error:", err);
    }
  });
}

/**
 * Executes a batched translation request for all queued texts
 */
async function processBatchQueue() {
  if (pendingQueue.size === 0) return;

  const textsToTranslate = Array.from(pendingQueue);
  pendingQueue.clear();

  try {
    const res = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texts: textsToTranslate, targetLang: "ar" }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data?.translations) {
        let hasNew = false;
        Object.entries(data.translations).forEach(([orig, trans]) => {
          if (typeof trans === "string" && trans.trim()) {
            dynamicCache[orig] = trans;
            hasNew = true;
          }
        });

        if (hasNew) {
          saveCacheToStorage();
          notifySubscribers();
        }
      }
    }
  } catch (error) {
    console.error("Batch translation request failed:", error);
  }
}

function queueForTranslation(text: string) {
  if (!text || !text.trim() || /[\u0600-\u06FF]/.test(text)) return;
  if (dynamicCache[text]) return;

  pendingQueue.add(text);

  if (batchTimeout) {
    clearTimeout(batchTimeout);
  }
  batchTimeout = setTimeout(() => {
    processBatchQueue();
  }, 40); // 40ms debounce to collect all components on page mount
}

/**
 * Translates dynamic database strings to Arabic if Arabic language is active.
 * If translation is pending, queues background translation and notifies components on completion.
 */
export function translateDynamic(
  text: string | null | undefined,
  language: "en" | "ar" = "en"
): string {
  if (!text) return "";
  if (language !== "ar") return text;

  const trimmed = text.trim();
  if (!trimmed) return "";

  // If already Arabic text, return directly
  if (/[\u0600-\u06FF]/.test(trimmed)) {
    return text;
  }

  // If translation exists in cache, return it
  if (dynamicCache[trimmed]) {
    return dynamicCache[trimmed];
  }

  // Queue for dynamic translation
  queueForTranslation(trimmed);

  // Return original text temporarily while background translation completes
  return text;
}

/**
 * Hook subscriber so React components re-render when new dynamic translations arrive
 */
export function subscribeToTranslations(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
