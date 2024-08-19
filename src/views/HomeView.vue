<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue';
import { type Container } from "@tsparticles/engine";
import { useSpeechRecognition } from '@vueuse/core'

const correctSound = new Audio('/sounds/correct-sound.mp3');
const correctSound2 = new Audio('/sounds/correct-sound2.mp3');
const incorrectSound = new Audio('/sounds/incorrect-sound.mp3');


const lang = ref('ko-KR');

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

const speech = useSpeechRecognition({
  lang,
  continuous: true,
})

const color = ref('transparent')

const colors = ['aqua', 'azure', 'beige', 'bisque', 'black', 'blue', 'brown', 'chocolate', 'coral', 'crimson', 'cyan', 'fuchsia', 'ghostwhite', 'gold', 'goldenrod', 'gray', 'green', 'indigo', 'ivory', 'khaki', 'lavender', 'lime', 'linen', 'magenta', 'maroon', 'moccasin', 'navy', 'olive', 'orange', 'orchid', 'peru', 'pink', 'plum', 'purple', 'red', 'salmon', 'sienna', 'silver', 'snow', 'tan', 'teal', 'thistle', 'tomato', 'turquoise', 'violet', 'white', 'yellow', 'transparent']
const grammar = `#JSGF V1.0; grammar colors; public <color> = ${colors.join(' | ')} ;`

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

const selectedTheme = ref('fruits'); // 기본 테마

const selectedLanguage = ref(lang.value)
watch(lang, lang => isListening.value ? null : selectedLanguage.value = lang)
watch(isListening, isListening => isListening ? null : selectedLanguage.value = lang.value)

interface Word {
  word: string;
  image_url: string;
  english: string;
}

const wordPool = ref<Word[]>([]);
const currentWord = ref<Word | null>(null);

const loadWordPool = async () => {
  try {
    console.log('load')
    const response = await fetch(`/${selectedTheme.value}.json`);
    console.log('loaded')
    if (response.ok) {
      wordPool.value = await response.json();
      nextWord();
    } else {
      console.error('Failed to load JSON file:', response.statusText);
    }
  } catch (error) {
    console.error('Error fetching JSON file:', error);
  }
};


const currentStage = ref(1);
const userAnswer = ref('');
const isAnswerCorrect = ref(false);
const showParticles = ref(false);
const timeLeft = ref(15);
let timer: ReturnType<typeof setInterval>;
const timeWaitAnswerCheckLeft = ref(2); // 말하고 난 뒤 2초뒤 답 체크
let timerSpeechIsAnswer: ReturnType<typeof setInterval>;

const startGame = () => {
  nextWord();
};

const nextWord = () => {
  if (wordPool.value.length > 0) {
    currentWord.value = wordPool.value[Math.floor(Math.random() * wordPool.value.length)];
  }
  userAnswer.value = '';
  isAnswerCorrect.value = false;
  currentStage.value = 1;
  timeLeft.value = 15;
  startTimer();

  showParticles.value = false;
};

const checkAnswer = () => {
  if (userAnswer.value.toLowerCase() === currentWord.value!.english.toLowerCase()
  || userAnswer.value.toLowerCase() === currentWord.value!.word.toLowerCase()) {
    isAnswerCorrect.value = true;
    clearInterval(timer);

    showParticles.value = true;
    
    // sound effect for correct answer
    correctSound.play();
    correctSound2.play();
  } else {
    // sound effect for wrong answer
    incorrectSound.play();

    const rootDiv = document.querySelector('.root-div'); // root div 선택
    if (rootDiv) {
      rootDiv.classList.add('shake');
      setTimeout(() => {
        rootDiv.classList.remove('shake');
      }, 500); // 0.5초 후 흔들림 효과 제거
    }
  }
};

const startTimer = () => {
  timer = setInterval(() => {
    if (timeLeft.value > 0) {
      timeLeft.value -= 1;
    } else if (currentStage.value === 1) {
      currentStage.value = 2;
      timeLeft.value = 15;
    } else {
      clearInterval(timer);
      checkAnswer();
      currentStage.value = 3;
    }
  }, 1000);
};

const startTimerWaitingSpeechIsAnswer = () => {
  if (timerSpeechIsAnswer) {
    clearInterval(timerSpeechIsAnswer);
  }
  timeWaitAnswerCheckLeft.value = 2;

  timerSpeechIsAnswer = setInterval(() => {
    if (timeWaitAnswerCheckLeft.value > 0) {
      timeWaitAnswerCheckLeft.value -= 1;
    } else {
      clearInterval(timerSpeechIsAnswer);
      checkAnswer();
    }
  }, 1000);
};

const particlesLoaded = async (container: Container) => {
    console.log("Particles container loaded", container);
};

const startRecording = () => {
  start();
};

const stopRecording = () => {
  stop();
}

watch(result, () => {
  userAnswer.value = result.value.trim();
  console.log('result changed', result.value);
  startTimerWaitingSpeechIsAnswer();
});

onMounted(() => {
  loadWordPool();
  // startGame();
});
</script>


<template>

  <div class="min-h-screen flex flex-col justify-center items-center bg-gray-100 p-4 root-div">
    <!-- 타이머 표시 -->
    <div class="w-full max-w-md">
      <div class="h-4 bg-gray-300 rounded-full overflow-hidden mb-4">
        <div
          class="h-full bg-blue-500 transition-all duration-1000"
          :style="{ width: `${(timeLeft / 15) * 100}%` }"
        ></div>
      </div>
      <div class="text-right text-gray-700 mb-4">
        Time left: {{ timeLeft }} seconds
      </div>
    </div>
    
    <!-- 단어 표시 -->
    <div v-if="!isAnswerCorrect && currentStage === 1" class="text-9xl font-bold text-gray-800 mb-4 relative z-10">
      {{ currentWord?.word }}
    </div>
    <div v-if="currentStage > 1 || isAnswerCorrect" class="flex flex-col items-center relative z-10">
      <div class="text-9xl font-bold text-gray-800 mb-4">{{ currentWord?.word }}</div>
      <img :src="currentWord?.image_url" alt="Image" class="max-w-96 object-cover rounded-md shadow-lg z-10"/>
    </div>

    <!-- 입력과 제출 -->
    <div v-if="!isAnswerCorrect && currentStage !== 3" class="mt-4">
      <input 
        type="text" 
        v-model="userAnswer" 
        @keyup.enter="checkAnswer"
        placeholder="Type your answer..."
        class="p-2 border rounded-md"
      />
      <button @click="checkAnswer" class="ml-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md">
        Submit
      </button>
    </div>
    
    <!-- 정답 안내 -->
    <div v-if="currentStage === 3" class="mt-4 text-red-600">
      Time's up! The correct answer is: {{ currentWord?.english }}
    </div>
    
    <!-- 다음 버튼 -->
    <button v-if="isAnswerCorrect || currentStage === 3" @click="nextWord" class="mt-4 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md z-10">
      Next
    </button>
    <!-- 음성 녹음 버튼 및 스피너 -->
    <div v-if="currentStage !== 3" class="mt-4 flex flex-col items-center">
      <button @click="isListening ? stopRecording() : startRecording()" 
              :class="isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'"
              class="px-4 py-2 text-white rounded-md">
        {{ isListening ? '🎤 Stop Recording' : '🎤 Start Recording' }}
      </button>
      <!-- 말하는 아이콘 추가 -->
      <div v-if="isListening" class="speaking-icon"></div>
    </div>
    <div class="mt-4">
      <label for="theme-select" class="mr-2">Choose a wordpool:</label>
      <select id="theme-select" v-model="selectedTheme" @change="loadWordPool">
        <option value="fruits">과일들</option>
        <option value="tinyping">티니핑</option>
      </select>
    </div>
  </div>
  <!-- 파티클 효과 -->
  <vue-particles v-if="showParticles" id="tsparticles" @particles-loaded="particlesLoaded" url="/particles.json" />
</template>


<style scoped>
/* 스피너 기본 스타일 */
.spinner {
  width: 50px;
  height: 50px;
  border: 8px solid #ccc;
  border-top: 8px solid #3498db;
  border-radius: 50%;
  animation: spin 2s linear infinite;
  transition: transform 0.3s ease-in-out;
}

/* 사용자가 말할 때 스피너 확대 */
.spinner-grow {
  width: 50px;
  height: 50px;
  border: 8px solid #ccc;
  border-top: 8px solid #3498db;
  border-radius: 50%;
  animation: spin 2s linear infinite;
  transition: transform 0.3s ease-in-out;
  transform: scale(1.5);
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
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

@keyframes shake {
  0% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  50% { transform: translateX(10px); }
  75% { transform: translateX(-10px); }
  100% { transform: translateX(0); }
}

.shake {
  animation: shake 0.5s ease-in-out;
}
</style>