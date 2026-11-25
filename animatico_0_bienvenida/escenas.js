/* Animático del video de bienvenida: las viñetas del storyboard con cámara suave, entradas sencillas y voces.
   Textos del Guion_Video_0_Bienvenida_v3. Los tiempos siguen a la locución real (sin los silencios largos del guion),
   así que el video dura cerca de 1:12 en lugar de 1:30. */
(function () {
  /* Inicio de cada escena y de cada pista de voz, en segundos. */
  const E = { e1: 0, e2: 8.2, e3: 15.8, e4: 26.6, e5: 45.2, e6: 62.2, e7: 67.6 }, FIN = 72;
  const VOZ = { g1: 1.0, g2: 3.4, m1: 10.8, g3: 16.8, g4: 20.3, g5: 27.8, g6: 38.6, g7: 46.2, g8: 54.1, g9: 63.2 };
  const D = window.AUDIO || {};
  const audios = Object.keys(VOZ).filter((id) => D[id]).map((id) => ({ t: VOZ[id], dur: D[id], src: 'audio/' + id + '.mp3' }));
  const fin = (id) => VOZ[id] + (D[id] || 4) + 0.25;
  const parte = (id, fr) => VOZ[id] + (D[id] || 4) * fr;            // reparte una pista larga entre varios subtítulos

  const escenas = [
    { t: E.e1, nombre: 'Lunes de febrero' }, { t: E.e2, nombre: 'La pregunta' }, { t: E.e3, nombre: 'Quien está al otro lado' },
    { t: E.e4, nombre: 'Tres instituciones' }, { t: E.e5, nombre: 'Quiénes acompañan' }, { t: E.e6, nombre: 'La respuesta empieza' }, { t: E.e7, nombre: 'Cierre' },
  ];
  const subtitulos = [
    { a: VOZ.g1, b: fin('g1'), quien: 'Gaby', texto: 'Es un lunes de febrero.' },
    { a: VOZ.g2, b: fin('g2'), quien: 'Gaby', texto: 'Una madre espera su turno en la ventanilla de la escuela.' },
    { a: VOZ.m1, b: fin('m1') + 0.5, quien: 'Madre', texto: '«¿Qué tengo que hacer para que mi hijo tenga documentos?»' },
    { a: VOZ.g3, b: fin('g3'), quien: 'Gaby', texto: 'Quien está al otro lado puede ser usted.' },
    { a: VOZ.g4, b: fin('g4'), quien: 'Gaby', texto: 'Queremos que, ese lunes, la respuesta sea clara, correcta y amable.' },
    { a: VOZ.g5, b: parte('g5', 0.52), quien: 'Gaby', texto: 'Lo que va a recorrer son las pautas que el MEP, la DGME y el PANI acordaron' },
    { a: parte('g5', 0.52), b: fin('g5'), quien: 'Gaby', texto: 'para promover la regularización migratoria de las personas estudiantes.' },
    { a: VOZ.g6, b: fin('g6'), quien: 'Gaby', texto: 'El MEP promueve, la DGME ejecuta y el PANI protege.' },
    { a: VOZ.g7, b: parte('g7', 0.4), quien: 'Gaby', texto: 'Andrés hace las preguntas que usted se haría;' },
    { a: parte('g7', 0.4), b: parte('g7', 0.79), quien: 'Gaby', texto: 'Charly explica los trámites y los documentos;' },
    { a: parte('g7', 0.79), b: fin('g7'), quien: 'Gaby', texto: 'yo reflexiono con usted.' },
    { a: VOZ.g8, b: fin('g8'), quien: 'Gaby', texto: 'Son cuatro bloques de una hora: por qué importa, la identificación, la información y el trámite, y el seguimiento.' },
    { a: VOZ.g9, b: fin('g9'), quien: 'Gaby', texto: 'Al terminar, usted sabrá qué decirle a esa madre.' },
  ];

  function construir(tl) {
    gsap.set(['#e2', '#e4', '#e5', '#e6', '#e7'], { autoAlpha: 0 });
    gsap.set(['#velo', '#pausa', '.fila-siluetas', '#txt-personal'], { autoAlpha: 0 });
    gsap.set(['#globo-madre', '#globo-func'], { autoAlpha: 0, scale: 0.7 });
    const pasa = (de, a, t, dur = 0.8) => { tl.to(a, { autoAlpha: 1, duration: dur, ease: 'power1.inOut' }, t); tl.set(de, { autoAlpha: 0 }, t + dur); };

    /* 1 · Lunes de febrero: la cámara se acerca despacio hacia la madre que espera */
    tl.fromTo('#e1 .plano', { scale: 1.02, xPercent: 1 }, { scale: 1.14, xPercent: 5, yPercent: -2, duration: E.e2 + 1, ease: 'sine.inOut' }, 0);

    /* 2 · La pregunta */
    pasa('#e1', '#e2', E.e2);
    tl.fromTo('#e2 .plano', { scale: 1.12, xPercent: -3 }, { scale: 1.03, xPercent: 0, duration: E.e3 - E.e2 + 1, ease: 'sine.out' }, E.e2);
    tl.to('#globo-madre', { autoAlpha: 1, scale: 1, duration: 0.6, ease: 'back.out(1.6)' }, VOZ.m1 - 0.1);
    tl.to('#globo-madre', { autoAlpha: 0, scale: 0.92, duration: 0.35 }, E.e3 - 0.5);

    /* 3 · Se congela la imagen y aparecen las siluetas */
    tl.to('#e2 .plano', { filter: 'grayscale(1) brightness(0.9)', duration: 0.3 }, E.e3);
    tl.to('#velo', { autoAlpha: 0.84, duration: 0.7 }, E.e3 + 0.1);
    tl.set('#pausa', { autoAlpha: 1 }, E.e3 + 0.1).from('#pausa', { scale: 0, duration: 0.4, ease: 'back.out(2)' }, E.e3 + 0.1).to('#pausa', { autoAlpha: 0, scale: 1.4, duration: 0.4 }, E.e3 + 1);
    tl.set('.fila-siluetas', { autoAlpha: 1 }, VOZ.g3 - 0.3);
    tl.from('.sil', { y: 120, autoAlpha: 0, duration: 0.7, stagger: 0.28, ease: 'back.out(1.3)' }, VOZ.g3 - 0.3);
    tl.to('.sil', { y: -30, duration: 0.28, stagger: 0.3, repeat: 1, yoyo: true }, VOZ.g3 + 1.6);
    tl.fromTo('#txt-personal', { y: 60, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.7, ease: 'back.out(1.5)' }, VOZ.g4 + 0.4);

    /* 4 · Tres instituciones: cada una entra cuando Gaby la nombra, y cada verbo cuando lo dice */
    pasa('#e2', '#e4', E.e4, 0.7);
    tl.from('#linea', { scaleX: 0, duration: 1.4, ease: 'power2.inOut' }, E.e4 + 0.9);
    tl.set('.verbo', { autoAlpha: 0, y: 50 }, E.e4);
    [['#i-mep', 2.6, 0.3], ['#i-dgme', 3.5, 2.0], ['#i-pani', 4.4, 3.7]].forEach(([s, entra, verbo]) => {
      tl.from(s + ' .ficha-i', { scale: 0, rotation: -30, duration: 0.8, ease: 'back.out(1.8)' }, VOZ.g5 + entra);
      tl.from(s + ' strong', { y: 30, autoAlpha: 0, duration: 0.5 }, VOZ.g5 + entra + 0.35);
      tl.to(s + ' .verbo', { autoAlpha: 1, y: 0, duration: 0.6, ease: 'back.out(1.7)' }, VOZ.g6 + verbo);
      tl.to(s + ' .ficha-i', { scale: 1.12, duration: 0.25, repeat: 1, yoyo: true }, VOZ.g6 + verbo);
    });

    /* 5 · Quiénes acompañan y los cuatro bloques */
    pasa('#e4', '#e5', E.e5, 0.7);
    const cinta = document.querySelector('#cinta-path'), largo = cinta.getTotalLength();
    gsap.set(cinta, { strokeDasharray: largo, strokeDashoffset: largo });
    tl.to(cinta, { strokeDashoffset: 0, duration: 2.4, ease: 'power1.inOut' }, E.e5 + 0.3);
    tl.from('#g-gaby', { y: 80, autoAlpha: 0, duration: 0.7, ease: 'back.out(1.4)' }, E.e5 + 0.3);
    tl.from('#g-andres', { x: -800, duration: 1.1, ease: 'back.out(1.1)' }, VOZ.g7 - 0.5);
    tl.from('#g-charly', { x: 800, duration: 1.1, ease: 'back.out(1.1)' }, parte('g7', 0.4) - 0.9);
    [['#g-andres', VOZ.g7 + 0.4], ['#g-charly', parte('g7', 0.4) + 0.2], ['#g-gaby', parte('g7', 0.79) + 0.1]].forEach(([s, t]) => tl.to(s, { y: -28, duration: 0.24, repeat: 1, yoyo: true, ease: 'power2.out' }, t));
    tl.from('#txt-bloques', { autoAlpha: 0, y: 20, duration: 0.5 }, VOZ.g8 + 0.2);
    tl.from('.bloques .teja', { y: 90, autoAlpha: 0, duration: 0.6, stagger: 1.2, ease: 'back.out(1.6)' }, VOZ.g8 + 2.1);

    /* 6 · La funcionaria empieza a responder */
    pasa('#e5', '#e6', E.e6, 0.8);
    tl.fromTo('#e6 .plano', { scale: 1.06 }, { scale: 1.14, xPercent: -2, duration: E.e7 - E.e6 + 1.5, ease: 'sine.inOut' }, E.e6);
    tl.to('#globo-func', { autoAlpha: 1, scale: 1, duration: 0.5, ease: 'back.out(1.8)' }, VOZ.g9 + 2.2);
    tl.to('#globo-func i', { y: -12, duration: 0.3, stagger: 0.15, repeat: 3, yoyo: true, ease: 'sine.inOut' }, VOZ.g9 + 2.6);

    /* 7 · Cierre con pregunta */
    tl.to('#e7', { autoAlpha: 1, duration: 1.2, ease: 'power1.inOut' }, E.e7);
    tl.from('#pregunta', { y: 60, autoAlpha: 0, duration: 1, ease: 'power3.out' }, E.e7 + 0.9);
  }

  Motor.iniciar({ duracion: FIN, escenas, subtitulos, audios, construir });
})();
