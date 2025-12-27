// Character images mapping
// 로우폴리 3D 고양이 캐릭터 이미지 경로

export const CHARACTER_IMAGES = {
    good: '/images/cat-good.png',      // 기쁜 표정의 고양이
    neutral: '/images/cat-neutral.png', // 보통 표정의 고양이
    bad: '/images/cat-bad.png'          // 슬픈/화난 표정의 고양이
};

// Get character image based on mood
export function getCharacterImage(mood) {
    return CHARACTER_IMAGES[mood] || CHARACTER_IMAGES.neutral;
}
