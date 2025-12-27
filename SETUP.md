# 🚀 빠른 시작 가이드

## 1. API 키 설정

OpenAI API 키를 설정해야 앱이 작동합니다.

### API 키 발급
1. https://platform.openai.com/api-keys 접속
2. "Create new secret key" 클릭
3. 생성된 키 복사 (sk-proj-로 시작)

### 코드에 API 키 입력
`src/ai.js` 파일을 열고 4번째 줄을 수정:

```javascript
// 수정 전
const API_KEY = 'YOUR_OPENAI_API_KEY_HERE';

// 수정 후
const API_KEY = 'sk-proj-xxxxxxxxxxxxx'; // 실제 API 키 입력
```

## 2. 의존성 설치

```bash
cd e:\projects\sample\civics-simulator
npm install
```

## 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 http://localhost:5173 접속

## 4. 테스트

1. 텍스트 입력창에 규칙 입력 (예: "모든 학교를 놀이공원으로 바꾸기")
2. "시뮬레이션 시작" 버튼 클릭
3. AI가 생성한 3단계 시나리오 확인

## 💡 팁

- **랜덤 주제**: "🎲 랜덤 주제" 버튼을 클릭하면 12가지 재미있는 주제 카드가 나타납니다
- **모델 변경**: `src/ai.js`에서 `model: 'gpt-4o-mini'`를 다른 모델로 변경 가능 (예: `gpt-4o`)
- **API 키 공통 사용**: OpenAI API 키는 모든 모델에 공통으로 사용됩니다

## ⚠️ 주의사항

- **브라우저 사용**: 현재 `dangerouslyAllowBrowser: true` 설정으로 브라우저에서 직접 API 호출
- **프로덕션**: 실제 배포 시에는 백엔드 서버를 통해 API 호출하는 것을 권장
- **비용**: GPT-4o-mini는 저렴하지만 API 사용량에 따라 과금됩니다

## 🏗️ 빌드 및 배포

```bash
# 프로덕션 빌드
npm run build

# Apps-in-Toss 배포
npm run deploy
```
