<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue';
import { type Container } from "@tsparticles/engine";
import { useSpeechRecognition } from '@vueuse/core'

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

const selectedLanguage = ref(lang.value)
watch(lang, lang => isListening.value ? null : selectedLanguage.value = lang)
watch(isListening, isListening => isListening ? null : selectedLanguage.value = lang.value)

interface Word {
  word: string;
  image_url: string;
  english: string;
}

const wordPool: Word[] = [
  { word: "사과", image_url: "https://lh6.googleusercontent.com/proxy/i9pw1jJE31-GMS4R7EfwX5bVJjS2cBAFATyklQgDUVXTR3E4xTR9vcOcCqVhe_MkLy2HB8O1_Oo8O7KxibZQSHhhMekesZKth-XQ7A4sVgY", english: "apple" },
  { word: "바나나", image_url: "https://health.chosun.com/site/data/img_dir/2022/05/04/2022050401754_0.jpg", english: "banana" },
  { word: "딸기", image_url: "https://pds.joongang.co.kr/news/component/htmlphoto_mmdata/201502/04/htm_20150204185442c010c011.jpg", english: "strawberry" },
  { word: "귤", image_url: "https://i.namu.wiki/i/buz7yc4OCUUD2tYQLf3uM3mCmrN4Mj76qQtKF4UOMDuJzVQ9Zxlc5pCZ8OJxqVwTHQmdcuoaXU_b_FuM7YmIEA.webp", english: "tangerine" },
  { word: "포도", image_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSMiQ9irtPloBYlAjqUlCJ_HHH8UlyhTc1Hsg&s", english: "grape" },
  { word: "복숭아", image_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR2IIxOS7VJLfRijjWpFSmonT43Zap-s79bgg&s", english: "peach" },
  { word: "레몬", image_url: "https://i.namu.wiki/i/kbapICj5X6Tsd9Wj2spuhfQRPcZbx2gkHvunmBUF6byvlvk4j2nIP-8-G1-xWt7olgNjC-dvDBVLXIg90TN4xA.webp", english: "lemon" },
  { word: "파인애플", image_url: "https://i.namu.wiki/i/RCvtyBLUbsrcfnBHZIRhaW_jucxE99vOLFTepZvPErsWOAMrie_LpksZXuOMz1D8Wf4yf2K97Hd-Dr_zqi9v_Q.webp", english: "pineapple" },
  { word: "키위", image_url: "https://i.namu.wiki/i/u6uPTTTt3M7KxSZ8vH4NS7wtBz05rRzQFYDH0NeBReVeMEVybQbZvXRVSIHKh4Y9yGbKf51tcE5PWcMP3mQCFg.webp", english: "kiwi" },
  { word: "오렌지", image_url: "https://i.namu.wiki/i/uwOpUaWZPXhxxrVZyID_VATqmJvDiJmM8tLYpzlgKcDLWTtehtl9G9_4h8qGYW3t918v1V2a96R0Hu1X5xiNVQ.webp", english: "orange" },
];

const currentWord = ref<Word>(wordPool[0]);
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
  currentWord.value = wordPool[Math.floor(Math.random() * wordPool.length)];
  userAnswer.value = '';
  isAnswerCorrect.value = false;
  currentStage.value = 1;
  timeLeft.value = 15;
  startTimer();

  showParticles.value = false;
};

const checkAnswer = () => {
  if (userAnswer.value.toLowerCase() === currentWord.value.english.toLowerCase()
  || userAnswer.value.toLowerCase() === currentWord.value.word.toLowerCase()) {
    isAnswerCorrect.value = true;
    clearInterval(timer);

    showParticles.value = true;
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
  startGame();
});
</script>


<template>

  <div class="min-h-screen flex flex-col justify-center items-center bg-gray-100 p-4 ">
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
    <div v-if="currentStage === 1" class="text-9xl font-bold text-gray-800 mb-4 relative z-10">
      {{ currentWord.word }}
    </div>
    <div v-if="currentStage > 1" class="flex flex-col items-center relative z-10">
      <div class="text-9xl font-bold text-gray-800 mb-4">{{ currentWord.word }}</div>
      <img :src="currentWord.image_url" alt="Image" class="max-w-96 object-cover rounded-md shadow-lg z-10"/>
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
      Time's up! The correct answer is: {{ currentWord.english }}
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
        {{ isListening ? 'Stop Recording' : 'Start Recording' }}
      </button>
      <!-- 말하는 아이콘 추가 -->
      <div v-if="isListening" class="speaking-icon"></div>
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
</style>