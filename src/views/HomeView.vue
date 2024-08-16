<script lang="ts" setup>
import { ref, onMounted } from 'vue';

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
      currentStage.value = 3;
    }
  }, 1000);
};

const particlesLoaded = async container => {
    console.log("Particles container loaded", container);
};

onMounted(() => {
  startGame();
});
</script>


<template>
  <div class="min-h-screen flex flex-col justify-center items-center bg-gray-100 p-4">

    <!-- 파티클 효과 -->
    <vue-particles v-if="showParticles" id="tsparticles" @particles-loaded="particlesLoaded" url="/particles.json" />

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
    <div v-if="currentStage === 1" class="text-9xl font-bold text-gray-800 mb-4">
      {{ currentWord.word }}
    </div>
    <div v-if="currentStage > 1" class="flex flex-col items-center">
      <div class="text-9xl font-bold text-gray-800 mb-4">{{ currentWord.word }}</div>
      <img :src="currentWord.image_url" alt="Image" class="max-w-96 object-cover rounded-md shadow-lg"/>
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
      <button @click="checkAnswer" class="ml-2 px-4 py-2 bg-blue-500 text-white rounded-md">
        Submit
      </button>
    </div>
    
    <!-- 정답 안내 -->
    <div v-if="currentStage === 3" class="mt-4 text-red-600">
      Time's up! The correct answer is: {{ currentWord.english }}
    </div>
    
    <!-- 다음 버튼 -->
    <button v-if="isAnswerCorrect || currentStage === 3" @click="nextWord" class="mt-4 px-4 py-2 bg-green-500 text-white rounded-md">
      Next
    </button>
  </div>
</template>
