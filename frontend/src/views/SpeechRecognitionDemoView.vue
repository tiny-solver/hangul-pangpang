<script setup lang="ts">
import { ref, watch } from 'vue'
import { useSpeechRecognition } from '@vueuse/core'

const lang = ref('en-US')

function sample<T>(arr: T[], size: number) {
  const shuffled = arr.slice(0)
  let i = arr.length
  let temp: T
  let index: number
  while (i--) {
    index = Math.floor((i + 1) * Math.random())
    temp = shuffled[index]
    shuffled[index] = shuffled[i]
    shuffled[i] = temp
  }
  return shuffled.slice(0, size)
}

const colors = ['aqua', 'azure', 'beige', 'bisque', 'black', 'blue', 'brown', 'chocolate', 'coral', 'crimson', 'cyan', 'fuchsia', 'ghostwhite', 'gold', 'goldenrod', 'gray', 'green', 'indigo', 'ivory', 'khaki', 'lavender', 'lime', 'linen', 'magenta', 'maroon', 'moccasin', 'navy', 'olive', 'orange', 'orchid', 'peru', 'pink', 'plum', 'purple', 'red', 'salmon', 'sienna', 'silver', 'snow', 'tan', 'teal', 'thistle', 'tomato', 'turquoise', 'violet', 'white', 'yellow', 'transparent']
const grammar = `#JSGF V1.0; grammar colors; public <color> = ${colors.join(' | ')} ;`

const speech = useSpeechRecognition({
  lang,
  continuous: true,
})

const color = ref('transparent')

if (speech.isSupported.value) {
  // @ts-expect-error missing types
  const SpeechGrammarList = window.SpeechGrammarList || window.webkitSpeechGrammarList
  const speechRecognitionList = new SpeechGrammarList()
  speechRecognitionList.addFromString(grammar, 1)
  speech.recognition!.grammars = speechRecognitionList

  speech.recognition!.onsoundstart = () => {
    console.log('onsoundstart')
  }
  speech.recognition!.onsoundend = () => {
    console.log('onsoundend')
  }
  speech.recognition!.onspeechstart = () => {
    console.log('onspeechstart')
  }
  speech.recognition!.onspeechend = () => {
    console.log('onspeechend')
  }
  speech.recognition!.onaudiostart = () => {
    console.log('onaudiostart')
  }
  speech.recognition!.onaudioend = () => {
    console.log('onaudioend')
  }

  watch(speech.result, () => {
    for (const i of speech.result.value.toLowerCase().split(' ').reverse()) {
      if (colors.includes(i)) {
        color.value = i
        break
      }
    }
  })
}

const sampled = ref<string[]>([])

function start() {
  color.value = 'transparent'
  speech.result.value = ''
  sampled.value = sample(colors, 5)
  speech.start()
}

const { isListening, isSupported, stop, result } = speech

const selectedLanguage = ref(lang.value)
watch(lang, lang => isListening.value ? null : selectedLanguage.value = lang)
watch(isListening, isListening => isListening ? null : selectedLanguage.value = lang.value)
</script>

<template>
  <div>
    <div v-if="!isSupported">
      Your browser does not support SpeechRecognition API,
      <a
        href="https://caniuse.com/mdn-api_speechrecognition"
        target="_blank"
      >more details</a>
    </div>
    <div v-else>
      <div space-x-4>
        <label class="radio">
          <input v-model="lang" value="en-US" type="radio">
          <span>English (US)</span>
        </label>
        <label class="radio">
          <input v-model="lang" value="fr" type="radio">
          <span>French</span>
        </label>
        <label class="radio">
          <input v-model="lang" value="es" type="radio">
          <span>Spanish</span>
        </label>
        <label class="radio">
          <input v-model="lang" value="ko-KR" type="radio">
          <span>Korean</span>
        </label>
      </div>
      <button v-if="!isListening" @click="start">
        Press and talk
      </button>
      <p>
          selected: {{ lang }}
        </p>
      <button v-if="isListening" class="orange" @click="stop">
        Stop
      </button>

      <!-- 말하는 아이콘 추가 -->
      <div v-if="isListening" class="speaking-icon"></div>

      <div v-if="isListening" class="mt-4">
        <template v-if="selectedLanguage === 'en-US'">
          <p class="mb-2">
            <b>Please say a color</b>
          </p>
          <p class="mb-2">
            try: {{ sampled.join(', ') }}
          </p>
        </template>
        <p v-else-if="selectedLanguage === 'es'">
          Speak some Spanish!
        </p>
        <p v-else-if="selectedLanguage === 'fr'">
          Speak some French!
        </p>
        <p
          class="tag"
          :style="selectedLanguage === 'en-US' ? { background: color } : {}"
        >
          {{ result }}
        </p>
      </div>
    </div>
  </div>
</template>

<!-- <style scoped>
.tag {
  padding: 0.3rem 0.6rem;
  margin-right: 0.5rem;
  border-radius: 4px;
}
</style> -->

<style scoped lang="postcss">
input {
  --tw-ring-offset-width: 1px !important;
  --tw-ring-color: #8885 !important;
  --tw-ring-offset-color: transparent !important;
}

.radio {
  @apply inline-flex items-center my-auto cursor-pointer select-none;
}

.radio input {
  appearance: none;
  padding: 0;
  display: inline-block;
  vertical-align: middle;
  background-origin: border-box;
  user-select: none;
  flex-shrink: 0;
  height: 1rem;
  width: 1rem;
  @apply bg-gray-400/30;
  @apply rounded-full h-4 w-4 select-none relative;
  @apply mr-1;
}

.radio input:checked::after {
  content: '';
}

/* 말하는 아이콘에 대한 애니메이션 정의 */
.speaking-icon {
  width: 30px;
  height: 30px;
  background-color: #ff5733;
  border-radius: 50%;
  animation: pulse 1s infinite;
  margin: 10px auto;
}

@keyframes pulse {
  0% {
    transform: scale(0.95);
    opacity: 0.7;
  }
  70% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(0.95);
    opacity: 0.7;
  }
}

</style>