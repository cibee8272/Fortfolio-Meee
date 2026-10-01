document.addEventListener("DOMContentLoaded", () => {
  if (window.lucide) lucide.createIcons();

  const body = document.body;
  const themeBtn = document.getElementById("themeBtn");
  const menuBtn = document.getElementById("menuBtn");
  const sidebar = document.getElementById("sidebar");
  const cursorGlow = document.querySelector(".cursor-glow");

  // Theme
  const savedTheme = localStorage.getItem("portfolio-theme");
  if (savedTheme === "light") body.classList.add("light");

  themeBtn?.addEventListener("click", () => {
    body.classList.toggle("light");
    localStorage.setItem("portfolio-theme", body.classList.contains("light") ? "light" : "dark");
    themeBtn.innerHTML = body.classList.contains("light")
      ? '<i data-lucide="sun"></i><span>Toggle theme</span>'
      : '<i data-lucide="moon"></i><span>Toggle theme</span>';
    lucide.createIcons();
  });

  // Mobile menu
  menuBtn?.addEventListener("click", () => sidebar.classList.toggle("open"));
  document.querySelectorAll(".nav-link").forEach(link => {
    link.addEventListener("click", () => sidebar.classList.remove("open"));
  });

  // Scroll reveal
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("show");
        if (entry.target.classList.contains("skills-layout")) entry.target.classList.add("in-view");
      }
    });
  }, { threshold: 0.14 });

  document.querySelectorAll(".reveal, .skills-layout").forEach(el => observer.observe(el));

  // Animated counters
  const counterObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = Number(el.dataset.count);
      let current = 0;
      const step = Math.max(1, Math.ceil(target / 45));
      const tick = () => {
        current = Math.min(current + step, target);
        el.textContent = current;
        if (current < target) requestAnimationFrame(tick);
      };
      tick();
      obs.unobserve(el);
    });
  }, { threshold: 0.8 });

  document.querySelectorAll("[data-count]").forEach(el => counterObserver.observe(el));

  // Active navigation
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".nav-link");
  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => link.classList.toggle("active", link.getAttribute("href") === "#" + entry.target.id));
      }
    });
  }, { rootMargin: "-35% 0px -55% 0px" });
  sections.forEach(section => sectionObserver.observe(section));

  // Cursor glow on desktop
  if (window.matchMedia("(pointer:fine)").matches) {
    window.addEventListener("pointermove", e => {
      cursorGlow.style.left = e.clientX + "px";
      cursorGlow.style.top = e.clientY + "px";
    });
  } else {
    cursorGlow.style.display = "none";
  }

  // Contact demo
  document.getElementById("contactForm")?.addEventListener("submit", e => {
    e.preventDefault();
    const note = document.getElementById("formNote");
    note.textContent = "Demo berhasil — form siap dihubungkan ke backend/email service.";
    e.target.reset();
  });

  // 3D-ish project hover on desktop
  if (window.matchMedia("(pointer:fine)").matches) {
    document.querySelectorAll(".project-card").forEach(card => {
      card.addEventListener("pointermove", e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - .5;
        const y = (e.clientY - r.top) / r.height - .5;
        card.style.transform = `perspective(900px) rotateX(${y * -3}deg) rotateY(${x * 3}deg) translateY(-5px)`;
      });
      card.addEventListener("pointerleave", () => card.style.transform = "");
    });
  }

  // Scroll progress + gentle scene motion (kept lightweight and dependency-free)
  const progress = document.querySelector('.scroll-progress span');
  const motionNodes = document.querySelectorAll('.showcase-ad, .project-ad, .mini-ad, .project-card');
  const updateMotion = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.height = (max > 0 ? (window.scrollY / max) * 100 : 0) + '%';
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduce && window.matchMedia('(pointer:fine)').matches) {
      const vh = window.innerHeight;
      motionNodes.forEach((el, i) => {
        const r = el.getBoundingClientRect();
        const center = (r.top + r.height / 2 - vh / 2) / vh;
        const amount = Math.max(-1, Math.min(1, center));
        el.style.setProperty('--scroll-shift', `${amount * -8}px`);
      });
    }
  };
  let motionTick = false;
  window.addEventListener('scroll', () => {
    if (motionTick) return;
    motionTick = true;
    requestAnimationFrame(() => { updateMotion(); motionTick = false; });
  }, { passive: true });
  updateMotion();

});


/* === All project showcases: scroll + pointer product motion === */
(() => {
  const showcases = [
    {root:'#finance-showcase', stage:'.finance-stage', device:'.finance-device', shift:'--finance-shift', x:'--finance-x', y:'--finance-y'},
    {root:'#store-showcase', stage:'.store-stage', device:'.store-browser', shift:'--store-shift', x:'--store-x', y:'--store-y'},
    {root:'#school-showcase', stage:'.school-stage', device:'.school-laptop', shift:'--school-shift', x:'--school-x', y:'--school-y'}
  ];
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  const active=new Set();
  let raf=0;

  showcases.forEach(cfg=>{
    const root=document.querySelector(cfg.root), stage=root?.querySelector(cfg.stage), device=root?.querySelector(cfg.device);
    if(!root||!stage||!device) return;
    const io=new IntersectionObserver(entries=>{
      entries.forEach(e=>{ if(e.isIntersecting) active.add(cfg.root); else active.delete(cfg.root); });
    },{threshold:.05});
    io.observe(root);

    if(window.matchMedia?.('(pointer:fine)').matches){
      stage.addEventListener('pointermove',e=>{
        const r=stage.getBoundingClientRect();
        const x=clamp((e.clientX-r.left)/r.width-.5,-.5,.5);
        const y=clamp((e.clientY-r.top)/r.height-.5,-.5,.5);
        device.style.setProperty(cfg.x, `${-y*6}deg`);
        device.style.setProperty(cfg.y, `${x*7}deg`);
      });
      stage.addEventListener('pointerleave',()=>{
        device.style.setProperty(cfg.x,'0deg'); device.style.setProperty(cfg.y,'0deg');
      });
    }
  });

  const update=()=>{
    raf=0;
    if(!active.size) return;
    const vh=window.innerHeight||800;
    showcases.forEach(cfg=>{
      if(!active.has(cfg.root)) return;
      const root=document.querySelector(cfg.root), stage=root?.querySelector(cfg.stage), device=root?.querySelector(cfg.device);
      if(!stage||!device) return;
      const r=stage.getBoundingClientRect();
      const delta=clamp((r.top+r.height*.5-vh*.5)/(vh*.8),-1,1);
      device.style.setProperty(cfg.shift, `${-delta*42}px`);
      const leftPhones=root.querySelector('.school-phone-left'), rightPhones=root.querySelector('.school-phone-right');
      if(leftPhones) leftPhones.style.setProperty('--phone-a', `${delta*24}px`);
      if(rightPhones) rightPhones.style.setProperty('--phone-b', `${-delta*24}px`);
    });
  };
  const onScroll=()=>{if(!raf)raf=requestAnimationFrame(update)};
  window.addEventListener('scroll',onScroll,{passive:true});
  window.addEventListener('resize',onScroll,{passive:true});
  update();

  const schoolCount=document.querySelector('.school-count');
  if(schoolCount){
    let done=false;
    const io=new IntersectionObserver(entries=>{
      if(done||!entries[0].isIntersecting)return;
      done=true;
      const target=Number(schoolCount.dataset.target)||0, start=performance.now(), duration=1100;
      const tick=now=>{
        const p=clamp((now-start)/duration,0,1), eased=1-Math.pow(1-p,3);
        schoolCount.textContent=Math.round(target*eased).toLocaleString('en-US');
        if(p<1)requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick); io.disconnect();
    },{threshold:.25});
    io.observe(document.querySelector('#school-showcase'));
  }
})();


/* === Full-page motion controller === */
(() => {
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const topbar = document.querySelector('.topbar');
  const heroCard = document.querySelector('.hero-card');
  const projectCards = document.querySelectorAll('.project-card');
  const cursor = document.querySelector('.cursor-glow');

  // Scroll-linked depth for the hero and project cards.
  if (!reduce) {
    let raf = 0;
    const updateScene = () => {
      raf = 0;
      const y = window.scrollY || 0;
      if (heroCard) {
        const r = heroCard.getBoundingClientRect();
        const amount = Math.max(-18, Math.min(18, (r.top - window.innerHeight * .25) * -0.018));
        heroCard.style.setProperty('--hero-scroll-y', `${amount}px`);
      }
      projectCards.forEach((card, i) => {
        const r = card.getBoundingClientRect();
        const center = r.top + r.height / 2;
        const delta = Math.max(-1, Math.min(1, (center - window.innerHeight / 2) / window.innerHeight));
        card.style.setProperty('--depth-y', `${delta * -10}px`);
        card.style.setProperty('--depth-r', `${delta * (i % 2 ? .35 : -.35)}deg`);
      });
      if (topbar) topbar.classList.toggle('scrolled', y > 24);
    };
    const request = () => {
      if (!raf) raf = requestAnimationFrame(updateScene);
    };
    window.addEventListener('scroll', request, {passive:true});
    window.addEventListener('resize', request, {passive:true});
    updateScene();
  } else if (topbar) {
    topbar.classList.remove('scrolled');
  }

  // Give cards a gentle magnetic tilt on fine pointers without changing mobile behavior.
  if (!reduce && window.matchMedia?.('(pointer:fine)').matches) {
    projectCards.forEach(card => {
      card.addEventListener('pointermove', e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - .5;
        const y = (e.clientY - r.top) / r.height - .5;
        card.style.transform =
          `perspective(1000px) translateY(var(--depth-y,0px)) rotateX(${(-y * 2.5).toFixed(2)}deg) rotateY(${(x * 3).toFixed(2)}deg)`;
      });
      card.addEventListener('pointerleave', () => {
        card.style.transform = '';
      });
    });

    // Hero terminal follows the cursor very slightly.
    const hero = document.querySelector('.hero');
    hero?.addEventListener('pointermove', e => {
      if (!heroCard) return;
      const r = hero.getBoundingClientRect();
      const x = Math.max(-.5, Math.min(.5, (e.clientX - r.left) / r.width - .5));
      const y = Math.max(-.5, Math.min(.5, (e.clientY - r.top) / r.height - .5));
      heroCard.style.setProperty('--mouse-x', `${x * 5}deg`);
      heroCard.style.setProperty('--mouse-y', `${-y * 4}deg`);
    });
    hero?.addEventListener('pointerleave', () => {
      heroCard?.style.setProperty('--mouse-x', '0deg');
      heroCard?.style.setProperty('--mouse-y', '0deg');
    });
  }

  // Make the cursor glow feel alive rather than fixed.
  if (cursor && !reduce && window.matchMedia?.('(pointer:fine)').matches) {
    let glowRaf = 0, gx = 0, gy = 0, tx = 0, ty = 0;
    window.addEventListener('pointermove', e => { tx = e.clientX; ty = e.clientY; });
    const glowTick = () => {
      gx += (tx - gx) * .14;
      gy += (ty - gy) * .14;
      cursor.style.left = `${gx}px`;
      cursor.style.top = `${gy}px`;
      glowRaf = requestAnimationFrame(glowTick);
    };
    glowRaf = requestAnimationFrame(glowTick);
  }
})();
