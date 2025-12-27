# 🏛️ Civics Simulator (우당탕냥 마을 시뮬레이터)

초등학생들이 사회 정책의 인과관계를 재미있게 배울 수 있는 교육용 시뮬레이터입니다.

## ✨ 주요 기능

- 🎙️ **정책 선포**: 귀여운 채팅 UI로 정책 입력
- 📰 **신문 스타일 결과**: 지역 신문처럼 꾸며진 결과 화면
- 📊 **실시간 게이지**: 행복도, 혼란도, 경제 지표
- 🐱 **주민 인터뷰**: 고양이 마을 주민들의 생생한 반응
- 🏆 **배지 시스템**: 정책 결과에 따른 배지 획득
- ⏱️ **타임라인**: 1주일 후 → 1개월 후 → 1년 후 단계별 진행

## 🚀 시작하기

### 1. 설치

\`\`\`bash
npm install
\`\`\`

### 2. 환경 변수 설정

\`.env\` 파일을 생성하고 OpenAI API 키를 추가하세요:

\`\`\`
VITE_OPENAI_API_KEY=your-api-key-here
\`\`\`

### 3. 개발 서버 실행

\`\`\`bash
npm run dev
\`\`\`

### 4. 빌드

\`\`\`bash
npm run build
\`\`\`

## 🛠️ 기술 스택

- **Frontend**: Vite + Vanilla JavaScript
- **AI**: OpenAI GPT-4o-mini
- **Styling**: Custom CSS with warm brown/beige theme
- **Icons**: Custom SVG icon library

## 📁 프로젝트 구조

\`\`\`
civics-simulator/
├── public/
│   └── images/          # 캐릭터 및 배경 이미지
├── src/
│   ├── main.js          # 메인 애플리케이션 로직
│   ├── ai.js            # OpenAI API 통합
│   ├── characters.js    # 캐릭터 이미지 관리
│   ├── icons.js         # SVG 아이콘 라이브러리
│   └── style.css        # 스타일시트
├── .env.example         # 환경 변수 템플릿
└── package.json
\`\`\`

## 🎨 디자인 특징

- **채팅 인터페이스**: 비서 알콩이와의 대화형 입력
- **신문 레이아웃**: 우당탕냥 마을 신문 스타일
- **플로팅 버튼**: 우측 하단 고정 네비게이션
- **반응형 디자인**: 모바일 친화적

## 📝 라이선스

MIT

## 👥 기여

이슈와 PR은 언제나 환영합니다!
