(() => {
  const root = document.documentElement;
  root.classList.add("js");
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isMac = /Mac|iPhone|iPad/.test(navigator.platform);

  $("#kbd-hint").textContent = isMac ? "⌘ K" : "Ctrl K";
  $("#year").textContent = new Date().getFullYear();

  // theme
  const setTheme = (t) => {
    root.dataset.theme = t;
    try { localStorage.setItem("theme", t); } catch (e) {}
    $('meta[name="theme-color"]').content = t === "dark" ? "#0b0d10" : "#fbfbfa";
  };
  const toggleTheme = () => setTheme(root.dataset.theme === "dark" ? "light" : "dark");
  $("#theme-toggle").addEventListener("click", toggleTheme);

  // typed intro
  const typed = $("#typed");
  const line = "whoami  # henry oh, senior ml engineer";
  if (reduced) typed.textContent = line;
  else {
    let i = 0;
    const tick = () => {
      typed.textContent = line.slice(0, ++i);
      if (i < line.length) setTimeout(tick, 35 + Math.random() * 45);
    };
    setTimeout(tick, 500);
  }

  // scroll reveal
  const io = "IntersectionObserver" in window
    ? new IntersectionObserver((es) => es.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      }), { threshold: 0.12 })
    : null;
  $$(".reveal").forEach((el) => (io ? io.observe(el) : el.classList.add("in")));

  // timeline
  const btns = $$(".tl-btn");
  const toggleAllBtn = $("#toggle-all");
  const allOpen = () => btns.every((b) => b.getAttribute("aria-expanded") === "true");
  const label = () => (toggleAllBtn.textContent = allOpen() ? "Collapse all" : "Expand all");
  btns.forEach((b) => b.addEventListener("click", () => {
    b.setAttribute("aria-expanded", String(b.getAttribute("aria-expanded") !== "true"));
    label();
  }));
  const setAll = (open) => {
    btns.forEach((b) => b.setAttribute("aria-expanded", String(open)));
    label();
  };
  const toggleAll = () => setAll(!allOpen());
  toggleAllBtn.addEventListener("click", toggleAll);

  // timeline line draws in as you scroll
  const tl = $(".tl");
  if (!reduced) {
    const draw = () => {
      const r = tl.getBoundingClientRect();
      const p = Math.min(1, Math.max(0.04, (innerHeight * 0.8 - r.top) / r.height));
      tl.style.setProperty("--p", p.toFixed(3));
    };
    addEventListener("scroll", draw, { passive: true });
    addEventListener("resize", draw);
    draw();
  }

  // dialogs
  let lastFocus = null;
  const open = (el) => { lastFocus = document.activeElement; el.hidden = false; };
  const close = (el) => { el.hidden = true; if (lastFocus) lastFocus.focus(); };
  const pal = $("#palette"), help = $("#help");
  $$("[data-close]").forEach((n) => n.addEventListener("click", () => close(n.closest(".palette"))));

  const go = (id) => () => $(id).scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
  const commands = [
    { name: "Go to About", hint: "1", run: go("#about") },
    { name: "Go to Timeline", hint: "2", run: go("#timeline") },
    { name: "Go to Contact", hint: "3", run: go("#contact") },
    { name: "Toggle theme", hint: "T", run: toggleTheme },
    { name: "Expand / collapse timeline", hint: "E", run: toggleAll },
    { name: "Download CV", hint: "pdf", run: () => (location.href = "/files/cv200316.pdf") },
    { name: "Send email", hint: "mailto", run: () => (location.href = "mailto:rion.oyh@gmail.com") },
    { name: "Open GitHub", hint: "link", run: () => window.open("https://github.com/rion-o", "_blank", "noopener") },
    { name: "Open LinkedIn", hint: "link", run: () => window.open("https://www.linkedin.com/in/henry-oh", "_blank", "noopener") },
    { name: "Keyboard shortcuts", hint: "?", run: () => setTimeout(() => open(help)) },
  ];
  const input = $("#pal-input"), list = $("#pal-list");
  let shown = [], sel = 0;
  const render = () => {
    const q = input.value.trim().toLowerCase();
    shown = commands.filter((c) => c.name.toLowerCase().includes(q));
    sel = Math.min(sel, Math.max(0, shown.length - 1));
    list.innerHTML = "";
    shown.forEach((c, i) => {
      const li = document.createElement("li");
      li.id = "pal-" + i;
      li.setAttribute("role", "option");
      li.setAttribute("aria-selected", String(i === sel));
      li.innerHTML = "<span></span><small></small>";
      li.firstChild.textContent = c.name;
      li.lastChild.textContent = c.hint;
      li.addEventListener("click", () => run(c));
      li.addEventListener("mousemove", () => { if (sel !== i) { sel = i; render(); } });
      list.append(li);
    });
    if (shown.length) input.setAttribute("aria-activedescendant", "pal-" + sel);
    else list.innerHTML = '<li aria-disabled="true"><span>No matches</span></li>';
  };
  const run = (c) => { close(pal); c.run(); };
  const openPalette = () => { input.value = ""; sel = 0; render(); open(pal); input.focus(); };
  $("#open-palette").addEventListener("click", openPalette);
  $("#open-help").addEventListener("click", () => open(help));
  input.addEventListener("input", () => { sel = 0; render(); });
  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); sel = (sel + 1) % shown.length; render(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); sel = (sel - 1 + shown.length) % shown.length; render(); }
    else if (e.key === "Enter" && shown[sel]) { e.preventDefault(); run(shown[sel]); }
  });

  // global keys
  addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (!pal.hidden) close(pal); else if (!help.hidden) close(help);
      return;
    }
    if (!help.hidden) {
      if (e.key === "Tab") { e.preventDefault(); $("[data-close].btn", help).focus(); }
      return;
    }
    if (!pal.hidden) {
      if (e.key === "Tab") e.preventDefault();
      return;
    }
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); openPalette(); return; }
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const t = e.target;
    if (t.matches && t.matches("input, textarea, select, [contenteditable]")) return;
    const k = e.key.toLowerCase();
    if (k === "/") { e.preventDefault(); openPalette(); }
    else if (k === "t") toggleTheme();
    else if (k === "e") toggleAll();
    else if (k === "?") open(help);
    else if (k === "1") go("#about")();
    else if (k === "2") go("#timeline")();
    else if (k === "3") go("#contact")();
  });
})();
