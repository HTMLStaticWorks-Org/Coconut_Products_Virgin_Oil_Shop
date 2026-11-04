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
  const path = window.location.pathname.split('/').pop() || 'index.html';
  const cleanPath = path.split('?')[0].split('#')[0];
  $$('.links > a:not(.btn):not(.drawer-cta)').forEach((a) => {
    const href = a.getAttribute('href');
    if (href === cleanPath || (cleanPath === '' && href === 'index.html')) {
      a.classList.add('active');
    }
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
