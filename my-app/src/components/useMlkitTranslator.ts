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

    // Wenn kein natives Plugin vorhanden → Fallback (Demo-Übersetzung)
    if (!mlkit) {
      translating.value = true;
      progressMsg.value = 'Simuliere Übersetzung (Dev/Web)...';
      await new Promise((resolve) => setTimeout(resolve, 600));
      translating.value = false;
      progressMsg.value = '';
      return `[${targetLang.toUpperCase()}-Pseudo] ${text}`;
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