// Apps-in-Toss Rewarded Ad Integration
// Based on emotion-acct implementation

import { Storage, GoogleAdMob } from '@apps-in-toss/web-framework';
import { config } from './config.js';

// Rewarded ad state management
let isRewardedAdLoaded = false;

/**
 * 보상형 광고 미리 로드
 */
export async function prepareRewardedAd() {
    try {
        // Check if we're in a browser environment (dev mode)
        if (typeof window !== 'undefined' && !window.ReactNativeWebView) {
            console.log('🔧 Dev mode: Skipping ad preload (browser environment)');
            return;
        }

        // Check if GoogleAdMob is available (IMPORTANT: isSupported is a function!)
        if (GoogleAdMob.loadAppsInTossAdMob.isSupported() !== true) {
            console.warn('⚠️ AdMob not supported');
            return;
        }

        const cleanup = GoogleAdMob.loadAppsInTossAdMob({
            options: { adGroupId: config.ADMOB_REWARDED_ID },
            onEvent: (event) => {
                console.log('📢 Ad load event:', event.type);
                switch (event.type) {
                    case 'loaded':
                        console.log('✅ Rewarded ad loaded', event.data);
                        isRewardedAdLoaded = true;
                        cleanup(); // Call cleanup after successful load
                        break;
                }
            },
            onError: (error) => {
                console.error('❌ Rewarded Ad Preload Failed:', error);
                isRewardedAdLoaded = false;
                cleanup?.(); // Call cleanup on error
            }
        });
    } catch (error) {
        console.warn('⚠️ prepareRewardedAd Error (browser mode):', error);
        // Silently fail in dev/browser mode
    }
}

/**
 * 보상형 광고 표시 (미리 로드된 광고 사용)
 * @returns Promise<{ rewarded: boolean }> - rewarded is true if user watched the ad
 */
export function showRewardedAd() {
    return new Promise((resolve) => {
        // Check if we're in a browser environment (dev mode)
        if (typeof window !== 'undefined' && !window.ReactNativeWebView) {
            console.log('🔧 Dev mode: Allowing action without ad (browser environment)');
            resolve({ rewarded: true }); // Allow action in dev
            return;
        }

        if (!isRewardedAdLoaded) {
            console.warn('⚠️ Rewarded ad not loaded, allowing action anyway');
            prepareRewardedAd(); // Try to load for next time
            resolve({ rewarded: true }); // Allow action even if ad not loaded
            return;
        }

        try {
            // IMPORTANT: isSupported is a function!
            if (GoogleAdMob.showAppsInTossAdMob.isSupported() !== true) {
                console.warn('⚠️ showAppsInTossAdMob not supported');
                resolve({ rewarded: true }); // Allow action in dev
                return;
            }

            GoogleAdMob.showAppsInTossAdMob({
                options: { adGroupId: config.ADMOB_REWARDED_ID },
                onEvent: (event) => {
                    console.log('📢 Ad show event:', event.type);
                    switch (event.type) {
                        case 'requested':
                            console.log('📤 광고 보여주기 요청 완료');
                            isRewardedAdLoaded = false;
                            break;
                        case 'show':
                            console.log('📺 광고 컨텐츠 보여졌음');
                            break;
                        case 'impression':
                            console.log('👁️ 광고 노출');
                            break;
                        case 'clicked':
                            console.log('👆 광고 클릭');
                            break;
                        case 'userEarnedReward':
                            console.log('🎁 광고 보상 획득', event.data);
                            break;
                        case 'dismissed':
                            console.log('✅ 광고 닫힘');
                            isRewardedAdLoaded = false;
                            prepareRewardedAd(); // Preload next ad
                            resolve({ rewarded: true });
                            break;
                        case 'failedToShow':
                            console.warn('⚠️ 보상형 광고 표시 실패');
                            isRewardedAdLoaded = false;
                            resolve({ rewarded: false });
                            break;
                    }
                },
                onError: (error) => {
                    console.error('❌ Failed to show Rewarded Ad:', error);
                    isRewardedAdLoaded = false;
                    resolve({ rewarded: false });
                }
            });
        } catch (error) {
            console.error('❌ Error calling showRewardedAd:', error);
            resolve({ rewarded: false });
        }
    });
}

// ===== Daily Ad Limit System =====

/**
 * Check if we're in native Apps-in-Toss environment
 */
function isNativeEnvironment() {
    return typeof window !== 'undefined' && window.ReactNativeWebView;
}

/**
 * Get item from storage (native or browser fallback)
 */
async function getStorageItem(key) {
    if (isNativeEnvironment()) {
        return await Storage.getItem(key);
    } else {
        // Browser fallback
        return localStorage.getItem(key);
    }
}

/**
 * Set item to storage (native or browser fallback)
 */
async function setStorageItem(key, value) {
    if (isNativeEnvironment()) {
        await Storage.setItem(key, value);
    } else {
        // Browser fallback
        localStorage.setItem(key, value);
    }
}

/**
 * Get today's date string (YYYY-MM-DD)
 */
function getTodayString() {
    const today = new Date();
    return today.toISOString().split('T')[0];
}

/**
 * Check if user viewed result page today
 */
export async function hasViewedResultToday() {
    const today = getTodayString();
    const value = await getStorageItem(`result_viewed_${today}`);
    return value === 'true';
}

/**
 * Mark that user viewed result page today
 */
export async function markResultViewed() {
    const today = getTodayString();
    await setStorageItem(`result_viewed_${today}`, 'true');
}

/**
 * Check if user watched ad today
 */
export async function hasWatchedAdToday() {
    const today = getTodayString();
    const value = await getStorageItem(`ad_watched_${today}`);
    return value === 'Y';
}

/**
 * Mark that user watched ad today
 */
export async function markAdWatched() {
    const today = getTodayString();
    await setStorageItem(`ad_watched_${today}`, 'Y');
}

/**
 * Reset ad watched status (after submitting new rule)
 */
export async function resetAdWatched() {
    const today = getTodayString();
    await setStorageItem(`ad_watched_${today}`, 'N');
}

/**
 * Check if user can submit a new rule
 * @returns {Promise<boolean>} true if user can submit
 */
export async function canSubmitRule() {
    const viewedResult = await hasViewedResultToday();
    const watchedAd = await hasWatchedAdToday();

    // First time today OR watched ad → can submit
    return !viewedResult || watchedAd;
}
