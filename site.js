/* LUKOJI : carrousel « à la une » et apparitions au défilement. Sans JavaScript, tout reste visible. */
(function () {
  var calme = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Carrousel ---------- */
  var car = document.querySelector(".carrousel");
  if (car) {
    var diapos = car.querySelectorAll(".diapo"), points = car.querySelectorAll(".point");
    var pause = car.querySelector(".pause"), n = diapos.length, i = 0, minuteur = null, arrete = calme;
    var DUREE = 7000;
    car.style.setProperty("--duree", DUREE + "ms");
    function montrer(k) {
      i = (k + n) % n;
      diapos.forEach(function (d, j) {
        var on = j === i;
        d.classList.toggle("actif", on);
        if (on) d.removeAttribute("aria-hidden"); else d.setAttribute("aria-hidden", "true");
        d.querySelectorAll("a, button").forEach(function (x) { x.tabIndex = on ? 0 : -1; });
      });
      points.forEach(function (p, j) {
        p.classList.remove("actif"); void p.offsetWidth; /* relance la barre de progression */
        p.classList.toggle("actif", j === i);
      });
    }
    function lancer() { arreter(); if (!arrete && n > 1) minuteur = setInterval(function () { montrer(i + 1); }, DUREE); car.classList.toggle("en-pause", arrete); }
    function arreter() { if (minuteur) clearInterval(minuteur); minuteur = null; }
    points.forEach(function (p, j) { p.addEventListener("click", function () { montrer(j); lancer(); }); });
    if (pause) pause.addEventListener("click", function () {
      arrete = !arrete;
      pause.textContent = arrete ? "Lecture" : "Pause";
      pause.setAttribute("aria-label", arrete ? "Reprendre le défilement" : "Mettre en pause le défilement");
      lancer();
    });
    if (pause && calme) { pause.textContent = "Lecture"; }
    car.addEventListener("mouseenter", arreter);
    car.addEventListener("mouseleave", lancer);
    car.addEventListener("focusin", arreter);
    car.addEventListener("focusout", lancer);
    /* glisser du doigt sur téléphone */
    var x0 = null;
    car.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    car.addEventListener("touchend", function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0; x0 = null;
      if (Math.abs(dx) > 50) { montrer(i + (dx < 0 ? 1 : -1)); lancer(); }
    });
    document.addEventListener("visibilitychange", function () { document.hidden ? arreter() : lancer(); });
    montrer(0); lancer();
  }

  /* ---------- Apparitions au défilement ---------- */
  var cibles = document.querySelectorAll(".section-titre, .carte, .pub, .signe, .fondateur, .contenu > *:not(.une-noire), .encart, .partage, .page > *");
  if (calme || !("IntersectionObserver" in window)) return;
  var obs = new IntersectionObserver(function (entrees) {
    entrees.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add("vu"); obs.unobserve(en.target); }
    });
  }, { rootMargin: "0px 0px -4% 0px", threshold: 0.05 });
  cibles.forEach(function (el) {
    /* ce qui est déjà à l'écran au chargement reste visible tout de suite */
    if (el.getBoundingClientRect().top < window.innerHeight * 0.92) return;
    el.classList.add("revele");
    var parent = el.parentElement;
    if (parent && parent.classList.contains("grille")) {
      var rang = Array.prototype.indexOf.call(parent.children, el);
      el.style.transitionDelay = (rang % 3) * 90 + "ms";
    }
    obs.observe(el);
  });
})();
