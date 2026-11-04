// DOM Helpers
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

// Theme Management
const body = document.body;
const savedTheme = localStorage.getItem('coconut-theme');
if (savedTheme === 'dark') {
  body.classList.add('dark');
}

$('#themeToggle')?.addEventListener('click', () => {
  body.classList.toggle('dark');
  const isDark = body.classList.contains('dark');
  localStorage.setItem('coconut-theme', isDark ? 'dark' : 'light');
});

// Direction (RTL / LTR) Management
const rtlBtn = $('#rtlToggle');
const savedDir = localStorage.getItem('coconut-dir');

function setDirection(dir) {
  const isRtl = dir === 'rtl';
  document.documentElement.setAttribute('dir', isRtl ? 'rtl' : 'ltr');
  document.body.setAttribute('dir', isRtl ? 'rtl' : 'ltr');
  if (rtlBtn) {
    rtlBtn.textContent = isRtl ? 'LTR' : 'RTL';
    rtlBtn.classList.toggle('active', isRtl);
    rtlBtn.setAttribute('aria-pressed', isRtl);
    rtlBtn.setAttribute('title', isRtl ? 'Switch to Left-to-Right (LTR)' : 'Switch to Right-to-Left (RTL)');
  }
}

if (savedDir === 'rtl') {
  setDirection('rtl');
} else {
  setDirection('ltr');
}

rtlBtn?.addEventListener('click', () => {
  const currentDir = document.documentElement.getAttribute('dir') || 'ltr';
  const newDir = currentDir === 'rtl' ? 'ltr' : 'rtl';
  setDirection(newDir);
  localStorage.setItem('coconut-dir', newDir);
});

// Mobile Navigation
$('#menuToggle')?.addEventListener('click', () => {
  $('#siteLinks')?.classList.toggle('open');
});

// Close mobile navigation when clicking outside
document.addEventListener('click', (e) => {
  const nav = $('#siteLinks');
  const btn = $('#menuToggle');
  if (nav?.classList.contains('open') && !nav.contains(e.target) && !btn?.contains(e.target)) {
    nav.classList.remove('open');
  }
});

// Dynamic Active Link Highlight
(function highlightActivePage() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  const cleanPath = path.split('?')[0].split('#')[0];
  $$('.links a').forEach((a) => {
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
