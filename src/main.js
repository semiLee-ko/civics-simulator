import './style.css';
import './helpPopup.css';
import './adButton.css';
import './confirmButtons.css';
import { simulateRule, RANDOM_RULES } from './ai.js';
import { getIcon } from './icons.js';
import { getCharacterImage, resetUsedImages } from './characters.js';
import blockedWordsData from './blockedWords.json';
import {
  prepareRewardedAd,
  showRewardedAd,
  canSubmitRule,
  markResultViewed,
  markAdWatched,
  resetAdWatched
} from './ads.js';

// DOM Elements
let ruleInput;
let randomBtn;
let simulateBtn;
let randomCardsContainer;

// Game state
let currentPhase = 1;
let maxPhaseReached = 1;
let simulationData = null;
let currentRule = '';
let currentPage = 'input'; // 'input' or 'result'

// Initialize app
function init() {
  renderInputPage();

  // Preload rewarded ad for later use
  prepareRewardedAd();
}

// Render input page
async function renderInputPage() {
  currentPage = 'input';
  const app = document.getElementById('app');

  // Check if user can submit (for button icon)
  const canSubmit = await canSubmitRule();

  app.innerHTML = `
    <div class="page-container input-page">
      <div class="main-image-section">
        <img src="/images/mainBg.png" alt="고양이 마을" class="main-bg-image" />
        <button class="help-btn" id="helpBtn" aria-label="도움말 보기">
          <span class="icon icon-md" aria-hidden="true">${getIcon('help')}</span>
        </button>
        <div class="main-image-overlay">
          <h1 class="village-name">우당탕냥 마을</h1>
          <p class="village-subtitle">시장님, 어떤 규칙을 선포할까요?</p>
        </div>
      </div>
      
      <div class="main-content">
        <div class="chat-container">
          <!-- Chat Messages -->
          <div class="chat-messages" id="chatMessages">
            <div class="chat-message assistant typing-message" id="initialTyping">
              <img src="/images/assistant.png" alt="비서" class="chat-avatar" />
              <div class="message-bubble">
                <div class="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Chat Input Area -->
          <div class="chat-input-area">
            <button id="randomBtn" class="btn-icon" aria-label="주제 예시 보기">
              <span class="icon icon-md" aria-hidden="true">${getIcon('dice')}</span>
            </button>
            <label for="ruleInput" class="sr-only">규칙 입력</label>
            <textarea 
              id="ruleInput" 
              class="chat-input" 
              placeholder="규칙을 입력하세요..."
              rows="1"
              aria-label="규칙 입력"
            ></textarea>
            <button id="simulateBtn" class="btn-send" disabled>
              <span class="icon icon-md" id="submitBtnIcon">${canSubmit ? getIcon('pen') : getIcon('video')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Cache DOM elements
  ruleInput = document.getElementById('ruleInput');
  randomBtn = document.getElementById('randomBtn');
  simulateBtn = document.getElementById('simulateBtn');
  randomCardsContainer = document.getElementById('randomCards');

  // Setup event listeners
  randomBtn.addEventListener('click', toggleRandomCards);
  simulateBtn.addEventListener('click', handleSimulate);
  ruleInput.addEventListener('input', () => {
    simulateBtn.disabled = !ruleInput.value.trim();
  });

  // Help button listener
  document.getElementById('helpBtn').addEventListener('click', showHelpPopup);

  // Show initial message after typing animation
  showInitialMessage();
}

// Show initial welcome message with typing animation
function showInitialMessage() {
  setTimeout(() => {
    const chatMessages = document.getElementById('chatMessages');
    const typingIndicator = document.getElementById('initialTyping');

    if (typingIndicator) {
      typingIndicator.remove();
    }

    const welcomeMessage = document.createElement('div');
    welcomeMessage.className = 'chat-message assistant';
    welcomeMessage.innerHTML = `
      <img src="/images/assistant.png" alt="비서" class="chat-avatar" />
      <div class="message-bubble">
        <div class="message-header">
          <strong>비서 알콩이</strong>
        </div>
        <p>안녕하세요, 시장님! 😊<br>마을에 적용할 새로운 규칙을 말씀해주세요.</p>
      </div>
    `;

    chatMessages.appendChild(welcomeMessage);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }, 1500);
}

// Toggle random cards visibility with animation
function toggleRandomCards() {
  const chatMessages = document.getElementById('chatMessages');
  const existingSuggestions = document.querySelector('.suggestion-message');

  // If already showing, just hide
  if (existingSuggestions) {
    existingSuggestions.remove();
    return;
  }

  // Add typing indicator
  const typingDiv = document.createElement('div');
  typingDiv.className = 'chat-message assistant typing-message';
  typingDiv.innerHTML = `
    <img src="/images/assistant.png" alt="비서" class="chat-avatar" />
    <div class="message-bubble">
      <div class="typing-indicator">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  `;
  chatMessages.appendChild(typingDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  // After 1.5 seconds, show suggestions
  setTimeout(() => {
    typingDiv.remove();

    const suggestionDiv = document.createElement('div');
    suggestionDiv.className = 'suggestion-message';
    suggestionDiv.innerHTML = `
      <div class="chat-message assistant">
        <img src="/images/assistant.png" alt="비서" class="chat-avatar" />
        <div class="message-bubble">
          <p>예를 들어 이런 규칙은 어떨까요?</p>
        </div>
      </div>
      <div class="random-suggestions">
        ${RANDOM_RULES.map(rule => `
          <div class="suggestion-chip" data-rule="${rule.text}">
            <span class="chip-emoji">${rule.emoji}</span>
            <span class="chip-text">${rule.text}</span>
          </div>
        `).join('')}
      </div>
    `;

    chatMessages.appendChild(suggestionDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Add click listeners
    suggestionDiv.querySelectorAll('.suggestion-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const rule = chip.dataset.rule;

        // Add user message to chat
        const userMessage = document.createElement('div');
        userMessage.className = 'chat-message user';
        userMessage.innerHTML = `
          <div class="message-bubble user-bubble">
            <p>${rule}</p>
          </div>
          <img src="/images/mayor.png" alt="시장님" class="chat-avatar" />
        `;
        chatMessages.appendChild(userMessage);

        // Set input value
        ruleInput.value = rule;
        simulateBtn.disabled = false;

        // Remove suggestions
        suggestionDiv.remove();

        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
        ruleInput.focus();
      });
    });
  }, 1500);
}

// Check for blocked words
function containsBlockedWords(text) {
  const lowerText = text.toLowerCase();
  const allBlockedWords = [
    ...blockedWordsData.profanity,
    ...blockedWordsData.violence,
    ...blockedWordsData.sensitive
  ];

  for (const word of allBlockedWords) {
    if (lowerText.includes(word)) {
      return { blocked: true, word };
    }
  }

  return { blocked: false };
}

// Validate rule input
function validateRuleInput(rule) {
  // Check length
  if (rule.length === 0) {
    return { valid: false, message: '규칙을 입력해주세요!' };
  }

  if (rule.length > 50) {
    return { valid: false, message: '규칙은 50자 이내로 입력해주세요!' };
  }

  // Check allowed characters: 한글, 영어, 숫자, 허용 특수문자, 띄어쓰기
  const allowedPattern = /^[가-힣a-zA-Z0-9~!@#$%^&*()_\-+=\[\]:;,.?/\s]+$/;
  if (!allowedPattern.test(rule)) {
    return { valid: false, message: '허용되지 않은 문자가 포함되어 있네요!\n한글, 영어, 숫자, 일부 특수문자만 사용 가능해요.' };
  }

  // Check for blocked words
  const blockedCheck = containsBlockedWords(rule);
  if (blockedCheck.blocked) {
    return {
      valid: false,
      message: `이 규칙은 사용할 수 없어요.\n대신 다른 재미있는 규칙을 생각해볼까요?`
    };
  }

  return { valid: true };
}

// Show custom alert modal
function showCustomAlert(message) {
  // Save current focus
  const previousFocus = document.activeElement;

  const modal = document.createElement('div');
  modal.className = 'custom-alert-overlay';
  modal.innerHTML = `
    <div class="custom-alert" role="dialog" aria-modal="true" aria-labelledby="alert-title">
      <h2 id="alert-title" class="sr-only">알림</h2>
      <div class="alert-icon">
        <span class="icon icon-xl" aria-hidden="true">${getIcon('alert')}</span>
      </div>
      <div class="alert-message">${message.replace(/\n/g, '<br>')}</div>
      <button class="alert-button" id="alertCloseBtn">확인</button>
    </div>
  `;

  document.body.appendChild(modal);
  setTimeout(() => modal.classList.add('show'), 10);

  // Set background inert
  const app = document.querySelector('#app');
  app?.setAttribute('inert', 'true');

  // Focus on close button
  const closeBtn = document.getElementById('alertCloseBtn');
  setTimeout(() => closeBtn?.focus(), 100);

  // Close function
  const closeModal = () => {
    modal.classList.remove('show');
    setTimeout(() => {
      modal.remove();
      document.removeEventListener('keydown', handleEscape);
      // Remove inert and restore focus
      app?.removeAttribute('inert');
      previousFocus?.focus();
    }, 300);
  };

  // ESC key handler
  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      closeModal();
    }
  };

  document.addEventListener('keydown', handleEscape);

  closeBtn.addEventListener('click', closeModal);

  // Close on overlay click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });
}

// Show custom confirm modal
function showCustomConfirm(message) {
  return new Promise((resolve) => {
    // Save current focus
    const previousFocus = document.activeElement;
    const modal = document.createElement('div');
    modal.className = 'custom-alert-overlay';
    modal.innerHTML = `
      <div class="custom-alert" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
        <h2 id="confirm-title" class="sr-only">확인</h2>
        <div class="alert-icon">
          <span class="icon icon-xl" aria-hidden="true">${getIcon('alert')}</span>
        </div>
        <div class="alert-message">${message.replace(/\n/g, '<br>')}</div>
        <div class="alert-buttons">
          <button class="alert-button alert-button-cancel" id="alertCancelBtn">취소</button>
          <button class="alert-button alert-button-confirm" id="alertConfirmBtn">광고 보기</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('show'), 10);

    // Set background inert
    const app = document.querySelector('#app');
    app?.setAttribute('inert', 'true');

    const confirmBtn = document.getElementById('alertConfirmBtn');
    const cancelBtn = document.getElementById('alertCancelBtn');

    // Focus on confirm button
    setTimeout(() => confirmBtn?.focus(), 100);

    // Close function
    const closeModal = (result) => {
      modal.classList.remove('show');
      setTimeout(() => {
        modal.remove();
        document.removeEventListener('keydown', handleEscape);
        // Remove inert and restore focus
        app?.removeAttribute('inert');
        previousFocus?.focus();
      }, 300);
      resolve(result);
    };

    // ESC key handler
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        closeModal(false);
      }
    };

    document.addEventListener('keydown', handleEscape);

    // Confirm button listener
    confirmBtn.addEventListener('click', () => closeModal(true));

    // Cancel button listener
    cancelBtn.addEventListener('click', () => closeModal(false));

    // Close on overlay click (cancel)
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal(false);
      }
    });
  });
}

// Show help popup
function showHelpPopup() {
  // Save current focus
  const previousFocus = document.activeElement;

  const helpPopup = document.createElement('div');
  helpPopup.className = 'help-popup-overlay';
  helpPopup.innerHTML = `
    <div class="help-popup" role="dialog" aria-modal="true" aria-labelledby="help-title">
      <div class="help-header">
        <h3 id="help-title">도움말</h3>
        <button class="help-close-btn" id="helpCloseBtn" aria-label="도움말 닫기">
          <span class="icon icon-md" aria-hidden="true">${getIcon('close')}</span>
        </button>
      </div>
      <div class="help-content">
        <div class="help-section">
          <h4><span class="icon icon-sm" aria-hidden="true">${getIcon('target')}</span> 게임 방법</h4>
          <p>우당탕냥 마을의 시장이 되어 새로운 규칙을 만들어보세요!</p>
        </div>
        
        <div class="help-section">
          <h4><span class="icon icon-sm" aria-hidden="true">${getIcon('edit')}</span> 규칙 입력하기</h4>
          <ul>
            <li>아래 입력창에 원하는 규칙을 입력하세요</li>
            <li>주사위 버튼을 눌러 예시 규칙을 볼 수 있어요</li>
            <li>규칙은 50자 이내로 입력해주세요</li>
          </ul>
        </div>
        
        <div class="help-section">
          <h4><span class="icon icon-sm" aria-hidden="true">${getIcon('search')}</span> 시뮬레이션 보기</h4>
          <ul>
            <li>1주일 후, 1개월 후, 1년 후의 변화를 확인하세요</li>
            <li>행복도, 혼란도, 경제 지표를 살펴보세요</li>
            <li>주민들의 인터뷰를 읽어보세요</li>
          </ul>
        </div>
        
        <div class="help-section">
          <h4><span class="icon icon-sm" aria-hidden="true">${getIcon('trophy')}</span> 배지 획득</h4>
          <p>시뮬레이션을 완료하면 특별한 배지를 받을 수 있어요!</p>
        </div>
        
        <div class="help-copyright">
          © 2025 CODA Creative. All rights reserved.
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(helpPopup);
  setTimeout(() => helpPopup.classList.add('show'), 10);

  // Set background inert
  const app = document.querySelector('#app');
  app?.setAttribute('inert', 'true');

  const closeBtn = document.getElementById('helpCloseBtn');

  // Focus on close button
  setTimeout(() => closeBtn?.focus(), 100);

  // Close function
  const closeModal = () => {
    helpPopup.classList.remove('show');
    setTimeout(() => {
      helpPopup.remove();
      document.removeEventListener('keydown', handleEscape);
      // Remove inert and restore focus
      app?.removeAttribute('inert');
      previousFocus?.focus();
    }, 300);
  };

  // ESC key handler
  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      closeModal();
    }
  };

  document.addEventListener('keydown', handleEscape);

  // Close button listener
  closeBtn.addEventListener('click', closeModal);

  // Close on overlay click
  helpPopup.addEventListener('click', (e) => {
    if (e.target === helpPopup) {
      closeModal();
    }
  });
}

// Handle simulation
async function handleSimulate() {
  const rule = ruleInput.value.trim();

  // Validate input
  const validation = validateRuleInput(rule);
  if (!validation.valid) {
    showCustomAlert(validation.message);
    return;
  }

  // Check if user can submit (daily ad limit)
  if (!(await canSubmitRule())) {
    // Show custom confirm for blocked users
    const confirmed = await showCustomConfirm(
      '하루에 한 건씩만 규칙을 선포할 수 있어요.\n광고를 보고 새로운 규칙을 선포하시겠어요?'
    );

    if (confirmed) {
      // Show rewarded ad
      const result = await showRewardedAd();
      if (result.rewarded) {
        // Mark ad watched and allow submission
        await markAdWatched();
        // Continue with submission
      } else {
        // Ad failed or cancelled
        showCustomAlert('광고를 시청하지 못했어요.\n잠시 후 다시 시도해주세요.');
        return;
      }
    } else {
      // User cancelled
      return;
    }
  }

  currentRule = rule;

  // Reset ad watched status for next submission
  await resetAdWatched();

  // Reset phase tracking for new simulation
  currentPhase = 1;
  maxPhaseReached = 1;

  // Reset interview image pool for new simulation
  resetUsedImages();

  // Show proclamation modal
  showProclamationModal(rule);

  try {
    const result = await simulateRule(rule);
    simulationData = result;
    currentPhase = 1;

    // Reset ad watched status after submitting new rule
    resetAdWatched();

    // Hide proclamation and show results
    hideProclamationModal();
    renderResultPage();
  } catch (error) {
    hideProclamationModal();
    alert('시뮬레이션 중 오류가 발생했어요. 다시 시도해주세요.');
    console.error(error);
  }
}

// Show proclamation modal
function showProclamationModal(rule) {
  // Blur the background
  document.querySelector('.page-container').classList.add('blurred');

  const modal = document.createElement('div');
  modal.id = 'proclamationModal';
  modal.className = 'proclamation-modal';
  modal.innerHTML = `
    <div class="proclamation-card" role="dialog" aria-modal="true" aria-labelledby="proclamation-title">
      <div class="proclamation-image-container">
        <img src="/images/backgroundImg.png" alt="고양이 마을 선포" class="proclamation-image" />
      </div>
      <div class="proclamation-text">
        <h2 class="proclamation-title" id="proclamation-title">시장님의 새로운 규칙!</h2>
        <div class="proclamation-rule"><span class="rule-highlight">"${rule}"</span></div>
        <div class="proclamation-loading">
          <div class="proclamation-spinner"></div>
          <p>주민들에게 규칙을 선포하고<br>반응을 살피는 중이에요...</p>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  setTimeout(() => modal.classList.add('show'), 10);
}

// Hide proclamation modal
function hideProclamationModal() {
  const modal = document.getElementById('proclamationModal');
  if (modal) {
    modal.classList.remove('show');
    setTimeout(() => {
      modal.remove();
      // Remove blur from background
      const blurred = document.querySelector('.blurred');
      if (blurred) {
        blurred.classList.remove('blurred');
      }
    }, 300);
  }
}

// Render result page
async function renderResultPage() {
  currentPage = 'result';

  // Mark that user viewed result page today
  await markResultViewed();

  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="page-container result-page">
      <div class="result-header-bar">
        <h2 class="result-page-title" id="resultPageTitle">시뮬레이션 결과</h2>
        <div id="headerAdBtnContainer"></div>
      </div>
      <div id="resultsContainer"></div>
    </div>
  `;

  renderPhaseView();
}

// Render phase view
function renderPhaseView() {
  const { phase_1, phase_2, phase_3, citizens, badge, summary } = simulationData;
  const phases = [phase_1, phase_2, phase_3];
  const currentPhaseData = phases[currentPhase - 1];

  // Get 3 citizens for current phase
  const startIdx = (currentPhase - 1) * 3;
  const phaseCitizens = citizens.slice(startIdx, startIdx + 3);

  // Calculate newspaper date
  const publishDate = getPublishDate(currentPhase);

  const container = document.getElementById('resultsContainer');
  container.innerHTML = `
    <div class="results-section">
      <div class="result-rule-simple">"${currentRule}"</div>
      
      <div class="gauges">
        <div class="gauge">
          <div class="gauge-label"><span class="icon icon-sm">${getIcon('happy')}</span> 행복도</div>
          <div class="gauge-value" data-gauge="happiness">0</div>
          <div class="gauge-bar">
            <div class="gauge-fill" data-fill="happiness" data-type="happiness" style="width: 0%;"></div>
          </div>
        </div>
        <div class="gauge">
          <div class="gauge-label"><span class="icon icon-sm">${getIcon('shield')}</span> 안전도</div>
          <div class="gauge-value" data-gauge="safety">0</div>
          <div class="gauge-bar">
            <div class="gauge-fill" data-fill="safety" data-type="safety" style="width: 0%;"></div>
          </div>
        </div>
        <div class="gauge">
          <div class="gauge-label"><span class="icon icon-sm">${getIcon('money')}</span> 경제</div>
          <div class="gauge-value" data-gauge="wealth">0</div>
          <div class="gauge-bar">
            <div class="gauge-fill" data-fill="wealth" data-type="wealth" style="width: 0%;"></div>
          </div>
        </div>
      </div>
      
      <!-- Timeline Progress (Clickable) -->
      <div class="timeline">
        <div class="timeline-item ${currentPhase >= 1 ? 'active' : ''} ${maxPhaseReached >= 1 ? 'clickable' : ''}" data-phase="1">
          <div class="timeline-dot"></div>
          <div class="timeline-label">1주일 후</div>
        </div>
        <div class="timeline-line ${currentPhase >= 2 ? 'active' : ''}"></div>
        <div class="timeline-item ${currentPhase >= 2 ? 'active' : ''} ${maxPhaseReached >= 2 ? 'clickable' : ''}" data-phase="2">
          <div class="timeline-dot"></div>
          <div class="timeline-label">1개월 후</div>
        </div>
        <div class="timeline-line ${currentPhase >= 3 ? 'active' : ''}"></div>
        <div class="timeline-item ${currentPhase >= 3 ? 'active' : ''} ${maxPhaseReached >= 3 ? 'clickable' : ''}" data-phase="3">
          <div class="timeline-dot"></div>
          <div class="timeline-label">1년 후</div>
        </div>
      </div>
      
      <!-- Newspaper Article -->
      <div class="newspaper-article">
        <div class="newspaper-header-inline">
          <div class="newspaper-title">우당탕냥 마을 신문</div>
          <div class="newspaper-date">${publishDate}</div>
        </div>
        
        <div class="article-headline">
          ${currentPhaseData.title}
        </div>
        <div class="article-content">
          <p class="article-story">${currentPhaseData.story}</p>
          
          <div class="article-divider"></div>
          
          <div class="article-interviews">
            <h3 class="interviews-title">주민 인터뷰</h3>
            ${phaseCitizens.map(citizen => `
              <div class="interview-item">
                <img src="${getCharacterImage(citizen.mood)}" alt="${citizen.mood}" class="interview-avatar" />
                <div class="interview-content">
                  <div class="interview-name">${citizen.name} (${citizen.job})</div>
                  <div class="interview-comment">"${citizen.comment}"</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
      
      ${currentPhase === 3 ? `
        <div class="ai-summary">
          <strong><span class="icon icon-md">${getIcon('lightbulb')}</span> 한줄평:</strong><br>
          ${summary}
        </div>
      ` : ''}
    </div>
    
    <!-- Ad Button for New Policy -->
    
    <!-- Floating Navigation Buttons -->
    <div class="floating-nav">
      ${maxPhaseReached >= 3 ? `
        <button class="floating-btn badge-btn" id="floatingBadgeBtn" title="배지 확인">
          <span class="icon icon-lg">${getIcon('trophy')}</span>
        </button>
      ` : ''}
      ${currentPhase < 3 ? `
        <button class="floating-btn next-btn" id="floatingNextBtn" title="다음 단계">
          <span class="icon icon-lg">${getIcon('chevronRight')}</span>
        </button>
      ` : ''}
    </div>
  `;

  // Add event listeners for timeline
  document.querySelectorAll('.timeline-item.clickable').forEach(item => {
    item.addEventListener('click', () => {
      const phase = parseInt(item.dataset.phase);
      if (phase <= maxPhaseReached) {
        goToPhase(phase);
      }
    });
  });

  // Add event listeners for floating buttons
  const floatingNextBtn = document.getElementById('floatingNextBtn');
  const floatingBadgeBtn = document.getElementById('floatingBadgeBtn');

  if (floatingNextBtn) {
    floatingNextBtn.addEventListener('click', nextPhase);
  }

  if (floatingBadgeBtn) {
    floatingBadgeBtn.addEventListener('click', showBadge);
  }

  // Update header based on phase (Level 3 reached)
  const resultPageTitle = document.getElementById('resultPageTitle');
  const headerAdBtnContainer = document.getElementById('headerAdBtnContainer');

  if (currentPhase === 3) {
    if (resultPageTitle) resultPageTitle.style.display = 'none';
    if (headerAdBtnContainer) {
      headerAdBtnContainer.innerHTML = `
        <button class="ad-policy-btn-header" id="headerAdPolicyBtn">
          <span class="icon icon-md">${getIcon('video')}</span>
          광고 보고 다른 규칙 추가
        </button>
      `;

      document.getElementById('headerAdPolicyBtn')?.addEventListener('click', async () => {
        const result = await showRewardedAd();
        if (result.rewarded) {
          markAdWatched();
          renderInputPage();
        }
      });
    }
  } else {
    if (resultPageTitle) resultPageTitle.style.display = 'block';
    if (headerAdBtnContainer) headerAdBtnContainer.innerHTML = '';
  }

  // Animate gauges
  setTimeout(() => animateGaugesToPhase(currentPhase), 100);
}

// Get publish date based on phase
function getPublishDate(phase) {
  const today = new Date();
  const targetDate = new Date(today);

  if (phase === 1) {
    targetDate.setDate(today.getDate() + 7); // 1주일 후
  } else if (phase === 2) {
    targetDate.setMonth(today.getMonth() + 1); // 1개월 후
  } else {
    targetDate.setFullYear(today.getFullYear() + 1); // 1년 후
  }

  const year = targetDate.getFullYear();
  const month = targetDate.getMonth() + 1;
  const day = targetDate.getDate();

  return `${year}년 ${month}월 ${day}일`;
}

// Go to specific phase
function goToPhase(phase) {
  // Create a temporary variable to store the target phase
  const tempPhase = currentPhase;
  currentPhase = phase;

  // Re-render the view
  renderPhaseView();

  // Scroll to top of results
  document.getElementById('resultsContainer').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function getPhaseLabel(phase) {
  const labels = {
    1: '1주일 후',
    2: '1개월 후',
    3: '1년 후'
  };
  return labels[phase];
}

function getPhaseColor(phase) {
  const colors = {
    1: '#4ECDC4',
    2: '#FFE66D',
    3: '#FF6B6B'
  };
  return colors[phase];
}

function nextPhase() {
  if (currentPhase < 3) {
    currentPhase++;
    maxPhaseReached = Math.max(maxPhaseReached, currentPhase);
    renderPhaseView();
  }
}

function showBadge() {
  const { badge, phase_3, summary } = simulationData;

  // Save current focus
  const previousFocus = document.activeElement;

  // Determine which level card to use based on metrics average
  // Calculate average of phase 3 metrics
  const h = parseInt(phase_3.happiness) || 0;
  const s = parseInt(phase_3.safety) || 0;
  const w = parseInt(phase_3.wealth) || 0;
  const avgScore = Math.round((h + s + w) / 3);

  const score = avgScore;
  let levelImage = 'level3.png';

  if (score <= 20) levelImage = 'level1.png';
  else if (score <= 40) levelImage = 'level2.png';
  else if (score <= 60) levelImage = 'level3.png';
  else if (score <= 80) levelImage = 'level4.png';
  else levelImage = 'level5.png';

  const isLevel5 = score > 80;

  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-content badge-card-container ${isLevel5 ? 'is-level-5' : ''}" role="dialog" aria-modal="true" aria-labelledby="badge-title-text">
      <button class="modal-download-btn" id="downloadBadgeBtn" aria-label="배지 이미지 저장">
        <span class="icon icon-md" aria-hidden="true">${getIcon('download')}</span>
      </button>
      <button class="modal-close-btn" id="closeBadgeBtn" aria-label="배지 닫기">
        <span class="icon icon-md" aria-hidden="true">${getIcon('close')}</span>
      </button>
      
      <img src="/images/${levelImage}" alt="Badge Card" class="badge-card-image" />
      
      <!-- Badge Title - Positioned on ribbon below star -->
      <div class="badge-title-text" id="badge-title-text">${badge.title}</div>
      
      <!-- Badge Description - Positioned below village image -->
      <div class="badge-description-text">${badge.description}</div>
      
      <!-- Metrics - Positioned in middle gray box -->
      <div class="badge-metrics-container">
        <div class="badge-metric-item">
          <span class="metric-label">행복도</span>
          <span class="metric-value">${phase_3.happiness}</span>
        </div>
        <div class="badge-metric-item">
          <span class="metric-label">안전도</span>
          <span class="metric-value">${phase_3.safety}</span>
        </div>
        <div class="badge-metric-item">
          <span class="metric-label">경제</span>
          <span class="metric-value">${phase_3.wealth}</span>
        </div>
      </div>
      
      <!-- Summary - Positioned in bottom gray box -->
      <div class="badge-summary-text">
        ${summary}
      </div>
      
      <!-- Promotional text - Inside badge card -->
      <div class="badge-promo-text">
        우당탕냥 마을의 시장이 되어 여러가지 규칙을 세워 보세요
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Set background inert
  const app = document.querySelector('#app');
  app?.setAttribute('inert', 'true');

  // Download button handler
  document.getElementById('downloadBadgeBtn').addEventListener('click', async () => {
    const badgeContainer = modal.querySelector('.badge-card-container');
    const downloadBtn = document.getElementById('downloadBadgeBtn');
    const closeBtn = document.getElementById('closeBadgeBtn');

    try {
      // Hide buttons during capture
      downloadBtn.style.display = 'none';
      closeBtn.style.display = 'none';

      // Disable animations to prevent text cutoff
      const titleText = badgeContainer.querySelector('.badge-title-text');
      const descText = badgeContainer.querySelector('.badge-description-text');
      if (titleText) titleText.style.animation = 'none';
      if (descText) descText.style.animation = 'none';

      // Wait for DOM update
      await new Promise(resolve => setTimeout(resolve, 100));

      // Use html2canvas to capture the badge
      const html2canvas = (await import('https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/+esm')).default;

      const canvas = await html2canvas(badgeContainer, {
        backgroundColor: null,
        scale: 2, // Higher quality
        logging: false,
        useCORS: true
      });

      // Convert canvas to base64
      const base64Data = canvas.toDataURL('image/png').split(',')[1]; // Remove 'data:image/png;base64,' prefix

      // Use Apps-in-Toss native API to save
      const { saveBase64Data } = await import('@apps-in-toss/web-framework');
      await saveBase64Data({
        data: base64Data,
        fileName: `배지-${badge.title}.png`,
        mimeType: 'image/png'
      });

      console.log('✅ Badge saved successfully');

      // Restore buttons and animations
      downloadBtn.style.display = '';
      closeBtn.style.display = '';
      if (titleText) titleText.style.animation = '';
      if (descText) descText.style.animation = '';
    } catch (error) {
      console.error('Download failed:', error);
      // Restore buttons even on error
      downloadBtn.style.display = '';
      closeBtn.style.display = '';
      showCustomAlert('배지 저장에 실패했습니다.');
    }
  });

  const closeBtn = document.getElementById('closeBadgeBtn');

  // Focus on close button
  setTimeout(() => closeBtn?.focus(), 100);

  // Close function
  const closeModal = () => {
    modal.classList.remove('show');
    setTimeout(() => {
      modal.remove();
      document.removeEventListener('keydown', handleEscape);
      // Remove inert and restore focus
      app?.removeAttribute('inert');
      previousFocus?.focus();
    }, 300);
  };

  // ESC key handler
  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      closeModal();
    }
  };

  document.addEventListener('keydown', handleEscape);

  closeBtn.addEventListener('click', closeModal);

  // Close on overlay click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  setTimeout(() => modal.classList.add('show'), 10);
}

// Animate gauges to specific phase
function animateGaugesToPhase(phase) {
  const { phase_1, phase_2, phase_3 } = simulationData;
  const phases = [phase_1, phase_2, phase_3];
  const targetPhase = phases[phase - 1];
  const metrics = ['happiness', 'safety', 'wealth'];

  metrics.forEach(metric => {
    const value = targetPhase[metric];
    const valueEl = document.querySelector(`[data-gauge="${metric}"]`);
    const fillEl = document.querySelector(`[data-fill="${metric}"]`);

    if (valueEl && fillEl) {
      animateValue(valueEl, parseInt(valueEl.textContent), value, 600);
      fillEl.style.width = `${value}%`;

      // Set color based on value and type
      const color = getGaugeColor(metric, value);
      fillEl.style.background = color;
    }
  });
}

// Get gauge color based on type and value
function getGaugeColor(type, value) {
  // Happiness, Safety, Wealth: 0-30 red, 31-70 yellow, 71-100 green
  if (value <= 30) return '#F44336'; // Red
  if (value <= 70) return '#FFC107'; // Yellow
  return '#4CAF50'; // Green
}

// Animate number value
function animateValue(element, start, end, duration) {
  const range = end - start;
  const increment = range / (duration / 16);
  let current = start;

  const timer = setInterval(() => {
    current += increment;
    if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
      current = end;
      clearInterval(timer);
    }
    element.textContent = Math.round(current);
  }, 16);
}

// Start the app
init();
