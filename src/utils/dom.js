/**
 * DOM utilities for safe elements creation and manipulation.
 * Helps prevent XSS vulnerability by escaping input data.
 */

/**
 * Escapes characters for HTML output.
 * @param {string} string - Raw string to escape
 * @returns {string} Escaped HTML string
 */
export function escapeHTML(string) {
  if (typeof string !== 'string') {
    return String(string);
  }
  return string
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Safely creates a DOM element with classes, attributes, text content, and event listeners.
 * @param {string} tag - HTML tag name (e.g. 'div', 'button')
 * @param {Object} [props] - Properties, classes, attributes, and event listeners
 * @param {...(Node|string)} [children] - Child nodes or text strings
 * @returns {HTMLElement} Created element
 */
export function createElement(tag, props = {}, ...children) {
  const element = document.createElement(tag);

  for (const [key, value] of Object.entries(props)) {
    if (value === undefined || value === null) continue;

    if (key === 'className') {
      element.className = value;
    } else if (key === 'style' && typeof value === 'object') {
      Object.assign(element.style, value);
    } else if (key.startsWith('on') && typeof value === 'function') {
      const eventName = key.substring(2).toLowerCase();
      element.addEventListener(eventName, value);
    } else if (key === 'dataset' && typeof value === 'object') {
      Object.assign(element.dataset, value);
    } else if (key === 'textContent') {
      element.textContent = value;
    } else {
      element.setAttribute(key, value);
    }
  }

  for (const child of children) {
    if (child === undefined || child === null) continue;
    if (typeof child === 'string') {
      element.appendChild(document.createTextNode(child));
    } else if (child instanceof Node) {
      element.appendChild(child);
    }
  }

  return element;
}

/**
 * Clears all children of a DOM container.
 * @param {HTMLElement} container - DOM node to clear
 */
export function clearContainer(container) {
  if (!container) return;
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
}
