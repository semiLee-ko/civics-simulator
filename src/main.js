import './style.css';
import { simulateRule, RANDOM_RULES } from './ai.js';
import { getIcon } from './icons.js';
import { getCharacterImage } from './characters.js';

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
}

// Render input page
function renderInputPage() {
  currentPage = 'input';
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="page-container input-page">
      <div class="main-image-section">
        <img src="/images/mainBg.png" alt="고양이 마을" class="main-bg-image" />
        <div class="main-image-overlay">
          <h1 class="village-name">우당탕냥 마을</h1>
          <p class="village-subtitle">시장님, 어떤 정책을 선포할까요?</p>
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
            <button id="randomBtn" class="btn-icon" title="주제 예시">
              <span class="icon icon-md">${getIcon('dice')}</span>
            </button>
            <textarea 
              id="ruleInput" 
              class="chat-input" 
              placeholder="규칙을 입력하세요..."
              rows="1"
            ></textarea>
            <button id="simulateBtn" class="btn-send" disabled>
              <span class="icon icon-md">${getIcon('pen')}</span>
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
    return { valid: false, message: '허용되지 않은 문자가 포함되어 있습니다!\n한글, 영어, 숫자, 일부 특수문자만 사용 가능합니다.' };
  }

  return { valid: true };
}

// Show custom alert modal
function showCustomAlert(message) {
  const modal = document.createElement('div');
  modal.className = 'custom-alert-overlay';
  modal.innerHTML = `
    <div class="custom-alert">
      <div class="alert-icon">⚠️</div>
      <div class="alert-message">${message.replace(/\n/g, '<br>')}</div>
      <button class="alert-button" id="alertCloseBtn">확인</button>
    </div>
  `;

  document.body.appendChild(modal);
  setTimeout(() => modal.classList.add('show'), 10);

  document.getElementById('alertCloseBtn').addEventListener('click', () => {
    modal.classList.remove('show');
    setTimeout(() => modal.remove(), 300);
  });

  // Close on overlay click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('show');
      setTimeout(() => modal.remove(), 300);
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

  currentRule = rule;

  // Show proclamation modal
  showProclamationModal(rule);

  try {
    const result = await simulateRule(rule);
    simulationData = result;
    currentPhase = 1;

    // Hide proclamation and show results
    hideProclamationModal();
    renderResultPage();
  } catch (error) {
    hideProclamationModal();
    alert('시뮬레이션 중 오류가 발생했습니다. 다시 시도해주세요.');
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
    <div class="proclamation-card">
      <div class="proclamation-image-container">
        <img src="/images/backgroundImg.png" alt="고양이 마을 선포" class="proclamation-image" />
      </div>
      <div class="proclamation-text">
        <h2 class="proclamation-title">시장님의 새로운 규칙!</h2>
        <div class="proclamation-rule"><span class="rule-highlight">"${rule}"</span></div>
        <div class="proclamation-loading">
          <div class="proclamation-spinner"></div>
          <p>주민들에게 규칙을 선포하고<br>반응을 살피는 중...</p>
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
function renderResultPage() {
  currentPage = 'result';
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="page-container result-page">
      <div class="result-header-bar">
        <h2 class="result-page-title">시뮬레이션 결과</h2>
        <button class="btn-ad" id="adBtn">
          광고 보고 다른 정책 추가
        </button>
      </div>
      <div id="resultsContainer"></div>
    </div>
  `;

  document.getElementById('adBtn').addEventListener('click', () => {
    // TODO: Show ad and return to input page
    renderInputPage();
  });

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
          <div class="gauge-label"><span class="icon icon-sm">${getIcon('alert')}</span> 혼란도</div>
          <div class="gauge-value" data-gauge="chaos">0</div>
          <div class="gauge-bar">
            <div class="gauge-fill" data-fill="chaos" data-type="chaos" style="width: 0%;"></div>
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
  const { badge } = simulationData;

  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-content badge-modal">
      <button class="modal-close-btn" id="closeBadgeBtn">
        <span class="icon icon-md">${getIcon('close')}</span>
      </button>
      <div class="badge-emoji-large">${badge.emoji}</div>
      <div class="badge-title-large"><span class="icon icon-lg">${getIcon('trophy')}</span> ${badge.title}</div>
      <div class="badge-description-large">${badge.description}</div>
    </div>
  `;

  document.body.appendChild(modal);

  document.getElementById('closeBadgeBtn').addEventListener('click', () => {
    modal.classList.remove('show');
    setTimeout(() => modal.remove(), 300);
  });

  // Close on overlay click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('show');
      setTimeout(() => modal.remove(), 300);
    }
  });

  setTimeout(() => modal.classList.add('show'), 10);
}

// Animate gauges to specific phase
function animateGaugesToPhase(phase) {
  const { phase_1, phase_2, phase_3 } = simulationData;
  const phases = [phase_1, phase_2, phase_3];
  const targetPhase = phases[phase - 1];
  const metrics = ['happiness', 'chaos', 'wealth'];

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
  if (type === 'chaos') {
    // Chaos: 0-30 green, 31-70 yellow, 71-100 red
    if (value <= 30) return '#4CAF50'; // Green
    if (value <= 70) return '#FFC107'; // Yellow
    return '#F44336'; // Red
  } else {
    // Happiness, Wealth: 0-30 red, 31-70 yellow, 71-100 green
    if (value <= 30) return '#F44336'; // Red
    if (value <= 70) return '#FFC107'; // Yellow
    return '#4CAF50'; // Green
  }
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
