/**
 * Main
 */

'use strict';

// Simple logging utility to avoid build issues
const log = {
  info: function() { console.info.apply(console, arguments); },
  warn: function() { console.warn.apply(console, arguments); },
  error: function() { console.error.apply(console, arguments); },
  // Add other console methods as needed
};

// Set log level based on environment (e.g., development, production)
// In a real application, you might get this from a config file or environment variable
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  // Development mode: show info, warnings, and errors
  log.level = 'info';
} else {
  // Production mode: only show warnings and errors
  log.level = 'warn';
}

// Override console methods based on log level
for (const level in log) {
  if (typeof console[level] === 'function' && log.hasOwnProperty(level)) {
    const originalMethod = console[level];
    console[level] = function() {
      if (log.level === 'info' || (log.level === 'warn' && (level === 'warn' || level === 'error')) || (log.level === 'error' && level === 'error')) {
        originalMethod.apply(console, arguments);
      }
    };
  }
}

log.info('Frontend application started with simple logger.');

let menu, animate;

function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
}

document.addEventListener('DOMContentLoaded', function() {
  let menu;
  // Initialize menu
  //-----------------

  let layoutMenuEl = document.querySelectorAll('#layout-menu');
  layoutMenuEl.forEach(function (element) {
    if (typeof window.Menu === 'function') {
      menu = new window.Menu(element, {
        orientation: 'vertical',
        closeChildren: false
      });
      // Change parameter to true if you want scroll animation
      window.Helpers.scrollToActive(false);
      window.Helpers.mainMenu = menu;
    } else {
      log.error('window.Menu is not a constructor function. Menu initialization skipped.');
    }
  });

  // Dynamically adjust menu for Bike role
  const token = localStorage.getItem('authToken');
  if (token) {
      const decoded = parseJwt(token);
      if (decoded && decoded.role === 'Bike') {
          const taskManagementLink = document.querySelector('a[href="dashboard.html"]');
          if (taskManagementLink) {
              const parentLi = taskManagementLink.closest('.menu-item');
              const parentUl = parentLi ? parentLi.closest('.menu-sub') : null;

              if (parentLi && parentUl) {
                // 1. Update existing link to be the main bike dashboard
                taskManagementLink.href = 'task-attachments.html';
                taskManagementLink.querySelector('div').textContent = 'Task Attachments';

                // Add History Attachments link
                const historyAttachmentsLi = document.createElement('li');
                historyAttachmentsLi.className = 'menu-item';
                historyAttachmentsLi.innerHTML = `
                  <a href="history-attachments.html" class="menu-link">
                    <i class='menu-icon icon-base bx bx-history'></i>
                    <div data-i18n="History">History Attachments</div>
                  </a>
                `;
                parentUl.appendChild(historyAttachmentsLi);

                // 2. Create the new link for pre-approved tasks
                const preApprovedLi = parentLi.cloneNode(true);
                const preApprovedLink = preApprovedLi.querySelector('a');
                preApprovedLink.href = 'bike-pre-approved.html';
                preApprovedLink.querySelector('div').textContent = 'งาน Pre-approved';
                
                // Make the original link inactive and the current page active
                parentLi.classList.remove('active');
                if (window.location.pathname.endsWith('bike-dashboard.html')) {
                    parentLi.classList.add('active');
                } else if (window.location.pathname.endsWith('bike-pre-approved.html')) {
                    preApprovedLi.classList.add('active');
                }
              }
      }
  }

  // Initialize menu togglers and bind click on each
  let menuToggler = document.querySelectorAll('.layout-menu-toggle');
  menuToggler.forEach(item => {
    item.addEventListener('click', event => {
      event.preventDefault();
      window.Helpers.toggleCollapsed();
    });
  });

  // Display menu toggle (layout-menu-toggle) on hover with delay
  let delay = function (elem, callback) {
    let timeout = null;
    elem.onmouseenter = function () {
      // Set timeout to be a timer which will invoke callback after 300ms (not for small screen)
      if (!window.Helpers.isSmallScreen()) {
      } else {
        timeout = setTimeout(callback, 0);
      }
    };

    elem.onmouseleave = function () {
      // Clear any timers set to timeout
      document.querySelector('.layout-menu-toggle').classList.remove('d-block');
      clearTimeout(timeout);
    };
  };
  if (document.getElementById('layout-menu')) {
    delay(document.getElementById('layout-menu'), function () {
      // not for small screen
      if (!Helpers.isSmallScreen()) {
        document.querySelector('.layout-menu-toggle').classList.add('d-block');
      }
    });
  }

  // Display in main menu when menu scrolls
  let menuInnerContainer = document.getElementsByClassName('menu-inner'),
    menuInnerShadow = document.getElementsByClassName('menu-inner-shadow')[0];
  if (menuInnerContainer.length > 0 && menuInnerShadow) {
    menuInnerContainer[0].addEventListener('ps-scroll-y', function () {
      if (this.querySelector('.ps__thumb-y').offsetTop) {
        menuInnerShadow.style.display = 'block';
      } else {
        menuInnerShadow.style.display = 'none';
      }
    });
  }

  // Init helpers & misc
  // --------------------

  // Init BS Tooltip
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });

  // Accordion active class
  const accordionActiveFunction = function (e) {
    if (e.type == 'show.bs.collapse' || e.type == 'show.bs.collapse') {
      e.target.closest('.accordion-item').classList.add('active');
    } else {
      e.target.closest('.accordion-item').classList.remove('active');
    }
  };

  const accordionTriggerList = [].slice.call(document.querySelectorAll('.accordion'));
  const accordionList = accordionTriggerList.map(function (accordionTriggerEl) {
    accordionTriggerEl.addEventListener('show.bs.collapse', accordionActiveFunction);
    accordionTriggerEl.addEventListener('hide.bs.collapse', accordionActiveFunction);
  });

    // Auto update layout based on screen size
    if (window.Helpers) {
      window.Helpers.setAutoUpdate(true);
    }
  
    // Toggle Password Visibility
    if (window.Helpers) {
      window.Helpers.initPasswordToggle();
    }
  
    // Speech To Text
    if (window.Helpers) {
      window.Helpers.initSpeechToText();
    }
  
    // Manage menu expanded/collapsed with templateCustomizer & local storage
    //------------------------------------------------------------------
  
    // If current layout is horizontal OR current window screen is small (overlay menu) than return from here
    if (window.Helpers && window.Helpers.isSmallScreen()) {
      return;
    }
  
    // If current layout is vertical and current window screen is > small
  
    // Auto update menu collapsed/expanded based on the themeConfig
    if (window.Helpers) {
      window.Helpers.setCollapsed(true, false);
    }  // Fetch and display app version
  fetch('/version.json')
    .then(res => res.json())
    .then(frontendVersionData => {
        const feVersion = `FE: ${frontendVersionData.version}`;
        const appVersionEl = document.getElementById("appVersion");
        if(appVersionEl) appVersionEl.textContent = feVersion;

        // Fetch backend version
        fetch('https://be-claims-service.onrender.com/api/version')
            .then(res => res.json())
            .then(backendVersionData => {
                const beVersion = `BE: ${backendVersionData.version}`;
                if(appVersionEl) appVersionEl.textContent = `${feVersion} | ${beVersion}`;
            })
            .catch(() => {
                if(appVersionEl) appVersionEl.textContent = `${feVersion} | BE: -`;
            });
    })
    .catch(() => { 
        const appVersionEl = document.getElementById("appVersion");
        if(appVersionEl) appVersionEl.textContent = "FE: - | BE: -"; 
    });
});
