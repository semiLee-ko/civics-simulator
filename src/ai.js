// AI Service using Firebase Cloud Functions
import { initializeApp } from 'firebase/app';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { config } from './config.js';

// Initialize Firebase with error handling
let app, functions, simulateRuleFunction;

try {
  app = initializeApp(config.FIREBASE_CONFIG);
  functions = getFunctions(app, 'asia-northeast3');
  simulateRuleFunction = httpsCallable(functions, 'simulateRule');
  console.log('✅ Firebase initialized successfully');
} catch (error) {
  console.error('❌ Firebase initialization failed:', error);
  // Create a fallback function that shows error
  simulateRuleFunction = () => {
    throw new Error('Firebase 초기화 실패. 앱을 다시 시작해주세요.');
  };
}

export async function simulateRule(rule) {
  try {
    console.log('🔵 Calling simulateRule function with rule:', rule);
    const result = await simulateRuleFunction({ rule });
    console.log('✅ Function call successful');
    return result.data;
  } catch (error) {
    console.error('❌ AI Simulation Error:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('Error details:', error.details);
    throw error;
  }
}

// Random rule suggestions
export const RANDOM_RULES = [
  { emoji: '🏫', text: '모든 학교를 놀이공원으로 바꾸기' },
  { emoji: '💰', text: '돈을 없애고 물물교환만 하기' },
  { emoji: '👮', text: '경찰을 없애기' },
  { emoji: '🛌', text: '하루에 20시간 의무적으로 잠자기' },
  { emoji: '🍫', text: '모든 돈을 초콜릿으로 바꾸기' },
  { emoji: '🐶', text: '강아지를 시장으로 임명하기' },
  { emoji: '🎮', text: '게임을 12시간 의무적으로 하기' },
  { emoji: '🚗', text: '모든 차를 없애기' },
  { emoji: '📱', text: '스마트폰 사용 금지하기' },
  { emoji: '🍕', text: '피자만 먹을 수 있게 하기' },
  { emoji: '⏰', text: '시계를 모두 없애기' },
  { emoji: '🏃', text: '걷기를 금지하고 뛰기만 하기' }
];

