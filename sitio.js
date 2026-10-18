// Clerk Digital · sitio web: tema claro/oscuro, menú del celular, animaciones al bajar, pantalla 3D, avisos,
// carruseles, contador de números, precios mensual/anual, videos y formulario de contacto (abre WhatsApp).
(() => {
  const raiz = document.documentElement;
  const sinMovimiento = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* tema */
  const guardado = (() => { try { return localStorage.getItem('tema'); } catch { return null; } })();
  if (guardado) raiz.dataset.tema = guardado;
  document.querySelectorAll('[data-cambiar-tema]').forEach(b => b.addEventListener('click', () => {
    const oscuro = raiz.dataset.tema ? raiz.dataset.tema === 'oscuro' : matchMedia('(prefers-color-scheme: dark)').matches;
    raiz.dataset.tema = oscuro ? 'claro' : 'oscuro';
    try { localStorage.setItem('tema', raiz.dataset.tema); } catch {}
  }));

  /* menú del celular */
  const mc = document.querySelector('.menu-celular');
  document.querySelector('[data-menu]')?.addEventListener('click', e => { const ab = mc.classList.toggle('abierto'); e.currentTarget.setAttribute('aria-expanded', ab); });

  /* barra y progreso al bajar */
  const barra = document.querySelector('.barra'), prog = document.querySelector('.progreso'), dudas = document.querySelector('.dudas');
  const p3d = document.querySelector('.pantalla-3d');
  const alBajar = () => {
    const y = scrollY, alto = document.documentElement.scrollHeight - innerHeight;
    barra?.classList.toggle('con-sombra', y > 8);
    if (prog) prog.style.transform = `scaleX(${alto > 0 ? y / alto : 0})`;
    dudas?.classList.toggle('visible', y > 300);
    if (p3d && !sinMovimiento) { const k = Math.min(1, y / 500); p3d.style.transform = `rotateX(${14 * (1 - k)}deg) scale(${0.96 + 0.04 * k})`; }
  };
  addEventListener('scroll', alBajar, { passive: true }); alBajar();

  /* aparecer al bajar */
  const obs = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } }), { threshold: .14, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.aparece').forEach(el => obs.observe(el));
  // las tarjetas de una misma fila aparecen una tras otra
  document.querySelectorAll('[data-escalonar]').forEach(g => [...g.children].forEach((c, i) => { c.classList.add('aparece'); c.style.setProperty('--retraso', i * 0.08 + 's'); obs.observe(c); }));

  /* título letra por letra (por palabras, para que no se corte) */
  document.querySelectorAll('[data-letras]').forEach(h => {
    let i = 0;
    const partir = n => { if (n.nodeType === 3) { const f = document.createDocumentFragment(); n.textContent.split(/(\s+)/).forEach(p => { if (!p.trim()) { f.append(p); return; } const s = document.createElement('span'); s.textContent = p; s.style.animationDelay = (i++ * 0.07) + 's'; f.append(s); }); n.replaceWith(f); } else [...n.childNodes].forEach(partir); };
    h.classList.add('letras'); [...h.childNodes].forEach(partir);
  });

  /* avisos flotantes sobre la pantalla del programa */
  const avisos = [...document.querySelectorAll('.aviso')];
  if (avisos.length) {
    const mostrar = (k = 0) => { avisos.forEach((a, i) => a.classList.toggle('visible', i === k % avisos.length || i === (k + 1) % avisos.length)); setTimeout(() => mostrar(k + 1), 3200); };
    setTimeout(() => mostrar(0), 1200);
  }

  /* carruseles de imágenes */
  document.querySelectorAll('.carrusel').forEach(c => {
    const imgs = [...c.querySelectorAll('img')], dots = c.parentElement.querySelector('.puntitos');
    if (imgs.length < 2) { imgs[0]?.classList.add('activa'); return; }
    let k = 0, t;
    const ir = n => { k = (n + imgs.length) % imgs.length; imgs.forEach((im, i) => im.classList.toggle('activa', i === k)); dots && [...dots.children].forEach((d, i) => d.setAttribute('aria-current', i === k)); clearTimeout(t); t = setTimeout(() => ir(k + 1), 3800); };
    if (dots) imgs.forEach((im, i) => { const b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-label', 'Imagen ' + (i + 1)); b.onclick = () => ir(i); dots.append(b); });
    ir(0);
  });

  /* números que suben */
  const contar = el => { const fin = +el.dataset.contar, pre = el.dataset.pre || '', suf = el.dataset.suf || ''; if (sinMovimiento) { el.textContent = pre + fin.toLocaleString('es-NI') + suf; return; } const t0 = performance.now(); const paso = t => { const k = Math.min(1, (t - t0) / 1400), v = Math.round(fin * (1 - Math.pow(1 - k, 3))); el.textContent = pre + v.toLocaleString('es-NI') + suf; if (k < 1) requestAnimationFrame(paso); }; requestAnimationFrame(paso); };
  const obsN = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { contar(e.target); obsN.unobserve(e.target); } }), { threshold: .6 });
  document.querySelectorAll('[data-contar]').forEach(el => obsN.observe(el));

  /* precios: mensual o anual */
  document.querySelectorAll('[data-periodo]').forEach(b => b.addEventListener('click', () => {
    const p = b.dataset.periodo;
    document.querySelectorAll('[data-periodo]').forEach(x => x.setAttribute('aria-pressed', x === b));
    document.querySelectorAll('[data-precio-' + p + ']').forEach(el => { el.style.opacity = 0; setTimeout(() => { el.textContent = el.getAttribute('data-precio-' + p); const s = el.nextElementSibling; if (s && s.dataset['unidad' + (p === 'mes' ? 'Mes' : 'Anio')]) s.textContent = s.dataset['unidad' + (p === 'mes' ? 'Mes' : 'Anio')]; el.style.opacity = 1; }, 200); });
  }));

  /* preguntas que se abren con suavidad */
  document.querySelectorAll('.pregunta').forEach(d => {
    const r = d.querySelector('.respuesta');
    d.querySelector('summary').addEventListener('click', e => {
      if (sinMovimiento || !r.animate) return;
      e.preventDefault();
      if (d.open) { r.animate([{ height: r.scrollHeight + 'px', opacity: 1 }, { height: 0, opacity: 0 }], { duration: 260, easing: 'ease' }).onfinish = () => { d.open = false; }; }
      else { d.open = true; r.animate([{ height: 0, opacity: 0 }, { height: r.scrollHeight + 'px', opacity: 1 }], { duration: 320, easing: 'ease' }); }
    });
  });

  /* videos: se cargan solo al tocar «play» */
  document.querySelectorAll('[data-video]').forEach(c => c.addEventListener('click', () => {
    if (c.querySelector('video')) return;
    const v = document.createElement('video'); v.src = c.dataset.video; v.controls = true; v.autoplay = true; v.playsInline = true; v.preload = 'auto';
    c.innerHTML = ''; c.append(v); v.play().catch(() => {});
  }));
  // el video de la portada se reproduce solo, sin sonido, cuando está a la vista
  const vp = document.querySelector('.pantalla-3d video');
  if (vp) { if (sinMovimiento) vp.removeAttribute('autoplay'); new IntersectionObserver(es => es.forEach(e => e.isIntersecting && !sinMovimiento ? vp.play().catch(() => {}) : vp.pause())).observe(vp); }

  /* video en ventana (botón «Ver el video») */
  const base = new URL('.', document.querySelector('script[src$="sitio.js"]').src).href;
  const dlg = document.querySelector('.ventana-video');
  document.querySelectorAll('[data-video-abrir]').forEach(b => b.addEventListener('click', () => {
    const v = dlg.querySelector('video'); v.src = base + 'videos/' + b.dataset.videoAbrir + '.webm'; dlg.showModal(); v.play().catch(() => {});
  }));
  dlg?.addEventListener('close', () => { const v = dlg.querySelector('video'); v.pause(); v.removeAttribute('src'); v.load(); });
  dlg?.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });

  /* descargas: el enlace directo a la última versión publicada en GitHub */
  const des = document.querySelectorAll('[data-descarga]');
  if (des.length) fetch('https://api.github.com/repos/hanzelcruz70-cyber/vuelto-releases/releases/latest').then(r => r.ok ? r.json() : null).then(r => {
    const a = r && (r.assets || []).find(x => /\.exe$/.test(x.name));
    if (!a) return;
    des.forEach(d => { d.href = a.browser_download_url; });
    const info = document.querySelector('[data-descarga-info]');
    if (info) info.textContent = 'Windows 10 u 11 · versión ' + r.tag_name.replace(/^v/, '') + ' · ' + Math.round(a.size / 1048576) + ' MB';
  }).catch(() => {});

  /* formulario de contacto: arma el mensaje y abre WhatsApp (el sitio no guarda nada) */
  const f = document.querySelector('[data-contacto]');
  f?.addEventListener('submit', e => {
    e.preventDefault();
    const d = new FormData(f), v = k => String(d.get(k) || '').trim();
    const texto = `Hola, soy ${v('nombre')}${v('tienda') ? ' de ' + v('tienda') : ''}${v('ciudad') ? ' (' + v('ciudad') + ')' : ''}.\nTipo de negocio: ${v('negocio')}.\nMe interesa: ${v('interes')}.\n${v('mensaje')}`;
    open('https://wa.me/50589188813?text=' + encodeURIComponent(texto), '_blank', 'noopener');
  });
})();
