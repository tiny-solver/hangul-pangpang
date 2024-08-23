<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue';
import { type Container } from "@tsparticles/engine";
import { useSpeechRecognition } from '@vueuse/core'

// constants
const timeOut = 15; // 15 seconds
const waitTimeMS = 200; // 0.2 seconds
const waitTimeVADInMS = 1000; // 1 seconds
const correctSound = new Audio('/sounds/correct-sound.mp3');
const correctSound2 = new Audio('/sounds/correct-sound2.mp3');
const incorrectSound = new Audio('/sounds/incorrect-sound.mp3');

const lang = ref('ko-KR');
const speech = useSpeechRecognition({
  lang,
  continuous: true,
})

if (speech.isSupported.value) {
  
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
}

function setupGrammerList(words: string[]) {
  // @ts-expect-error missing types
  const SpeechGrammarList = window.SpeechGrammarList || window.webkitSpeechGrammarList
  if (!SpeechGrammarList) {
    console.warn('SpeechGrammarList is not supported');
  } else {
    const grammar = `#JSGF V1.0; grammar words; public <words> = ${words.join(' | ')} ;`

    // if grammerlist supported, set it
    const speechRecognitionList = new SpeechGrammarList();
    speechRecognitionList.addFromString(grammar, 1);
    speech.recognition!.grammars = speechRecognitionList;

    console.log('[*] setupGrammerList:', words);
  }
}

function startGame(isNewGame = false) {
  if (isNewGame) {
    // shuffle word pool
    wordPoolForGame.value = [...wordPool.value];
    wordPoolForGame.value.sort(() => Math.random() - 0.5);
    console.log('setup new game, wordPoolForGame:', wordPoolForGame.value.length, wordPoolForGame.value);
    setupGrammerList(wordPoolForGame.value.map(w => w.word));
  }
  resetGameState();
  nextWord();
  // start timer
  startGameTimer();
}

const { isListening, isSupported } = speech
const isSomeoneSaying = ref(false);

const selectedTheme = ref('tinyping'); // 기본 테마, 단어풀

interface Word {
  word: string;
  image_url: string;
  english: string;
}

const wordPool = ref<Word[]>([]);
const wordPoolForGame = ref<Word[]>([]);
const currentWord = ref<Word | null>(null);

const loadWordPool = async () => {
  try {
    console.log('async load word pool')
    const response = await fetch(`/${selectedTheme.value}.json`);
    
    if (response.ok) {
      wordPool.value = await response.json();
      console.log('loaded, start new Game')
      startGame(true);
    } else {
      console.error('Failed to load JSON file:', response.statusText);
    }
  } catch (error) {
    console.error('Error fetching JSON file:', error);
  }
};

enum Stage {
  Stage1_JustWord = 1,
  Stage2_WordWithImages = 2,
  Stage3_Result = 3,
}

const currentStage = ref(Stage.Stage1_JustWord);
const userAnswer = ref('');
const isAnswerCorrect = ref(false);
const showParticles = ref(false);

// 정답을 맞추는데 남은 시간
const timeLeftGame = ref(timeOut);
let timerGame: ReturnType<typeof setInterval>;

// 정답 체크를 위한 딜레이, 음성 입력 후 waitTimeMS초 뒤에 체크
const waitTimeLeftGradingAnswerInMS = ref(waitTimeMS);
let timerDelayGradingAnswer: ReturnType<typeof setInterval>;

  // 정답 체크를 위한 딜레이, 음성 입력 후 waitTimeMS초 뒤에 체크
const waitTimeLeftVADInMS = ref(waitTimeVADInMS);
let timerVAD: ReturnType<typeof setInterval>;

const resetGameState = () => {
  // reset
  clearInterval(timerGame);
  speech.result.value = '';
  showParticles.value = false;
  userAnswer.value = '';
  isAnswerCorrect.value = false;
  currentStage.value = Stage.Stage1_JustWord;
  timeLeftGame.value = timeOut;
}

const nextWord = () => {
  // pick a word
  if (wordPoolForGame.value.length === 0) {
    wordPoolForGame.value = [...wordPool.value];
  }

  const pickIndex = Math.floor(Math.random() * wordPoolForGame.value.length);
  currentWord.value = wordPoolForGame.value[pickIndex];
  wordPoolForGame.value.splice(pickIndex, 1);

  console.log("nextWord: ", currentWord.value, ", leftCount: ", wordPoolForGame.value.length);
};

const gradeAnswer = () => {
  if (userAnswer.value.toLowerCase() === currentWord.value!.word.toLowerCase()) {
    isAnswerCorrect.value = true;
    currentStage.value = Stage.Stage3_Result;
    clearInterval(timerGame);

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

const startGameTimer = () => {
  timerGame = setInterval(() => {
    if (timeLeftGame.value > 0) {
      timeLeftGame.value -= 1;
    } else {
      callbackTimeOut();
    }
  }, 1000);
};

const callbackTimeOut = () => {
  switch(currentStage.value) {
    case Stage.Stage1_JustWord:
      currentStage.value = Stage.Stage2_WordWithImages;
      timeLeftGame.value = timeOut * 2;
      break;
    case Stage.Stage2_WordWithImages:
      currentStage.value = Stage.Stage3_Result;
      clearInterval(timerGame);
      gradeAnswer();
      break;
  }
}

const startVADTimer = () => {
  if (timerVAD) {
    clearInterval(timerVAD);
  }
  waitTimeLeftVADInMS.value = waitTimeVADInMS;
  isSomeoneSaying.value = true;

  timerVAD = setInterval(() => {
    if (waitTimeLeftVADInMS.value > 0) {
      waitTimeLeftVADInMS.value -= 100;
    } else {
      clearInterval(timerVAD);
      isSomeoneSaying.value = false;
    }
  }, 100);
};

// delay grading answer
const delayTimerGradingAnswer = (delayMS: number) => {
  if (timerDelayGradingAnswer) {
    clearInterval(timerDelayGradingAnswer);
  }
  waitTimeLeftGradingAnswerInMS.value = delayMS;

  timerDelayGradingAnswer = setInterval(() => {
    if (waitTimeLeftGradingAnswerInMS.value > 0) {
      waitTimeLeftGradingAnswerInMS.value -= 100;
    } else {
      clearInterval(timerDelayGradingAnswer);
      if (userAnswer.value.trim() !== '') {
        gradeAnswer();
      } else {
        console.log('ignore empty answer');
      }
    }
  }, 100);
};

const particlesLoaded = async (container: Container) => {
    console.log("Particles container loaded", container);
};

const startRecording = () => {
  speech.start();
  console.log('startRecording');
};

const stopRecording = () => {
  speech.stop();
}

watch(speech.result, () => {
  if (currentStage.value === Stage.Stage3_Result) {
    return;
  }
  
  console.log('watch speech.result =======');
  // hueristic: if there are more than 1 words, start VAD timer
  const words = speech.result.value.trim().split(' ');
  if (words.length > 0) {
    startVADTimer();
    console.log('startVADTimer');
  } else {
    console.log('no words')
  }

  console.log('speech.result changed: ', speech.result.value, words);
  
  let foundAnswer = false;
  for (const i of words) {
    if (currentWord.value?.word.toLowerCase() === i.toLowerCase()) {
      userAnswer.value = i;
      foundAnswer = true;
      console.log('[*] found answer: ', i, words.length);
      break;
    }
  }

  // combine all words and check answer
  // join 2,3,... length of words
  if (!foundAnswer) {
    for (let i = 2; i <= words.length; i++) {
      const combined = words.slice(0, i).join('');
      // console.log('combined:', combined);
      if (currentWord.value?.word.toLowerCase() === combined.toLowerCase()) {
        userAnswer.value = combined;
        foundAnswer = true;
        console.log('[*] found answer: ', combined, words.length);
        break;
      }
    }
  }

  if (!foundAnswer) {
    userAnswer.value = speech.result.value.trim();
  }
  
  delayTimerGradingAnswer(waitTimeMS);
});

onMounted(() => {
  loadWordPool();
});

const gitSha = import.meta.env.VITE_GIT_SHA || 'local';
console.log('gitSha', gitSha);
</script>


<template>

  <div class="min-h-screen flex flex-col justify-center items-center bg-gray-100 p-4 root-div">
    <!-- 타이머 표시 -->
    <div class="w-full max-w-md">
      <div class="h-4 bg-gray-300 rounded-full overflow-hidden mb-4">
        <div
          class="h-full bg-blue-500 transition-all duration-1000"
          :style="{ width: `${(timeLeftGame / 15) * 100}%` }"
        ></div>
      </div>
      <div class="text-right text-gray-700 mb-4">
        Time left: {{ timeLeftGame }} seconds
      </div>
    </div>
    
    <!-- 단어 표시 -->
    <div v-if="!isAnswerCorrect && currentStage === 1" class="text-6xl xl:text-9xl font-bold text-gray-800 mb-4 relative z-10">
      {{ currentWord?.word }}
    </div>
    <div v-if="currentStage > 1 || isAnswerCorrect" class="flex flex-col items-center relative z-10">
      <div class="text-6xl xl:text-9xl font-bold text-gray-800 mb-4">{{ currentWord?.word }}</div>
      <img :src="currentWord?.image_url" alt="Image" class="max-w-80 xl:max-w-96 object-cover rounded-md shadow-lg z-10"/>
    </div>

    <!-- 입력과 제출 -->
    <div v-if="!isAnswerCorrect && currentStage !== 3" class="mt-4 relative">
       <!-- 말하는 아이콘 추가 -->
       <div v-if="isListening" class="absolute inset-y-0 left-[-2.5rem] flex items-center bg-blue-500">
        <div v-if="isSomeoneSaying" class="absolute animate-ping text-2xl">
          🎤
        </div>
        <div class="absolute text-2xl" :class="isSomeoneSaying ? '': 'opacity-25'">
          🎤
        </div>
      </div>
      <input 
        type="text" 
        v-model="userAnswer" 
        @keyup.enter="gradeAnswer"
        placeholder="Type your answer..."
        class="p-2 border rounded-md text-2xl"
      />
      <button @click="gradeAnswer" class="ml-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-2xl">
        💯
      </button>
    </div>
    
    <!-- 정답 안내 -->
    <div v-if="currentStage === Stage.Stage3_Result && !isAnswerCorrect" class="mt-4 text-red-600">
      Time's up! The correct answer is: {{ currentWord?.word }}
    </div>
    
    <!-- 다음 버튼 -->
    <button v-if="currentStage === Stage.Stage3_Result"
      @click="startGame()" class="mt-4 px-4 py-2  text-white rounded-md z-10 text-2xl" :class="isAnswerCorrect ? 'bg-green-500 hover:bg-green-600': 'bg-orange-400 hover:bg-orange-500'">
      {{ isAnswerCorrect ? '🎉' : '▶' }}
    </button>
    <!-- 음성 녹음 버튼 및 스피너 -->
    <div v-if="currentStage !== Stage.Stage3_Result" class="mt-4 flex flex-col items-center">
      <button @click="isListening ? stopRecording() : startRecording()" 
              :class="isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'"
              class="px-4 py-2 text-2xl text-white rounded-md">
        {{ isListening ? '🛑' : '🎤' }}
      </button>
    </div>
    <header class="fixed top-0 left-0 w-full text-center py-2 bg-indigo-200">
      <label for="theme-select" class="mr-2">단어장:</label>
      <select id="theme-select" v-model="selectedTheme" @change="loadWordPool">
        <option value="tinyping">티니핑</option>
        <option value="fruits">과일</option>
      </select>
    </header>
    
    <!-- 하단 고정 푸터 -->
    <footer class="fixed bottom-0 left-0 w-full text-center py-2 bg-gray-200">
      <p>version: {{ gitSha }}</p>
    </footer>
  </div>
  <!-- 파티클 효과 -->
  <vue-particles v-if="showParticles" id="tsparticles" @particles-loaded="particlesLoaded" url="/particles.json" />
</template>


<style scoped>
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