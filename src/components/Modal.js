import { createElement } from '../utils/dom.js';

/**
 * Accessible Modal Component.
 * Mounts directly into the document body or modal-root and handles its own lifecycle.
 * @param {Object} props - Modal configuration
 * @param {string} props.title - Modal title text
 * @param {Function} props.onClose - Callback triggered on close request
 * @param {Array<HTMLElement|string>} children - Modal contents
 * @returns {Object} Control interface { close, element }
 */
export function createModal(props, ...children) {
  const { title, onClose } = props;

  const modalRoot = document.getElementById('modal-root') || document.body;

  let previousActiveElement = document.activeElement;

  const close = () => {
    overlay.classList.add('fadeOut');
    content.classList.add('scaleDown');
    
    setTimeout(() => {
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
      if (previousActiveElement && typeof previousActiveElement.focus === 'function') {
        previousActiveElement.focus();
      }
      if (onClose) onClose();
    }, 200);
  };

  // Close Button
  const closeBtn = createElement('button', {
    className: 'btn-close',
    style: {
      position: 'absolute',
      top: '20px',
      right: '20px',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: 'var(--text-muted)',
      padding: '4px'
    },
    'aria-label': 'Close modal',
    onClick: close
  }, 
    createElement('svg', {
      width: '20',
      height: '20',
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '2'
    },
      createElement('line', { x1: '18', y1: '6', x2: '6', y2: '18' }),
      createElement('line', { x1: '6', y1: '6', x2: '18', y2: '18' })
    )
  );

  // Modal content wrapper
  const content = createElement('div', {
    className: 'modal-content',
    role: 'dialog',
    'aria-modal': 'true',
    'aria-labelledby': 'modal-title-header'
  },
    closeBtn,
    createElement('h2', { 
      id: 'modal-title-header', 
      className: 'modal-title', 
      style: { marginBottom: '20px', fontSize: '1.5rem', fontWeight: '800' },
      textContent: title 
    }),
    createElement('div', { className: 'modal-body' }, ...children)
  );

  // Overlay mask
  const overlay = createElement('div', {
    className: 'modal-overlay',
    onClick: (e) => {
      // If clicked exactly on overlay background, close modal
      if (e.target === overlay) close();
    }
  }, content);

  // Keyboard accessibility
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      close();
    }
    // Focus trapping loop
    if (e.key === 'Tab') {
      const focusables = content.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (focusables.length === 0) return;
      
      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          last.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === last) {
          first.focus();
          e.preventDefault();
        }
      }
    }
  };

  overlay.addEventListener('keydown', handleKeyDown);
  modalRoot.appendChild(overlay);

  // Set initial focus inside modal
  setTimeout(() => {
    const firstFocusable = content.querySelector('button, [href], input, select, textarea');
    if (firstFocusable) {
      firstFocusable.focus();
    } else {
      content.focus();
    }
  }, 50);

  return {
    close,
    element: overlay
  };
}
