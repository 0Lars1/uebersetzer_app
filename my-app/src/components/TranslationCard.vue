<template>
  <ion-card v-if="text">
    <ion-card-header>
      <ion-card-title>Übersetzung</ion-card-title>
    </ion-card-header>
    <ion-card-content>
      <p class="translated-text">{{ text }}</p>
      <ion-grid>
        <ion-row>
          <ion-col size="4">
            <ion-button size="small" expand="block" @click="copyText">Kopieren</ion-button>
          </ion-col>
          <ion-col size="4">
            <ion-button size="small" expand="block" @click="speakText">Vorlesen</ion-button>
          </ion-col>
          <ion-col size="4">
            <ion-button color="medium" size="small" expand="block" @click="$emit('clear')">Löschen</ion-button>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-card-content>
  </ion-card>
</template>

<script setup lang="ts">
import {
  IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonButton, IonGrid, IonRow, IonCol, IonToast
} from '@ionic/vue';
import { Clipboard } from '@capacitor/clipboard';
import { TextToSpeech } from '@capacitor-community/text-to-speech';
import { defineProps, ref } from 'vue';

const props = defineProps<{ text: string; lang: string }>();
const showToast = ref(false);
const toastMessage = ref('');

async function copyText() {
  await Clipboard.write({ string: props.text });
  toastMessage.value = 'Text in die Zwischenablage kopiert';
  showToast.value = true;
}

async function speakText() {
  try {
    await TextToSpeech.speak({
      text: props.text,
      lang: props.lang || 'en-US',
      rate: 1.0,
      pitch: 1.0,
      volume: 1.0,
      category: 'ambient'
    });
  } catch (err) {
    // Fallback auf Browser SpeechSynthesis
    const synth = window.speechSynthesis;
    if (synth) {
      const utter = new SpeechSynthesisUtterance(props.text);
      utter.lang = props.lang;
      synth.speak(utter);
    }
  }
}
</script>

<style scoped>
.translated-text {
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
