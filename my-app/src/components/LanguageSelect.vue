<template>
  <ion-item>
    <ion-label>{{ label }}</ion-label>
    <ion-select interface="popover" :value="modelValue" @ionChange="onChange" :aria-label="label">
      <ion-select-option v-for="lang in langs" :key="lang.code" :value="lang.code">{{ lang.label }}</ion-select-option>
    </ion-select>
  </ion-item>
</template>

<script setup lang="ts">
import { IonItem, IonLabel, IonSelect, IonSelectOption } from '@ionic/vue';
import { SUPPORTED_LANGS } from '../data/languages';
import { defineProps, defineEmits } from 'vue';

const props = defineProps<{ label: string; modelValue: string }>();
const emit = defineEmits(['update:modelValue']);

const langs = SUPPORTED_LANGS;

function onChange(ev: CustomEvent) {
  emit('update:modelValue', ev.detail.value);
}
</script>
