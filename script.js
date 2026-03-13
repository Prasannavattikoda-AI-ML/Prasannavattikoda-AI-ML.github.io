/* ===== PARTICLE BACKGROUND ===== */
const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');
let particles = [];
let mouse = { x: null, y: null };
let animationId;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

class Particle {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 2 + 0.5;
    this.speedX = (Math.random() - 0.5) * 0.6;
    this.speedY = (Math.random() - 0.5) * 0.6;
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

    // Mouse interaction: particles glow brighter near cursor
    if (mouse.x !== null && mouse.y !== null) {
      const dx = mouse.x - this.x;
      const dy = mouse.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120) {
        this.currentOpacity = Math.min(1, this.opacity + (1 - dist / 120) * 0.5);
        this.currentSize = this.size + (1 - dist / 120) * 2;
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
    const theme = document.documentElement.getAttribute('data-theme');
    const colors = theme === 'light'
      ? ['5, 150, 105', '8, 145, 178', '108, 79, 255']
      : ['6, 214, 160', '0, 180, 216', '123, 97, 255'];
    const color = colors[this.colorIndex];
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.currentSize, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${color}, ${this.currentOpacity})`;
    ctx.fill();
  }
}

function initParticles() {
  particles = [];
  const count = Math.min(80, Math.floor((canvas.width * canvas.height) / 12000));
  for (let i = 0; i < count; i++) {
    particles.push(new Particle());
  }
}

function connectParticles() {
  const theme = document.documentElement.getAttribute('data-theme');
  const color = theme === 'light' ? '5, 150, 105' : '6, 214, 160';
  const maxDist = 150;

  for (let a = 0; a < particles.length; a++) {
    for (let b = a + 1; b < particles.length; b++) {
      const dx = particles[a].x - particles[b].x;
      const dy = particles[a].y - particles[b].y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < maxDist) {
        const opacity = (1 - dist / maxDist) * 0.15;
        ctx.beginPath();
        ctx.strokeStyle = `rgba(${color}, ${opacity})`;
        ctx.lineWidth = 0.6;
        ctx.moveTo(particles[a].x, particles[a].y);
        ctx.lineTo(particles[b].x, particles[b].y);
        ctx.stroke();
      }
    }
  }

  // Mouse-to-particle connections for tech scanner effect
  if (mouse.x !== null && mouse.y !== null) {
    particles.forEach(p => {
      const dx = mouse.x - p.x;
      const dy = mouse.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 150) {
        const opacity = (1 - dist / 150) * 0.25;
        ctx.beginPath();
        ctx.strokeStyle = `rgba(${color}, ${opacity})`;
        ctx.lineWidth = 0.8;
        ctx.moveTo(mouse.x, mouse.y);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      }
    });
  }
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
animateParticles();

window.addEventListener('resize', () => {
  resizeCanvas();
  initParticles();
});

/* ===== THEME TOGGLE ===== */
const themeToggle = document.getElementById('themeToggle');
const savedTheme = localStorage.getItem('theme') || 'dark';
document.documentElement.setAttribute('data-theme', savedTheme);

themeToggle.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
});

/* ===== NAVBAR ===== */
const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
const sections = document.querySelectorAll('.section, .hero');

// Scrolled state
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
  updateActiveLink();
});

// Mobile toggle
navToggle.addEventListener('click', () => {
  navToggle.classList.toggle('active');
  navLinks.classList.toggle('open');
});

// Close mobile nav on link click
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navToggle.classList.remove('active');
    navLinks.classList.remove('open');
  });
});

// Active link highlighting
function updateActiveLink() {
  let current = '';
  sections.forEach(section => {
    const top = section.offsetTop - 120;
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
const observerOptions = {
  threshold: 0.15,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, observerOptions);

document.querySelectorAll('[data-aos]').forEach(el => {
  observer.observe(el);
});

/* ===== CONTACT FORM (Cloudflare Worker + Resend) ===== */
// TODO: Replace with your deployed Cloudflare Worker URL
const WORKER_URL = 'https://portfolio-contact.gnanasaiprasanna333.workers.dev';

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
    const res = await fetch(WORKER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

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
      }, 4000);
    } else {
      throw new Error(data.error || 'Failed to send');
    }
  } catch (error) {
    btn.innerHTML = originalText;
    btn.disabled = false;
    formStatus.textContent = 'Failed to send: ' + error.message;
    formStatus.classList.add('error');
    console.error('Contact form error:', error);
  }
});

/* ===== SMOOTH REVEAL FOR ABOUT CODE BLOCK ===== */
const codeBlock = document.querySelector('.code-block');
if (codeBlock) {
  const codeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.2 });

  codeBlock.style.opacity = '0';
  codeBlock.style.transform = 'translateY(30px)';
  codeBlock.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  codeObserver.observe(codeBlock);
}
