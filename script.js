// Café Réconciliateur — logique de commande + animations
(function () {
  "use strict";

  var UNIT_PRICE = 4000; // F CFA, prix d'une boîte de 12 infusettes
  var WHATSAPP_NUMBER = "2250711359065"; // format international sans le +

  var qtyValueEl = document.getElementById("qtyValue");
  var totalValueEl = document.getElementById("totalValue");
  var minusBtn = document.getElementById("qtyMinus");
  var plusBtn = document.getElementById("qtyPlus");
  var orderBtn = document.getElementById("orderBtn");

  var quantity = 1;
  var MIN_QTY = 1;
  var MAX_QTY = 20;

  var prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  function pulse(el, className) {
    if (prefersReducedMotion || !el) return;
    el.classList.remove(className);
    // force reflow so the animation can replay
    void el.offsetWidth;
    el.classList.add(className);
  }

  function formatFCFA(amount) {
    // Sépare les milliers avec une espace : 12 000 F CFA
    var withSpaces = amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    return withSpaces + " F CFA";
  }

  var isFirstRender = true;

  function updateDisplay() {
    qtyValueEl.textContent = quantity;
    totalValueEl.textContent = formatFCFA(quantity * UNIT_PRICE);
    minusBtn.disabled = quantity <= MIN_QTY;
    if (!isFirstRender) {
      pulse(qtyValueEl, "is-pulsing");
      pulse(totalValueEl, "is-pulsing");
    }
    isFirstRender = false;
    updateOrderLink();
  }

  function updateOrderLink() {
    var boxWord = quantity > 1 ? "boîtes" : "boîte";
    var message =
      "Bonjour, je souhaite commander " +
      quantity +
      " " +
      boxWord +
      " de Café Réconciliateur (12 infusettes chacune), soit " +
      formatFCFA(quantity * UNIT_PRICE) +
      " au total. Merci de me confirmer la disponibilité et la livraison.";

    var url =
      "https://wa.me/" +
      WHATSAPP_NUMBER +
      "?text=" +
      encodeURIComponent(message);

    orderBtn.setAttribute("href", url);
  }

  minusBtn.addEventListener("click", function () {
    if (quantity > MIN_QTY) {
      quantity -= 1;
      updateDisplay();
    }
  });

  plusBtn.addEventListener("click", function () {
    if (quantity < MAX_QTY) {
      quantity += 1;
      updateDisplay();
    }
  });

  updateDisplay();

  // ---------- Barre de progression de lecture ----------

  var progressEl = document.getElementById("scrollProgress");

  function updateProgress() {
    var scrollTop = window.scrollY || document.documentElement.scrollTop;
    var docHeight =
      document.documentElement.scrollHeight - window.innerHeight;
    var ratio = docHeight > 0 ? scrollTop / docHeight : 0;
    progressEl.style.width = Math.min(1, Math.max(0, ratio)) * 100 + "%";
  }

  // ---------- En-tête qui réagit au scroll ----------

  var header = document.getElementById("siteHeader");

  function updateHeader() {
    var scrollTop = window.scrollY || document.documentElement.scrollTop;
    header.classList.toggle("is-scrolled", scrollTop > 12);
  }

  var ticking = false;
  window.addEventListener(
    "scroll",
    function () {
      if (!ticking) {
        window.requestAnimationFrame(function () {
          updateProgress();
          updateHeader();
          ticking = false;
        });
        ticking = true;
      }
    },
    { passive: true }
  );

  updateProgress();
  updateHeader();

  // ---------- Apparition au défilement ----------

  var revealEls = document.querySelectorAll("[data-reveal]");

  if ("IntersectionObserver" in window && !prefersReducedMotion) {
    // Décale légèrement chaque élément d'un même groupe pour un effet en cascade
    var counters = new WeakMap();
    revealEls.forEach(function (el) {
      var parent = el.parentElement;
      var n = counters.has(parent) ? counters.get(parent) : 0;
      el.style.transitionDelay = Math.min(n * 90, 360) + "ms";
      counters.set(parent, n + 1);
    });

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );

    revealEls.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  // ---------- Effet ripple sur les boutons ----------

  document.querySelectorAll(".btn").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      if (prefersReducedMotion) return;
      var rect = btn.getBoundingClientRect();
      var span = document.createElement("span");
      span.className = "ripple";
      span.style.setProperty("--x", e.clientX - rect.left + "px");
      span.style.setProperty("--y", e.clientY - rect.top + "px");
      btn.appendChild(span);
      window.setTimeout(function () {
        span.remove();
      }, 650);
    });
  });

  // ---------- Léger effet de parallax sur le visuel héro ----------

  var heroVisual = document.getElementById("heroVisual");
  var isTouchDevice = window.matchMedia("(hover: none)").matches;

  if (heroVisual && !prefersReducedMotion && !isTouchDevice) {
    heroVisual.addEventListener("mousemove", function (e) {
      var rect = heroVisual.getBoundingClientRect();
      var px = (e.clientX - rect.left) / rect.width - 0.5;
      var py = (e.clientY - rect.top) / rect.height - 0.5;
      var rotateX = (py * -6).toFixed(2);
      var rotateY = (px * 8).toFixed(2);
      heroVisual.style.transform =
        "perspective(900px) rotateX(" +
        rotateX +
        "deg) rotateY(" +
        rotateY +
        "deg)";
    });

    heroVisual.addEventListener("mouseleave", function () {
      heroVisual.style.transform =
        "perspective(900px) rotateX(0deg) rotateY(0deg)";
    });
  }
})();
