export const SUPPORTED_LANGS = [
  { code: 'de', label: 'Deutsch', tts: 'de-DE' },
  { code: 'en', label: 'Englisch', tts: 'en-US' },
  { code: 'fr', label: 'Französisch', tts: 'fr-FR' },
  { code: 'it', label: 'Italienisch', tts: 'it-IT' },
  { code: 'es', label: 'Spanisch', tts: 'es-ES' },
];

export function labelFor(code: string): string {
  return SUPPORTED_LANGS.find(l => l.code === code)?.label ?? code;
}

export function ttsFor(code: string): string {
  return SUPPORTED_LANGS.find(l => l.code === code)?.tts ?? 'en-US';
}
