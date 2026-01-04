// Character images mapping
// 인터뷰 이미지 풀 (각 mood별로 10개씩)
const IMAGE_POOL = {
    good: Array.from({ length: 10 }, (_, i) => `/images/interview/good${i}.png`),
    neutral: Array.from({ length: 10 }, (_, i) => `/images/interview/neutral${i}.png`),
    bad: Array.from({ length: 10 }, (_, i) => `/images/interview/bad${i}.png`)
};

// Track used images to prevent duplicates within the same simulation
let usedImages = {
    good: [],
    neutral: [],
    bad: []
};

// Reset used images (call this when starting a new simulation)
export function resetUsedImages() {
    usedImages = {
        good: [],
        neutral: [],
        bad: []
    };
}

// Get random character image based on mood without duplicates
export function getCharacterImage(mood) {
    // Default to neutral if mood is invalid
    const validMood = ['good', 'neutral', 'bad'].includes(mood) ? mood : 'neutral';

    // Get available images (not yet used)
    const availableImages = IMAGE_POOL[validMood].filter(
        img => !usedImages[validMood].includes(img)
    );

    // If all images have been used, reset the pool for this mood
    if (availableImages.length === 0) {
        usedImages[validMood] = [];
        return getCharacterImage(validMood); // Recursive call with reset pool
    }

    // Pick a random image from available ones
    const randomIndex = Math.floor(Math.random() * availableImages.length);
    const selectedImage = availableImages[randomIndex];

    // Mark this image as used
    usedImages[validMood].push(selectedImage);

    return selectedImage;
}
