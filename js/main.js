// DOM Helpers
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

// Theme Management
const body = document.body;

function applyTheme(isDark) {
  body.classList.toggle('dark', isDark);
  localStorage.setItem('coconut-theme', isDark ? 'dark' : 'light');
  $$('.theme-toggle, #themeToggle').forEach((btn) => {
    btn.setAttribute('aria-pressed', isDark);
    btn.setAttribute('title', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    const label = btn.querySelector('.theme-text');
    if (label) {
      label.textContent = isDark ? 'Light' : 'Theme';
    }
  });
}

const savedTheme = localStorage.getItem('coconut-theme');
if (savedTheme === 'dark') {
  applyTheme(true);
} else {
  applyTheme(false);
}

$$('.theme-toggle, #themeToggle').forEach((btn) => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isDark = !body.classList.contains('dark');
    applyTheme(isDark);
  });
});

// Direction (RTL / LTR) Management
function setDirection(dir) {
  const isRtl = dir === 'rtl';
  document.documentElement.setAttribute('dir', isRtl ? 'rtl' : 'ltr');
  document.body.setAttribute('dir', isRtl ? 'rtl' : 'ltr');
  $$('.rtl-toggle').forEach((btn) => {
    btn.classList.toggle('active', isRtl);
    btn.setAttribute('aria-pressed', isRtl);
    btn.setAttribute('title', isRtl ? 'Switch to Left-to-Right (LTR)' : 'Switch to Right-to-Left (RTL)');
    const textSpan = btn.querySelector('.rtl-text');
    if (textSpan) {
      textSpan.textContent = isRtl ? 'LTR' : 'RTL';
    } else {
      btn.textContent = isRtl ? 'LTR' : 'RTL';
    }
  });
}

const savedDir = localStorage.getItem('coconut-dir');
if (savedDir === 'rtl') {
  setDirection('rtl');
} else {
  setDirection('ltr');
}

$$('.rtl-toggle').forEach((btn) => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const currentDir = document.documentElement.getAttribute('dir') || 'ltr';
    const newDir = currentDir === 'rtl' ? 'ltr' : 'rtl';
    setDirection(newDir);
    localStorage.setItem('coconut-dir', newDir);
  });
});

// Mobile Navigation
$('#menuToggle')?.addEventListener('click', (e) => {
  e.stopPropagation();
  $('#siteLinks')?.classList.toggle('open');
});

// Close mobile navigation when clicking outside or clicking a nav link
document.addEventListener('click', (e) => {
  const nav = $('#siteLinks');
  const btn = $('#menuToggle');
  if (nav?.classList.contains('open') && !nav.contains(e.target) && !btn?.contains(e.target)) {
    nav.classList.remove('open');
  }
});

$$('.links > a').forEach((link) => {
  link.addEventListener('click', () => {
    $('#siteLinks')?.classList.remove('open');
  });
});

// Dynamic Active Link Highlight
(function highlightActivePage() {
  let rawPath = '';
  try {
    rawPath = decodeURIComponent(window.location.pathname.split('/').pop() || 'index.html');
  } catch (e) {
    rawPath = window.location.pathname.split('/').pop() || 'index.html';
  }
  let cleanPath = rawPath.split('?')[0].split('#')[0].toLowerCase();
  if (!cleanPath || cleanPath === '') {
    cleanPath = 'index.html';
  }

  // Handle standard navigation links
  const regularLinks = $$('.links > a:not(.btn):not(.drawer-cta)');
  let hasMatch = false;
  regularLinks.forEach((a) => {
    const href = (a.getAttribute('href') || '').split('?')[0].split('#')[0].toLowerCase();
    const isCurrent = href === cleanPath;
    if (isCurrent) {
      a.classList.add('active');
      hasMatch = true;
    } else {
      a.classList.remove('active');
    }
  });

  // If on index or root and no link matched, default to Home
  if (!hasMatch && (cleanPath === 'index.html' || cleanPath === '')) {
    const homeLink = $('.links > a[href="index.html"]');
    if (homeLink) homeLink.classList.add('active');
  }

  // Handle Bulk Enquiry button state
  const isEnquiryPage = cleanPath === 'bulk-enquiry.html';
  $$('.drawer-cta, .nav-actions .btn[href="bulk-enquiry.html"]').forEach((btn) => {
    btn.classList.toggle('active', isEnquiryPage);
  });
})();

// Catalogue Filter Buttons
$$('[data-filter]').forEach((btn) => {
  btn.addEventListener('click', () => {
    $$('[data-filter]').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    const f = btn.dataset.filter;
    $$('.product[data-category]').forEach((card) => {
      card.hidden = !(f === 'all' || card.dataset.category === f);
    });
  });
});

// Quick Enquiry Button Action
$$('[data-enquire]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const product = btn.dataset.enquire;
    const field = $('#productInterest');
    if (field) field.value = product;
    const target = $('#enquiry-form') || $('#contact-form');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
      field?.focus();
    } else {
      location.href = 'bulk-enquiry.html?product=' + encodeURIComponent(product);
    }
  });
});

// Mailto Form Handler
function handleForm(form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const subject = encodeURIComponent(form.dataset.subject || 'Website enquiry');
    const bodyText = encodeURIComponent([...data.entries()].map(([k, v]) => `${k}: ${v}`).join('\n'));
    const email = form.dataset.email || 'hello@example.com';
    $('#formStatus', form)?.classList.remove('hidden');
    window.location.href = `mailto:${email}?subject=${subject}&body=${bodyText}`;
  });
}
$$('form[data-mailto]').forEach(handleForm);

// Newsletter Form Handler
$$('form[data-newsletter]').forEach((form) => {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const successMsg = form.parentElement.querySelector('.newsletter-success');
    if (successMsg) {
      successMsg.hidden = false;
      successMsg.style.display = 'block';
    }
    form.reset();
    setTimeout(() => {
      if (successMsg) {
        successMsg.hidden = true;
        successMsg.style.display = 'none';
      }
    }, 5000);
  });
});

// Prefill Product from URL Query
const params = new URLSearchParams(location.search);
if ($('#productInterest') && params.get('product')) {
  $('#productInterest').value = params.get('product');
}

// Move to Top Floating Button Handler
function initScrollTop() {
  const scrollTopBtn = $('#scrollTopBtn') || $('.scroll-top');
  if (!scrollTopBtn || scrollTopBtn.dataset.bound === 'true') return;
  scrollTopBtn.dataset.bound = 'true';

  const getScrollOffset = () =>
    window.pageYOffset ||
    document.documentElement.scrollTop ||
    document.body.scrollTop ||
    0;

  const updateScrollTopVisibility = () => {
    if (getScrollOffset() > 220) {
      scrollTopBtn.classList.add('visible');
    } else {
      scrollTopBtn.classList.remove('visible');
    }
  };

  window.addEventListener('scroll', updateScrollTopVisibility, { passive: true });
  document.addEventListener('scroll', updateScrollTopVisibility, { passive: true });
  updateScrollTopVisibility();

  scrollTopBtn.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.documentElement.scrollTo?.({ top: 0, behavior: 'smooth' });
    document.body.scrollTo?.({ top: 0, behavior: 'smooth' });
  });
}

initScrollTop();
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initScrollTop);
}
window.addEventListener('load', initScrollTop);

// FAQ Accordion Handler (Contact Page & Site)
$$('.faq-item').forEach((item) => {
  const trigger = item.querySelector('.faq-question');
  trigger?.addEventListener('click', () => {
    const isOpen = item.classList.contains('open');
    item.parentElement.querySelectorAll('.faq-item').forEach((other) => {
      if (other !== item) other.classList.remove('open');
    });
    item.classList.toggle('open', !isOpen);
  });
});
