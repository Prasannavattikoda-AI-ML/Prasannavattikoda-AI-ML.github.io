/* ===== CONFIGURATION ===== */
const CONFIG = {
  particles: {
    maxCount: 80,
    densityDivisor: 12000,
    interactionRadius: 120,
    connectionDistance: 150,
    mouseConnectionDistance: 150,
    baseLineWidth: 0.6,
    mouseLineWidth: 0.8,
    maxSpeed: 0.6,
    glowBoost: 0.5,
    sizeBoost: 2,
    connectionOpacity: 0.15,
    mouseOpacity: 0.25,
  },
  scroll: {
    navThreshold: 50,
    navOffset: 120,
  },
  observer: {
    threshold: 0.15,
    rootMarginBottom: '-50px',
  },
  form: {
    resetTimeout: 4000,
    fetchTimeout: 10000,
  },
  resize: {
    debounceDelay: 250,
  },
};

const THEME_COLORS = {
  dark: {
    particles: ['6, 214, 160', '0, 180, 216', '123, 97, 255'],
    connection: '6, 214, 160',
  },
  light: {
    particles: ['5, 150, 105', '8, 145, 178', '108, 79, 255'],
    connection: '5, 150, 105',
  },
};

/* ===== UTILITIES ===== */
function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/* ===== PARTICLE BACKGROUND ===== */
const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');
let particles = [];
let mouse = { x: null, y: null };
let animationId;
let currentThemeColors = THEME_COLORS.dark;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function updateThemeColors() {
  const theme = document.documentElement.getAttribute('data-theme');
  currentThemeColors = THEME_COLORS[theme] || THEME_COLORS.dark;
}

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

class Particle {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 2 + 0.5;
    this.speedX = (Math.random() - 0.5) * CONFIG.particles.maxSpeed;
    this.speedY = (Math.random() - 0.5) * CONFIG.particles.maxSpeed;
    this.opacity = Math.random() * 0.5 + 0.2;
    this.colorIndex = Math.floor(Math.random() * 3);
    this.currentOpacity = this.opacity;
    this.currentSize = this.size;
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;

    if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
    if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;

    if (mouse.x !== null && mouse.y !== null) {
      const dx = mouse.x - this.x;
      const dy = mouse.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const radius = CONFIG.particles.interactionRadius;

      if (dist < radius) {
        const proximity = 1 - dist / radius;
        this.currentOpacity = Math.min(1, this.opacity + proximity * CONFIG.particles.glowBoost);
        this.currentSize = this.size + proximity * CONFIG.particles.sizeBoost;
      } else {
        this.currentOpacity = this.opacity;
        this.currentSize = this.size;
      }
    } else {
      this.currentOpacity = this.opacity;
      this.currentSize = this.size;
    }
  }

  draw() {
    const color = currentThemeColors.particles[this.colorIndex];
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.currentSize, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${color}, ${this.currentOpacity})`;
    ctx.fill();
  }
}

function initParticles() {
  particles = [];
  const count = Math.min(
    CONFIG.particles.maxCount,
    Math.floor((canvas.width * canvas.height) / CONFIG.particles.densityDivisor)
  );
  for (let i = 0; i < count; i++) {
    particles.push(new Particle());
  }
}

function connectParticles() {
  const color = currentThemeColors.connection;
  const maxDist = CONFIG.particles.connectionDistance;

  for (let a = 0; a < particles.length; a++) {
    for (let b = a + 1; b < particles.length; b++) {
      const dx = particles[a].x - particles[b].x;
      const dy = particles[a].y - particles[b].y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < maxDist) {
        const opacity = (1 - dist / maxDist) * CONFIG.particles.connectionOpacity;
        ctx.beginPath();
        ctx.strokeStyle = `rgba(${color}, ${opacity})`;
        ctx.lineWidth = CONFIG.particles.baseLineWidth;
        ctx.moveTo(particles[a].x, particles[a].y);
        ctx.lineTo(particles[b].x, particles[b].y);
        ctx.stroke();
      }
    }
  }

  // Mouse-to-particle connections for tech scanner effect
  if (mouse.x !== null && mouse.y !== null) {
    const mouseDist = CONFIG.particles.mouseConnectionDistance;

    particles.forEach(p => {
      const dx = mouse.x - p.x;
      const dy = mouse.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < mouseDist) {
        const opacity = (1 - dist / mouseDist) * CONFIG.particles.mouseOpacity;
        ctx.beginPath();
        ctx.strokeStyle = `rgba(${color}, ${opacity})`;
        ctx.lineWidth = CONFIG.particles.mouseLineWidth;
        ctx.moveTo(mouse.x, mouse.y);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      }
    });
  }
}

function drawStaticFrame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => p.draw());
  connectParticles();
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => {
    p.update();
    p.draw();
  });
  connectParticles();
  animationId = requestAnimationFrame(animateParticles);
}

function startParticles() {
  cancelAnimationFrame(animationId);
  if (reducedMotion.matches) {
    drawStaticFrame();
  } else {
    animateParticles();
  }
}

// Mouse events for particle interaction
canvas.addEventListener('mousemove', (e) => {
  mouse.x = e.x;
  mouse.y = e.y;
});

canvas.addEventListener('mouseleave', () => {
  mouse.x = null;
  mouse.y = null;
});

resizeCanvas();
initParticles();
startParticles();

function handleResize() {
  cancelAnimationFrame(animationId);
  resizeCanvas();
  initParticles();
  startParticles();
}

window.addEventListener('resize', debounce(handleResize, CONFIG.resize.debounceDelay));

reducedMotion.addEventListener('change', () => {
  cancelAnimationFrame(animationId);
  startParticles();
});

/* ===== THEME TOGGLE ===== */
const themeToggle = document.getElementById('themeToggle');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
const savedTheme = localStorage.getItem('theme') || (prefersDark ? 'dark' : 'light');
document.documentElement.setAttribute('data-theme', savedTheme);
updateThemeColors();

themeToggle.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  updateThemeColors();
});

/* ===== NAVBAR ===== */
const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
const sections = document.querySelectorAll('.section, .hero');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > CONFIG.scroll.navThreshold);
  updateActiveLink();
});

navToggle.addEventListener('click', () => {
  navToggle.classList.toggle('active');
  navLinks.classList.toggle('open');
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navToggle.classList.remove('active');
    navLinks.classList.remove('open');
  });
});

function updateActiveLink() {
  let current = '';
  sections.forEach(section => {
    const top = section.offsetTop - CONFIG.scroll.navOffset;
    if (window.scrollY >= top) {
      current = section.getAttribute('id');
    }
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${current}`) {
      link.classList.add('active');
    }
  });
}

/* ===== SCROLL ANIMATIONS ===== */
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, {
  threshold: CONFIG.observer.threshold,
  rootMargin: `0px 0px ${CONFIG.observer.rootMarginBottom} 0px`,
});

document.querySelectorAll('[data-aos]').forEach(el => {
  observer.observe(el);
});

/* ===== CONTACT FORM (Vercel Serverless Function) ===== */
const CONTACT_API = 'https://contact-api-lime-xi.vercel.app/api/contact';

const contactForm = document.getElementById('contactForm');
const formStatus = document.getElementById('formStatus');

contactForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const btn = contactForm.querySelector('button[type="submit"]');
  const originalText = btn.innerHTML;

  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
  btn.disabled = true;
  formStatus.textContent = '';
  formStatus.className = 'form-status';

  const payload = {
    from_name: document.getElementById('name').value,
    from_email: document.getElementById('email').value,
    subject: document.getElementById('subject').value,
    message: document.getElementById('message').value,
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CONFIG.form.fetchTimeout);

    const res = await fetch(CONTACT_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      throw new Error('Server returned an unexpected response');
    }

    const data = await res.json();

    if (res.ok && data.success) {
      btn.innerHTML = '<i class="fas fa-check"></i> Message Sent!';
      btn.style.background = 'linear-gradient(135deg, #06d6a0, #00b4d8)';
      formStatus.textContent = 'Your message has been sent successfully!';
      formStatus.classList.add('success');
      contactForm.reset();

      setTimeout(() => {
        btn.innerHTML = originalText;
        btn.style.background = '';
        btn.disabled = false;
        formStatus.textContent = '';
      }, CONFIG.form.resetTimeout);
    } else {
      throw new Error(data.error || 'Failed to send');
    }
  } catch (error) {
    btn.innerHTML = originalText;
    btn.disabled = false;

    const message = error.name === 'AbortError'
      ? 'Request timed out. Please try again.'
      : error.message;

    formStatus.textContent = 'Failed to send: ' + message;
    formStatus.classList.add('error');
    console.error('Contact form error:', error);
  }
});
