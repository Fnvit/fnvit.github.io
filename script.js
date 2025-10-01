// 년도 자동 표기
document.getElementById('year').textContent = new Date().getFullYear().toString();

// 모바일 네비 토글
const navToggle = document.querySelector('.nav-toggle');
const siteNav = document.getElementById('site-nav');
if (navToggle && siteNav) {
    navToggle.addEventListener('click', () => {
        const opened = siteNav.classList.toggle('open');
        navToggle.setAttribute('aria-expanded', String(opened));
    });

    siteNav.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => {
            siteNav.classList.remove('open');
            navToggle.setAttribute('aria-expanded', 'false');
        });
    });
}

// 부드러운 스크롤
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
        const id = anchor.getAttribute('href');
        if (!id || id === '#') return;
        const el = document.querySelector(id);
        if (!el) return;
        e.preventDefault();
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        history.pushState(null, '', id);
    });
});

// 스크롤 큐 클릭 시 다음 섹션으로
const scrollCue = document.querySelector('.scroll-cue');
if (scrollCue) {
    scrollCue.addEventListener('click', () => {
        const next = document.querySelector('#about');
        if (next) next.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
}

/* ===========================
   히어로 캔버스 인터랙티브 배경
   - 파티클 + 연결 라인 + 마우스 패럴럭스
   =========================== */
(() => {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    let w, h, dpr, particles = [], mouse = { x: 0, y: 0 }, rafId;

    function resize() {
        w = canvas.clientWidth;
        h = canvas.clientHeight;
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        initParticles();
    }

    function initParticles() {
        const count = Math.floor((w * h) / 24000); // 밀도 기반
        particles = Array.from({ length: count }, () => ({
            x: Math.random() * w,
            y: Math.random() * h,
            vx: (Math.random() - 0.5) * 0.4,
            vy: (Math.random() - 0.5) * 0.4,
            r: Math.random() * 1.6 + 0.6,
            hue: 210 + Math.random() * 90
        }));
    }

    function step() {
        ctx.clearRect(0, 0, w, h);

        // 배경 가벼운 그라데이션 오버페인트
        const grad = ctx.createLinearGradient(0, 0, w, h);
        grad.addColorStop(0, 'rgba(108,140,255,0.10)');
        grad.addColorStop(1, 'rgba(86,226,215,0.06)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // 파티클 업데이트/렌더
        for (const p of particles) {
            // 살짝 마우스 어트랙션
            const dx = (mouse.x || w * 0.6) - p.x;
            const dy = (mouse.y || h * 0.3) - p.y;
            const dist2 = dx*dx + dy*dy;
            const force = Math.min(80_000 / (dist2 + 80_000), 0.05);
            p.vx += dx * force * 0.0005;
            p.vy += dy * force * 0.0005;

            p.x += p.vx; p.y += p.vy;
            p.vx *= 0.995; p.vy *= 0.995;

            if (p.x < -10) p.x = w + 10; else if (p.x > w + 10) p.x = -10;
            if (p.y < -10) p.y = h + 10; else if (p.y > h + 10) p.y = -10;

            ctx.beginPath();
            ctx.fillStyle = `hsla(${p.hue}, 80%, 70%, .8)`;
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fill();
        }

        // 연결 라인
        ctx.lineWidth = 1;
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const a = particles[i], b = particles[j];
                const dx = a.x - b.x, dy = a.y - b.y;
                const d2 = dx*dx + dy*dy;
                if (d2 < 140 * 140) {
                    const alpha = 1 - Math.sqrt(d2) / 140;
                    ctx.strokeStyle = `rgba(180, 200, 255, ${alpha * 0.18})`;
                    ctx.beginPath();
                    ctx.moveTo(a.x, a.y);
                    ctx.lineTo(b.x, b.y);
                    ctx.stroke();
                }
            }
        }

        rafId = requestAnimationFrame(step);
    }

    function onMove(e) {
        const rect = canvas.getBoundingClientRect();
        mouse.x = (e.touches?.[0]?.clientX ?? e.clientX) - rect.left;
        mouse.y = (e.touches?.[0]?.clientY ?? e.clientY) - rect.top;
    }

    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('visibilitychange', () => {
        if (document.hidden) cancelAnimationFrame(rafId);
        else rafId = requestAnimationFrame(step);
    });
    canvas.addEventListener('mousemove', onMove, { passive: true });
    canvas.addEventListener('touchmove', onMove, { passive: true });

    resize();
    rafId = requestAnimationFrame(step);
})();

/* ===========================
   히어로 단어 티커
   =========================== */
(() => {
    const words = Array.from(document.querySelectorAll('.ticker-word'));
    const line = document.getElementById('ticker-line');
    const aria = document.getElementById('ticker-aria');
    if (!words.length || !line) return;

    let index = 0;
    function updateTicker() {
        index = (index + 1) % words.length;
        const offset = -index * words[0].offsetHeight;
        line.style.transform = `translateY(${offset}px)`;
        if (aria) aria.textContent = words[index].textContent || '';
    }
    // 초기 위치 보정
    line.style.transform = 'translateY(0)';
    setInterval(updateTicker, 2200);
})();

/* ===========================
   스킬 클라우드 무작위 배치
   - 각 배지를 컨테이너 내 임의 좌표/회전/오프셋으로 배치
   - 리사이즈 시 재배치
   =========================== */
(() => {
    const cloud = document.getElementById('skill-cloud');
    if (!cloud) return;

    function randomize() {
        const rect = cloud.getBoundingClientRect();
        const pads = 12; // 가장자리 패딩
        const badges = Array.from(cloud.querySelectorAll('.skill-badge'));
        badges.forEach((b, i) => {
            // 3열 밴드처럼 분포를 주어 겹침을 감소
            const band = i % 3; // 0,1,2
            const yPct = band === 0 ? Math.random() * 25 + 10 : band === 1 ? Math.random() * 25 + 37 : Math.random() * 25 + 64;
            const xPct = Math.random() * 84 + 8;
            const dx = (Math.random() - 0.5) * 10 + 'px';
            const dy = (Math.random() - 0.5) * 10 + 'px';
            const rot = (Math.random() - 0.5) * 6 + 'deg';

            b.style.left = `calc(${xPct}% - ${pads}px)`;
            b.style.top = `calc(${yPct}% - ${pads}px)`;
            b.style.setProperty('--dx', dx);
            b.style.setProperty('--dy', dy);
            b.style.setProperty('--rot', rot);
        });
    }

    const ro = new ResizeObserver(randomize);
    ro.observe(cloud);
    randomize();

    // 키보드 포커스 가능하게
    cloud.querySelectorAll('.skill-badge').forEach(btn => {
        btn.setAttribute('tabindex', '0');
        btn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                btn.blur();
            }
        });
    });
})();

/* ===========================
   Carousel: 각 카드 슬라이더
   - Prev/Next, 점 네비, 드래그 스와이프
   =========================== */
(() => {
    const carousels = document.querySelectorAll('.carousel');
    carousels.forEach(initCarousel);

    function initCarousel(root) {
        const slides = root.querySelector('.slides');
        const imgs = Array.from(slides.querySelectorAll('img'));
        const prev = root.querySelector('.prev');
        const next = root.querySelector('.next');
        const dotsWrap = root.querySelector('.dots');
        let index = 0, startX = 0, deltaX = 0, isDown = false;

        function renderDots() {
            dotsWrap.innerHTML = '';
            imgs.forEach((_, i) => {
                const d = document.createElement('button');
                d.type = 'button';
                d.setAttribute('aria-current', i === index ? 'true' : 'false');
                d.addEventListener('click', () => go(i));
                dotsWrap.appendChild(d);
            });
        }

        function go(i) {
            index = (i + imgs.length) % imgs.length;
            slides.style.transform = `translateX(${-index * 100}%)`;
            Array.from(dotsWrap.children).forEach((el, idx) => {
                el.setAttribute('aria-current', idx === index ? 'true' : 'false');
            });
        }

        prev.addEventListener('click', () => go(index - 1));
        next.addEventListener('click', () => go(index + 1));
        renderDots();
        go(0);

        // 스와이프
        const onDown = (e) => {
            isDown = true;
            startX = (e.touches?.[0]?.clientX ?? e.clientX);
            deltaX = 0;
            slides.style.transition = 'none';
        };
        const onMove = (e) => {
            if (!isDown) return;
            const x = (e.touches?.[0]?.clientX ?? e.clientX);
            deltaX = x - startX;
            const pct = (deltaX / root.clientWidth) * 100;
            slides.style.transform = `translateX(${(-index * 100) + pct}%)`;
        };
        const onUp = () => {
            if (!isDown) return;
            slides.style.transition = '';
            if (Math.abs(deltaX) > root.clientWidth * 0.2) {
                go(index + (deltaX < 0 ? 1 : -1));
            } else {
                go(index);
            }
            isDown = false;
            deltaX = 0;
        };

        slides.addEventListener('mousedown', onDown);
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
        slides.addEventListener('touchstart', onDown, { passive: true });
        slides.addEventListener('touchmove', onMove, { passive: true });
        slides.addEventListener('touchend', onUp);
    }
})();

/* ===========================
   스크롤 리빌 애니메이션 (간단)
   =========================== */
const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
        if (entry.isIntersecting) {
            entry.target.classList.add('reveal');
            observer.unobserve(entry.target);
        }
    }
}, { threshold: 0.08 });

document.querySelectorAll('.section, .card').forEach(el => {
    if (el.id === 'hero') return; // 히어로 제외
    el.style.opacity = '0';
    el.style.transform = 'translateY(16px)';
    el.style.transition = 'opacity .6s ease, transform .6s ease';
    observer.observe(el);
});

const style = document.createElement('style');
style.textContent = `.reveal { opacity: 1 !important; transform: translateY(0) !important; }`;
document.head.appendChild(style);