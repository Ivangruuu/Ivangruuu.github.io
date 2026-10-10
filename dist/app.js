// Static locale pages share the same functional enhancements.
const ui = (ru, en) => (document.documentElement.lang === "en" ? en : ru);
// Functional enhancements are independent of the decorative background.
const motion = matchMedia("(prefers-reduced-motion: reduce)");
const menuButton = document.querySelector(".menu-toggle");
const nav = document.querySelector(".nav");
function closeMenu() {
  nav.classList.remove("open");
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", ui("Открыть меню", "Open menu"));
}
if (menuButton && nav) {
  document.documentElement.classList.add("nav-enhanced");
  menuButton.setAttribute("aria-controls", "primary-nav");
  nav.id = "primary-nav";
  menuButton.addEventListener("click", () => {
    const open = menuButton.getAttribute("aria-expanded") !== "true";
    nav.classList.toggle("open", open);
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.setAttribute(
      "aria-label",
      open ? ui("Закрыть меню", "Close menu") : ui("Открыть меню", "Open menu"),
    );
  });
  nav.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeMenu();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && nav.classList.contains("open")) {
      closeMenu();
      menuButton.focus();
    }
  });
}
const progress = document.querySelector(".scroll-progress");
let scrollPending = false;
window.addEventListener(
  "scroll",
  () => {
    if (scrollPending) return;
    scrollPending = true;
    requestAnimationFrame(() => {
      const max = document.documentElement.scrollHeight - innerHeight;
      progress.style.width = `${max > 0 ? (scrollY / max) * 100 : 0}%`;
      scrollPending = false;
    });
  },
  { passive: true },
);
if ("IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting)
          nav.querySelectorAll("a").forEach((link) => {
            const active = link.hash === `#${entry.target.id}`;
            link.classList.toggle("active", active);
            if (active) link.setAttribute("aria-current", "location");
            else link.removeAttribute("aria-current");
          });
      });
    },
    { rootMargin: "-15% 0px -60% 0px" },
  );
  nav.querySelectorAll("a").forEach((link) => {
    const section = document.querySelector(link.hash);
    if (section) sectionObserver.observe(section);
  });
}
let toastTimer;
function toast(message) {
  const element = document.querySelector(".toast");
  element.textContent = message;
  element.classList.add("shown");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => element.classList.remove("shown"), 2500);
}
document.querySelector(".copy-button").addEventListener("click", async () => {
  const email = document.querySelector(".contact-email").textContent.trim();
  try {
    await navigator.clipboard.writeText(email);
    toast(ui("Email скопирован", "Email copied"));
  } catch {
    toast(`Email: ${email}`);
  }
});

const videoDialog = document.querySelector("#video-dialog");
const videoStage = videoDialog.querySelector(".video-screen-stage");
const states = new Map();
let expanded = null;
let enteredFullscreen = false;
function ensureLoaded(video) {
  if (!video.hasAttribute("src")) {
    video.src = video.dataset.src;
    video.load();
  }
}
function syncButton(video) {
  const { button } = states.get(video);
  button.textContent = video.paused
    ? ui("Воспроизвести", "Play")
    : ui("Пауза", "Pause");
  button.setAttribute(
    "aria-label",
    `${video.paused ? ui("Воспроизвести видео", "Play video") : ui("Остановить видео", "Pause video")}: ${button.dataset.title}`,
  );
}
function reconcile(video) {
  const state = states.get(video);
  const visible = expanded?.video === video || state.visible;
  const allowed =
    !document.hidden &&
    visible &&
    !state.userPaused &&
    (state.userStarted || !motion.matches);
  if (allowed) {
    ensureLoaded(video);
    video.play().catch(() => syncButton(video));
  } else video.pause();
}
async function expandVideo(video, trigger) {
  if (expanded) return;
  const frame = video.closest(".media-frame");
  const marker = document.createComment("video position");
  frame.before(marker);
  expanded = { video, frame, marker, trigger };
  ensureLoaded(video);
  videoStage.append(frame);
  video.controls = true;
  document.querySelector("#video-screen-title").textContent =
    video.getAttribute("aria-label");
  videoDialog.showModal();
  videoDialog.querySelector(".video-screen-close").focus();
  reconcile(video);
  if (videoDialog.requestFullscreen) {
    try {
      await videoDialog.requestFullscreen();
    } catch {
      /* Dialog remains usable. */
    }
  }
}
videoDialog
  .querySelector(".video-screen-close")
  .addEventListener("click", () => videoDialog.close());
videoDialog.addEventListener("close", () => {
  if (!expanded) return;
  const { video, frame, marker, trigger } = expanded;
  expanded = null;
  enteredFullscreen = false;
  if (document.fullscreenElement === videoDialog)
    document.exitFullscreen().catch(() => {});
  marker.replaceWith(frame);
  video.controls = false;
  reconcile(video);
  syncButton(video);
  trigger.focus({ preventScroll: true });
});
document.addEventListener("fullscreenchange", () => {
  if (document.fullscreenElement === videoDialog) enteredFullscreen = true;
  else if (enteredFullscreen) {
    enteredFullscreen = false;
    if (videoDialog.open) videoDialog.close();
  }
});
const loadObserver =
  "IntersectionObserver" in window
    ? new IntersectionObserver(
        (entries) => {
          entries.forEach(({ target, isIntersecting }) => {
            if (isIntersecting) {
              ensureLoaded(target);
              loadObserver.unobserve(target);
            }
          });
        },
        { rootMargin: "300px 0px" },
      )
    : null;
const playbackObserver =
  "IntersectionObserver" in window
    ? new IntersectionObserver(
        (entries) => {
          entries.forEach(({ target, isIntersecting, intersectionRatio }) => {
            states.get(target).visible =
              isIntersecting && intersectionRatio > 0;
            reconcile(target);
          });
        },
        { threshold: [0, 0.05] },
      )
    : null;
document.querySelectorAll(".original-video").forEach((clip) => {
  const video = clip.querySelector("video");
  const button = clip.querySelector(".video-toggle");
  states.set(video, {
    button,
    visible: false,
    userPaused: false,
    userStarted: false,
  });
  const frame = video.closest(".media-frame");
  const expandButton = document.createElement("button");
  expandButton.className = "video-expand";
  expandButton.type = "button";
  expandButton.setAttribute(
    "aria-label",
    `${ui("Увеличить видео", "Expand video")}: ${button.dataset.title}`,
  );
  expandButton.title = ui("На весь экран", "Fullscreen");
  expandButton.innerHTML =
    '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  frame.append(expandButton);
  expandButton.addEventListener("click", () =>
    expandVideo(video, expandButton),
  );
  video.controls = false;
  video.addEventListener("play", () => syncButton(video));
  video.addEventListener("pause", () => syncButton(video));
  video.addEventListener("error", () => {
    // Keep a usable original link if the browser cannot decode the video.
    if (!clip.querySelector(".video-fallback")) {
      const link = document.createElement("a");
      link.className = "video-fallback";
      link.href = video.dataset.src;
      link.textContent = ui("Открыть видео ↗", "Open video \u2197");
      clip.append(link);
    }
  });
  button.addEventListener("click", async () => {
    const state = states.get(video);
    if (video.paused) {
      state.userPaused = false;
      state.userStarted = true;
      ensureLoaded(video);
      try {
        await video.play();
      } catch {
        toast(
          ui(
            "Не удалось воспроизвести видео. Попробуйте открыть его в полном размере.",
            "Unable to play the video. Try opening it fullscreen.",
          ),
        );
      }
    } else {
      state.userPaused = true;
      video.pause();
    }
  });
  clip.classList.add("media-enhanced");
  loadObserver?.observe(video);
  playbackObserver?.observe(video);
  // Older browsers retain native controls and an explicit play action.
  if (!playbackObserver) video.controls = true;
  syncButton(video);
});
document.addEventListener("visibilitychange", () =>
  states.forEach((_, video) => reconcile(video)),
);
motion.addEventListener("change", () => {
  states.forEach((state, video) => {
    state.userStarted = false;
    reconcile(video);
  });
});
