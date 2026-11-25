/* Motor común de las animaciones.
   Cada video llama a Motor.iniciar({ duracion, escenas, subtitulos, construir }).
   - construir(tl): arma la línea de tiempo de GSAP (tiempos absolutos, en segundos).
   - escenas: [{ t, nombre }] para los capítulos del reproductor y el storyboard.
   - subtitulos: [{ a, b, quien, texto }].
   - audios (opcional): [{ t, dur, src }] pistas de voz que suenan a partir del segundo t.
   Parámetros de la URL: ?t=12.5 (abre en ese segundo, en pausa) · ?captura=1 (oculta el reproductor) · ?subs=0. */
window.Motor = (function () {
  const $ = (s) => document.querySelector(s);
  const fmt = (s) => Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');

  function iniciar(cfg) {
    const q = new URLSearchParams(location.search);
    const escenario = $('#escenario'), marco = $('#marco');
    if (q.get('captura')) document.body.classList.add('captura');
    if (q.get('subs') === '0') document.body.classList.add('sin-subs');

    const ajustar = () => {
      const k = Math.min(marco.clientWidth / 1920, marco.clientHeight / 1080);
      escenario.style.transform = 'scale(' + k + ')';
    };
    addEventListener('resize', ajustar); ajustar();

    const subs = document.createElement('p'); subs.id = 'subs'; subs.setAttribute('aria-live', 'off');
    subs.innerHTML = '<b></b><span></span>'; escenario.appendChild(subs);

    const tl = gsap.timeline({ paused: true, defaults: { ease: 'power2.out' } });
    cfg.construir(tl);
    tl.set({}, {}, cfg.duracion);            // fija la duración total

    const play = $('#btn-play'), barra = $('#barra'), tiempo = $('#tiempo'), caps = $('#capitulos');
    barra.max = cfg.duracion; barra.step = 0.05;
    cfg.escenas.forEach((e, i) => {
      const b = document.createElement('button');
      b.textContent = (i + 1) + '. ' + e.nombre; b.title = fmt(e.t) + ' · ' + e.nombre;
      b.addEventListener('click', () => { tl.pause(e.t + 0.01); pintar(); });
      caps.appendChild(b);
    });

    // Pistas de voz: cada una suena mientras el tiempo esté dentro de su tramo; al pausar o saltar se reajustan.
    const pistas = (cfg.audios || []).map((a) => { const el = new Audio(a.src); el.preload = 'auto'; return Object.assign({ el }, a); });
    function sonar() {
      const t = tl.time(), anda = !tl.paused() && t < cfg.duracion;
      pistas.forEach((p) => {
        const dentro = t >= p.t && t < p.t + p.dur;
        if (anda && dentro) { if (Math.abs(p.el.currentTime - (t - p.t)) > 0.3) p.el.currentTime = t - p.t; if (p.el.paused) p.el.play().catch(() => {}); }
        else if (!p.el.paused) p.el.pause();
      });
    }
    let ultimo = null;
    function pintar() {
      const t = tl.time();
      sonar(); barra.value = t; tiempo.textContent = fmt(t) + ' / ' + fmt(cfg.duracion);
      play.textContent = tl.paused() || t >= cfg.duracion ? '▶ Reproducir' : '⏸ Pausa';
      let act = 0; cfg.escenas.forEach((e, i) => { if (t >= e.t) act = i; });
      [...caps.children].forEach((b, i) => b.classList.toggle('activo', i === act));
      const s = cfg.subtitulos.find((x) => t >= x.a && t < x.b) || null;
      if (s !== ultimo) {
        ultimo = s;
        subs.classList.toggle('ver', !!s);
        if (s) { subs.classList.toggle('sin', !s.quien); subs.firstChild.textContent = s.quien || ''; subs.lastChild.textContent = s.texto; }
      }
    }
    tl.eventCallback('onUpdate', pintar);
    tl.eventCallback('onComplete', pintar);

    const alternar = () => { if (tl.time() >= cfg.duracion) tl.restart(); else tl.paused(!tl.paused()); pintar(); };
    play.addEventListener('click', alternar);
    barra.addEventListener('input', () => { tl.pause(+barra.value); pintar(); });
    $('#btn-subs').addEventListener('click', () => document.body.classList.toggle('sin-subs'));
    $('#btn-pantalla').addEventListener('click', () => {
      if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen();
    });
    addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' && e.key !== ' ') return;
      if (e.key === ' ') { e.preventDefault(); alternar(); }
      if (e.key === 'ArrowRight') { tl.pause(Math.min(cfg.duracion, tl.time() + 1)); pintar(); }
      if (e.key === 'ArrowLeft') { tl.pause(Math.max(0, tl.time() - 1)); pintar(); }
    });

    const t0 = parseFloat(q.get('t'));
    tl.pause(isNaN(t0) ? 0 : t0); pintar();
    window.__tl = tl; window.__pintar = pintar;                        // para capturas automáticas
    document.fonts.ready.then(() => document.body.classList.add('listo'));
    return tl;
  }
  return { iniciar };
})();
