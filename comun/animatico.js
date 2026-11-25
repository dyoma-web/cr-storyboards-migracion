/* Animático genérico: arma las escenas a partir de window.VIDEO (lo escribe generar.mjs) y llama al Motor.

   window.VIDEO = { escenas: [{ nombre, html, cam, cola, lineas: [{ id, quien, texto, pausa }] }] }
   window.AUDIO = { id: segundos }   (opcional; si falta una pista, su duración se estima y el video queda sin voz)

   Tiempos: cada escena dura lo que tardan sus líneas, una tras otra, más una entrada y una salida cortas.
   Capas: dentro de una escena, los elementos con class="entra" aparecen solos:
     data-en="g2"      cuando empieza la línea g2          data-en="g2+1.5"  1,5 s después
     data-en="+2"      2 s después de empezar la escena    (sin data-en: a los 0,7 s)
   Un elemento .c-raya (tachado) se dibuja de izquierda a derecha en vez de aparecer. */
(function () {
  const V = window.VIDEO, D = window.AUDIO || {};
  const ENTRADA = 0.9, SALIDA = 0.7, PAUSA = 0.45, FUNDIDO = 0.7;
  const estimar = (t) => Math.max(1.6, t.length / 15.5);

  // --- Tiempos
  const VOZ = {}, DUR = {}, INI = [];
  let t = 0;
  V.escenas.forEach((e) => {
    INI.push(t);
    let c = t + ENTRADA;
    (e.lineas || []).forEach((l) => { VOZ[l.id] = c; DUR[l.id] = D[l.id] || estimar(l.texto); c += DUR[l.id] + (l.pausa == null ? PAUSA : l.pausa); });
    t = Math.max(c + SALIDA + (e.cola || 0), t + 3.5);
  });
  const FIN = Math.ceil(t + 0.5);

  // --- Escenas en el escenario
  const escenario = document.querySelector('#escenario');
  V.escenas.forEach((e, i) => {
    const d = document.createElement('div');
    d.className = 'escena'; d.id = 'e' + (i + 1); d.innerHTML = e.html;
    escenario.appendChild(d);
  });

  // --- Subtítulos: las líneas largas se reparten en tramos según su longitud
  function tramos(texto) {
    if (texto.length <= 92) return [texto];
    const partes = texto.match(/[^.;:?!,]+[.;:?!,]*\s*/g) || [texto];
    const sal = []; let act = '';
    partes.forEach((p) => { if (act && (act + p).length > 88) { sal.push(act.trim()); act = p; } else act += p; });
    if (act.trim()) sal.push(act.trim());
    return sal;
  }
  const subtitulos = [], audios = [];
  V.escenas.forEach((e) => (e.lineas || []).forEach((l) => {
    const ps = tramos(l.texto), total = ps.reduce((n, p) => n + p.length, 0);
    let a = VOZ[l.id];
    ps.forEach((p, k) => { const b = k === ps.length - 1 ? VOZ[l.id] + DUR[l.id] + 0.25 : a + DUR[l.id] * p.length / total; subtitulos.push({ a, b, quien: l.quien, texto: p }); a = b; });
    if (D[l.id]) audios.push({ t: VOZ[l.id], dur: D[l.id], src: 'audio/' + l.id + '.mp3' });
  }));

  function cuando(el, i) {
    const s = el.dataset.en || '+0.7';
    const m = s.match(/^([a-z]+\d*)?([+-][\d.]+)?$/i) || [];
    const base = m[1] && VOZ[m[1]] != null ? VOZ[m[1]] : INI[i];
    return base + (parseFloat(m[2]) || 0);
  }

  function construir(tl) {
    V.escenas.forEach((e, i) => {
      const id = '#e' + (i + 1), fin = (INI[i + 1] == null ? FIN : INI[i + 1]);
      if (i > 0) {
        gsap.set(id, { autoAlpha: 0 });
        tl.to(id, { autoAlpha: 1, duration: FUNDIDO, ease: 'power1.inOut' }, INI[i]);
        tl.set('#e' + i, { autoAlpha: 0 }, INI[i] + FUNDIDO);
      }
      // Cámara: acercamiento o paneo lento sobre la ilustración
      const plano = document.querySelector(id + ' .plano');
      if (plano) {
        const c = e.cam || {}, de = c.de || [1.03, 0, 0], a = c.a || [1.1, 0, 0];
        tl.fromTo(plano, { scale: de[0], xPercent: de[1], yPercent: de[2] }, { scale: a[0], xPercent: a[1], yPercent: a[2], duration: fin - INI[i] + FUNDIDO, ease: 'sine.inOut' }, INI[i]);
      }
      document.querySelectorAll(id + ' .entra').forEach((el) => {
        const en = cuando(el, i);
        if (el.classList.contains('c-raya')) tl.fromTo(el, { scaleX: 0 }, { scaleX: 1, duration: 0.45, ease: 'power2.inOut' }, en);
        else tl.fromTo(el, { autoAlpha: 0, scale: 0.72 }, { autoAlpha: 1, scale: 1, duration: 0.55, ease: 'back.out(1.6)' }, en);
        if (el.dataset.sale) tl.to(el, { autoAlpha: 0, duration: 0.4 }, en + parseFloat(el.dataset.sale));
      });
    });
  }

  const escenas = V.escenas.map((e, i) => ({ t: INI[i], nombre: e.nombre }));
  window.__tiempos = { INI, VOZ, DUR, FIN, conVoz: audios.length };
  Motor.iniciar({ duracion: FIN, escenas, subtitulos, audios, planos: INI.slice(1), construir });
})();
