/* eslint-disable */
import { ref } from 'vue';

// Vereinfachtes Interface eines nativen Capacitor Plugins (muss nativ implementiert werden – siehe unten).
// Wir deklarieren das TS-Interface; zur Laufzeit prüfen wir, ob window.Capacitor?.Plugins?.MlkitTranslate existiert.
interface MlkitTranslatePlugin {
  downloadModel(options: { language: string }): Promise<{ success: boolean }>;
  isModelDownloaded(options: { language: string }): Promise<{ downloaded: boolean }>;
  translate(options: { sourceLang: string; targetLang: string; text: string }): Promise<{ text: string }>;
}

// eigene Hook-Funktion
export function useMlkitTranslator() {
  const downloading = ref(false);
  const translating = ref(false);
  const progressMsg = ref('');
  const errorMsg = ref('');

  // Prüfen, ob Native Plugin vorhanden ist
  const mlkit: MlkitTranslatePlugin | undefined = (window as any)?.Capacitor?.Plugins?.MlkitTranslate;

  async function ensureModel(lang: string) {
    if (!mlkit) return; // im Web-Fallback ignorieren
    try {
      const { downloaded } = await mlkit.isModelDownloaded({ language: lang });
      if (!downloaded) {
        downloading.value = true;
        progressMsg.value = `Lade Sprachmodell (${lang}) ...`;
        await mlkit.downloadModel({ language: lang });
      }
    } catch (err: any) {
      errorMsg.value = err?.message ?? String(err);
    } finally {
      downloading.value = false;
      progressMsg.value = '';
    }
  }

  async function translateText(sourceLang: string, targetLang: string, text: string): Promise<string> {
    if (!text.trim()) return '';

    // Wenn kein natives Plugin vorhanden → Web-basierte Übersetzung
    if (!mlkit) {
      translating.value = true;
      progressMsg.value = 'Übersetze...';
      
      try {
        // Versuche Chrome's built-in Translation API (experimentell)
        if ('translation' in window && 'createTranslator' in (window as any).translation) {
          try {
            const translator = await (window as any).translation.createTranslator({
              sourceLanguage: sourceLang,
              targetLanguage: targetLang
            });
            await translator.ready;
            const result = await translator.translate(text);
            translating.value = false;
            progressMsg.value = '';
            return result;
          } catch (err) {
            console.log('Chrome Translation API Fehler:', err);
          }
        }

        // Fallback: LibreTranslate API (Open Source Alternative)
        try {
          const response = await fetch('https://libretranslate.de/translate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              q: text,
              source: sourceLang,
              target: targetLang,
              format: 'text'
            })
          });
          
          if (response.ok) {
            const data = await response.json();
            translating.value = false;
            progressMsg.value = '';
            return data.translatedText;
          }
        } catch (err) {
          console.log('LibreTranslate API Fehler:', err);
        }

        // Fallback: MyMemory API (kostenlos)
        try {
          const langPair = `${sourceLang}|${targetLang}`;
          const response = await fetch(
            `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langPair}`
          );
          
          if (response.ok) {
            const data = await response.json();
            if (data.responseStatus === 200) {
              translating.value = false;
              progressMsg.value = '';
              return data.responseData.translatedText;
            }
          }
        } catch (err) {
          console.log('MyMemory API Fehler:', err);
        }

        // Wenn alle APIs fehlschlagen
        translating.value = false;
        progressMsg.value = '';
        errorMsg.value = 'Übersetzung fehlgeschlagen. Bitte versuchen Sie es später erneut.';
        return text; // Originaltext zurückgeben
        
      } catch (err: any) {
        translating.value = false;
        progressMsg.value = '';
        errorMsg.value = err?.message ?? 'Übersetzung fehlgeschlagen';
        return text;
      }
    }

    // Sicherstellen, dass Modelle vorhanden (Quelle + Ziel)
    await ensureModel(sourceLang);
    await ensureModel(targetLang);

    try {
      translating.value = true;
      progressMsg.value = 'Übersetze...';
      const { text: translated } = await mlkit.translate({ sourceLang, targetLang, text });
      return translated;
    } catch (err: any) {
      errorMsg.value = err?.message ?? String(err);
      return '';
    } finally {
      translating.value = false;
      progressMsg.value = '';
    }
  }

  return {
    downloading,
    translating,
    progressMsg,
    errorMsg,
    translateText,
  };
}