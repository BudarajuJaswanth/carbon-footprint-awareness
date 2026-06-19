import { clearContainer, createElement } from './utils/dom.js';
import { store } from './services/Store.js';
import { renderDashboard } from './pages/Dashboard.js';
import { renderCalculator } from './pages/Calculator.js';
import { renderRecommendations } from './pages/Recommendations.js';
import { renderGoals } from './pages/Goals.js';
import { renderInsights } from './pages/Insights.js';

const ROUTES = {
  '#/dashboard': renderDashboard,
  '#/calculator': renderCalculator,
  '#/recommendations': renderRecommendations,
  '#/goals': renderGoals,
  '#/insights': renderInsights
};

const DEFAULT_ROUTE = '#/dashboard';

export function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const closeBtn = createElement('span', {
    className: 'toast-close',
    textContent: '×',
    onClick: () => toast.remove()
  });

  const toast = createElement('div', {
    className: `toast toast-${type}`,
    textContent: message
  }, closeBtn);

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-10px)';
    toast.style.transition = 'opacity 0.4s, transform 0.4s';
    
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 400);
  }, 4000);
}

function handleRouting() {
  const hash = window.location.hash || DEFAULT_ROUTE;
  const renderer = ROUTES[hash];

  const appContainer = document.getElementById('app-container');
  if (!appContainer) return;

  const navLinks = document.querySelectorAll('.sidebar-nav .nav-link');
  navLinks.forEach(link => {
    link.classList.remove('active');
    link.removeAttribute('aria-current');
    
    if (link.getAttribute('href') === hash) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    }
  });

  clearContainer(appContainer);

  if (renderer) {
    try {
      const pageNode = renderer();
      appContainer.appendChild(pageNode);
    } catch (err) {
      console.error(err);
      appContainer.appendChild(
        createElement('div', { style: { padding: '40px 0', color: 'var(--danger)' } },
          createElement('h3', { textContent: 'Failed to load page' }),
          createElement('p', { textContent: 'An unexpected application rendering error occurred. Please try again.' })
        )
      );
    }
  } else {
    window.location.hash = DEFAULT_ROUTE;
  }
}

const initialize = () => {
  window.addEventListener('hashchange', handleRouting);
  
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js')
        .catch(err => console.warn('Service worker registration failed:', err));
    });
  }

  const themeToggleBtn = document.getElementById('theme-toggle');
  if (themeToggleBtn) {
    const updateThemeButtonUI = (theme) => {
      const isDark = theme === 'dark';
      const textSpan = themeToggleBtn.querySelector('.theme-toggle-text');
      if (textSpan) {
        textSpan.textContent = isDark ? 'Light Mode' : 'Dark Mode';
      }
      
      const iconContainer = themeToggleBtn.querySelector('.theme-icon-sun');
      if (iconContainer) {
        if (isDark) {
          iconContainer.innerHTML = `
            <circle cx="12" cy="12" r="5"/>
            <line x1="12" y1="1" x2="12" y2="3"/>
            <line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="1" y1="12" x2="3" y2="12"/>
            <line x1="21" y1="12" x2="23" y2="12"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
          `;
        } else {
          iconContainer.innerHTML = `
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          `;
        }
      }
    };

    updateThemeButtonUI(store.getState().theme);

    themeToggleBtn.addEventListener('click', () => {
      const newTheme = store.getState().theme === 'dark' ? 'light' : 'dark';
      store.updateTheme(newTheme);
      updateThemeButtonUI(newTheme);
      showToast(`Switched to ${newTheme} mode!`, 'info');
    });
  }

  let previousState = store.getState();
  
  store.subscribe((newState) => {
    newState.achievements.forEach((ach, index) => {
      const prevAch = previousState.achievements[index];
      if (ach.isUnlocked && !prevAch.isUnlocked) {
        showToast(`🏆 Milestone Unlocked: "${ach.title}"!`, 'info');
      }
    });

    if (newState.goals.length > previousState.goals.length) {
      showToast('Goal added successfully!', 'success');
    }
    if (newState.goals.length < previousState.goals.length) {
      showToast('Goal deleted.', 'warning');
    }
    if (newState.footprints.length > previousState.footprints.length) {
      showToast('Footprint calculated and logged!', 'success');
    }
    if (newState.footprints.length < previousState.footprints.length) {
      showToast('Footprint record deleted.', 'warning');
    }
    
    previousState = newState;
    handleRouting();
  });

  handleRouting();
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}
