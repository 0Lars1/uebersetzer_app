<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Übersetzer</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="swapLangs" aria-label="Sprachen tauschen">
            <ion-icon :icon="swapVertical" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <!-- Quellsprachauswahl -->
      <language-select label="Quellsprache" v-model="sourceLang" />

      <!-- Zielsprachauswahl -->
      <language-select label="Zielsprache" v-model="targetLang" />

      <!-- Texteingabe -->
      <ion-item lines="full">
        <ion-textarea auto-grow placeholder="Text eingeben..." v-model="sourceText" />
      </ion-item>

      <ion-button expand="block" class="ion-margin-top" :disabled="!canTranslate" @click="doTranslate">Übersetzen</ion-button>

      <!-- Ergebnis -->
      <translation-card
        v-if="translatedText"
        :text="translatedText"
        :lang="ttsFor(targetLang)"
        @clear="clearOutput"
      />

      <!-- Ladeindikator -->
      <ion-loading :is-open="showLoading" :message="progressMsg" />

    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon,
  IonContent, IonItem, IonTextarea, IonLoading
} from '@ionic/vue';
import { ref, computed } from 'vue';
import { swapVertical } from 'ionicons/icons';
import LanguageSelect from '../components/LanguageSelect.vue';
import TranslationCard from '../components/TranslationCard.vue';
import { useMlkitTranslator } from '../components/useMlkitTranslator';
import { ttsFor } from '../data/languages';

const sourceLang = ref('de');
const targetLang = ref('en');
const sourceText = ref('');
const translatedText = ref('');

const { downloading, translating, progressMsg, errorMsg, translateText } = useMlkitTranslator();

const showLoading = computed(() => downloading.value || translating.value);
const canTranslate = computed(() => sourceText.value.trim().length > 0 && sourceLang.value !== targetLang.value);

async function doTranslate() {
  translatedText.value = '';
  const result = await translateText(sourceLang.value, targetLang.value, sourceText.value);
  translatedText.value = result;
}

function clearOutput() {
  translatedText.value = '';
}

function swapLangs() {
  const tmp = sourceLang.value;
  sourceLang.value = targetLang.value;
  targetLang.value = tmp;
  // optional: sofortige Neuübersetzung
  if (sourceText.value.trim()) {
    doTranslate();
  }
}
</script>

<style scoped>
ion-textarea {
  min-height: 120px;
}
</style>
