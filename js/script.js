let completedLessons = 0;

function markComplete(element) {
  if (!element.classList.contains("done")) {
    element.classList.add("done");
    completedLessons++;
    updateProgress();
  }
}

function completeLesson() {
  completedLessons++;
  updateProgress();
}

function updateProgress() {
  const totalLessons = 4;
  const percentage = (completedLessons / totalLessons) * 100;
  const progressBar = document.getElementById("progress-bar");
  if (progressBar) {
    progressBar.style.width = percentage + "%";
  }
}

const heroHeader = document.querySelector(".hero-header");

if (heroHeader) {
  // Two thresholds prevent flicker near the top:
  // collapse quickly on small downward scroll, expand only very close to top.
  const collapseAt = 18;
  const expandAt = 6;
  let isCompact = false;

  const getNumberVar = (name, fallback) => {
    const raw = getComputedStyle(heroHeader).getPropertyValue(name).trim();
    const num = Number(raw);
    return Number.isFinite(num) ? num : fallback;
  };

  const maxSize = getNumberVar("--logo-size-max", 340);
  const minSize = getNumberVar("--logo-size-min", 95);
  const range = Math.max(1, maxSize - minSize);
  let maxHeaderPx = 0;
  let minHeaderPx = 0;

  const syncHeaderLimits = () => {
    const maxVh = getNumberVar("--header-max-vh", 45);
    const minPx = getNumberVar("--header-min-px", 90);
    maxHeaderPx = (maxVh / 100) * window.innerHeight;
    minHeaderPx = minPx;
  };

  const syncLogoSizeFromHeader = () => {
    const h = heroHeader.getBoundingClientRect().height;
    const denom = Math.max(1, maxHeaderPx - minHeaderPx);
    const t = Math.min(1, Math.max(0, (maxHeaderPx - h) / denom));
    const size = Math.round(maxSize - range * t);
    heroHeader.style.setProperty("--logo-size", `${size}px`);
  };

  const syncHeaderState = () => {
    const y = window.scrollY;

    if (!isCompact && y > collapseAt) {
      isCompact = true;
      heroHeader.classList.add("is-compact");
    } else if (isCompact && y <= expandAt) {
      isCompact = false;
      heroHeader.classList.remove("is-compact");
    }

    syncLogoSizeFromHeader();
  };

  syncHeaderLimits();
  syncHeaderState();
  window.addEventListener("scroll", syncHeaderState, { passive: true });
  window.addEventListener("resize", () => {
    syncHeaderLimits();
    syncLogoSizeFromHeader();
  });

  const ro = new ResizeObserver(() => {
    syncLogoSizeFromHeader();
  });
  ro.observe(heroHeader);
}

const a1Lessons = {
  1: {
    title: "Theme: ABC / Numbers",
    video: "https://youtu.be/JRXbb566uuo?si=kV9VIieh9dUzLvvD",
    cover: "assets/images/cover_lesson_1.png",
  },
  2: {
    title: "Theme: Noun",
    video: "https://youtu.be/IpWRL8rJMLY",
    cover: "assets/images/cover_lesson_2.png",
  },
  3: {
    title: "Theme: Personal Subject Pronoun and To Be",
    video: "https://youtu.be/7YGYvJ61yi0",
    cover: "assets/images/cover_lesson_3.png",
  },
  4: {
    title: "Theme: Speaking",
    video: "assets/videos/a1-lesson6.mp4",
    cover: "assets/images/cover_lesson_4.png",
  },
  5: { title: "Theme: Review Lesson", video: "https://youtu.be/8Y8iZ2pMokY" },
  6: {
    title: "Theme: Possessive Adjective and Possessive Pronouns",
    video: "https://youtu.be/I_PGgz7Wjxg",
    cover: "assets/images/cover_lesson_6.png",
  },
  7: { title: "Theme: Demonstrative Pronouns", video: "assets/videos/a1-lesson10.mp4" },
  8: { title: "Theme: Articles", video: "assets/videos/a1-lesson12.mp4" },
  9: { title: "Theme: Possessive Case", video: "assets/videos/a1-lesson13.mp4" },
  10: { title: "Theme: Much / Many", video: "assets/videos/a1-lesson15.mp4" },
  11: { title: "Theme: Present Simple Tense", video: "assets/videos/a1-lesson16.mp4" },
  12: { title: "Theme: Some Any No", video: "assets/videos/a1-lesson18.mp4" },
  13: { title: "Theme: Prepositions of Place", video: "assets/videos/a1-lesson19.mp4" },
  14: { title: "Theme: Object Pronouns", video: "assets/videos/a1-lesson21.mp4" },
  15: { title: "Theme: Present Continuous Tense", video: "assets/videos/a1-lesson22.mp4" },
  16: { title: "Theme: Time", video: "assets/videos/a1-lesson23.mp4" },
  17: { title: "Theme: Either Neither Too", video: "assets/videos/a1-lesson25.mp4" },
  18: { title: "Theme: Past Simple Tense", video: "assets/videos/a1-lesson26.mp4" },
  19: { title: "Theme: Future Simple Tense", video: "assets/videos/a1-lesson27.mp4" },
  20: { title: "Theme: Used To", video: "assets/videos/a1-lesson28.mp4" },
};

const isYouTubeUrl = (value) => /youtube\.com|youtu\.be/.test(String(value || ""));

const extractYouTubeId = (value) => {
  const raw = String(value || "").trim();
  if (!raw) {
    return "";
  }
  const patterns = [
    /youtu\.be\/([A-Za-z0-9_-]{11})/i,
    /youtube\.com\/watch\?v=([A-Za-z0-9_-]{11})/i,
    /youtube\.com\/embed\/([A-Za-z0-9_-]{11})/i,
    /youtube\.com\/shorts\/([A-Za-z0-9_-]{11})/i,
  ];
  for (const pattern of patterns) {
    const match = raw.match(pattern);
    if (match) {
      return match[1];
    }
  }
  return "";
};

const getYouTubeEmbedUrl = (value) => {
  const id = extractYouTubeId(value);
  if (!id) {
    return "";
  }
  return `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1&playsinline=1`;
};

const getYouTubeCoverUrl = (value) => {
  const id = extractYouTubeId(value);
  if (!id) {
    return "";
  }
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
};

const loadYouTubeApi = () => {
  if (window.YT && window.YT.Player) {
    return Promise.resolve(window.YT);
  }
  if (window._ytApiPromise) {
    return window._ytApiPromise;
  }
  window._ytApiPromise = new Promise((resolve) => {
    window._ytApiCallbacks = window._ytApiCallbacks || [];
    window._ytApiCallbacks.push(resolve);
    if (window._ytApiScriptAdded) {
      return;
    }
    window._ytApiScriptAdded = true;
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
    window.onYouTubeIframeAPIReady = () => {
      const callbacks = window._ytApiCallbacks || [];
      callbacks.forEach((cb) => cb(window.YT));
      window._ytApiCallbacks = [];
    };
  });
  return window._ytApiPromise;
};

const createVideoProgressTracker = (course, lessonNumber, getCurrentTime, getDuration) => {
  const authState = getAuthState();
  if (!authState || !authState.username) {
    return null;
  }
  let maxWatchedSeconds = 0;
  let lastSentAt = 0;
  let lastSentWatched = 0;
  const throttleMs = 12000;
  const minDeltaSeconds = 8;

  const sendProgress = (force = false) => {
    const durationSeconds = Number(getDuration()) || 0;
    const now = Date.now();
    if (!force) {
      if (now - lastSentAt < throttleMs && Math.abs(maxWatchedSeconds - lastSentWatched) < minDeltaSeconds) {
        return;
      }
    }
    lastSentAt = now;
    lastSentWatched = maxWatchedSeconds;
    fetch(`${API_BASE_URL}/api/video-progress`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: authState.username,
        course,
        lesson_number: lessonNumber,
        watched_seconds: Math.floor(maxWatchedSeconds),
        duration_seconds: Math.floor(durationSeconds || 0),
        last_position_seconds: Math.floor(getCurrentTime() || 0),
      }),
    }).catch(() => {
      // Ignore tracking errors.
    });
  };

  const recordTick = () => {
    const current = Number(getCurrentTime()) || 0;
    if (current > maxWatchedSeconds) {
      maxWatchedSeconds = current;
    }
    sendProgress(false);
  };

  const markEnded = () => {
    const durationSeconds = Number(getDuration()) || 0;
    if (durationSeconds > maxWatchedSeconds) {
      maxWatchedSeconds = durationSeconds;
    }
    sendProgress(true);
  };

  return { sendProgress, recordTick, markEnded };
};

const setupYouTubeTracking = (player, course, lessonNumber) => {
  let watchedSeconds = 0;
  let lastTickAt = 0;
  const getDurationSafe = () => {
    try {
      return Number(player.getDuration()) || 0;
    } catch (error) {
      return 0;
    }
  };
  const getWatchedSeconds = () => watchedSeconds;
  const tracker = createVideoProgressTracker(course, lessonNumber, getWatchedSeconds, getDurationSafe);
  if (!tracker) {
    return;
  }
  let timer = null;
  const updateWatchedSeconds = () => {
    if (!lastTickAt) {
      lastTickAt = Date.now();
      return;
    }
    const now = Date.now();
    const delta = Math.max(0, (now - lastTickAt) / 1000);
    if (delta > 0) {
      watchedSeconds += delta;
      const duration = getDurationSafe();
      if (duration > 0 && watchedSeconds > duration) {
        watchedSeconds = duration;
      }
    }
    lastTickAt = now;
  };
  const start = () => {
    if (timer) {
      return;
    }
    lastTickAt = Date.now();
    timer = setInterval(() => {
      updateWatchedSeconds();
      tracker.recordTick();
    }, 1000);
  };
  const stop = () => {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
    updateWatchedSeconds();
  };

  player.addEventListener("onReady", () => {
    tracker.sendProgress(true);
  });
  player.addEventListener("onStateChange", (event) => {
    if (event.data === window.YT.PlayerState.PLAYING) {
      start();
      tracker.sendProgress(false);
      return;
    }
    if (event.data === window.YT.PlayerState.PAUSED) {
      stop();
      tracker.sendProgress(true);
      return;
    }
    if (event.data === window.YT.PlayerState.BUFFERING) {
      stop();
      tracker.sendProgress(false);
      return;
    }
    if (event.data === window.YT.PlayerState.ENDED) {
      stop();
      tracker.markEnded();
    }
  });
  window.addEventListener("beforeunload", () => {
    updateWatchedSeconds();
    tracker.sendProgress(true);
  });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      updateWatchedSeconds();
      tracker.sendProgress(true);
    }
  });
};

const a2Lessons = {
  1: { title: "Theme: Reflexive pronouns", video: "assets/videos/a2-lesson1.mp4" },
  2: { title: "Theme: Present Simple Tense", video: "assets/videos/a2-lesson2.mp4" },
  3: { title: "Theme: Present Continuous", video: "assets/videos/a2-lesson3.mp4" },
  4: { title: "Theme: Possessive Case", video: "assets/videos/a2-lesson4.mp4" },
  5: { title: "Theme: Much Many a2 revision", video: "assets/videos/a2-lesson5.mp4" },
  6: {
    title: "Theme: Indefinite pronouns: Someone Anybody nothing everywhere",
    video: "assets/videos/a2-lesson6.mp4",
  },
  7: { title: "Theme: Past Simple", video: "assets/videos/a2-lesson7.mp4" },
  8: { title: "Theme: Past Continuous", video: "assets/videos/a2-lesson8.mp4" },
  9: { title: "Theme: Future Simple", video: "assets/videos/a2-lesson9.mp4" },
  10: { title: "Theme: Future Continuous", video: "assets/videos/a2-lesson10.mp4" },
  11: { title: "Theme: Present Perfect", video: "assets/videos/a2-lesson11.mp4" },
  12: {
    title: "Theme: Interrogative pronouns / relative pronouns",
    video: "assets/videos/a2-lesson12.mp4",
  },
  13: { title: "Theme: Modal verbs", video: "assets/videos/a2-lesson13.mp4" },
};

const LESSONS_BY_COURSE = {
  a1: a1Lessons,
  a2: a2Lessons,
  b1: {
    1: { title: "Theme: Much Many", video: "assets/videos/b1-lesson1.mp4" },
    2: { title: "Theme: Consecutive order", video: "assets/videos/b1-lesson2.mp4" },
    3: { title: "Theme: Countable & Non-countable nouns", video: "assets/videos/b1-lesson3.mp4" },
    4: { title: "Theme: Articles", video: "assets/videos/b1-lesson4.mp4" },
    5: { title: "Theme: Singular & Plural nouns", video: "assets/videos/b1-lesson5.mp4" },
    6: { title: "Theme: TEST", video: "assets/videos/b1-lesson6.mp4" },
    7: { title: "Theme: Present Simple", video: "assets/videos/b1-lesson7.mp4" },
    8: { title: "Theme: Present Continuous", video: "assets/videos/b1-lesson8.mp4" },
    9: { title: "Theme: Present Perfect", video: "assets/videos/b1-lesson9.mp4" },
    10: { title: "Theme: Present Perfect Continuous", video: "assets/videos/b1-lesson10.mp4" },
    11: { title: "Theme: TEST", video: "assets/videos/b1-lesson11.mp4" },
    12: { title: "Theme: Past Simple", video: "assets/videos/b1-lesson12.mp4" },
    13: { title: "Theme: Past Continuous", video: "assets/videos/b1-lesson13.mp4" },
    14: { title: "Theme: Past Perfect", video: "assets/videos/b1-lesson14.mp4" },
    15: { title: "Theme: Past Perfect Continuous", video: "assets/videos/b1-lesson15.mp4" },
    16: { title: "Theme: TEST", video: "assets/videos/b1-lesson16.mp4" },
    17: { title: "Theme: Future Simple", video: "assets/videos/b1-lesson17.mp4" },
    18: { title: "Theme: Future Continuous", video: "assets/videos/b1-lesson18.mp4" },
    19: { title: "Theme: Future Perfect", video: "assets/videos/b1-lesson19.mp4" },
    20: { title: "Theme: Future Perfect Continuous", video: "assets/videos/b1-lesson20.mp4" },
    21: { title: "Theme: Future in the past", video: "assets/videos/b1-lesson21.mp4" },
    22: { title: "Theme: TEST", video: "assets/videos/b1-lesson22.mp4" },
    23: { title: "Theme: Gerund / infinitive", video: "assets/videos/b1-lesson23.mp4" },
    24: { title: "Theme: Reported speech", video: "assets/videos/b1-lesson24.mp4" },
    25: { title: "Theme: Essay writing", video: "assets/videos/b1-lesson25.mp4" },
    26: { title: "Theme: Adverbs", video: "assets/videos/b1-lesson26.mp4" },
    27: { title: "Theme: Adjectives", video: "assets/videos/b1-lesson27.mp4" },
  },
  b2: {
    1: { title: "Theme: Letter Writing", video: "assets/videos/b2-lesson1.mp4" },
    2: { title: "Theme: Conjunction", video: "assets/videos/b2-lesson2.mp4" },
    3: { title: "Theme: If conditional sentence", video: "assets/videos/b2-lesson3.mp4" },
    4: { title: "Theme: Suffix prefix rules", video: "assets/videos/b2-lesson4.mp4" },
    5: { title: "Theme: Nominalization", video: "assets/videos/b2-lesson5.mp4" },
    6: { title: "Theme: Passive Active voice", video: "assets/videos/b2-lesson6.mp4" },
    7: { title: "Theme: Modal Verbs", video: "assets/videos/b2-lesson7.mp4" },
    8: { title: "Theme: Wish grammar", video: "assets/videos/b2-lesson8.mp4" },
  },
};

let quizQuestions = [];

const resolveApiBaseUrl = () => {
  const host = window.location.hostname || "";
  if (!host) {
    return "http://127.0.0.1:8000";
  }
  if (host === "localhost") {
    return "http://localhost:8000";
  }
  if (host === "127.0.0.1") {
    return "http://127.0.0.1:8000";
  }
  return `http://${host}:8000`;
};

let API_BASE_URL = resolveApiBaseUrl();
let ACCESS_API_BASE_URL = API_BASE_URL;
const API_BASE_URL_FALLBACKS = ["http://127.0.0.1:8000", "http://localhost:8000"];

const checkApiHealth = async (baseUrl) => {
  try {
    const response = await fetch(`${baseUrl}/api/health`);
    if (!response.ok) {
      return false;
    }
    const payload = await response.json();
    return payload && payload.status === "ok";
  } catch (error) {
    return false;
  }
};

const ensureApiBaseUrl = async () => {
  if (await checkApiHealth(API_BASE_URL)) {
    return API_BASE_URL;
  }
  for (const candidate of API_BASE_URL_FALLBACKS) {
    if (candidate === API_BASE_URL) {
      continue;
    }
    if (await checkApiHealth(candidate)) {
      API_BASE_URL = candidate;
      ACCESS_API_BASE_URL = candidate;
      return API_BASE_URL;
    }
  }
  return API_BASE_URL;
};
const initContactForm = () => {
  const form = document.getElementById("contact-form");
  if (!form) {
    return;
  }
  const nameInput = document.getElementById("contact-name");
  const emailInput = document.getElementById("contact-email");
  const messageInput = document.getElementById("contact-message");
  const submitBtn = form.querySelector(".contact-submit-btn");
  const statusEl = document.getElementById("contact-status");

  const setStatus = (text, type) => {
    if (!statusEl) {
      return;
    }
    statusEl.textContent = text;
    statusEl.classList.remove("is-error", "is-success");
    if (type) {
      statusEl.classList.add(`is-${type}`);
    }
  };

  const setBusy = (isBusy) => {
    if (!submitBtn) {
      return;
    }
    submitBtn.disabled = isBusy;
    submitBtn.textContent = isBusy ? "Sending..." : "Send Message";
  };

  const isValidEmail = (value) => /\S+@\S+\.\S+/.test(String(value || "").trim());

  const handleSubmit = async (event) => {
    if (event) {
      event.preventDefault();
    }
    const name = nameInput ? nameInput.value.trim() : "";
    const email = emailInput ? emailInput.value.trim() : "";
    const message = messageInput ? messageInput.value.trim() : "";

    if (!name || !email || !message) {
      setStatus("Please fill in your name, email, and message.", "error");
      return;
    }
    if (!isValidEmail(email)) {
      setStatus("Please enter a valid email address.", "error");
      return;
    }

    setBusy(true);
    setStatus("Sending message...");
    await ensureApiBaseUrl();

    try {
      const response = await fetch(`${API_BASE_URL}/api/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          message,
        }),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        const errorText = payload && payload.error ? payload.error : "Unable to send message.";
        setStatus(errorText, "error");
        return;
      }
      form.reset();
      setStatus("Message sent! We will reply soon.", "success");
    } catch (error) {
      setStatus("Network error. Please try again in a moment.", "error");
    } finally {
      setBusy(false);
    }
  };

  form.addEventListener("submit", handleSubmit);
};
const ACCESS_AUTH_STORAGE_KEY = "ewms_auth_state";
const COURSE_CODES = ["a1", "a2", "b1", "b2"];

const getSessionTokenFromStorage = () => {
  const raw = localStorage.getItem(ACCESS_AUTH_STORAGE_KEY);
  if (!raw) {
    return "";
  }
  try {
    const parsed = JSON.parse(raw);
    return String(parsed.sessionToken || parsed.session_token || "").trim();
  } catch (error) {
    return "";
  }
};

const getCourseFromPathname = () => {
  const path = (window.location.pathname || "").toLowerCase();
  const match = path.match(/\/(a1|a2|b1|b2)\.html$/);
  return match ? match[1] : "";
};

const fetchLessonAccess = async (course, lessonNumber) => {
  const normalizedCourse = String(course || "").trim().toLowerCase();
  const safeCourse = COURSE_CODES.includes(normalizedCourse) ? normalizedCourse : "";
  const sessionToken = getSessionTokenFromStorage();
  await ensureApiBaseUrl();

  try {
    const response = await fetch(`${ACCESS_API_BASE_URL}/api/access/check`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        course: safeCourse,
        lesson_number: lessonNumber,
        session_token: sessionToken,
      }),
    });
    if (!response.ok) {
      return { allowed: false, status: response.status };
    }
    const payload = await response.json();
    return payload || { allowed: false };
  } catch (error) {
    return { allowed: false, network_error: true };
  }
};

const getLocalAuthRole = () => {
  const raw = localStorage.getItem(ACCESS_AUTH_STORAGE_KEY);
  if (!raw) {
    return "";
  }
  try {
    const parsed = JSON.parse(raw);
    return String(parsed && parsed.role ? parsed.role : "").trim().toLowerCase();
  } catch (error) {
    return "";
  }
};

const isLocalHost = () => {
  const host = String(window.location.hostname || "").toLowerCase();
  return host === "localhost" || host === "127.0.0.1" || host === "";
};

const checkServerLessonAccess = async (course, lessonNumber) => {
  const payload = await fetchLessonAccess(course, lessonNumber);
  if (payload && payload.allowed) {
    return true;
  }
  if (getLocalAuthRole() === "admin") {
    return true;
  }
  if (payload && payload.network_error && isLocalHost()) {
    return true;
  }
  return false;
};

const getLessonCompletionStorageKey = (course, lessonNumber, username) =>
  `ewms_lesson_completed:${String(course || "").toLowerCase()}:${Number(lessonNumber) || 1}:${username || "guest"}`;

const markLessonCompletedLocal = (course, lessonNumber) => {
  const authState = getAuthState();
  const username = authState && authState.username ? authState.username : "guest";
  const key = getLessonCompletionStorageKey(course, lessonNumber, username);
  try {
    localStorage.setItem(key, "1");
  } catch (error) {
    // Ignore storage failures.
  }
};

const isLessonCompletedLocal = (course, lessonNumber) => {
  const authState = getAuthState();
  const username = authState && authState.username ? authState.username : "guest";
  const key = getLessonCompletionStorageKey(course, lessonNumber, username);
  try {
    return localStorage.getItem(key) === "1";
  } catch (error) {
    return false;
  }
};

const lessonPage = document.querySelector("[data-lesson-page]");
if (lessonPage) {
  const params = new URLSearchParams(window.location.search);
  const course = (params.get("course") || "a1").toLowerCase();
  const lessonNumber = Number(params.get("lesson")) || 1;
  (async () => {
    const hasAccess = await checkServerLessonAccess(course, lessonNumber);
    if (!hasAccess) {
      window.location.href = `${course}.html`;
      return;
    }

    const courseLessons = LESSONS_BY_COURSE[course] || a1Lessons;
    const lessonData = courseLessons[lessonNumber] || courseLessons[1] || a1Lessons[1];

    const titleEl = document.getElementById("lesson-title");
    const videoEl = document.getElementById("lesson-video");
    const sourceEl = document.getElementById("lesson-video-source");
    const embedEl = document.getElementById("lesson-video-embed");
    const coverEl = document.getElementById("lesson-video-cover");
    const tasksBtn = document.getElementById("go-tasks-btn");
    const homeworkBtn = document.getElementById("lesson-homework-btn");
    const backBtn = document.getElementById("back-lessons-btn");
    const presentationBtn = document.getElementById("lesson-presentation-btn");
    const homeworkGateModal = document.getElementById("homework-gate-modal");
    const homeworkGateTasksBtn = document.getElementById("homework-gate-tasks");
    const homeworkGateCloseBtn = document.getElementById("homework-gate-close");
    const fallbackCoverUrl = "assets/images/cover.jpg";
    let ytPlayer = null;
    let ytPlayRequested = false;
    let embedUrl = "";

    const hideCover = () => {
      if (coverEl) {
        coverEl.classList.add("is-hidden");
      }
    };

    const showCover = () => {
      if (coverEl) {
        coverEl.classList.remove("is-hidden");
      }
    };

    const setCoverImage = (url) => {
      if (!coverEl) {
        return;
      }
      if (url) {
        coverEl.style.setProperty("--lesson-cover-image", `url("${url}")`);
        coverEl.style.backgroundImage = `url("${url}")`;
      } else {
        coverEl.style.removeProperty("--lesson-cover-image");
        coverEl.style.backgroundImage = "none";
      }
    };

    if (titleEl) {
      titleEl.textContent = lessonData.title;
    }

    const isYoutubeVideo = isYouTubeUrl(lessonData.video);
    const coverUrl =
      lessonData.cover || (isYoutubeVideo ? getYouTubeCoverUrl(lessonData.video) : fallbackCoverUrl);
    setCoverImage(coverUrl);
    showCover();
    if (videoEl && !isYoutubeVideo && coverUrl) {
      videoEl.setAttribute("poster", coverUrl);
    }
    if (coverEl) {
      coverEl.addEventListener("click", () => {
        hideCover();
        if (isYoutubeVideo) {
          if (ytPlayer && typeof ytPlayer.playVideo === "function") {
            ytPlayer.playVideo();
          } else {
            ytPlayRequested = true;
            const iframe = embedEl ? embedEl.querySelector("iframe") : null;
            if (iframe && embedUrl) {
              const separator = embedUrl.includes("?") ? "&" : "?";
              const autoplayUrl = `${embedUrl}${separator}autoplay=1`;
              if (iframe.src !== autoplayUrl) {
                iframe.src = autoplayUrl;
              }
            }
          }
        } else if (videoEl) {
          const playAttempt = videoEl.play();
          if (playAttempt && typeof playAttempt.catch === "function") {
            playAttempt.catch(() => {});
          }
        }
      });
    }
    if (videoEl) {
      videoEl.addEventListener("play", hideCover);
    }

    if (isYoutubeVideo && embedEl) {
      if (videoEl) {
        if (typeof videoEl.pause === "function") {
          videoEl.pause();
        }
        videoEl.removeAttribute("src");
        if (typeof videoEl.load === "function") {
          videoEl.load();
        }
        videoEl.remove();
      }
      embedEl.hidden = false;
      embedUrl = getYouTubeEmbedUrl(lessonData.video);
      const playerId = "lesson-youtube-player";
      const initPlayer = () => {
        if (!window.YT || !window.YT.Player) {
          return;
        }
        embedEl.innerHTML = `<div id="${playerId}"></div>`;
        const player = new window.YT.Player(playerId, {
          videoId: extractYouTubeId(lessonData.video),
          playerVars: {
            rel: 0,
            modestbranding: 1,
            playsinline: 1,
          },
        });
        ytPlayer = player;
        player.addEventListener("onReady", () => {
          if (ytPlayRequested) {
            player.playVideo();
          }
        });
        player.addEventListener("onStateChange", (event) => {
          if (event && window.YT && event.data === window.YT.PlayerState.PLAYING) {
            hideCover();
          }
        });
        setupYouTubeTracking(player, course, lessonNumber);
      };
      loadYouTubeApi().then(initPlayer);
      if (embedUrl && embedEl.querySelector("iframe") === null) {
        // fallback while API loads
        embedEl.innerHTML = `<iframe src="${embedUrl}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
      }
    } else if (sourceEl && videoEl) {
      if (embedEl) {
        embedEl.hidden = true;
        embedEl.innerHTML = "";
      }
      videoEl.hidden = false;
      sourceEl.src = lessonData.video;
      videoEl.load();
    }

    if (tasksBtn) {
      tasksBtn.href = `tasks.html?course=${course}&lesson=${lessonNumber}`;
    }

    const tasksUrl = `tasks.html?course=${course}&lesson=${lessonNumber}`;
    const homeworkUrl = `${tasksUrl}&open=homework`;

    const openHomeworkGate = () => {
      if (!homeworkGateModal) {
        return;
      }
      homeworkGateModal.classList.add("is-open");
      homeworkGateModal.setAttribute("aria-hidden", "false");
    };

    const closeHomeworkGate = () => {
      if (!homeworkGateModal) {
        return;
      }
      homeworkGateModal.classList.remove("is-open");
      homeworkGateModal.setAttribute("aria-hidden", "true");
    };

    const fetchQuizExists = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/quiz/questions?course=${encodeURIComponent(course)}&lesson=${encodeURIComponent(
            lessonNumber
          )}`
        );
        if (!response.ok) {
          return false;
        }
        const payload = await response.json();
        return !!(payload && Array.isArray(payload.questions) && payload.questions.length > 0);
      } catch (error) {
        return false;
      }
    };

    const fetchQuizStatus = async () => {
      const username = getAuthUser();
      if (!username) {
        return { has_attempt: false };
      }
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/quiz/status?username=${encodeURIComponent(username)}&course=${encodeURIComponent(
            course
          )}&lesson=${encodeURIComponent(lessonNumber)}`
        );
        if (!response.ok) {
          return { has_attempt: false };
        }
        const payload = await response.json();
        if (!payload || typeof payload !== "object") {
          return { has_attempt: false };
        }
        return payload;
      } catch (error) {
        return { has_attempt: false };
      }
    };

    const handleHomeworkClick = async () => {
      const quizExists = await fetchQuizExists();
      if (!quizExists) {
        window.location.href = homeworkUrl;
        return;
      }
      const status = await fetchQuizStatus();
      if (status && status.has_attempt) {
        window.location.href = homeworkUrl;
        return;
      }
      openHomeworkGate();
    };

    if (homeworkBtn) {
      homeworkBtn.addEventListener("click", async () => {
        homeworkBtn.disabled = true;
        try {
          await handleHomeworkClick();
        } finally {
          homeworkBtn.disabled = false;
        }
      });
    }

    if (homeworkGateTasksBtn) {
      homeworkGateTasksBtn.addEventListener("click", () => {
        window.location.href = tasksUrl;
      });
    }

    if (homeworkGateCloseBtn) {
      homeworkGateCloseBtn.addEventListener("click", () => {
        closeHomeworkGate();
      });
    }

    if (homeworkGateModal) {
      homeworkGateModal.addEventListener("click", (event) => {
        if (event.target === homeworkGateModal) {
          closeHomeworkGate();
        }
      });
    }

    if (backBtn) {
      backBtn.href = `${course}.html`;
    }

    if (presentationBtn) {
      const presentationUrl =
        typeof getPresentationUrl === "function"
          ? getPresentationUrl(course, lessonNumber)
          : `presentation.html?course=${encodeURIComponent(course)}&lesson=${lessonNumber}`;
      if (presentationUrl) {
        presentationBtn.href = presentationUrl;
      } else {
        presentationBtn.hidden = true;
      }
    }

    if (videoEl && !isYoutubeVideo) {
      const tracker = createVideoProgressTracker(
        course,
        lessonNumber,
        () => videoEl.currentTime,
        () => videoEl.duration
      );
      if (tracker) {
        videoEl.addEventListener("loadedmetadata", () => {
          tracker.sendProgress(true);
        });

        videoEl.addEventListener("timeupdate", () => {
          tracker.recordTick();
        });

        videoEl.addEventListener("pause", () => {
          tracker.sendProgress(true);
        });

        videoEl.addEventListener("ended", () => {
          tracker.markEnded();
        });

        window.addEventListener("beforeunload", () => {
          tracker.sendProgress(true);
        });

        document.addEventListener("visibilitychange", () => {
          if (document.visibilityState === "hidden") {
            tracker.sendProgress(true);
          }
        });
      }
    }
  })();
}

const presentationPage = document.querySelector("[data-presentation-page]");
if (presentationPage) {
  const params = new URLSearchParams(window.location.search);
  const course = (params.get("course") || "a1").toLowerCase();
  const lessonNumber = Number(params.get("lesson")) || 1;
  const titleEl = document.getElementById("presentation-title");
  const noteEl = document.getElementById("presentation-note");
  const frameEl = document.getElementById("presentation-frame");
  const backBtn = document.getElementById("presentation-back-btn");

  const courseLessons = LESSONS_BY_COURSE[course] || a1Lessons;
  const lessonData = courseLessons[lessonNumber] || courseLessons[1] || a1Lessons[1];
  if (titleEl) {
    titleEl.textContent = `Lesson ${lessonNumber}: ${(lessonData.title || "").replace("Theme: ", "")}`;
  }
  if (backBtn) {
    backBtn.href = `lesson.html?course=${course}&lesson=${lessonNumber}`;
  }

  const authState = getAuthState();
  if (!authState || !authState.sessionToken) {
    if (noteEl) {
      noteEl.textContent = "Please log in to view this presentation.";
    }
  } else {
    (async () => {
      if (noteEl) {
        noteEl.textContent = "Checking access...";
      }
      const accessPayload = await fetchLessonAccess(course, lessonNumber);
      if (!accessPayload || !accessPayload.allowed) {
        if (noteEl) {
          noteEl.textContent = "Access denied for this lesson.";
        }
        return;
      }
      if (noteEl) {
        noteEl.textContent = "Loading presentation...";
      }
      if (!frameEl) {
        if (noteEl) {
          noteEl.textContent = "Presentation not available.";
        }
        return;
      }
      const token = encodeURIComponent(authState.sessionToken || "");
      const src = `${API_BASE_URL}/api/presentation?course=${encodeURIComponent(course)}&lesson=${lessonNumber}&session_token=${token}`;
      let loadTimer = null;
      const clearTimer = () => {
        if (loadTimer) {
          clearTimeout(loadTimer);
          loadTimer = null;
        }
      };
      const markLoaded = () => {
        clearTimer();
        if (noteEl) {
          noteEl.textContent = "";
        }
      };
      const markFailed = () => {
        clearTimer();
        if (noteEl) {
          noteEl.textContent = "Failed to load presentation.";
        }
      };
      frameEl.addEventListener("load", markLoaded, { once: true });
      frameEl.addEventListener("error", markFailed, { once: true });
      loadTimer = setTimeout(markFailed, 12000);
      frameEl.src = `${src}#toolbar=0&navpanes=0&scrollbar=0`;
    })();
  }

  presentationPage.addEventListener("contextmenu", (event) => {
    event.preventDefault();
  });
  presentationPage.addEventListener("copy", (event) => {
    event.preventDefault();
  });
  presentationPage.addEventListener("cut", (event) => {
    event.preventDefault();
  });
  presentationPage.addEventListener("selectstart", (event) => {
    event.preventDefault();
  });
  presentationPage.addEventListener("dragstart", (event) => {
    event.preventDefault();
  });
  presentationPage.addEventListener("keydown", (event) => {
    const key = event.key.toLowerCase();
    const isModifier = event.ctrlKey || event.metaKey;
    if (isModifier && ["s", "p", "c", "x", "a", "u"].includes(key)) {
      event.preventDefault();
    }
    if (isModifier && event.shiftKey && ["i", "j", "c"].includes(key)) {
      event.preventDefault();
    }
    if (event.key === "F12") {
      event.preventDefault();
    }
  });
}

const tasksPage = document.querySelector("[data-tasks-page]");
if (tasksPage) {
  if (tasksPage.dataset.quizInitialized === "1") {
    // Guard against duplicate script execution attaching duplicate handlers.
  } else {
    tasksPage.dataset.quizInitialized = "1";
  const params = new URLSearchParams(window.location.search);
  const course = (params.get("course") || "a1").toLowerCase();
  const lessonNumber = Number(params.get("lesson")) || 1;
  (async () => {
    const hasAccess = await checkServerLessonAccess(course, lessonNumber);
    if (!hasAccess) {
      window.location.href = `${course}.html`;
      return;
    }

  const courseLessons = LESSONS_BY_COURSE[course] || a1Lessons;
  const lessonData = courseLessons[lessonNumber] || courseLessons[1] || a1Lessons[1];

  const titleEl = document.getElementById("tasks-title");
  const descriptionEl = document.getElementById("tasks-description");
  const openLessonBtn = document.getElementById("tasks-open-lesson-btn");
  const backBtn = document.getElementById("tasks-back-btn");
  const defaultCard = document.getElementById("tasks-default-card");
  const homeworkReadyCard = document.getElementById("homework-ready-card");
  const homeworkReadyTitle = document.getElementById("homework-ready-title");
  const homeworkReadyText = document.getElementById("homework-ready-text");
  const homeworkReadyRetakeBtn = document.getElementById("homework-ready-retake");

  const quizCard = document.getElementById("alphabet-quiz-card");
  const quizLessonTitle = document.getElementById("quiz-lesson-title");
  const quizOpenLessonBtn = document.getElementById("quiz-open-lesson-btn");
  const quizTaskNumber = document.getElementById("quiz-task-number");
  const quizQuestion = document.getElementById("quiz-question");
  const quizOptions = document.getElementById("quiz-options");
  const quizCheckBtn = document.getElementById("quiz-check-btn");
  const quizStatus = document.getElementById("quiz-status");
  const quizPrevBtn = document.getElementById("quiz-prev-btn");
  const quizNextBtn = document.getElementById("quiz-next-btn");
  const quizExplainBtn = document.getElementById("quiz-explain-btn");
  const quizCounter = document.getElementById("quiz-counter");
  const quizFinalResult = document.getElementById("quiz-final-result");
  const quizRetryModal = document.getElementById("quiz-retry-modal");
  const quizModalRetryBtn = document.getElementById("quiz-modal-retry-btn");
  const quizModalTheoryBtn = document.getElementById("quiz-modal-theory-btn");
  const quizExplainModal = document.getElementById("quiz-explain-modal");
  const quizExplainCloseBtn = document.getElementById("quiz-explain-close");
  const quizExplainQuestion = document.getElementById("quiz-explain-question");
  const quizExplainText = document.getElementById("quiz-explain-text");
  const quizExplainOptions = document.querySelectorAll(".quiz-explain-option");
  const quizExplainLangWrap = document.getElementById("quiz-explain-lang");
  const quizExplainLangTrigger = document.getElementById("quiz-explain-lang-trigger");
  const quizExplainLangValue = document.getElementById("quiz-explain-lang-value");
  const quizExplainLangFlag = document.getElementById("quiz-explain-lang-flag");
  const quizExplainLangList = document.getElementById("quiz-explain-lang-list");
  const quizExplainLangItems = document.querySelectorAll(".quiz-explain-lang-item");
  const quizExplainNote = document.getElementById("quiz-explain-note");
  const homeworkModal = document.getElementById("homework-modal");
  const homeworkCloseBtn = document.getElementById("homework-close");
  const homeworkTitle = document.getElementById("homework-title");
  const homeworkSubtitle = document.getElementById("homework-subtitle");
  const homeworkList = document.getElementById("homework-list");
  const homeworkText = document.getElementById("homework-text");
  const homeworkFile = document.getElementById("homework-file");
  const homeworkUploadBtn = document.getElementById("homework-upload-btn");
  const homeworkBackBtn = document.getElementById("homework-back-btn");
  const homeworkStatus = document.getElementById("homework-status");
  const homeworkNote = document.getElementById("homework-note");
  const goToLessonPage = () => {
    window.location.href = `lesson.html?course=${course}&lesson=${lessonNumber}`;
  };

  if (titleEl) {
    titleEl.textContent = `Tasks: Lesson ${lessonNumber}`;
  }

  if (descriptionEl) {
    descriptionEl.textContent = `Practice tasks for "${lessonData.title.replace("Theme: ", "")}".`;
  }

  if (openLessonBtn) {
    openLessonBtn.href = `lesson.html?course=${course}&lesson=${lessonNumber}`;
  }

  if (backBtn) {
    backBtn.href = `${course}.html`;
  }

  const DEFAULT_HOMEWORK_TASKS = [
    {
      title: "Vocabulary focus",
      detail: "Pick 12 new words/phrases from the lesson, add translations, and write 1 short example for each.",
    },
    {
      title: "Grammar in action",
      detail: "Write 8 sentences using the new grammar. At least 3 must be questions.",
    },
    {
      title: "Speaking: 90 seconds",
      detail: "Record a 60-90 second audio on the lesson topic. Use at least 5 new words.",
    },
    {
      title: "Writing: mini story",
      detail: "Write 80-100 words on the topic. Watch tenses and linking words.",
    },
    {
      title: "Self-check",
      detail: "Create 5 questions about the topic and answer them.",
    },
  ];

  const HOMEWORK_MAX_BYTES = 10 * 1024 * 1024;
  const HOMEWORK_ALLOWED_EXTENSIONS = new Set([
    ".pdf",
    ".doc",
    ".docx",
    ".jpg",
    ".jpeg",
    ".png",
    ".mp3",
    ".m4a",
    ".wav",
  ]);

  const normalizeHomeworkTasks = (rawTasks) => {
    if (!Array.isArray(rawTasks) || rawTasks.length === 0) {
      return DEFAULT_HOMEWORK_TASKS;
    }
    return rawTasks.map((item, index) => {
    const fallbackTitle = `Task ${index + 1}`;
      if (typeof item === "string") {
        return { title: fallbackTitle, detail: item };
      }
      if (!item || typeof item !== "object") {
        return { title: fallbackTitle, detail: "" };
      }
      const title = String(item.title || item.name || item.label || fallbackTitle).trim();
      const detail = String(item.detail || item.text || item.description || "").trim();
      return { title: title || fallbackTitle, detail };
    });
  };

  const renderHomework = () => {
    if (!homeworkTitle && !homeworkSubtitle && !homeworkList) {
      return;
    }
    setHomeworkStatus("");
    const lessonLabel = String(lessonData?.title || "")
      .replace("Theme: ", "")
      .trim();
    if (homeworkTitle) {
      homeworkTitle.textContent = `Homework: Lesson ${lessonNumber}`;
    }
    if (homeworkSubtitle) {
      homeworkSubtitle.textContent = lessonLabel
        ? `Topic: ${lessonLabel}. Complete the tasks and submit them for review.`
        : "Complete the tasks and submit them for review.";
    }
    if (homeworkBackBtn) {
      homeworkBackBtn.href = `${course}.html`;
    }
    if (homeworkNote) {
      homeworkNote.textContent =
        "Submit your text and, if needed, a file. A mentor or AI will review it.";
    }
    if (!homeworkList) {
      return;
    }
    homeworkList.innerHTML = "";
    const tasks = normalizeHomeworkTasks(lessonData?.homework);
    tasks.forEach((task, index) => {
      const item = document.createElement("div");
      item.className = "homework-item";

      const itemIndex = document.createElement("div");
      itemIndex.className = "homework-item-index";
      itemIndex.textContent = String(index + 1);

      const textWrap = document.createElement("div");
      const titleEl = document.createElement("p");
      titleEl.className = "homework-item-title";
      titleEl.textContent = task.title || `Task ${index + 1}`;

      const detailEl = document.createElement("p");
      detailEl.className = "homework-item-desc";
      detailEl.textContent = task.detail || "";

      textWrap.appendChild(titleEl);
      textWrap.appendChild(detailEl);
      item.appendChild(itemIndex);
      item.appendChild(textWrap);
      homeworkList.appendChild(item);
    });
  };

  const openHomeworkModal = () => {
    if (!homeworkModal) {
      return;
    }
    renderHomework();
    homeworkModal.classList.add("is-open");
    homeworkModal.setAttribute("aria-hidden", "false");
  };

  const closeHomeworkModal = () => {
    if (!homeworkModal) {
      return;
    }
    homeworkModal.classList.remove("is-open");
    homeworkModal.setAttribute("aria-hidden", "true");
  };

  const setHomeworkStatus = (message, tone = "") => {
    if (!homeworkStatus) {
      return;
    }
    homeworkStatus.textContent = message || "";
    homeworkStatus.classList.remove("is-success", "is-error");
    if (tone === "success") {
      homeworkStatus.classList.add("is-success");
    } else if (tone === "error") {
      homeworkStatus.classList.add("is-error");
    }
  };

  const getHomeworkFileExtension = (name) => {
    const raw = String(name || "").trim().toLowerCase();
    if (!raw || !raw.includes(".")) {
      return "";
    }
    return `.${raw.split(".").pop()}`;
  };

  const readFileAsDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error("file_read_error"));
      reader.readAsDataURL(file);
    });

  const submitHomework = async () => {
    const username = getAuthUser();
    if (!username) {
      setHomeworkStatus("Please log in to submit homework.", "error");
      return;
    }

    const textValue = String(homeworkText?.value || "").trim();
    if (!textValue) {
      setHomeworkStatus("Please add your homework text.", "error");
      return;
    }

    let filePayload = {};
    const file = homeworkFile && homeworkFile.files ? homeworkFile.files[0] : null;
    if (file) {
      if (file.size > HOMEWORK_MAX_BYTES) {
        setHomeworkStatus("File is too large. Max 10 MB.", "error");
        return;
      }
      const extension = getHomeworkFileExtension(file.name);
      if (extension && !HOMEWORK_ALLOWED_EXTENSIONS.has(extension)) {
        setHomeworkStatus("This file format is not supported.", "error");
        return;
      }
      try {
        const dataUrl = await readFileAsDataUrl(file);
        filePayload = {
          file_name: file.name,
          file_type: file.type || "",
          file_data: dataUrl,
        };
      } catch (error) {
        setHomeworkStatus("Could not read the file.", "error");
        return;
      }
    }

    if (homeworkUploadBtn) {
      homeworkUploadBtn.disabled = true;
      homeworkUploadBtn.textContent = "Sending...";
    }
    setHomeworkStatus("Sending homework...");

    try {
      const response = await fetch(`${API_BASE_URL}/api/homework/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          course,
          lesson_number: lessonNumber,
          text: textValue,
          ...filePayload,
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setHomeworkStatus(payload.error || "Could not submit homework.", "error");
        return;
      }

      setHomeworkStatus("Homework sent! We will review it soon.", "success");
      if (homeworkText) {
        homeworkText.value = "";
      }
      if (homeworkFile) {
        homeworkFile.value = "";
      }
    } catch (error) {
      setHomeworkStatus("Auth server is not running.", "error");
    } finally {
      if (homeworkUploadBtn) {
        homeworkUploadBtn.disabled = false;
        homeworkUploadBtn.textContent = "Submit homework";
      }
    }
  };

  if (homeworkCloseBtn) {
    homeworkCloseBtn.addEventListener("click", () => {
      goToLessonPage();
    });
  }

  if (homeworkModal) {
    homeworkModal.addEventListener("click", (event) => {
      if (event.target === homeworkModal) {
        closeHomeworkModal();
      }
    });
  }

  if (homeworkUploadBtn) {
    homeworkUploadBtn.addEventListener("click", () => {
      void submitHomework();
    });
  }

  if (homeworkReadyRetakeBtn) {
    homeworkReadyRetakeBtn.addEventListener("click", () => {
      if (homeworkReadyCard) {
        homeworkReadyCard.hidden = true;
      }
      if (quizCard) {
        quizCard.hidden = false;
      }
      if (typeof resetQuizState === "function") {
        resetQuizState();
      }
      renderQuestion();
    });
  }

  renderHomework();

  const saveLessonCompletion = async (targetStatusEl = null, taskKey = "lesson_completed") => {
    const username = getAuthUser();
    if (!username) {
      if (targetStatusEl) {
        targetStatusEl.textContent = "Login required to save lesson progress.";
      }
      return false;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/task/complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          course,
          lesson_number: lessonNumber,
          task_key: taskKey,
        }),
      });

      if (!response.ok) {
        if (targetStatusEl) {
          targetStatusEl.textContent = "Could not save lesson progress.";
        }
        return false;
      }

      if (targetStatusEl) {
        targetStatusEl.textContent = "Lesson marked as completed.";
      }
      void checkAchievementsForUser(username, { notify: true, suppressIfNoCache: false });
      return true;
    } catch (error) {
      if (targetStatusEl) {
        targetStatusEl.textContent = "Auth server is not running.";
      }
      return false;
    }
  };

  const fetchQuizQuestions = async (targetCourse, targetLesson) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/quiz/questions?course=${encodeURIComponent(targetCourse)}&lesson=${encodeURIComponent(
          targetLesson
        )}`
      );
      if (!response.ok) {
        return [];
      }
      const payload = await response.json();
      if (!payload || !Array.isArray(payload.questions)) {
        return [];
      }
      return payload.questions;
    } catch (error) {
      return [];
    }
  };

  const fetchQuizStatus = async (targetCourse, targetLesson) => {
    const username = getAuthUser();
    if (!username) {
      return { has_attempt: false };
    }
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/quiz/status?username=${encodeURIComponent(username)}&course=${encodeURIComponent(
          targetCourse
        )}&lesson=${encodeURIComponent(targetLesson)}`
      );
      if (!response.ok) {
        return { has_attempt: false };
      }
      const payload = await response.json();
      if (!payload || typeof payload !== "object") {
        return { has_attempt: false };
      }
      return payload;
    } catch (error) {
      return { has_attempt: false };
    }
  };

  const loadedQuestions = await fetchQuizQuestions(course, lessonNumber);
  const hasQuiz = loadedQuestions.length > 0;
  const quizStatusPayload = hasQuiz ? await fetchQuizStatus(course, lessonNumber) : { has_attempt: false };
  const hasQuizAttempt = !!(quizStatusPayload && quizStatusPayload.has_attempt);
  const openParam = params.get("open") || "";
  const openHomeworkOnly = openParam.toLowerCase() === "homework";

  if (!hasQuiz) {
    if (quizCard) {
      quizCard.hidden = true;
    }
    if (defaultCard) {
      defaultCard.hidden = false;
    }
    if (homeworkReadyCard) {
      homeworkReadyCard.hidden = true;
    }
    return;
  }

  if (defaultCard) {
    defaultCard.hidden = true;
  }
  if (quizCard) {
    quizCard.hidden = hasQuizAttempt && !!homeworkReadyCard && openHomeworkOnly;
  }
  if (homeworkReadyCard) {
    homeworkReadyCard.hidden = !(hasQuizAttempt && openHomeworkOnly);
  }
  if (hasQuizAttempt && openHomeworkOnly) {
    const lessonLabel = String(lessonData?.title || "").replace("Theme: ", "").trim();
    if (homeworkReadyTitle) {
      homeworkReadyTitle.textContent = `Homework: Lesson ${lessonNumber}`;
    }
    if (homeworkReadyText) {
      homeworkReadyText.textContent = lessonLabel
        ? `You already took the quiz on "${lessonLabel}". You can retake it or open homework from the lesson page.`
        : "You already took this quiz. You can retake it or open homework from the lesson page.";
    }
  }

  if (openHomeworkOnly && (!hasQuiz || hasQuizAttempt)) {
    openHomeworkModal();
  }
  if (quizLessonTitle) {
    quizLessonTitle.textContent = `${lessonData.title.replace("Theme: ", "")} - Tests`;
  }
  if (quizOpenLessonBtn) {
    quizOpenLessonBtn.href = `lesson.html?course=${course}&lesson=${lessonNumber}`;
  }
  if (quizModalTheoryBtn) {
    quizModalTheoryBtn.href = `lesson.html?course=${course}&lesson=${lessonNumber}`;
  }

  quizQuestions = loadedQuestions;

    const state = {
      currentIndex: 0,
      answers: {},
      checked: {},
      solved: {},
      firstAttemptLogged: {},
      firstAttempts: {},
      explanationUnlocked: {},
      isSubmitted: false,
    };
    const validQuestionIds = new Set(quizQuestions.map((item) => Number(item.id)));
    const getQuizStateStorageKey = () => {
      const username = getAuthUser() || "guest";
      return `ewms_quiz_state:${course}:${lessonNumber}:${username}`;
    };
    const sanitizeOptionMap = (source) => {
      const result = {};
      if (!source || typeof source !== "object") {
        return result;
      }
      Object.entries(source).forEach(([key, value]) => {
        const qid = Number(key);
        const option = String(value || "").trim().toUpperCase();
        if (
          validQuestionIds.has(qid) &&
          (option === "A" || option === "B" || option === "C" || option === "D")
        ) {
          result[qid] = option;
        }
      });
      return result;
    };
    const sanitizeBooleanMap = (source) => {
      const result = {};
      if (!source || typeof source !== "object") {
        return result;
      }
      Object.entries(source).forEach(([key, value]) => {
        const qid = Number(key);
        if (validQuestionIds.has(qid) && !!value) {
          result[qid] = true;
        }
      });
      return result;
    };
    const persistQuizState = () => {
      try {
        if (state.isSubmitted) {
          sessionStorage.removeItem(getQuizStateStorageKey());
          return;
        }
        sessionStorage.setItem(
          getQuizStateStorageKey(),
          JSON.stringify({
            currentIndex: state.currentIndex,
            answers: state.answers,
            checked: state.checked,
            solved: state.solved,
            firstAttemptLogged: state.firstAttemptLogged,
            firstAttempts: state.firstAttempts,
            explanationUnlocked: state.explanationUnlocked,
          })
        );
      } catch (error) {
        // Ignore storage failures.
      }
    };
    const restoreQuizState = () => {
      try {
        const raw = sessionStorage.getItem(getQuizStateStorageKey());
        if (!raw) {
          return;
        }
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== "object") {
          return;
        }
        const total = quizQuestions.length;
        const idx = Number(parsed.currentIndex);
        if (Number.isInteger(idx) && idx >= 0 && idx < total) {
          state.currentIndex = idx;
        }
        state.answers = sanitizeOptionMap(parsed.answers);
        state.firstAttempts = sanitizeOptionMap(parsed.firstAttempts);
        state.checked = sanitizeBooleanMap(parsed.checked);
        state.solved = sanitizeBooleanMap(parsed.solved);
        state.firstAttemptLogged = sanitizeBooleanMap(parsed.firstAttemptLogged);
        state.explanationUnlocked = sanitizeBooleanMap(parsed.explanationUnlocked);
      } catch (error) {
        // Ignore invalid persisted payloads.
      }
    };

    const resetQuizState = () => {
      state.currentIndex = 0;
      state.answers = {};
      state.checked = {};
      state.solved = {};
      state.firstAttemptLogged = {};
      state.firstAttempts = {};
      state.explanationUnlocked = {};
      state.isSubmitted = false;
      try {
        sessionStorage.removeItem(getQuizStateStorageKey());
      } catch (error) {
        // Ignore storage failures.
      }
    };

    const openRetryModal = () => {
      if (!quizRetryModal) {
        return;
      }
      quizRetryModal.classList.add("is-open");
      quizRetryModal.setAttribute("aria-hidden", "false");
    };

    const closeRetryModal = () => {
      if (!quizRetryModal) {
        return;
      }
      quizRetryModal.classList.remove("is-open");
      quizRetryModal.setAttribute("aria-hidden", "true");
    };

    const openExplainModal = () => {
      if (!quizExplainModal) {
        return;
      }
      quizExplainModal.classList.add("is-open");
      quizExplainModal.setAttribute("aria-hidden", "false");
    };

    const closeExplainModal = () => {
      if (!quizExplainModal) {
        return;
      }
      quizExplainModal.classList.remove("is-open");
      quizExplainModal.setAttribute("aria-hidden", "true");
      closeExplainLangList();
    };

    const getQuestionExplanation = (question) => {
      if (!question || typeof question !== "object") {
        return "Review the rule and choose the option that fits.";
      }
      const explicit = typeof question.explanation === "string" ? question.explanation.trim() : "";
      if (explicit) {
        return explicit;
      }
      return "Review the rule and choose the option that fits.";
    };

    const explainLangLabels = {
      en: "Eng",
      ru: "Rus",
      uz: "Uzb",
    };

    const explainLangFlagClasses = {
      en: "lang-flag--eng",
      ru: "lang-flag--rus",
      uz: "lang-flag--uzb",
    };

    const extractFirstSentence = (text) => {
      const trimmed = String(text || "").trim();
      if (!trimmed) {
        return "";
      }
      const match = trimmed.match(/^(.*?[.!?])\s/);
      return match ? match[1].trim() : trimmed;
    };

    const collectExplanationTranslations = (question) => {
      const translations = {};
      if (!question || typeof question !== "object") {
        return translations;
      }
      const raw = question.explanation_translations;
      if (raw && typeof raw === "object") {
        Object.entries(raw).forEach(([key, value]) => {
          const langKey = String(key || "").trim().toLowerCase();
          const langText = typeof value === "string" ? value.trim() : "";
          if (langKey && langText) {
            translations[langKey] = langText;
          }
        });
      }
      ["ru", "uz", "en"].forEach((langKey) => {
        const inline = typeof question[`explanation_${langKey}`] === "string" ? question[`explanation_${langKey}`].trim() : "";
        if (inline) {
          translations[langKey] = inline;
        }
      });
      return translations;
    };

    const supportedExplainLanguages = ["en", "ru", "uz"];

    const updateExplainLangTrigger = (lang) => {
      if (!quizExplainLangValue || !quizExplainLangFlag) {
        return;
      }
      const label = explainLangLabels[lang] || lang.toUpperCase();
      quizExplainLangValue.textContent = label;
      const flagClass = explainLangFlagClasses[lang];
      quizExplainLangFlag.className = `lang-flag ${flagClass || "lang-flag--eng"}`;
      if (quizExplainLangItems && quizExplainLangItems.length > 0) {
        quizExplainLangItems.forEach((item) => {
          const isActive = item.dataset.lang === lang;
          item.classList.toggle("is-active", isActive);
          item.setAttribute("aria-selected", isActive ? "true" : "false");
        });
      }
    };

    let activeExplainQuestion = null;
    let activeExplainMode = "main";
    let activeExplainLang = "";

    const updateExplainButtons = (mode) => {
      if (!quizExplainOptions || quizExplainOptions.length === 0) {
        return;
      }
      quizExplainOptions.forEach((button) => {
        button.classList.toggle("is-active", button.dataset.explainMode === mode);
      });
    };

    const closeExplainLangList = () => {
      if (!quizExplainLangList || !quizExplainLangTrigger) {
        return;
      }
      quizExplainLangList.classList.remove("is-open");
      quizExplainLangTrigger.setAttribute("aria-expanded", "false");
    };

    const toggleExplainLangList = () => {
      if (!quizExplainLangList || !quizExplainLangTrigger) {
        return;
      }
      const isOpen = quizExplainLangList.classList.toggle("is-open");
      quizExplainLangTrigger.setAttribute("aria-expanded", isOpen ? "true" : "false");
    };

    const setExplainMode = (question, mode, lang = "") => {
      if (!question) {
        return;
      }
      activeExplainQuestion = question;
      activeExplainMode = mode;

      const baseText = getQuestionExplanation(question);
      let displayText = baseText;
      let noteText = "";

      if (mode === "simple") {
        const simple = typeof question.explanation_simple === "string" ? question.explanation_simple.trim() : "";
        if (simple) {
          displayText = simple;
          noteText = "Упрощённая версия. / Soddalashtirilgan variant.";
        } else {
          const shorter = extractFirstSentence(baseText);
          displayText = shorter || baseText;
          noteText =
            shorter && shorter !== baseText
              ? "Короткая версия из основного объяснения. / Asosiy izohdan qisqa variant."
              : "Это самый простой вариант. / Eng sodda variant.";
        }
      } else if (mode === "detailed") {
        const detailed = typeof question.explanation_detailed === "string" ? question.explanation_detailed.trim() : "";
        if (detailed) {
          displayText = detailed;
          noteText = "Подробная версия. / Batafsil versiya.";
        } else {
          displayText = baseText;
          noteText = "Пока нет деталей. Показано основное объяснение. / Hozircha tafsilot yo'q.";
        }
      } else if (mode === "language") {
        const translations = collectExplanationTranslations(question);
        if (!translations.en) {
          translations.en = baseText;
        }
        const resolvedLang = supportedExplainLanguages.includes(lang) ? lang : activeExplainLang || "en";
        activeExplainLang = resolvedLang;
        const resolvedText = translations[resolvedLang];
        if (resolvedText) {
          displayText = resolvedText;
          const label = explainLangLabels[resolvedLang] || resolvedLang.toUpperCase();
          noteText = `Язык: ${label}. / Til: ${label}.`;
        } else {
          displayText = baseText;
          noteText = "Перевод пока не готов. / Tarjima hali tayyor emas.";
        }
        updateExplainLangTrigger(resolvedLang);
      }

      if (quizExplainText) {
        quizExplainText.textContent = displayText;
      }
      if (quizExplainNote) {
        quizExplainNote.textContent = noteText;
      }
      if (quizExplainLangWrap) {
        quizExplainLangWrap.hidden = mode !== "language";
      }
      updateExplainButtons(mode);
    };

    const updateQuizNavState = () => {
      const total = quizQuestions.length;
      const current = quizQuestions[state.currentIndex];
      const selected = state.answers[current.id] || "";
      const isChecked = !!state.checked[current.id];
      const isSolved = !!state.solved[current.id];

      if (quizPrevBtn) {
        quizPrevBtn.disabled = state.currentIndex === 0 || state.isSubmitted;
      }
      if (quizNextBtn) {
        const isLast = state.currentIndex === total - 1;
        const isCurrentSolved = !!(isSolved || (selected && isChecked && selected === current.correct));
        quizNextBtn.textContent = isLast ? "Finish & Save" : "Next";
        quizNextBtn.disabled = state.isSubmitted || !isCurrentSolved;
      }
      if (quizExplainBtn) {
        const hasExplanation = !!getQuestionExplanation(current);
        const isUnlocked = !!state.explanationUnlocked[current.id];
        const canExplain = !state.isSubmitted && (isUnlocked || isChecked || isSolved) && hasExplanation;
        quizExplainBtn.disabled = !canExplain;
      }
      if (quizCheckBtn) {
        quizCheckBtn.disabled = state.isSubmitted;
      }
    };

    const syncCurrentQuestionState = () => {
      const current = quizQuestions[state.currentIndex];
      const selected = state.answers[current.id] || "";
      const isChecked = !!state.checked[current.id];
      const isSolved = !!state.solved[current.id];

      if (quizStatus) {
        if (isSolved) {
          quizStatus.textContent = "Correct answer.";
          quizStatus.className = "quiz-status is-correct";
        } else if (!isChecked) {
          quizStatus.textContent = "";
          quizStatus.className = "quiz-status";
        } else if (!selected) {
          quizStatus.textContent = "Choose an option first.";
          quizStatus.className = "quiz-status is-warning";
        } else if (selected === current.correct) {
          quizStatus.textContent = "Correct answer.";
          quizStatus.className = "quiz-status is-correct";
        } else {
          quizStatus.textContent = "Incorrect answer.";
          quizStatus.className = "quiz-status is-wrong";
        }
      }

      if (quizOptions) {
        const optionButtons = quizOptions.querySelectorAll(".quiz-option");
        optionButtons.forEach((button) => {
          const optionKey = button.dataset.option || "";
          button.classList.remove("is-selected", "is-correct", "is-wrong");
          if (selected === optionKey) {
            button.classList.add("is-selected");
          }
          if (isSolved && optionKey === selected) {
            button.classList.add("is-correct");
          } else if (isChecked) {
            if (optionKey === selected && selected === current.correct) {
              button.classList.add("is-correct");
            } else if (optionKey === selected && selected !== current.correct) {
              button.classList.add("is-wrong");
            }
          }
        });
      }

      updateQuizNavState();
      persistQuizState();
    };

    const renderQuestion = () => {
      const total = quizQuestions.length;
      const current = quizQuestions[state.currentIndex];

      if (quizTaskNumber) {
        quizTaskNumber.textContent = `Task #${state.currentIndex + 1}`;
      }
      if (quizQuestion) {
        quizQuestion.textContent = current.question;
      }
      if (quizCounter) {
        quizCounter.textContent = `${state.currentIndex + 1} / ${total}`;
      }

      closeExplainModal();
      activeExplainQuestion = null;
      activeExplainMode = "main";
      activeExplainLang = "";
      if (quizExplainNote) {
        quizExplainNote.textContent = "";
      }
      if (quizExplainLangWrap) {
        quizExplainLangWrap.hidden = true;
      }
      updateExplainButtons("main");
      updateExplainLangTrigger("en");
      closeExplainLangList();

      if (quizOptions) {
        quizOptions.innerHTML = "";
        Object.entries(current.options).forEach(([key, value]) => {
          const optionButton = document.createElement("button");
          optionButton.type = "button";
          optionButton.className = "quiz-option";
          optionButton.dataset.option = key;
          optionButton.innerHTML = `<span class="quiz-option-key">${key}</span><span>${value}</span>`;
          optionButton.addEventListener("click", () => {
            if (state.isSubmitted) {
              return;
            }
            if (state.solved[current.id]) {
              return;
            }
            state.answers[current.id] = key;
            state.checked[current.id] = false;
            closeRetryModal();
            syncCurrentQuestionState();
          });
          quizOptions.appendChild(optionButton);
        });
      }

      syncCurrentQuestionState();
    };

    const checkCurrentAnswer = () => {
      const current = quizQuestions[state.currentIndex];
      const selected = state.answers[current.id];
      if (!quizStatus) {
        return !!selected;
      }

      if (!selected) {
        quizStatus.textContent = "Choose an option first.";
        quizStatus.className = "quiz-status is-warning";
        return false;
      }
      if (state.checked[current.id]) {
        return true;
      }

      if (!state.firstAttemptLogged[current.id]) {
        state.firstAttemptLogged[current.id] = true;
        state.firstAttempts[current.id] = selected;
      }

      state.checked[current.id] = true;
      state.explanationUnlocked[current.id] = true;

      if (selected === current.correct) {
        state.solved[current.id] = true;
        quizStatus.textContent = "Correct answer.";
        quizStatus.className = "quiz-status is-correct";
        closeRetryModal();
      } else {
        state.solved[current.id] = false;
        quizStatus.textContent = "Incorrect answer.";
        quizStatus.className = "quiz-status is-wrong";
        openRetryModal();
      }
      syncCurrentQuestionState();

      return true;
    };

    const submitQuiz = async () => {
      const username = getAuthUser();
      if (!username) {
        if (quizFinalResult) {
          quizFinalResult.textContent = "Login required to save result in database.";
        }
        openHomeworkModal();
        return;
      }

      const answers = quizQuestions.map((item) => ({
        question_id: item.id,
        selected_option: state.answers[item.id] || "",
      }));
      const firstAttempts = Object.entries(state.firstAttempts).map(([questionId, selectedOption]) => ({
        question_id: Number(questionId),
        selected_option: selectedOption,
      }));

      try {
        const response = await fetch(`${API_BASE_URL}/api/quiz/submit`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username,
            course,
            lesson_number: lessonNumber,
            answers,
            first_attempts: firstAttempts,
          }),
        });

        if (!response.ok) {
          if (quizFinalResult) {
            quizFinalResult.textContent = "Could not save quiz result.";
          }
          openHomeworkModal();
          return;
        }

        const result = await response.json();
        state.isSubmitted = true;
        persistQuizState();
        try {
          sessionStorage.removeItem(getQuizStateStorageKey());
        } catch (error) {
          // Ignore storage failures.
        }
        const saved = await saveLessonCompletion(null, "lesson_completed");
        if (saved) {
          markLessonCompletedLocal(course, lessonNumber);
        }
        if (!saved) {
          void checkAchievementsForUser(username, { notify: true, suppressIfNoCache: false });
        }
        if (quizFinalResult) {
          quizFinalResult.textContent = `Saved: ${result.correct_answers}/${result.total_questions} correct.`;
        }
        renderQuestion();
        openHomeworkModal();
      } catch (error) {
        if (quizFinalResult) {
          quizFinalResult.textContent = "Auth server is not running.";
        }
        openHomeworkModal();
      }
    };

    if (quizCheckBtn) {
      quizCheckBtn.addEventListener("click", () => {
        checkCurrentAnswer();
      });
    }

    if (quizPrevBtn) {
      quizPrevBtn.addEventListener("click", () => {
        if (state.currentIndex > 0) {
          state.currentIndex -= 1;
          renderQuestion();
        }
      });
    }

    if (quizNextBtn) {
      quizNextBtn.addEventListener("click", async () => {
        const total = quizQuestions.length;
        const isLast = state.currentIndex === total - 1;

        if (!isLast) {
          state.currentIndex += 1;
          renderQuestion();
          return;
        }

        const unanswered = quizQuestions.filter((item) => !state.answers[item.id]).length;
        if (unanswered > 0) {
          if (quizFinalResult) {
            quizFinalResult.textContent = `Answer all questions first. Remaining: ${unanswered}.`;
          }
          return;
        }

        await submitQuiz();
      });
    }

    if (quizExplainBtn) {
      quizExplainBtn.addEventListener("click", () => {
        const current = quizQuestions[state.currentIndex];
        if (!current) {
          return;
        }
        if (!state.checked[current.id] && !state.solved[current.id] && !state.explanationUnlocked[current.id]) {
          return;
        }
        if (quizExplainQuestion) {
          quizExplainQuestion.textContent = current.question || "";
        }
        setExplainMode(current, "main");
        openExplainModal();
      });
    }

    if (quizExplainOptions && quizExplainOptions.length > 0) {
      quizExplainOptions.forEach((button) => {
        button.addEventListener("click", () => {
          if (!activeExplainQuestion) {
            return;
          }
          const mode = button.dataset.explainMode || "main";
          const lang = mode === "language" ? activeExplainLang : "";
          setExplainMode(activeExplainQuestion, mode, lang);
        });
      });
    }

    if (quizExplainLangTrigger) {
      quizExplainLangTrigger.addEventListener("click", (event) => {
        event.stopPropagation();
        toggleExplainLangList();
      });
    }

    if (quizExplainLangItems && quizExplainLangItems.length > 0) {
      quizExplainLangItems.forEach((item) => {
        item.addEventListener("click", (event) => {
          event.stopPropagation();
          if (!activeExplainQuestion) {
            return;
          }
          const selected = item.dataset.lang || "en";
          setExplainMode(activeExplainQuestion, "language", selected);
          closeExplainLangList();
        });
      });
    }

    document.addEventListener("click", (event) => {
      if (!quizExplainLangList || !quizExplainLangTrigger) {
        return;
      }
      if (!quizExplainLangList.classList.contains("is-open")) {
        return;
      }
      const target = event.target;
      if (quizExplainLangList.contains(target) || quizExplainLangTrigger.contains(target)) {
        return;
      }
      closeExplainLangList();
    });

    if (quizModalRetryBtn) {
      quizModalRetryBtn.addEventListener("click", () => {
        const current = quizQuestions[state.currentIndex];
        state.checked[current.id] = false;
        closeRetryModal();
        closeExplainModal();
        syncCurrentQuestionState();
      });
    }

    if (quizRetryModal) {
      quizRetryModal.addEventListener("click", (event) => {
        if (event.target === quizRetryModal) {
          closeRetryModal();
        }
      });
    }

    if (quizExplainCloseBtn) {
      quizExplainCloseBtn.addEventListener("click", () => {
        closeExplainModal();
      });
    }

    if (quizExplainModal) {
      quizExplainModal.addEventListener("click", (event) => {
        if (event.target === quizExplainModal) {
          closeExplainModal();
        }
      });
    }

    restoreQuizState();
    renderQuestion();
  })();
  }
}

const AUTH_STORAGE_KEY = "ewms_auth_state";
const LEGACY_AUTH_STORAGE_KEY = "ewms_auth_user";
const ENABLE_VIEW_PROGRESS = true;
const ENABLE_KNOWLEDGE_RESULT_SAVE = true;

const loginBtn = document.getElementById("login-btn");
const profileBtn = document.getElementById("profile-btn");
const adminPanelBtn = document.getElementById("admin-panel-btn");
const adminPanelBadge = document.getElementById("admin-panel-badge");
const headerGreeting = document.getElementById("header-greeting");
const loginModal = document.getElementById("login-modal");
const profileModal = document.getElementById("profile-modal");
const profileCloseBtn = document.getElementById("profile-close-btn");
const profileMentorAvatar = document.getElementById("profile-mentor-avatar");
const profileMentorName = document.getElementById("profile-mentor-name");
const profileMentorText = document.getElementById("profile-mentor-text");
const profileMentorContact = document.getElementById("profile-mentor-contact");
const profileLevel = document.getElementById("profile-level");
const profileProgress = document.getElementById("profile-progress");
const profileSubscriptionRemaining = document.getElementById("profile-subscription-remaining");
const profileAchievements = document.getElementById("profile-achievements");
const profileAchievementsProgress = document.getElementById("profile-achievements-progress");
const profileAchievementsBtn = document.getElementById("profile-achievements-btn");
const achievementsModal = document.getElementById("achievements-modal");
const achievementsCloseBtn = document.getElementById("achievements-close-btn");
const achievementsModalList = document.getElementById("achievements-modal-list");
const achievementsModalProgress = document.getElementById("achievements-modal-progress");
const achievementsLeaderboardBtn = document.getElementById("achievements-leaderboard-btn");
const leaderboardModal = document.getElementById("leaderboard-modal");
const leaderboardCloseBtn = document.getElementById("leaderboard-close-btn");
const leaderboardModalList = document.getElementById("leaderboard-modal-list");
const profileUpgradeBtn = document.getElementById("profile-upgrade-btn");
const profileLessonsCompleted = document.getElementById("profile-lessons-completed");
const profileNextUnlock = document.getElementById("profile-next-unlock");
const resultsTabs = document.querySelectorAll(".results-modal-tab[data-scroll-target]");
const resultsSection =
  document.querySelector(".results-modal-card-standalone") ||
  document.querySelector(".results-modal-card");
const adminProgressModalEl = document.getElementById("admin-progress-modal");
const adminRequestsModalEl = document.getElementById("admin-requests-modal");
const knowledgeTestOpenBtn = document.getElementById("knowledge-test-open-btn");
const knowledgeTestModal = document.getElementById("knowledge-test-modal");
const knowledgeTestCloseBtn = document.getElementById("knowledge-test-close-btn");
const knowledgeTestHelp = document.getElementById("knowledge-test-help");
const knowledgeTestProgress = document.getElementById("knowledge-test-progress");
const knowledgeTestQuestion = document.getElementById("knowledge-test-question");
const knowledgeTestOptions = document.getElementById("knowledge-test-options");
const knowledgeTestFeedback = document.getElementById("knowledge-test-feedback");
const knowledgeTestNextBtn = document.getElementById("knowledge-test-next-btn");
const knowledgeTestRestartBtn = document.getElementById("knowledge-test-restart-btn");
const upgradeOpenBtn = document.getElementById("upgrade-open-btn");
const upgradeModal = document.getElementById("upgrade-modal");
const upgradeCloseBtn = document.getElementById("upgrade-close-btn");
const resultsLearnBtn = document.querySelector(".results-learn-btn");
const resultsModal = document.getElementById("results-modal");
const resultsModalCloseBtn = document.getElementById("results-modal-close");
const upgradePlanPriceButtons = document.querySelectorAll(".upgrade-plan-price-btn");
const enrollModal = document.getElementById("enroll-modal");
const enrollCloseBtn = document.getElementById("enroll-close-btn");
const enrollCancelBtn = document.getElementById("enroll-cancel-btn");
const enrollForm = document.getElementById("enroll-form");
const enrollPlanNote = document.getElementById("enroll-plan-note");
const enrollFullName = document.getElementById("enroll-full-name");
const enrollPhone = document.getElementById("enroll-phone");
const enrollTelegram = document.getElementById("enroll-telegram");
const enrollSchedule = document.getElementById("enroll-schedule");
const enrollScheduleWrap = document.getElementById("enroll-schedule-wrap");
const enrollMessage = document.getElementById("enroll-message");
const enrollSuccessModal = document.getElementById("enroll-success-modal");
const enrollSuccessMenuBtn = document.getElementById("enroll-success-menu");
const legalSignupLinks = document.querySelectorAll(".js-open-upgrade");
const legalLoginLinks = document.querySelectorAll(".js-open-login");
let profileAchievementsCache = [];
const ACHIEVEMENT_MEDAL_ICON = "&#x1F3C5;";
const ACHIEVEMENT_LOCKED_ICON = "??";
const ACHIEVEMENT_TOAST_ICON = "&#x1F3C5;";
const escapeAchievementHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
const getAchievementKey = (item) => {
  const rawKey =
    item?.id ??
    item?.code ??
    item?.slug ??
    item?.key ??
    item?.title ??
    item?.title_ru ??
    "";
  return String(rawKey || "").trim().toLowerCase();
};
const getAchievementNotifyStorageKey = (username) =>
  `ewms_achievement_notify:${String(username || "").trim().toLowerCase()}`;
const loadAchievementNotifySet = (username) => {
  const key = getAchievementNotifyStorageKey(username);
  if (!key || key.endsWith(":")) {
    return { set: new Set(), hasStored: false };
  }
  const raw = localStorage.getItem(key);
  if (!raw) {
    return { set: new Set(), hasStored: false };
  }
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return { set: new Set(parsed.map((value) => String(value))), hasStored: true };
    }
  } catch (error) {
    // Ignore parse errors.
  }
  return { set: new Set(), hasStored: true };
};
const saveAchievementNotifySet = (username, values) => {
  const key = getAchievementNotifyStorageKey(username);
  if (!key || key.endsWith(":")) {
    return;
  }
  try {
    localStorage.setItem(key, JSON.stringify(Array.from(values)));
  } catch (error) {
    // Ignore storage errors.
  }
};
const getAchievementToastContainer = () => {
  let container = document.getElementById("achievement-toast-container");
  if (!container && document.body) {
    container = document.createElement("div");
    container.id = "achievement-toast-container";
    container.className = "achievement-toast-container";
    container.setAttribute("aria-live", "polite");
    container.setAttribute("aria-atomic", "false");
    document.body.appendChild(container);
  }
  return container;
};
const showAchievementToast = (item) => {
  const container = getAchievementToastContainer();
  if (!container) {
    return;
  }
  const title = escapeAchievementHtml(item?.title || item?.title_ru || "Achievement");
  const points = Number(item?.points) || 0;
  const pointsLabel = points ? `+${escapeAchievementHtml(points)} XP` : "";
  const toast = document.createElement("div");
  toast.className = "achievement-toast";
  toast.innerHTML = `
    <div class="achievement-toast-icon">${ACHIEVEMENT_TOAST_ICON}</div>
    <div class="achievement-toast-content">
      <div class="achievement-toast-title">Achievement unlocked</div>
      <div class="achievement-toast-text">${title}${
        pointsLabel ? ` <span class="achievement-toast-points">${pointsLabel}</span>` : ""
      }</div>
    </div>
  `;
  container.appendChild(toast);
  requestAnimationFrame(() => {
    toast.classList.add("is-visible");
  });
  const removeToast = () => {
    toast.classList.remove("is-visible");
    toast.addEventListener(
      "transitionend",
      () => {
        toast.remove();
      },
      { once: true }
    );
    setTimeout(() => {
      if (toast.isConnected) {
        toast.remove();
      }
    }, 700);
  };
  setTimeout(removeToast, 4200);
};
const updateAchievementNotifications = (username, achievements, options = {}) => {
  const safeUsername = String(username || "").trim();
  if (!safeUsername) {
    return;
  }
  const notify = options.notify !== false;
  const suppressIfNoCache = options.suppressIfNoCache !== false;
  const { set: existingSet, hasStored } = loadAchievementNotifySet(safeUsername);
  const nextSet = new Set(existingSet);
  const list = Array.isArray(achievements) ? achievements : [];
  let hasNew = false;
  list.forEach((item) => {
    if (!item || !item.earned) {
      return;
    }
    const key = getAchievementKey(item);
    if (!key) {
      return;
    }
    if (!nextSet.has(key)) {
      if (notify && (!suppressIfNoCache || hasStored || existingSet.size > 0)) {
        showAchievementToast(item);
      }
      nextSet.add(key);
      hasNew = true;
    }
  });
  if (hasNew || !hasStored || existingSet.size !== nextSet.size) {
    saveAchievementNotifySet(safeUsername, nextSet);
  }
};
const renderProfileAchievementsSummary = (achievements) => {
  const list = Array.isArray(achievements) ? achievements : [];
  profileAchievementsCache = list;
  const earnedItems = list.filter((item) => item && item.earned);
  const totalCount = list.length;
  const earnedCount = earnedItems.length;
  const percent = totalCount ? Math.round((earnedCount / totalCount) * 100) : 0;
  if (profileAchievementsProgress) {
    profileAchievementsProgress.textContent = totalCount ? `${percent}% completed` : "0% completed";
  }
  if (!profileAchievements) {
    return;
  }
  if (earnedItems.length === 0) {
    profileAchievements.textContent = "No achievements yet";
    return;
  }
  profileAchievements.innerHTML = earnedItems
    .map((item) => {
      const title = escapeAchievementHtml(item?.title || item?.title_ru || "");
      const icon = ACHIEVEMENT_MEDAL_ICON;
      const points = Number(item?.points) || 0;
      const pointsLabel = points ? ` +${escapeAchievementHtml(points)} XP` : "";
      return title ? `<span class="profile-achievement-pill">${icon} ${title}${pointsLabel}</span>` : "";
    })
    .filter(Boolean)
    .join("");
};
const updateAchievementsModalProgress = (achievements) => {
  if (!achievementsModalProgress) {
    return;
  }
  const list = Array.isArray(achievements) ? achievements : [];
  const total = list.length;
  const earned = list.filter((item) => item && item.earned).length;
  const percent = total ? Math.round((earned / total) * 100) : 0;
  achievementsModalProgress.textContent = total
    ? `Completed ${earned} of ${total} (${percent}%)`
    : "Completed 0%";
};
const syncAchievementsModal = (achievements) => {
  if (achievementsModal && achievementsModal.classList.contains("is-open")) {
    renderAchievementsModal(achievements);
    updateAchievementsModalProgress(achievements);
  }
};
const checkAchievementsForUser = async (username, options = {}) => {
  const safeUsername = String(username || "").trim();
  if (!safeUsername) {
    return;
  }
  try {
    await ensureApiBaseUrl();
    const response = await fetch(
      `${API_BASE_URL}/api/user/progress-summary?username=${encodeURIComponent(safeUsername)}`
    );
    if (!response.ok) {
      return;
    }
    const payload = await response.json();
    const achievements = Array.isArray(payload.achievements) ? payload.achievements : [];
    renderProfileAchievementsSummary(achievements);
    syncAchievementsModal(achievements);
    updateAchievementNotifications(safeUsername, achievements, options);
  } catch (error) {
    // Ignore notification errors.
  }
};
const termsOpenLinks = document.querySelectorAll('[data-legal-open="terms"]');
const privacyOpenLinks = document.querySelectorAll('[data-legal-open="privacy"]');
let termsModal = document.getElementById("terms-modal");
let termsCloseBtn = document.getElementById("terms-close-btn");
let privacyModal = document.getElementById("privacy-modal");
let privacyCloseBtn = document.getElementById("privacy-close-btn");
const loginForm = document.getElementById("login-form");
const loginCancel = document.getElementById("login-cancel");
const loginError = document.getElementById("login-error");
const loginUsername = document.getElementById("login-username");
const loginPassword = document.getElementById("login-password");
const loginShowPassword = document.getElementById("login-show-password");
let loginConsentCheckbox = document.getElementById("login-consent");
let enrollConsentCheckbox = document.getElementById("enroll-consent");
const loginSubmitBtn = loginForm ? loginForm.querySelector(".login-submit-btn") : null;
const enrollSubmitBtn = enrollForm ? enrollForm.querySelector(".enroll-submit-btn") : null;
let isEnrollSubmitting = false;

const ensureLegalUi = () => {
  const injectLegalText = (formEl, beforeEl = null, mode = "login") => {
    if (!formEl) {
      return;
    }
    const legacyAgree = formEl.querySelector(".legal-agree");
    if (legacyAgree) {
      legacyAgree.remove();
    }
    let signup = formEl.querySelector(".legal-signup");
    if (!signup) {
      signup = document.createElement("p");
      signup.className = "legal-signup";
    }
    if (mode === "login") {
      signup.innerHTML = `Don't have account ? <a href="#" class="legal-link js-open-upgrade">Sign up</a>`;
    } else {
      signup.innerHTML = `Already have an account? <a href="#" class="legal-link js-open-login">Login</a>`;
    }

    let agree = formEl.querySelector(".legal-consent-wrap");
    if (!agree) {
      agree = document.createElement("label");
      agree.className = "legal-consent-wrap";
    }
    if (mode === "login") {
      agree.htmlFor = "login-consent";
      agree.innerHTML = `<input id="login-consent" class="legal-consent-checkbox" type="checkbox">
        <span>I agree to
          <a href="#" class="legal-link" data-legal-open="terms">Terms and Conditions</a>
          and
          <a href="#" class="legal-link" data-legal-open="privacy">Privacy Policy</a>
        </span>`;
    } else {
      agree.htmlFor = "enroll-consent";
      agree.innerHTML = `<input id="enroll-consent" class="legal-consent-checkbox" type="checkbox">
        <span>I agree to
          <a href="#" class="legal-link" data-legal-open="terms">Terms and Conditions</a>
          and
          <a href="#" class="legal-link" data-legal-open="privacy">Privacy Policy</a>
        </span>`;
    }

    if (beforeEl && formEl.contains(beforeEl)) {
      formEl.insertBefore(signup, beforeEl);
      formEl.insertBefore(agree, beforeEl);
    } else {
      formEl.appendChild(signup);
      formEl.appendChild(agree);
    }
  };

  const loginErrorEl = loginForm ? loginForm.querySelector("#login-error") : null;
  const enrollMessageEl = enrollForm ? enrollForm.querySelector("#enroll-message") : null;
  injectLegalText(loginForm, loginErrorEl, "login");
  injectLegalText(enrollForm, enrollMessageEl, "enroll");

  if (!document.getElementById("terms-modal")) {
    const terms = document.createElement("div");
    terms.id = "terms-modal";
    terms.className = "legal-modal";
    terms.setAttribute("aria-hidden", "true");
    terms.innerHTML = `
      <div class="legal-modal-card" role="dialog" aria-modal="true" aria-labelledby="terms-title">
        <button type="button" id="terms-close-btn" class="legal-modal-close" aria-label="Close terms">&times;</button>
        <h3 id="terms-title">Terms and Conditions</h3>
        <pre class="legal-text">1. Platform Description
The Platform provides online courses for learning English, including:
Video lessons
Tests
Homework assignments
Live lessons
Chat with the instructor (Telegram Support)
Access to the Platform is provided via a monthly subscription.

2. Account Creation
Accounts are created only by administrators after payment. Users cannot create their own accounts.
Users must provide accurate information.
Sharing your account with others is strictly prohibited. Accounts may be terminated immediately if this rule is violated.

3. Use of Platform
Users may access courses and materials for personal educational use only.
Users may not copy, publish, distribute, or sell any content from the Platform. All intellectual property rights belong to the Platform.
The Platform may update courses, lessons, or assignments. Users will be notified of major changes via Telegram or Instagram.
We do not guarantee any specific level of English proficiency. Progress depends on individual effort.

4. Payment
Subscription is monthly and does not renew automatically. Users must purchase each month individually.
Payment is handled via Click, Payme, Uzum.
No refunds are provided under any circumstances, including account deletion.

5. Intellectual Property
All content on the Platform, including videos, tests, lessons, homework, and live sessions, is protected by intellectual property law.
Users may not copy, share, or distribute any materials from the Platform.

6. Privacy
We collect the following user data: name, email, phone number, and device information to ensure account security.
During use of the Platform, we track: lesson progress, test results, and homework completion.
Payment data is processed via Click, Payme, and Uzum.
Contact for privacy inquiries: englishwithmrsam@gmail.com

7. Termination
Users may request account deletion via email or Telegram, providing a reason.
Access to the Platform ends automatically after the subscription period expires.

8. Governing Law
These Terms are governed by the laws of the Republic of Uzbekistan.
Disputes will first be attempted to resolve via negotiation. If unresolved, disputes may be brought to the court where the owner is located.

9. Changes to Terms
We reserve the right to update these Terms at any time.
Major changes will be announced via Telegram and Instagram.
Continued use of the Platform after changes indicates acceptance of the new Terms.</pre>
      </div>
    `;
    document.body.appendChild(terms);
  }

  if (!document.getElementById("privacy-modal")) {
    const privacy = document.createElement("div");
    privacy.id = "privacy-modal";
    privacy.className = "legal-modal";
    privacy.setAttribute("aria-hidden", "true");
    privacy.innerHTML = `
      <div class="legal-modal-card" role="dialog" aria-modal="true" aria-labelledby="privacy-title">
        <button type="button" id="privacy-close-btn" class="legal-modal-close" aria-label="Close privacy policy">&times;</button>
        <h3 id="privacy-title">Privacy Policy</h3>
        <pre class="legal-text">Privacy Policy - English with Mr.Sam
Last Updated: [дата]
Welcome to English with Mr.Sam ("we," "our," or "us"), a platform operated by Sunnatullo Raxmatullaev's team. Your privacy is important to us. This Privacy Policy explains how we collect, use, store, and protect your information when you use our website and services (the "Platform"). By using our Platform, you agree to the terms outlined in this Privacy Policy.

1. Information We Collect
We may collect the following types of information:
1.1 Personal Information:
Name
Email address
Phone number
1.2 Device and Activity Information:
Devices used to access the Platform
Login activity, course progress, completed lessons, test results, and submitted assignments
1.3 Payment Information:
Payment data required to process course subscriptions through Click, Payme, and Uzum (handled by third-party payment processors)
1.4 User-Generated Content:
Any feedback, messages, or submissions provided within the Platform or to Telegram Support

2. How We Use Your Information
We use the collected information to:
Provide and maintain access to courses, lessons, tests, and assignments
Track course progress and performance
Communicate with users via email or Telegram regarding account access, course updates, and support
Prevent account sharing and fraudulent activity
Improve our Platform and educational content

3. Sharing Your Information
We do not sell or rent your personal information. We may share your information in the following situations:
Service Providers: Third-party providers that help operate the Platform (hosting, analytics, payment processing)
Legal Requirements: When required by law or to protect our rights, property, or safety
Business Transfers: In the event of a merger, acquisition, or sale of assets

4. Data Storage and Security
Your data is stored securely using industry-standard practices
While we strive to protect your information, no method of transmission over the internet is completely secure

5. User Rights
You have the following rights regarding your personal information:
Access: Request a copy of the data we collect about you
Correction: Update or correct inaccurate information
Deletion: Request deletion of your account and data by contacting us via email or Telegram
Opt-Out: Opt out of promotional communications
Contact for privacy inquiries: englishwithmrsam@gmail.com

6. Third-Party Links
Our Platform may contain links to third-party websites or services
We are not responsible for the privacy practices of these third-party platforms

7. Changes to This Privacy Policy
We may update this Privacy Policy from time to time
Updates will be posted on the Platform and/or communicated via Telegram or Instagram
Continued use of the Platform indicates acceptance of any changes

8. Contact Us
For questions or concerns about this Privacy Policy, you may contact us via:
Email: englishwithmrsam@gmail.com
Telegram: @English_with_MrSam_bot</pre>
      </div>
    `;
    document.body.appendChild(privacy);
  }

  termsModal = document.getElementById("terms-modal");
  termsCloseBtn = document.getElementById("terms-close-btn");
  privacyModal = document.getElementById("privacy-modal");
  privacyCloseBtn = document.getElementById("privacy-close-btn");
  loginConsentCheckbox = document.getElementById("login-consent");
  enrollConsentCheckbox = document.getElementById("enroll-consent");
};

ensureLegalUi();
initContactForm();

const syncConsentButtons = () => {
  if (loginSubmitBtn) {
    loginSubmitBtn.disabled = !(loginConsentCheckbox && loginConsentCheckbox.checked);
  }
  if (enrollSubmitBtn) {
    if (isEnrollSubmitting) {
      enrollSubmitBtn.disabled = true;
      return;
    }
    enrollSubmitBtn.disabled = !(enrollConsentCheckbox && enrollConsentCheckbox.checked);
  }
};

syncConsentButtons();

const syncModalBodyScroll = () => {
  const hasOpenModal = !!(
    (loginModal && loginModal.classList.contains("is-open")) ||
    (profileModal && profileModal.classList.contains("is-open")) ||
    (achievementsModal && achievementsModal.classList.contains("is-open")) ||
    (leaderboardModal && leaderboardModal.classList.contains("is-open")) ||
    (knowledgeTestModal &&
      (knowledgeTestModal.classList.contains("is-open") || knowledgeTestModal.dataset.keepOpen === "1")) ||
    (adminProgressModalEl && adminProgressModalEl.classList.contains("is-open")) ||
    (adminRequestsModalEl && adminRequestsModalEl.classList.contains("is-open")) ||
    (document.getElementById("admin-create-queue-modal") &&
      document.getElementById("admin-create-queue-modal").classList.contains("is-open")) ||
    (document.getElementById("admin-manage-modal") &&
      document.getElementById("admin-manage-modal").classList.contains("is-open")) ||
    (document.getElementById("admin-renewals-modal") &&
      document.getElementById("admin-renewals-modal").classList.contains("is-open")) ||
    (document.getElementById("admin-payments-modal") &&
      document.getElementById("admin-payments-modal").classList.contains("is-open")) ||
    (document.getElementById("admin-delete-modal") &&
      document.getElementById("admin-delete-modal").classList.contains("is-open")) ||
    (document.getElementById("admin-delete-confirm-modal") &&
      document.getElementById("admin-delete-confirm-modal").classList.contains("is-open")) ||
    (upgradeModal && upgradeModal.classList.contains("is-open")) ||
    (resultsModal && resultsModal.classList.contains("is-open")) ||
    (enrollModal && enrollModal.classList.contains("is-open")) ||
    (enrollSuccessModal && enrollSuccessModal.classList.contains("is-open")) ||
    (termsModal && termsModal.classList.contains("is-open")) ||
    (privacyModal && privacyModal.classList.contains("is-open")) ||
    (document.getElementById("subscription-expired-modal") &&
      document.getElementById("subscription-expired-modal").classList.contains("is-open")) ||
    (document.getElementById("subscription-renew-modal") &&
      document.getElementById("subscription-renew-modal").classList.contains("is-open")) ||
    (document.getElementById("subscription-confirm-modal") &&
      document.getElementById("subscription-confirm-modal").classList.contains("is-open")) ||
    (document.getElementById("subscription-sent-modal") &&
      document.getElementById("subscription-sent-modal").classList.contains("is-open"))
  );
  document.body.style.overflow = hasOpenModal ? "hidden" : "";
};

const knowledgePlacementQuestions = [
  {
    level: "A1",
    question: "Choose the correct sentence.",
    options: [
      "She go to school every day.",
      "She goes to school every day.",
      "She going to school every day.",
      "She gone to school every day.",
    ],
    correct: 1,
    weight: 1,
  },
  {
    level: "A1",
    question: "Complete the sentence: I ___ a student.",
    options: ["am", "is", "are", "be"],
    correct: 0,
    weight: 1,
  },
  {
    level: "A2",
    question: "Choose the best answer: We ___ TV now.",
    options: ["watch", "watches", "are watching", "watched"],
    correct: 2,
    weight: 2,
  },
  {
    level: "A2",
    question: "Which sentence is correct?",
    options: [
      "I have seen this movie yesterday.",
      "I saw this movie yesterday.",
      "I seen this movie yesterday.",
      "I was see this movie yesterday.",
    ],
    correct: 1,
    weight: 2,
  },
  {
    level: "B1",
    question: "Choose the correct conditional sentence.",
    options: [
      "If I will study, I pass the exam.",
      "If I studied, I will pass the exam.",
      "If I study, I will pass the exam.",
      "If I study, I would pass the exam yesterday.",
    ],
    correct: 2,
    weight: 3,
  },
  {
    level: "B1",
    question: "Pick the sentence with correct reported speech.",
    options: [
      "He said that he is tired.",
      "He said that he was tired.",
      "He said me that he was tired.",
      "He told that he was tired.",
    ],
    correct: 1,
    weight: 3,
  },
  {
    level: "B2",
    question: "Choose the best advanced structure.",
    options: [
      "Hardly had I arrived when the meeting started.",
      "Hardly I had arrived when the meeting started.",
      "I hardly had arrived when started the meeting.",
      "Had hardly I arrived when the meeting started.",
    ],
    correct: 0,
    weight: 4,
  },
  {
    level: "B2",
    question: "Pick the most natural formal sentence.",
    options: [
      "Despite of the rain, we continued.",
      "Although raining, we continue.",
      "In spite of the rain, we continued.",
      "Despite it rained, we continued.",
    ],
    correct: 2,
    weight: 4,
  },
];

const knowledgeTestState = {
  index: 0,
  score: 0,
  correctAnswers: 0,
  selected: null,
  finished: false,
  levelStats: {
    A1: { correct: 0, total: 0 },
    A2: { correct: 0, total: 0 },
    B1: { correct: 0, total: 0 },
    B2: { correct: 0, total: 0 },
  },
};
let knowledgeResultCtaTimer = null;
let knowledgeResultHoldTimer = null;
let knowledgeKeepOpenTimer = null;
let knowledgeCloseRequested = false;
let knowledgeCloseBlockedUntil = 0;
const logKnowledgeClose = (reason) => {
  try {
    const state = {
      reason,
      finished: knowledgeTestState.finished,
      keepOpen: knowledgeTestModal ? knowledgeTestModal.dataset.keepOpen === "1" : false,
      isOpen: knowledgeTestModal ? knowledgeTestModal.classList.contains("is-open") : false,
      closeBlockedMs: Math.max(0, knowledgeCloseBlockedUntil - Date.now()),
    };
    console.groupCollapsed("knowledge-test-close");
    console.log(state);
    console.trace("close-trace");
    console.groupEnd();
  } catch (error) {
    // Ignore logging errors.
  }
};

const isKnowledgeModalVisible = () =>
  !!(
    knowledgeTestModal &&
    (knowledgeTestModal.classList.contains("is-open") || knowledgeTestModal.dataset.keepOpen === "1")
  );

const ensureKnowledgeModalOpen = () => {
  if (!knowledgeTestModal) {
    return;
  }
  if (!knowledgeTestModal.classList.contains("is-open")) {
    knowledgeTestModal.classList.add("is-open");
    knowledgeTestModal.setAttribute("aria-hidden", "false");
    syncModalBodyScroll();
  }
};

const startKnowledgeKeepOpen = () => {
  if (knowledgeKeepOpenTimer) {
    clearInterval(knowledgeKeepOpenTimer);
    knowledgeKeepOpenTimer = null;
  }
  if (!knowledgeTestModal) {
    return;
  }
  ensureKnowledgeModalOpen();
  knowledgeKeepOpenTimer = setInterval(() => {
    if (!knowledgeTestState.finished) {
      clearInterval(knowledgeKeepOpenTimer);
      knowledgeKeepOpenTimer = null;
      return;
    }
    ensureKnowledgeModalOpen();
  }, 200);
};

const stopKnowledgeKeepOpen = () => {
  if (knowledgeKeepOpenTimer) {
    clearInterval(knowledgeKeepOpenTimer);
    knowledgeKeepOpenTimer = null;
  }
};

const getLevelPercent = (stats, level) => {
  const total = Number(stats[level]?.total || 0);
  if (total <= 0) {
    return 0;
  }
  const correct = Number(stats[level]?.correct || 0);
  return correct / total;
};

const getRecommendedLevel = (stats) => {
  const passThreshold = 0.6;
  if (getLevelPercent(stats, "A1") < passThreshold) {
    return "A1";
  }
  if (getLevelPercent(stats, "A2") < passThreshold) {
    return "A2";
  }
  if (getLevelPercent(stats, "B1") < passThreshold) {
    return "B1";
  }
  return "B2";
};

const renderKnowledgeQuestion = () => {
  if (!knowledgeTestQuestion || !knowledgeTestOptions || !knowledgeTestProgress || !knowledgeTestNextBtn) {
    return;
  }
  const current = knowledgePlacementQuestions[knowledgeTestState.index];
  knowledgeTestProgress.textContent = `Question ${knowledgeTestState.index + 1} of ${knowledgePlacementQuestions.length}`;
  knowledgeTestQuestion.textContent = current.question;
  knowledgeTestOptions.innerHTML = "";
  if (knowledgeTestFeedback) {
    knowledgeTestFeedback.textContent = "";
    knowledgeTestFeedback.className = "knowledge-test-feedback";
  }
  knowledgeTestNextBtn.disabled = true;
  knowledgeTestNextBtn.textContent =
    knowledgeTestState.index === knowledgePlacementQuestions.length - 1 ? "Finish" : "Next";

  current.options.forEach((optionText, optionIndex) => {
    const optionButton = document.createElement("button");
    optionButton.type = "button";
    optionButton.className = "knowledge-test-option";
    optionButton.textContent = optionText;
    optionButton.addEventListener("click", () => {
      knowledgeTestState.selected = optionIndex;
      const allOptions = knowledgeTestOptions.querySelectorAll(".knowledge-test-option");
      allOptions.forEach((button) => {
        button.classList.remove("is-selected");
      });
      optionButton.classList.add("is-selected");
      knowledgeTestNextBtn.disabled = false;
    });
    knowledgeTestOptions.appendChild(optionButton);
  });
};

const showKnowledgeResult = () => {
  if (!knowledgeTestQuestion || !knowledgeTestOptions || !knowledgeTestProgress || !knowledgeTestHelp) {
    return;
  }
  const totalQuestions = knowledgePlacementQuestions.length;
  const level = getRecommendedLevel(knowledgeTestState.levelStats);
  const a1Percent = Math.round(getLevelPercent(knowledgeTestState.levelStats, "A1") * 100);
  const a2Percent = Math.round(getLevelPercent(knowledgeTestState.levelStats, "A2") * 100);
  const b1Percent = Math.round(getLevelPercent(knowledgeTestState.levelStats, "B1") * 100);
  const b2Percent = Math.round(getLevelPercent(knowledgeTestState.levelStats, "B2") * 100);
  knowledgeTestState.finished = true;
  if (knowledgeTestModal) {
    knowledgeTestModal.dataset.keepOpen = "1";
  }
  ensureKnowledgeModalOpen();
  knowledgeCloseBlockedUntil = Date.now() + 2200;
  startKnowledgeKeepOpen();
  if (knowledgeResultHoldTimer) {
    clearInterval(knowledgeResultHoldTimer);
    knowledgeResultHoldTimer = null;
  }
  const holdUntil = Date.now() + 5000;
  knowledgeResultHoldTimer = setInterval(() => {
    if (!knowledgeTestModal) {
      clearInterval(knowledgeResultHoldTimer);
      knowledgeResultHoldTimer = null;
      return;
    }
    if (!knowledgeTestState.finished || Date.now() > holdUntil) {
      clearInterval(knowledgeResultHoldTimer);
      knowledgeResultHoldTimer = null;
      return;
    }
    if (!knowledgeTestModal.classList.contains("is-open")) {
      knowledgeTestModal.classList.add("is-open");
      knowledgeTestModal.setAttribute("aria-hidden", "false");
      syncModalBodyScroll();
    }
  }, 120);
  knowledgeTestProgress.textContent = "Result";
  knowledgeTestQuestion.textContent = `Your level is ${level}`;
  knowledgeTestHelp.textContent = `You solved ${knowledgeTestState.correctAnswers} out of ${totalQuestions}. Score: ${knowledgeTestState.score} points. Block results: A1 ${a1Percent}%, A2 ${a2Percent}%, B1 ${b1Percent}%, B2 ${b2Percent}%. Recommended course: ${level}.`;
  knowledgeTestOptions.innerHTML = "";
  if (knowledgeTestFeedback) {
    knowledgeTestFeedback.textContent = "Preparing next step...";
    knowledgeTestFeedback.className = "knowledge-test-feedback is-final";
  }
  if (knowledgeResultCtaTimer) {
    clearTimeout(knowledgeResultCtaTimer);
  }
  knowledgeResultCtaTimer = setTimeout(() => {
    knowledgeTestOptions.innerHTML = "";
    const resultButton = document.createElement("button");
    resultButton.type = "button";
    resultButton.className = "btn knowledge-test-result-link";
    resultButton.textContent = `Go to ${level} course`;
    resultButton.addEventListener("click", () => {
      window.location.href = `${level.toLowerCase()}.html`;
    });
    knowledgeTestOptions.appendChild(resultButton);
    if (knowledgeTestFeedback) {
      knowledgeTestFeedback.textContent = "You can retake the test any time.";
      knowledgeTestFeedback.className = "knowledge-test-feedback is-final";
    }
  }, 1400);
  const authUser = getAuthUser();
  if (authUser && ENABLE_KNOWLEDGE_RESULT_SAVE) {
    fetch(`${API_BASE_URL}/api/knowledge-test/submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: authUser,
        total_questions: totalQuestions,
        correct_answers: knowledgeTestState.correctAnswers,
        score_points: knowledgeTestState.score,
        recommended_level: level,
      }),
    }).catch(() => {
      if (knowledgeTestFeedback) {
        knowledgeTestFeedback.textContent = "Could not save test result. You can still retake the test.";
        knowledgeTestFeedback.className = "knowledge-test-feedback is-wrong";
      }
    });
  } else if (knowledgeTestFeedback) {
    knowledgeTestFeedback.textContent = "Login to save this result in admin panel history.";
    knowledgeTestFeedback.className = "knowledge-test-feedback is-wrong";
  }
  if (knowledgeTestNextBtn) {
    knowledgeTestNextBtn.hidden = true;
  }
  if (knowledgeTestRestartBtn) {
    knowledgeTestRestartBtn.hidden = false;
  }
};

const startKnowledgeTest = () => {
  if (knowledgeResultCtaTimer) {
    clearTimeout(knowledgeResultCtaTimer);
    knowledgeResultCtaTimer = null;
  }
  if (knowledgeResultHoldTimer) {
    clearInterval(knowledgeResultHoldTimer);
    knowledgeResultHoldTimer = null;
  }
  stopKnowledgeKeepOpen();
  if (knowledgeTestModal) {
    delete knowledgeTestModal.dataset.keepOpen;
  }
  knowledgeTestState.index = 0;
  knowledgeTestState.score = 0;
  knowledgeTestState.correctAnswers = 0;
  knowledgeTestState.selected = null;
  knowledgeTestState.finished = false;
  knowledgeTestState.levelStats = {
    A1: { correct: 0, total: 0 },
    A2: { correct: 0, total: 0 },
    B1: { correct: 0, total: 0 },
    B2: { correct: 0, total: 0 },
  };
  if (knowledgeTestHelp) {
    knowledgeTestHelp.textContent = "Answer all questions to get your recommended level: A1, A2, B1, or B2.";
  }
  if (knowledgeTestRestartBtn) {
    knowledgeTestRestartBtn.hidden = true;
  }
  if (knowledgeTestNextBtn) {
    knowledgeTestNextBtn.hidden = false;
  }
  renderKnowledgeQuestion();
};

const closeKnowledgeTestModal = (force = false) => {
  if (!knowledgeTestModal) {
    return;
  }
  if (knowledgeTestState.finished && Date.now() < knowledgeCloseBlockedUntil) {
    logKnowledgeClose("blocked-by-time");
    return;
  }
  if (knowledgeTestState.finished && (!force || !knowledgeCloseRequested)) {
    logKnowledgeClose("blocked-by-finish");
    return;
  }
  if (force) {
    stopKnowledgeKeepOpen();
    delete knowledgeTestModal.dataset.keepOpen;
  }
  logKnowledgeClose(force ? "force-close" : "close");
  knowledgeTestModal.classList.remove("is-open");
  knowledgeTestModal.setAttribute("aria-hidden", "true");
  if (knowledgeResultCtaTimer) {
    clearTimeout(knowledgeResultCtaTimer);
    knowledgeResultCtaTimer = null;
  }
  if (knowledgeResultHoldTimer) {
    clearInterval(knowledgeResultHoldTimer);
    knowledgeResultHoldTimer = null;
  }
  syncModalBodyScroll();
};

const openKnowledgeTestModal = () => {
  if (!knowledgeTestModal) {
    return;
  }
  startKnowledgeTest();
  knowledgeTestModal.classList.add("is-open");
  knowledgeTestModal.setAttribute("aria-hidden", "false");
  syncModalBodyScroll();
};

const getAuthState = () => {
  const raw = localStorage.getItem(AUTH_STORAGE_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.username === "string") {
        return {
          id: Number(parsed.id) || null,
          username: parsed.username,
          fullName: parsed.fullName || parsed.full_name || "",
          role: parsed.role || "student",
          level: parsed.level || "",
          sessionToken: parsed.sessionToken || parsed.session_token || "",
        };
      }
    } catch (error) {
      // Continue to legacy key fallback
    }
  }

  const legacyUser = localStorage.getItem(LEGACY_AUTH_STORAGE_KEY);
  if (!legacyUser) {
    return null;
  }
  return { id: null, username: legacyUser, fullName: "", role: "student", level: "", sessionToken: "" };
};

const setAuthState = (authState) => {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authState));
  localStorage.removeItem(LEGACY_AUTH_STORAGE_KEY);
};

const getAuthUser = () => {
  const authState = getAuthState();
  return authState ? authState.username : null;
};

const isAdminUser = () => {
  const authState = getAuthState();
  return !!authState && authState.role === "admin";
};

const isExpressLevel = (value) => String(value || "").toLowerCase().includes("express");

const normalizeCourseLevel = (value) => {
  const raw = String(value || "").trim().toLowerCase();
  if (!raw) {
    return "";
  }
  return raw.replace(/[-_ ]express$/i, "").trim();
};

const formatLevelLabel = (value) => {
  const raw = String(value || "").trim();
  if (!raw) {
    return "";
  }
  const lower = raw.toLowerCase();
  if (/-express$|_express$| express$/.test(lower)) {
    const base = normalizeCourseLevel(lower).toUpperCase();
    return `${base} Express`;
  }
  return raw.toUpperCase();
};

const formatScheduleLabel = (schedule, level) => {
  const raw = String(schedule || "").trim().toLowerCase();
  if (!raw) {
    return isExpressLevel(level) ? "Daily" : "-";
  }
  if (raw === "mwf") {
    return "Mon / Wed / Fri";
  }
  if (raw === "tthsa") {
    return "Tue / Thu / Sat";
  }
  return raw;
};

const parseExpressPriceLabel = (value) => {
  const raw = String(value || "").trim();
  if (!raw) {
    return { price: "", isExpress: false };
  }
  const expressPattern = /\s*\(?\s*express\s*\)?\s*$/i;
  const isExpress = expressPattern.test(raw);
  const cleaned = isExpress ? raw.replace(expressPattern, "").trim() : raw;
  return { price: cleaned || raw, isExpress };
};

const countPendingEnrollmentRequests = (items) =>
  (Array.isArray(items) ? items : []).reduce(
    (total, item) => total + (Number(item && item.seen_by_admin) === 1 ? 0 : 1),
    0
  );

const formatUnlockCountdown = (diffMs) => {
  const safeMs = Math.max(0, diffMs);
  const totalMinutes = Math.floor(safeMs / 60000);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;
  if (days > 0) {
    return `${days}d ${hours}h`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

const applyLessonAccessLocks = async () => {
  const lessonsPageEl = document.querySelector(".lessons-page");
  if (!lessonsPageEl) {
    return;
  }

  const authState = getAuthState();
  const currentCourse = getCourseFromPathname();
  if (authState && authState.role === "admin") {
    return;
  }
  const hasLevelMismatch = !!(
    authState &&
    authState.sessionToken &&
    authState.level &&
    currentCourse &&
    normalizeCourseLevel(authState.level) !== currentCourse
  );
  const hasSession = !!(authState && authState.sessionToken);
  const isLoggedIn = !!getAuthUser() && hasSession;

  const lessonButtons = lessonsPageEl.querySelectorAll(".lesson-watch-btn");

  const resetLessonButton = (button) => {
    if (!button) {
      return;
    }
    const lessonCard = button.closest(".lesson-card");
    if (lessonCard) {
      lessonCard.classList.remove("is-locked-lesson-card");
      const note = lessonCard.querySelector(".lesson-lock-note");
      if (note) {
        note.remove();
      }
    }
    if (!button.dataset.originalText) {
      button.dataset.originalText = button.textContent;
    }
    if (!button.dataset.originalHref) {
      button.dataset.originalHref = button.getAttribute("href") || "#";
    }
    if (button.dataset.unlockTimerId) {
      clearInterval(Number(button.dataset.unlockTimerId));
      delete button.dataset.unlockTimerId;
    }
    button.classList.remove("is-locked-lesson-btn", "lesson-unlock-timer");
    button.removeAttribute("aria-disabled");
    button.removeAttribute("tabindex");
    button.textContent = button.dataset.originalText;
    button.href = button.dataset.originalHref;
    button.onclick = null;
  };

  const lockLessonButton = (button, label = "Locked") => {
    if (!button) {
      return;
    }
    resetLessonButton(button);
    button.href = "#";
    button.textContent = label;
    button.classList.add("is-locked-lesson-btn");
    button.setAttribute("aria-disabled", "true");
    button.setAttribute("tabindex", "-1");
    button.onclick = (event) => {
      event.preventDefault();
    };
  };

  const setUnlockTimer = (button, unlockAtIso) => {
    if (!button || !unlockAtIso) {
      return;
    }
    const unlockAt = new Date(unlockAtIso).getTime();
    if (!Number.isFinite(unlockAt)) {
      return;
    }
    lockLessonButton(button, "Locked");
    button.classList.add("lesson-unlock-timer");

    const update = () => {
      const diff = unlockAt - Date.now();
      if (diff <= 0) {
        if (button.dataset.unlockTimerId) {
          clearInterval(Number(button.dataset.unlockTimerId));
          delete button.dataset.unlockTimerId;
        }
        applyLessonAccessLocks();
        return;
      }
      button.textContent = `Opens in ${formatUnlockCountdown(diff)}`;
    };

    update();
    const timerId = window.setInterval(update, 60000);
    button.dataset.unlockTimerId = String(timerId);
  };

  let scheduledButton = null;
  let scheduledUnlockAt = null;

  if (!isLoggedIn || hasLevelMismatch) {
    lessonButtons.forEach((button) => {
      resetLessonButton(button);
      const href = button.getAttribute("href") || "";
      let lessonNumber = 1;
      try {
        const url = new URL(href, window.location.href);
        lessonNumber = Number(url.searchParams.get("lesson")) || 1;
      } catch (error) {
        lessonNumber = 1;
      }
      if (lessonNumber <= 1) {
        return;
      }
      lockLessonButton(button, "Locked");

      const lessonCard = button.closest(".lesson-card");
      if (lessonCard) {
        lessonCard.classList.add("is-locked-lesson-card");

        if (!lessonCard.querySelector(".lesson-lock-note")) {
          const lockNote = document.createElement("p");
          lockNote.className = "lesson-lock-note";
          lockNote.textContent = hasLevelMismatch ? "Only Lesson 1 is available for your level" : "Login required";
          button.insertAdjacentElement("afterend", lockNote);
        }
      }
    });
  } else {
    for (const button of lessonButtons) {
      resetLessonButton(button);
      const href = button.getAttribute("href") || "";
      let lessonNumber = 1;
      try {
        const url = new URL(href, window.location.href);
        lessonNumber = Number(url.searchParams.get("lesson")) || 1;
      } catch (error) {
        lessonNumber = 1;
      }
      if (lessonNumber <= 1) {
        continue;
      }
      const payload = await fetchLessonAccess(currentCourse, lessonNumber);
      if (payload && payload.allowed) {
        continue;
      }
      lockLessonButton(button, "Locked");
      if (payload && payload.reason === "scheduled" && !scheduledButton) {
        scheduledButton = button;
        scheduledUnlockAt = payload.next_unlock_at || "";
      }
    }
  }

  if (scheduledButton && scheduledUnlockAt) {
    setUnlockTimer(scheduledButton, scheduledUnlockAt);
  }

  const header = lessonsPageEl.querySelector(".lessons-header");
  if (header && !header.querySelector(".lessons-access-note") && (!isLoggedIn || hasLevelMismatch)) {
    const note = document.createElement("p");
    note.className = "lessons-access-note";
      const levelLabel = formatLevelLabel(authState.level || "");
      note.textContent = hasLevelMismatch
        ? `Your account level is ${levelLabel || "-"}. In this course only Lesson 1 is available.`
        : "Only Lesson 1 is available in guest mode. Login to unlock all lessons.";
    header.appendChild(note);
  }
};

const applyLessonCompletionBadges = () => {
  const lessonsPageEl = document.querySelector(".lessons-page");
  if (!lessonsPageEl) {
    return;
  }
  const course = getCourseFromPathname();
  if (!course) {
    return;
  }
  const lessonButtons = lessonsPageEl.querySelectorAll(".lesson-watch-btn");
  lessonButtons.forEach((button) => {
    const href = button.getAttribute("href") || "";
    let lessonNumber = 1;
    try {
      const url = new URL(href, window.location.href);
      lessonNumber = Number(url.searchParams.get("lesson")) || 1;
    } catch (error) {
      lessonNumber = 1;
    }
    if (!isLessonCompletedLocal(course, lessonNumber)) {
      return;
    }
    const existing = button.parentElement && button.parentElement.querySelector(".lesson-completed-badge");
    if (existing) {
      return;
    }
    const badge = document.createElement("div");
    badge.className = "lesson-completed-badge";
    badge.textContent = "Lesson completed";
    button.insertAdjacentElement("beforebegin", badge);
  });
};

const COURSE_RENEW_PLANS = {
  a1: {
    label: "A1",
    price: "350 000 so'm",
    features: [
      "20 beginner video lessons",
      "Basic grammar and vocabulary practice",
      "Pronunciation drills for daily speech",
      "Mini quizzes after each unit",
      "Teacher support and feedback",
    ],
  },
  a2: {
    label: "A2",
    price: "400 000 so'm",
    features: [
      "25 elementary level video lessons",
      "Sentence building and speaking tasks",
      "Grammar tests with explanations",
      "Weekly progress checkpoints",
      "Teacher support and feedback",
    ],
  },
  b1: {
    label: "B1",
    price: "450 000 so'm",
    features: [
      "30 intermediate video lessons",
      "Writing and reading improvement tasks",
      "Essay structure training",
      "Mock tests with analytics",
      "Teacher support and feedback",
    ],
  },
  b2: {
    label: "B2",
    price: "500 000 so'm",
    features: [
      "Advanced grammar and fluency lessons",
      "Academic writing practice",
      "Exam-oriented speaking sessions",
      "Full unit tests with explanations",
      "Teacher support and feedback",
    ],
  },
};

let subscriptionCourseContext = "";

const ensureSubscriptionModals = () => {
  if (document.getElementById("subscription-expired-modal")) {
    return;
  }
  const modalHtml = `
    <div id="subscription-expired-modal" class="subscription-expired-modal" aria-hidden="true">
      <div class="subscription-expired-card" role="dialog" aria-modal="true" aria-labelledby="subscription-expired-title">
        <div class="subscription-expired-icon">!</div>
        <h3 id="subscription-expired-title">Course subscription expired</h3>
        <p id="subscription-expired-text">Your subscription for this course has ended. To continue learning, please renew your subscription.</p>
        <button type="button" class="btn subscription-expired-renew-btn" id="subscription-expired-renew-btn">Renew subscription</button>
        <button type="button" class="btn subscription-expired-back-btn" id="subscription-expired-back-btn">Back to menu</button>
      </div>
    </div>
    <div id="subscription-renew-modal" class="subscription-renew-modal" aria-hidden="true">
      <div class="subscription-renew-card upgrade-plan-card" role="dialog" aria-modal="true" aria-labelledby="subscription-renew-title">
        <div class="upgrade-plan-head">
          <h4 id="subscription-renew-title">A1</h4>
        </div>
        <p class="upgrade-plan-subtitle">What's included:</p>
        <ul class="upgrade-feature-list" id="subscription-renew-features"></ul>
        <p class="subscription-renew-hint" id="subscription-renew-hint">Renew subscription</p>
        <button type="button" class="btn subscription-renew-price-btn" id="subscription-renew-price-btn"></button>
        <button type="button" class="btn subscription-renew-back-btn" id="subscription-renew-back-btn">Back to menu</button>
      </div>
    </div>
    <div id="subscription-confirm-modal" class="subscription-confirm-modal" aria-hidden="true">
      <div class="subscription-confirm-card" role="dialog" aria-modal="true" aria-labelledby="subscription-confirm-title">
        <h3 id="subscription-confirm-title">Please confirm renewal</h3>
        <p id="subscription-confirm-text">Do you want to send a renewal request for this course?</p>
        <button type="button" class="btn subscription-confirm-ok-btn" id="subscription-confirm-ok-btn">Confirm</button>
        <button type="button" class="btn subscription-confirm-back-btn" id="subscription-confirm-back-btn">Back</button>
      </div>
    </div>
    <div id="subscription-sent-modal" class="subscription-sent-modal" aria-hidden="true">
      <div class="subscription-sent-card" role="dialog" aria-modal="true" aria-labelledby="subscription-sent-title">
        <div class="subscription-sent-icon" aria-hidden="true"></div>
        <h3 id="subscription-sent-title">Request sent</h3>
        <p id="subscription-sent-text">Your course renewal request has been sent. Administrators will contact you soon.</p>
        <button type="button" class="btn subscription-sent-back-btn" id="subscription-sent-back-btn">Back to menu</button>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML("beforeend", modalHtml);

  const expiredRenewBtn = document.getElementById("subscription-expired-renew-btn");
  const expiredBackBtn = document.getElementById("subscription-expired-back-btn");
  const renewBackBtn = document.getElementById("subscription-renew-back-btn");
  const renewPriceBtn = document.getElementById("subscription-renew-price-btn");
  const confirmBackBtn = document.getElementById("subscription-confirm-back-btn");
  const confirmOkBtn = document.getElementById("subscription-confirm-ok-btn");
  const sentBackBtn = document.getElementById("subscription-sent-back-btn");

  if (expiredRenewBtn) {
    expiredRenewBtn.addEventListener("click", () => {
      openSubscriptionRenewModal(subscriptionCourseContext);
    });
  }

  if (expiredBackBtn) {
    expiredBackBtn.addEventListener("click", () => {
      window.location.href = "index.html";
    });
  }

  if (renewBackBtn) {
    renewBackBtn.addEventListener("click", () => {
      window.location.href = "index.html";
    });
  }

  if (renewPriceBtn) {
    renewPriceBtn.addEventListener("click", () => {
      openSubscriptionConfirmModal(subscriptionCourseContext);
    });
  }

  if (confirmBackBtn) {
    confirmBackBtn.addEventListener("click", () => {
      openSubscriptionRenewModal(subscriptionCourseContext);
    });
  }

  if (confirmOkBtn) {
    confirmOkBtn.addEventListener("click", async () => {
      const authState = getAuthState();
      const course = subscriptionCourseContext || "";
      const plan = COURSE_RENEW_PLANS[course] || COURSE_RENEW_PLANS.a1;
      try {
        await fetch(`${API_BASE_URL}/api/renewal-request`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            full_name: authState && authState.fullName ? authState.fullName : "",
            phone: "",
            telegram_username: "",
            level: course,
            price_label: plan.price,
            username: authState && authState.username ? authState.username : "",
          }),
        });
      } catch (error) {
        // Ignore submission errors for now.
      }
      openSubscriptionSentModal();
    });
  }

  if (sentBackBtn) {
    sentBackBtn.addEventListener("click", () => {
      window.location.href = "index.html";
    });
  }
};

const closeSubscriptionModals = () => {
  const modalIds = [
    "subscription-expired-modal",
    "subscription-renew-modal",
    "subscription-confirm-modal",
    "subscription-sent-modal",
  ];
  modalIds.forEach((id) => {
    const modal = document.getElementById(id);
    if (modal && modal.classList.contains("is-open")) {
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
    }
  });
};

const openSubscriptionExpiredModal = (course) => {
  ensureSubscriptionModals();
  closeSubscriptionModals();
  subscriptionCourseContext = String(course || "").trim().toLowerCase();
  const modal = document.getElementById("subscription-expired-modal");
  if (!modal) {
    return;
  }
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  syncModalBodyScroll();
};

const openSubscriptionRenewModal = (course) => {
  ensureSubscriptionModals();
  closeSubscriptionModals();
  subscriptionCourseContext = String(course || "").trim().toLowerCase();
  const modal = document.getElementById("subscription-renew-modal");
  if (!modal) {
    return;
  }

  const plan = COURSE_RENEW_PLANS[subscriptionCourseContext] || COURSE_RENEW_PLANS.a1;
  const titleEl = document.getElementById("subscription-renew-title");
  const featuresEl = document.getElementById("subscription-renew-features");
  const priceBtn = document.getElementById("subscription-renew-price-btn");
  const hintEl = document.getElementById("subscription-renew-hint");
  const authState = getAuthState();
  const authLevelLabel = authState ? formatLevelLabel(authState.level || "") : "";
  const shouldShowAuthLevel = authLevelLabel && normalizeCourseLevel(authState.level || "") === subscriptionCourseContext;
  const escapeHtmlInline = (value) =>
    String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  if (titleEl) {
    titleEl.textContent = shouldShowAuthLevel ? authLevelLabel : plan.label;
  }
  if (featuresEl) {
    featuresEl.innerHTML = plan.features.map((item) => `<li>${escapeHtmlInline(item)}</li>`).join("");
  }
  if (priceBtn) {
    priceBtn.textContent = plan.price;
  }
  if (hintEl) {
    hintEl.textContent = "Renew subscription";
  }

  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  syncModalBodyScroll();
};

const openSubscriptionConfirmModal = () => {
  ensureSubscriptionModals();
  closeSubscriptionModals();
  const modal = document.getElementById("subscription-confirm-modal");
  if (!modal) {
    return;
  }
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  syncModalBodyScroll();
};

const openSubscriptionSentModal = () => {
  ensureSubscriptionModals();
  closeSubscriptionModals();
  const modal = document.getElementById("subscription-sent-modal");
  if (!modal) {
    return;
  }
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  syncModalBodyScroll();
};

const handleSubscriptionGate = async () => {
  const lessonsPageEl = document.querySelector(".lessons-page");
  if (!lessonsPageEl) {
    return;
  }
  const authState = getAuthState();
  const currentCourse = getCourseFromPathname();
  if (!authState || !authState.sessionToken || !currentCourse) {
    return;
  }
  if (authState.role === "admin") {
    return;
  }
  if (normalizeCourseLevel(authState.level || "") !== currentCourse) {
    return;
  }
  const accessPayload = await fetchLessonAccess(currentCourse, 1);
  if (accessPayload && accessPayload.reason === "subscription_expired") {
    openSubscriptionExpiredModal(currentCourse);
  }
};

const applyCourseLevelLocks = () => {
  const courseButtons = document.querySelectorAll("#levels .card .btn");
  courseButtons.forEach((button) => {
    if (!button.dataset.originalText) {
      button.dataset.originalText = button.textContent;
    }
    if (!button.dataset.originalHref) {
      button.dataset.originalHref = button.getAttribute("href") || "#";
    }

    button.href = button.dataset.originalHref;
    button.textContent = button.dataset.originalText;
    button.classList.remove("is-locked-course-btn");
    button.removeAttribute("aria-disabled");
    button.removeAttribute("tabindex");
  });
};

const updateLoginButton = () => {
  const authState = getAuthState();

  if (loginBtn) {
    loginBtn.textContent = authState ? "Logout" : "Login";
  }

  if (profileBtn) {
    profileBtn.hidden = !authState || isAdminUser();
  }

  if (headerGreeting) {
    if (authState && authState.username) {
      const displayName = String(authState.fullName || "").trim() || authState.username;
      headerGreeting.textContent = `Welcome, ${displayName}`;
      headerGreeting.hidden = false;
    } else {
      headerGreeting.textContent = "";
      headerGreeting.hidden = true;
    }
  }

  if (adminPanelBtn) {
    adminPanelBtn.hidden = !authState || !isAdminUser();
  }
  if (adminPanelBadge && (!authState || !isAdminUser())) {
    adminPanelBadge.hidden = true;
    adminPanelBadge.textContent = "0";
  }
};

const closeProfileModal = () => {
  if (!profileModal) {
    return;
  }
  profileModal.classList.remove("is-open");
  profileModal.setAttribute("aria-hidden", "true");
  syncModalBodyScroll();
};

const closeAchievementsModal = () => {
  if (!achievementsModal) {
    return;
  }
  achievementsModal.classList.remove("is-open");
  achievementsModal.setAttribute("aria-hidden", "true");
  syncModalBodyScroll();
};

const closeLeaderboardModal = () => {
  if (!leaderboardModal) {
    return;
  }
  leaderboardModal.classList.remove("is-open");
  leaderboardModal.setAttribute("aria-hidden", "true");
  syncModalBodyScroll();
};

const renderAchievementsModal = (items) => {
  if (!achievementsModalList) {
    return;
  }
  const escapeHtmlInline = (value) =>
    String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const list = Array.isArray(items) ? items : [];
  if (!list.length) {
    achievementsModalList.innerHTML = "<p>No achievements yet.</p>";
    return;
  }
  achievementsModalList.innerHTML = list
    .map((item) => {
      const earned = !!(item && item.earned);
      const title = escapeHtmlInline(item?.title || item?.title_ru || "");
      const description = escapeHtmlInline(item?.description || item?.description_ru || "");
      const icon = earned
        ? ACHIEVEMENT_MEDAL_ICON
        : escapeHtmlInline(item?.icon || ACHIEVEMENT_LOCKED_ICON);
      const points = Number(item?.points) || 0;
      const pointsLabel = points ? `+${points} XP` : "";
      const statusLabel = earned ? "Unlocked" : "Locked";
      return `
        <div class="achievement-item${earned ? " is-earned" : " is-locked"}">
          <div class="achievement-icon">${icon}</div>
          <div class="achievement-text">
            <h4>${title}</h4>
            <p>${description}</p>
          </div>
          <div class="achievement-status">${statusLabel} ${pointsLabel}</div>
        </div>
      `;
    })
    .join("");
};

const loadAchievementsLeaderboard = async () => {
  if (!leaderboardModalList) {
    return;
  }
  leaderboardModalList.textContent = "Loading...";
  const escapeHtmlInline = (value) =>
    String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  try {
    await ensureApiBaseUrl();
    const response = await fetch(`${API_BASE_URL}/api/leaderboard/achievements?limit=10`);
    if (!response.ok) {
      leaderboardModalList.textContent = "Failed to load leaderboard.";
      return;
    }
    const payload = await response.json();
    const items = Array.isArray(payload.items) ? payload.items : [];
    if (!items.length) {
      leaderboardModalList.textContent = "No leaderboard data yet.";
      return;
    }
    const authState = getAuthState();
    const authUsername = authState && authState.username ? String(authState.username).toLowerCase() : "";
    leaderboardModalList.innerHTML = items
      .map((item) => {
        const rank = Number(item.rank) || 0;
        const username = String(item.username || "").trim();
        const nameRaw = item.full_name || username || "User";
        const name = escapeHtmlInline(nameRaw);
        const levelLabel = formatLevelLabel(item.level || "");
        const meta = levelLabel ? `<div class="leaderboard-meta">${escapeHtmlInline(levelLabel)}</div>` : "";
        const points = Number(item.total_points) || 0;
        const isYou = authUsername && username.toLowerCase() === authUsername;
        const medal =
          rank === 1 ? "&#x1F947;" : rank === 2 ? "&#x1F948;" : rank === 3 ? "&#x1F949;" : "";
        const rankClass = rank === 1 ? " is-top-1" : rank === 2 ? " is-top-2" : rank === 3 ? " is-top-3" : "";
        const medalMarkup = medal ? `<span class="leaderboard-medal" aria-hidden="true">${medal}</span>` : "";
        const rankLabel = rank ? `#${rank}` : "";
        return `
          <div class="leaderboard-row${isYou ? " is-you" : ""}${rankClass}">
            <div class="leaderboard-rank">
              <span class="leaderboard-rank-text">${rankLabel}</span>
              ${medalMarkup}
            </div>
            <div class="leaderboard-name">
              <div class="leaderboard-name-text">${name}</div>
              ${meta}
            </div>
            <div class="leaderboard-points">${points} XP</div>
          </div>
        `;
      })
      .join("");
  } catch (error) {
    leaderboardModalList.textContent = "Failed to load leaderboard.";
  }
};

const openAchievementsModal = () => {
  if (!achievementsModal) {
    return;
  }
  renderAchievementsModal(profileAchievementsCache);
  updateAchievementsModalProgress(profileAchievementsCache);
  achievementsModal.classList.add("is-open");
  achievementsModal.setAttribute("aria-hidden", "false");
  syncModalBodyScroll();
};

const openLeaderboardModal = () => {
  if (!leaderboardModal) {
    return;
  }
  closeAchievementsModal();
  loadAchievementsLeaderboard();
  leaderboardModal.classList.add("is-open");
  leaderboardModal.setAttribute("aria-hidden", "false");
  syncModalBodyScroll();
};

const openProfileModal = async () => {
  if (!profileModal) {
    return;
  }
  const authState = getAuthState();
  if (!authState || !authState.username) {
    return;
  }
  if (profileLevel) {
    const levelLabel = formatLevelLabel(authState.level || "");
    profileLevel.textContent = levelLabel || "-";
  }
  if (profileMentorName) {
    profileMentorName.textContent = "Mentor: —";
  }
  if (profileMentorText) {
    profileMentorText.textContent = "Mentor info will appear here.";
  }
  if (profileMentorContact) {
    const actionsWrap = profileMentorContact.querySelector(".profile-mentor-contact-actions");
    const labelEl = profileMentorContact.querySelector(".profile-mentor-contact-label");
    if (labelEl) {
      labelEl.textContent = "Contact:";
    }
    if (actionsWrap) {
      actionsWrap.textContent = "—";
    } else {
      profileMentorContact.textContent = "Contact: —";
    }
  }
  if (profileProgress) {
    profileProgress.textContent = "0%";
  }
  if (profileSubscriptionRemaining) {
    profileSubscriptionRemaining.textContent = "-";
  }
  if (profileAchievements) {
    profileAchievements.textContent = "-";
  }
  if (profileAchievementsProgress) {
    profileAchievementsProgress.textContent = "-";
  }
  profileAchievementsCache = [];
  if (profileLessonsCompleted) {
    profileLessonsCompleted.textContent = "-";
  }
  if (profileNextUnlock) {
    profileNextUnlock.textContent = "-";
  }
  profileModal.classList.add("is-open");
  profileModal.setAttribute("aria-hidden", "false");
  syncModalBodyScroll();
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/user/progress-summary?username=${encodeURIComponent(authState.username)}`
    );
    if (!response.ok) {
      return;
    }
    const payload = await response.json();
    const levelLabel = formatLevelLabel(payload.level || authState.level || "");
    if (profileLevel) {
      profileLevel.textContent = levelLabel || "-";
    }
    const averagePercent = Number(payload.average_percent || 0);
    const lessonsCount = Number(payload.lessons_count || 0);
    if (profileProgress) {
      profileProgress.textContent = lessonsCount > 0 ? `${Math.round(averagePercent)}%` : "0%";
    }
    if (profileSubscriptionRemaining) {
      const remainingDays = Number(payload.remaining_days || 0);
      const remainingHours = Number(payload.remaining_hours || 0);
      profileSubscriptionRemaining.textContent = `${remainingDays} days ${remainingHours} hours`;
    }
    const achievements = Array.isArray(payload.achievements) ? payload.achievements : [];
    renderProfileAchievementsSummary(achievements);
    updateAchievementNotifications(authState.username, achievements, {
      notify: true,
      suppressIfNoCache: true,
    });
    if (payload.mentor) {
      const mentor = payload.mentor || {};
      const mentorName = mentor.name ? `Mentor: ${mentor.name}` : "Mentor: —";
      if (profileMentorName) {
        profileMentorName.textContent = mentorName;
      }
      if (profileMentorText) {
        profileMentorText.textContent = mentor.info || "Mentor info will appear here.";
      }
      if (profileMentorContact) {
        const actionsWrap = profileMentorContact.querySelector(".profile-mentor-contact-actions");
        const labelEl = profileMentorContact.querySelector(".profile-mentor-contact-label");
        const phoneRaw = String(mentor.phone || "").trim();
        const phoneClean = phoneRaw.replace(/[^\d+]/g, "");
        const tgRaw = String(mentor.telegram_username || mentor.telegram || "").trim();
        const tgClean = tgRaw.replace(/^@/, "");

        if (labelEl) {
          labelEl.textContent = "Contact:";
        }
        if (actionsWrap) {
          actionsWrap.innerHTML = "";
          if (phoneClean) {
            const callBtn = document.createElement("a");
            callBtn.className = "profile-mentor-contact-btn is-call";
            callBtn.href = `tel:${phoneClean}`;
            callBtn.textContent = "Call";
            actionsWrap.appendChild(callBtn);
          }
          if (tgClean) {
            const tgBtn = document.createElement("a");
            tgBtn.className = "profile-mentor-contact-btn is-telegram";
            tgBtn.href = `https://t.me/${encodeURIComponent(tgClean)}`;
            tgBtn.target = "_blank";
            tgBtn.rel = "noopener";
            tgBtn.textContent = "Telegram";
            actionsWrap.appendChild(tgBtn);
          }
          if (!phoneClean && !tgClean) {
            actionsWrap.textContent = "—";
          }
        }
      }
      if (profileMentorAvatar && mentor.avatar_url) {
        const rawUrl = String(mentor.avatar_url || "").trim();
        const avatarUrl = rawUrl.startsWith("http") ? rawUrl : `${API_BASE_URL}${rawUrl}`;
        profileMentorAvatar.src = avatarUrl;
      }
    }
    if (profileLessonsCompleted) {
      const completed = Number(payload.completed_lessons || 0);
      const total = Number(payload.total_lessons || 0);
      profileLessonsCompleted.textContent = total > 0 ? `${completed} / ${total}` : `${completed}`;
    }
    if (profileNextUnlock) {
      const nextUnlockAtRaw = String(payload.next_unlock_at || "").trim();
      let formatted = "";
      if (nextUnlockAtRaw) {
        const unlockAtMs = new Date(nextUnlockAtRaw).getTime();
        if (Number.isFinite(unlockAtMs)) {
          const diff = unlockAtMs - Date.now();
          formatted = diff > 0 ? formatUnlockCountdown(diff) : "Available now";
        }
      }
      if (!formatted) {
        const nextSeconds = Number(payload.next_unlock_seconds || 0);
        formatted = nextSeconds > 0 ? formatUnlockCountdown(nextSeconds * 1000) : "Available now";
      }
      profileNextUnlock.textContent = formatted;
    }
  } catch (error) {
    // Ignore profile load errors.
  }
};

const refreshAdminPanelBadge = async () => {
  if (!adminPanelBtn || !adminPanelBadge) {
    return;
  }
  const authState = getAuthState();
  if (!authState || authState.role !== "admin" || !authState.username) {
    adminPanelBadge.hidden = true;
    adminPanelBadge.textContent = "0";
    return;
  }
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/overview?username=${encodeURIComponent(authState.username)}`);
    if (!response.ok) {
      return;
    }
    const payload = await response.json();
    const pendingCount = Number((payload.stats && payload.stats.pending_enrollment_requests) || 0);
    const renewalsCount = Array.isArray(payload.renewal_requests) ? payload.renewal_requests.length : 0;
    const totalCount = pendingCount + renewalsCount;
    adminPanelBadge.textContent = totalCount > 99 ? "99+" : String(totalCount);
    adminPanelBadge.hidden = totalCount <= 0;
  } catch (error) {
    // Ignore badge refresh errors.
  }
};

const refreshAuthRole = async () => {
  const authState = getAuthState();
  if (!authState || !authState.username) {
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/user/role?username=${encodeURIComponent(authState.username)}`);
    if (!response.ok) {
      return;
    }
    const payload = await response.json();
    const nextRole = payload.role || authState.role || "student";
    const nextLevel = payload.level || authState.level || "";
    const nextFullName = payload.full_name || authState.fullName || "";
    if (nextRole !== authState.role || nextLevel !== authState.level || nextFullName !== (authState.fullName || "")) {
      setAuthState({
        id: authState.id || null,
        username: authState.username,
        fullName: nextFullName,
        role: nextRole,
        level: nextLevel,
        sessionToken: authState.sessionToken || "",
      });
    }
    updateLoginButton();
    refreshAdminPanelBadge();
    applyCourseLevelLocks();
    applyLessonAccessLocks();
  } catch (error) {
    // Ignore role sync errors and keep current local state.
  }
};

const closeLoginModal = () => {
  if (!loginModal) {
    return;
  }

  loginModal.classList.remove("is-open");
  loginModal.setAttribute("aria-hidden", "true");
  if (loginError) {
    loginError.textContent = "";
  }
  if (loginPassword) {
    loginPassword.type = "password";
  }
  if (loginShowPassword) {
    loginShowPassword.checked = false;
  }
  if (loginConsentCheckbox) {
    loginConsentCheckbox.checked = false;
  }
  syncConsentButtons();
  syncModalBodyScroll();
};

const openLoginModal = () => {
  if (!loginModal) {
    return;
  }
  ensureLegalUi();

  loginModal.classList.add("is-open");
  loginModal.setAttribute("aria-hidden", "false");
  if (loginUsername) {
    loginUsername.focus();
  }
  syncConsentButtons();
  syncModalBodyScroll();
};

const closeUpgradeModal = () => {
  if (!upgradeModal) {
    return;
  }
  upgradeModal.classList.remove("is-open");
  upgradeModal.setAttribute("aria-hidden", "true");
  syncModalBodyScroll();
};

const openUpgradeModal = () => {
  if (!upgradeModal) {
    return;
  }
  upgradeModal.classList.add("is-open");
  upgradeModal.setAttribute("aria-hidden", "false");
  syncModalBodyScroll();
};

const handleRenewQuery = () => {
  if (!upgradeModal) {
    return;
  }
  const params = new URLSearchParams(window.location.search);
  const renewLevel = String(params.get("renew") || "").trim().toLowerCase();
  if (!renewLevel) {
    return;
  }
  openUpgradeModal();
};

const closeResultsModal = () => {
  if (!resultsModal) {
    return;
  }
  resultsModal.classList.remove("is-open");
  resultsModal.setAttribute("aria-hidden", "true");
  syncModalBodyScroll();
};

const openResultsModal = () => {
  if (!resultsModal) {
    return;
  }
  resultsModal.classList.add("is-open");
  resultsModal.setAttribute("aria-hidden", "false");
  syncModalBodyScroll();
};

const closeTermsModal = () => {
  if (!termsModal) {
    return;
  }
  termsModal.classList.remove("is-open");
  termsModal.setAttribute("aria-hidden", "true");
  syncModalBodyScroll();
};

const openTermsModal = () => {
  if (!termsModal) {
    return;
  }
  termsModal.classList.add("is-open");
  termsModal.setAttribute("aria-hidden", "false");
  syncModalBodyScroll();
};

const closePrivacyModal = () => {
  if (!privacyModal) {
    return;
  }
  privacyModal.classList.remove("is-open");
  privacyModal.setAttribute("aria-hidden", "true");
  syncModalBodyScroll();
};

const openPrivacyModal = () => {
  if (!privacyModal) {
    return;
  }
  privacyModal.classList.add("is-open");
  privacyModal.setAttribute("aria-hidden", "false");
  syncModalBodyScroll();
};

let selectedEnrollPlan = { level: "", price: "" };

const syncEnrollScheduleVisibility = () => {
  const isExpress = /express/i.test(String(selectedEnrollPlan.level || ""));
  if (enrollScheduleWrap) {
    enrollScheduleWrap.hidden = isExpress;
  }
  if (enrollSchedule) {
    enrollSchedule.required = !isExpress;
    if (isExpress) {
      enrollSchedule.value = "";
    }
  }
};

const closeEnrollModal = () => {
  if (!enrollModal) {
    return;
  }
  enrollModal.classList.remove("is-open");
  enrollModal.setAttribute("aria-hidden", "true");
  if (enrollForm) {
    enrollForm.reset();
  }
  if (enrollMessage) {
    enrollMessage.textContent = "";
    enrollMessage.classList.remove("is-success");
  }
  selectedEnrollPlan = { level: "", price: "" };
  if (enrollConsentCheckbox) {
    enrollConsentCheckbox.checked = false;
  }
  isEnrollSubmitting = false;
  if (enrollSubmitBtn) {
    enrollSubmitBtn.disabled = !(enrollConsentCheckbox && enrollConsentCheckbox.checked);
    enrollSubmitBtn.textContent = "Send request";
  }
  syncConsentButtons();
  syncModalBodyScroll();
};

const openEnrollSuccessModal = () => {
  if (!enrollSuccessModal) {
    return;
  }
  enrollSuccessModal.classList.add("is-open");
  enrollSuccessModal.setAttribute("aria-hidden", "false");
  syncModalBodyScroll();
};

const closeEnrollSuccessModal = () => {
  if (!enrollSuccessModal) {
    return;
  }
  enrollSuccessModal.classList.remove("is-open");
  enrollSuccessModal.setAttribute("aria-hidden", "true");
  syncModalBodyScroll();
};

const openEnrollModal = (level, price) => {
  if (!enrollModal) {
    return;
  }
  ensureLegalUi();
  const priceMeta = parseExpressPriceLabel(price);
  const levelLabel = formatLevelLabel(level);
  const levelWithExpress = priceMeta.isExpress && levelLabel && !/express/i.test(levelLabel)
    ? `${levelLabel} Express`
    : levelLabel;
  selectedEnrollPlan = {
    level: levelWithExpress,
    price: priceMeta.price || String(price || "").trim(),
  };
  syncEnrollScheduleVisibility();
  if (enrollPlanNote) {
    enrollPlanNote.textContent = selectedEnrollPlan.level && selectedEnrollPlan.price
      ? `Selected plan: ${selectedEnrollPlan.level} - ${selectedEnrollPlan.price}`
      : "Selected plan";
  }
  if (enrollMessage) {
    enrollMessage.textContent = "";
    enrollMessage.classList.remove("is-success");
  }
  const authState = getAuthState();
  if (enrollFullName) {
    enrollFullName.value = String((authState && authState.fullName) || "").trim();
  }
  if (enrollTelegram) {
    enrollTelegram.value = "";
  }
  if (enrollPhone) {
    enrollPhone.value = "";
  }
  if (enrollSchedule) {
    enrollSchedule.value = "";
  }
  syncEnrollScheduleVisibility();
  enrollModal.classList.add("is-open");
  enrollModal.setAttribute("aria-hidden", "false");
  if (enrollFullName) {
    enrollFullName.focus();
  }
  syncConsentButtons();
  syncModalBodyScroll();
};

if (loginBtn) {
  updateLoginButton();

  loginBtn.addEventListener("click", (event) => {
    event.preventDefault();
    const authUser = getAuthUser();

    if (authUser) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(LEGACY_AUTH_STORAGE_KEY);
      updateLoginButton();
      closeProfileModal();
      refreshAdminPanelBadge();
      applyCourseLevelLocks();
      return;
    }

    openLoginModal();
  });
}

if (profileBtn) {
  profileBtn.addEventListener("click", (event) => {
    event.preventDefault();
    openProfileModal();
  });
}

if (profileCloseBtn) {
  profileCloseBtn.addEventListener("click", () => {
    closeProfileModal();
  });
}

if (profileUpgradeBtn) {
  profileUpgradeBtn.addEventListener("click", () => {
    closeProfileModal();
    openUpgradeModal();
  });
}

if (profileAchievementsBtn) {
  profileAchievementsBtn.addEventListener("click", () => {
    openAchievementsModal();
  });
}

if (achievementsLeaderboardBtn) {
  achievementsLeaderboardBtn.addEventListener("click", () => {
    openLeaderboardModal();
  });
}

if (achievementsCloseBtn) {
  achievementsCloseBtn.addEventListener("click", () => {
    closeAchievementsModal();
  });
}

if (achievementsModal) {
  achievementsModal.addEventListener("click", (event) => {
    if (event.target === achievementsModal) {
      closeAchievementsModal();
    }
  });
}

if (leaderboardCloseBtn) {
  leaderboardCloseBtn.addEventListener("click", () => {
    closeLeaderboardModal();
  });
}

if (leaderboardModal) {
  leaderboardModal.addEventListener("click", (event) => {
    if (event.target === leaderboardModal) {
      closeLeaderboardModal();
    }
  });
}

if (resultsTabs.length) {
  resultsTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const targetId = tab.dataset.scrollTarget;
      const target = targetId ? document.getElementById(targetId) : null;
      if (!target) {
        return;
      }
      const targetTop = target.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: Math.max(0, targetTop - 20),
        behavior: "smooth",
      });
      resultsTabs.forEach((item) => item.classList.toggle("is-active", item === tab));
    });
  });
}

if (profileModal) {
  profileModal.addEventListener("click", (event) => {
    if (event.target === profileModal) {
      closeProfileModal();
    }
  });
}

if (loginCancel) {
  loginCancel.addEventListener("click", () => {
    closeLoginModal();
  });
}

if (loginModal) {
  loginModal.addEventListener("click", (event) => {
    if (event.target === loginModal) {
      closeLoginModal();
    }
  });
}

if (knowledgeTestOpenBtn) {
  knowledgeTestOpenBtn.addEventListener("click", (event) => {
    event.preventDefault();
    openKnowledgeTestModal();
  });
}

if (knowledgeTestCloseBtn) {
  knowledgeTestCloseBtn.addEventListener("click", () => {
    knowledgeCloseRequested = true;
    closeKnowledgeTestModal(true);
    knowledgeCloseRequested = false;
  });
}

if (knowledgeTestModal) {
  knowledgeTestModal.addEventListener("click", (event) => {
    if (event.target === knowledgeTestModal) {
      return;
    }
  });
}

if (knowledgeTestModal) {
  const observer = new MutationObserver((records) => {
    records.forEach((record) => {
      if (record.type !== "attributes" || record.attributeName !== "class") {
        return;
      }
      const wasOpen = record.oldValue && record.oldValue.split(" ").includes("is-open");
      const isOpen = knowledgeTestModal.classList.contains("is-open");
      if (wasOpen && !isOpen) {
        logKnowledgeClose("mutation-removed-is-open");
      }
    });
  });
  observer.observe(knowledgeTestModal, { attributes: true, attributeOldValue: true });
}

if (knowledgeTestNextBtn) {
  knowledgeTestNextBtn.addEventListener("click", (event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    if (knowledgeTestState.finished) {
      return;
    }
    const current = knowledgePlacementQuestions[knowledgeTestState.index];
    if (knowledgeTestState.selected === null) {
      return;
    }
    if (!knowledgeTestState.levelStats[current.level]) {
      knowledgeTestState.levelStats[current.level] = { correct: 0, total: 0 };
    }
    knowledgeTestState.levelStats[current.level].total += 1;
    if (knowledgeTestState.selected === current.correct) {
      knowledgeTestState.score += current.weight;
      knowledgeTestState.correctAnswers += 1;
      knowledgeTestState.levelStats[current.level].correct += 1;
    }
    const isLast = knowledgeTestState.index === knowledgePlacementQuestions.length - 1;
    if (isLast) {
      setTimeout(() => {
        showKnowledgeResult();
      }, 0);
      return;
    }
    knowledgeTestState.index += 1;
    knowledgeTestState.selected = null;
    renderKnowledgeQuestion();
  });
}

document.addEventListener(
  "submit",
  (event) => {
    if (!isKnowledgeModalVisible()) {
      return;
    }
    logKnowledgeClose("form-submit");
    event.preventDefault();
    event.stopPropagation();
  },
  true
);

document.addEventListener(
  "click",
  (event) => {
    if (!isKnowledgeModalVisible()) {
      return;
    }
    const link = event.target && event.target.closest ? event.target.closest("a[href]") : null;
    if (link) {
      logKnowledgeClose(`link-click:${link.getAttribute("href") || ""}`);
    }
  },
  true
);

window.addEventListener("beforeunload", () => {
  if (isKnowledgeModalVisible()) {
    logKnowledgeClose("beforeunload");
  }
});

if (knowledgeTestRestartBtn) {
  knowledgeTestRestartBtn.addEventListener("click", () => {
    startKnowledgeTest();
  });
}

if (upgradeOpenBtn) {
  upgradeOpenBtn.addEventListener("click", (event) => {
    event.preventDefault();
    openUpgradeModal();
  });
}

if (upgradeCloseBtn) {
  upgradeCloseBtn.addEventListener("click", () => {
    closeUpgradeModal();
  });
}

if (upgradeModal) {
  upgradeModal.addEventListener("click", (event) => {
    if (event.target === upgradeModal) {
      closeUpgradeModal();
    }
  });
}

if (resultsLearnBtn && resultsModal) {
  resultsLearnBtn.addEventListener("click", (event) => {
    event.preventDefault();
    openResultsModal();
  });
}

if (resultsModalCloseBtn) {
  resultsModalCloseBtn.addEventListener("click", () => {
    closeResultsModal();
  });
}

if (resultsModal) {
  resultsModal.addEventListener("click", (event) => {
    if (event.target === resultsModal) {
      closeResultsModal();
    }
  });
}

if (legalSignupLinks.length > 0) {
  legalSignupLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      closeLoginModal();
      closeEnrollModal();
      openUpgradeModal();
    });
  });
}

if (legalLoginLinks.length > 0) {
  legalLoginLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      closeEnrollModal();
      closeUpgradeModal();
      openLoginModal();
    });
  });
}

if (termsOpenLinks.length > 0) {
  termsOpenLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      openTermsModal();
    });
  });
}

if (privacyOpenLinks.length > 0) {
  privacyOpenLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      openPrivacyModal();
    });
  });
}

if (termsCloseBtn) {
  termsCloseBtn.addEventListener("click", () => {
    closeTermsModal();
  });
}

if (termsModal) {
  termsModal.addEventListener("click", (event) => {
    if (event.target === termsModal) {
      closeTermsModal();
    }
  });
}

if (privacyCloseBtn) {
  privacyCloseBtn.addEventListener("click", () => {
    closePrivacyModal();
  });
}

if (privacyModal) {
  privacyModal.addEventListener("click", (event) => {
    if (event.target === privacyModal) {
      closePrivacyModal();
    }
  });
}

document.addEventListener("click", (event) => {
  const upgradeLink = event.target.closest(".js-open-upgrade");
  if (upgradeLink) {
    event.preventDefault();
    closeLoginModal();
    closeEnrollModal();
    openUpgradeModal();
    return;
  }

  const loginLink = event.target.closest(".js-open-login");
  if (loginLink) {
    event.preventDefault();
    closeEnrollModal();
    closeUpgradeModal();
    openLoginModal();
    return;
  }

  const termsLink = event.target.closest('[data-legal-open="terms"]');
  if (termsLink) {
    event.preventDefault();
    openTermsModal();
    return;
  }

  const privacyLink = event.target.closest('[data-legal-open="privacy"]');
  if (privacyLink) {
    event.preventDefault();
    openPrivacyModal();
    return;
  }

  if (event.target && event.target.id === "terms-close-btn") {
    closeTermsModal();
    return;
  }

  if (event.target && event.target.id === "privacy-close-btn") {
    closePrivacyModal();
  }
});

document.addEventListener("change", (event) => {
  const target = event.target;
  if (!target) {
    return;
  }
  if (target.id === "login-consent" || target.id === "enroll-consent") {
    loginConsentCheckbox = document.getElementById("login-consent");
    enrollConsentCheckbox = document.getElementById("enroll-consent");
    syncConsentButtons();
  }
});

if (upgradePlanPriceButtons.length > 0) {
  upgradePlanPriceButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const level = button.dataset.level || "";
      const price = button.dataset.price || button.textContent || "";
      openEnrollModal(level, price);
    });
  });
}

if (enrollCloseBtn) {
  enrollCloseBtn.addEventListener("click", () => {
    closeEnrollModal();
  });
}

if (enrollCancelBtn) {
  enrollCancelBtn.addEventListener("click", () => {
    closeEnrollModal();
  });
}

if (enrollModal) {
  enrollModal.addEventListener("click", (event) => {
    if (event.target === enrollModal) {
      closeEnrollModal();
    }
  });
}

if (enrollSuccessMenuBtn) {
  enrollSuccessMenuBtn.addEventListener("click", () => {
    closeEnrollSuccessModal();
    window.location.href = "index.html";
  });
}

if (enrollSuccessModal) {
  enrollSuccessModal.addEventListener("click", (event) => {
    if (event.target === enrollSuccessModal) {
      closeEnrollSuccessModal();
    }
  });
}

if (enrollForm) {
  enrollForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (isEnrollSubmitting) {
      return;
    }
    if (!(enrollConsentCheckbox && enrollConsentCheckbox.checked)) {
      if (enrollMessage) {
        enrollMessage.textContent = "Please accept Terms and Privacy Policy.";
        enrollMessage.classList.remove("is-success");
      }
      syncConsentButtons();
      return;
    }
    const fullName = enrollFullName ? enrollFullName.value.trim() : "";
    const phone = enrollPhone ? enrollPhone.value.trim() : "";
    const rawTelegram = enrollTelegram ? enrollTelegram.value.trim() : "";
    const telegram = rawTelegram ? rawTelegram.replace(/^@/, "") : "";
    const schedule = enrollSchedule ? enrollSchedule.value.trim() : "";

    if (!fullName) {
      if (enrollMessage) {
        enrollMessage.textContent = "Name and surname are required.";
        enrollMessage.classList.remove("is-success");
      }
      return;
    }

    if (!phone || !/^\+?[0-9()\-\s]{7,20}$/.test(phone)) {
      if (enrollMessage) {
        enrollMessage.textContent = "Enter a valid phone number.";
        enrollMessage.classList.remove("is-success");
      }
      return;
    }

    if (telegram && !/^[A-Za-z0-9_]{4,32}$/.test(telegram)) {
      if (enrollMessage) {
        enrollMessage.textContent = "Telegram username format is invalid.";
        enrollMessage.classList.remove("is-success");
      }
      return;
    }

    if (!selectedEnrollPlan.level) {
      if (enrollMessage) {
        enrollMessage.textContent = "Plan is not selected.";
        enrollMessage.classList.remove("is-success");
      }
      return;
    }

    if (!schedule && !/express/i.test(String(selectedEnrollPlan.level || ""))) {
      if (enrollMessage) {
        enrollMessage.textContent = "Please select preferred schedule.";
        enrollMessage.classList.remove("is-success");
      }
      return;
    }

    const authState = getAuthState();
    try {
      isEnrollSubmitting = true;
      if (enrollSubmitBtn) {
        enrollSubmitBtn.disabled = true;
        enrollSubmitBtn.textContent = "Sending...";
      }
      const response = await fetch(`${API_BASE_URL}/api/enrollment-request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          full_name: fullName,
          phone,
          telegram_username: telegram,
          level: selectedEnrollPlan.level.toLowerCase(),
          price_label: selectedEnrollPlan.price,
          lesson_schedule: schedule,
          username: authState && authState.username ? authState.username : "",
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        if (enrollMessage) {
          enrollMessage.textContent = payload.error || "Could not send request.";
          enrollMessage.classList.remove("is-success");
        }
        isEnrollSubmitting = false;
        if (enrollSubmitBtn) {
          enrollSubmitBtn.disabled = !(enrollConsentCheckbox && enrollConsentCheckbox.checked);
          enrollSubmitBtn.textContent = "Send request";
        }
        return;
      }

      closeEnrollModal();
      openEnrollSuccessModal();
    } catch (error) {
      if (enrollMessage) {
        enrollMessage.textContent = "Auth server is not running.";
        enrollMessage.classList.remove("is-success");
      }
      isEnrollSubmitting = false;
      if (enrollSubmitBtn) {
        enrollSubmitBtn.disabled = !(enrollConsentCheckbox && enrollConsentCheckbox.checked);
        enrollSubmitBtn.textContent = "Send request";
      }
    }
  });
}

if (loginForm) {
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!(loginConsentCheckbox && loginConsentCheckbox.checked)) {
      if (loginError) {
        loginError.textContent = "Please accept Terms and Privacy Policy.";
      }
      syncConsentButtons();
      return;
    }

    const username = loginUsername ? loginUsername.value.trim() : "";
    const password = loginPassword ? loginPassword.value : "";

    try {
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        if (loginError) {
          loginError.textContent = "Incorrect login or password.";
        }
        return;
      }

      const data = await response.json();
      setAuthState({
        id: data.id || null,
        username: data.username || username,
        fullName: data.full_name || "",
        role: data.role || "student",
        level: data.level || "",
        sessionToken: data.session_token || "",
      });
      closeLoginModal();
      updateLoginButton();
      refreshAdminPanelBadge();
      applyCourseLevelLocks();
      applyLessonCompletionBadges();
      handleSubscriptionGate();
      loginForm.reset();
      syncConsentButtons();
    } catch (error) {
      if (loginError) {
        loginError.textContent = "Auth server is not running.";
      }
    }
  });
}

if (loginShowPassword && loginPassword) {
  loginShowPassword.addEventListener("change", () => {
    loginPassword.type = loginShowPassword.checked ? "text" : "password";
  });
}

updateLoginButton();
refreshAuthRole();
refreshAdminPanelBadge();
applyLessonAccessLocks();
applyLessonCompletionBadges();
applyCourseLevelLocks();
handleSubscriptionGate();
handleRenewQuery();

const adminPage = document.querySelector("[data-admin-page]");
if (adminPage) {
  const adminGuard = document.getElementById("admin-guard-message");
  const adminContent = document.getElementById("admin-content");
  const adminUserEl = document.getElementById("admin-user");
  const adminUsernameSearchInput = document.getElementById("admin-username-search");
  const statUsersEl = document.getElementById("admin-stat-users");
  const usersTableBody = document.getElementById("admin-users-body");
  const knowledgeTableBody = document.getElementById("admin-knowledge-body");
  const knowledgeToggleBtn = document.getElementById("admin-knowledge-toggle-btn");
  const levelTableA1 = document.getElementById("admin-level-table-a1");
  const levelTableA2 = document.getElementById("admin-level-table-a2");
  const levelTableB1 = document.getElementById("admin-level-table-b1");
  const levelTableB2 = document.getElementById("admin-level-table-b2");
  const adminSearchBtn = document.getElementById("admin-search-btn");
  const createModal = document.getElementById("admin-create-modal");
  const createForm = document.getElementById("admin-create-form");
  const createCancelBtn = document.getElementById("admin-create-cancel");
  const createPaymentApprovalBtn = document.getElementById("admin-create-payment-approval");
  const createSubmitBtn = document.getElementById("admin-create-submit");
  const createNameInput = document.getElementById("admin-create-name");
  const createPhoneInput = document.getElementById("admin-create-phone");
  const createLevelInput = document.getElementById("admin-create-level");
  const createScheduleInput = document.getElementById("admin-create-schedule");
  const createScheduleGroup = document.getElementById("admin-create-schedule-group");
  const createUsernameInput = document.getElementById("admin-create-username");
  const createPasswordInput = document.getElementById("admin-create-password");
  const createMessage = document.getElementById("admin-create-message");
  const editModal = document.getElementById("admin-edit-modal");
  const editForm = document.getElementById("admin-edit-form");
  const editCancelBtn = document.getElementById("admin-edit-cancel");
  const editSubmitBtn = document.getElementById("admin-edit-submit");
  const editNameInput = document.getElementById("admin-edit-name");
  const editPhoneInput = document.getElementById("admin-edit-phone");
  const editLevelInput = document.getElementById("admin-edit-level");
  const editScheduleInput = document.getElementById("admin-edit-schedule");
  const editUsernameInput = document.getElementById("admin-edit-username");
  const editPasswordInput = document.getElementById("admin-edit-password");
  const editMessage = document.getElementById("admin-edit-message");
  const viewProgressBtn = document.getElementById("admin-view-progress-btn");
  const progressModal = document.getElementById("admin-progress-modal");
  const progressCloseBtn = document.getElementById("admin-progress-close");
  const progressTitle = document.getElementById("admin-progress-title");
  const progressUsersList = document.getElementById("admin-progress-users-list");
  const progressLessons = document.getElementById("admin-progress-lessons");
  const progressNote = document.getElementById("admin-progress-note");
  const manageBtn = document.getElementById("admin-manage-btn");
  const manageBadge = document.getElementById("admin-manage-badge");
  const manageModal = document.getElementById("admin-manage-modal");
  const manageCloseBtn = document.getElementById("admin-manage-close");
  const manageRequestsBtn = document.getElementById("admin-manage-requests-btn");
  const manageRenewalsBtn = document.getElementById("admin-manage-renewals-btn");
  const manageCreateBtn = document.getElementById("admin-manage-create-btn");
  const manageMentorBtn = document.getElementById("admin-manage-mentor-btn");
  const manageDevicesBtn = document.getElementById("admin-manage-devices-btn");
  const manageDeleteBtn = document.getElementById("admin-manage-delete-btn");
  const createQueueModal = document.getElementById("admin-create-queue-modal");
  const createQueueCloseBtn = document.getElementById("admin-create-queue-close");
  const createQueueList = document.getElementById("admin-create-queue-list");
  const createQueueNote = document.getElementById("admin-create-queue-note");
  const mentorModal = document.getElementById("admin-mentor-modal");
  const mentorForm = document.getElementById("admin-mentor-form");
  const mentorCancelBtn = document.getElementById("admin-mentor-cancel");
  const mentorAvatarBtn = document.getElementById("admin-mentor-avatar-btn");
  const mentorAvatarInput = document.getElementById("admin-mentor-avatar");
  const mentorAvatarMessage = document.getElementById("admin-mentor-avatar-message");
  const mentorMessage = document.getElementById("admin-mentor-message");
  const mentorNameInput = document.getElementById("admin-mentor-name");
  const mentorLevelInput = document.getElementById("admin-mentor-level");
  const mentorPhoneInput = document.getElementById("admin-mentor-phone");
  const mentorEmailInput = document.getElementById("admin-mentor-email");
  const mentorTelegramInput = document.getElementById("admin-mentor-telegram");
  const mentorInfoInput = document.getElementById("admin-mentor-info");
  const mentorSubmitBtn = document.getElementById("admin-mentor-submit");
  const mentorsModal = document.getElementById("admin-mentors-modal");
  const mentorsCloseBtn = document.getElementById("admin-mentors-close");
  const mentorsCreateBtn = document.getElementById("admin-mentors-create-btn");
  const mentorsBody = document.getElementById("admin-mentors-body");
  const mentorsNote = document.getElementById("admin-mentors-note");
  const mentorEditModal = document.getElementById("admin-mentor-edit-modal");
  const mentorEditForm = document.getElementById("admin-mentor-edit-form");
  const mentorEditCancelBtn = document.getElementById("admin-mentor-edit-cancel");
  const mentorEditAvatarBtn = document.getElementById("admin-mentor-edit-avatar-btn");
  const mentorEditAvatarInput = document.getElementById("admin-mentor-edit-avatar");
  const mentorEditAvatarMessage = document.getElementById("admin-mentor-edit-avatar-message");
  const mentorEditMessage = document.getElementById("admin-mentor-edit-message");
  const mentorEditNameInput = document.getElementById("admin-mentor-edit-name");
  const mentorEditLevelInput = document.getElementById("admin-mentor-edit-level");
  const mentorEditPhoneInput = document.getElementById("admin-mentor-edit-phone");
  const mentorEditEmailInput = document.getElementById("admin-mentor-edit-email");
  const mentorEditTelegramInput = document.getElementById("admin-mentor-edit-telegram");
  const mentorEditInfoInput = document.getElementById("admin-mentor-edit-info");
  const mentorEditSubmitBtn = document.getElementById("admin-mentor-edit-submit");
  const renewalsModal = document.getElementById("admin-renewals-modal");
  const renewalsCloseBtn = document.getElementById("admin-renewals-close");
  const renewalsBody = document.getElementById("admin-renewals-body");
  const renewalsNote = document.getElementById("admin-renewals-note");
  const devicesModal = document.getElementById("admin-devices-modal");
  const devicesCloseBtn = document.getElementById("admin-devices-close");
  const devicesBody = document.getElementById("admin-devices-body");
  const devicesNote = document.getElementById("admin-devices-note");
  const deviceDetailModal = document.getElementById("admin-device-detail-modal");
  const deviceDetailCloseBtn = document.getElementById("admin-device-detail-close");
  const deviceDetailUsername = document.getElementById("admin-device-detail-username");
  const deviceDetailType = document.getElementById("admin-device-detail-type");
  const deviceDetailFirst = document.getElementById("admin-device-detail-first");
  const deviceDetailLast = document.getElementById("admin-device-detail-last");
  const deviceDetailCount = document.getElementById("admin-device-detail-count");
  const deviceDetailIp = document.getElementById("admin-device-detail-ip");
  const deviceDetailLocation = document.getElementById("admin-device-detail-location");
  const deviceDetailTimezone = document.getElementById("admin-device-detail-timezone");
  const deviceDetailOrg = document.getElementById("admin-device-detail-org");
  const deviceDetailAgent = document.getElementById("admin-device-detail-agent");
  const deviceDetailUa = document.getElementById("admin-device-detail-ua");
  const paymentApprovalBtn = document.getElementById("admin-payment-approval-btn");
  const paymentsModal = document.getElementById("admin-payments-modal");
  const paymentsCloseBtn = document.getElementById("admin-payments-close");
  const paymentsBody = document.getElementById("admin-payments-body");
  const paymentForm = document.getElementById("admin-payment-form");
  const paymentUsername = document.getElementById("admin-payment-username");
  const paymentDate = document.getElementById("admin-payment-date");
  const paymentFile = document.getElementById("admin-payment-file");
  const paymentMessage = document.getElementById("admin-payment-message");
  const paymentSubmitBtn = document.getElementById("admin-payment-submit");
  const deleteModal = document.getElementById("admin-delete-modal");
  const deleteCloseBtn = document.getElementById("admin-delete-close");
  const deleteBody = document.getElementById("admin-delete-body");
  const deleteNote = document.getElementById("admin-delete-note");
  const deleteConfirmModal = document.getElementById("admin-delete-confirm-modal");
  const deleteConfirmText = document.getElementById("admin-delete-confirm-text");
  const deleteConfirmUsername = document.getElementById("admin-delete-confirm-username");
  const deleteConfirmCancel = document.getElementById("admin-delete-confirm-cancel");
  const deleteConfirmAccept = document.getElementById("admin-delete-confirm-accept");
  const requestsBadge = document.getElementById("admin-requests-badge");
  const renewalsBadge = document.getElementById("admin-renewals-badge");
  const requestsModal = document.getElementById("admin-requests-modal");
  const requestsCloseBtn = document.getElementById("admin-requests-close");
  const requestsBody = document.getElementById("admin-requests-body");
  const requestsNote = document.getElementById("admin-requests-note");
  const requestsSearchInput = document.getElementById("admin-requests-search");
  const requestsSearchBtn = document.getElementById("admin-requests-search-btn");

  const authState = getAuthState();
  if (!authState || authState.role !== "admin") {
    if (adminGuard) {
      adminGuard.hidden = false;
    }
    if (adminContent) {
      adminContent.hidden = true;
    }
  } else {
    if (adminGuard) {
      adminGuard.hidden = true;
    }
    if (adminContent) {
      adminContent.hidden = false;
    }
    if (adminUserEl) {
      adminUserEl.textContent = authState.username;
    }
    if (viewProgressBtn) {
      viewProgressBtn.hidden = !ENABLE_VIEW_PROGRESS;
    }
    if (progressModal && !ENABLE_VIEW_PROGRESS) {
      progressModal.classList.remove("is-open");
      progressModal.setAttribute("aria-hidden", "true");
    }

    const escapeHtml = (value) =>
      String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
    const DEVICE_ICON_SVGS = {
      pc: `
        <svg class="admin-device-icon" viewBox="0 0 24 24" aria-hidden="true">
          <rect x="3" y="4" width="18" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="2"></rect>
          <rect x="9" y="18" width="6" height="2" fill="currentColor"></rect>
          <rect x="7" y="20" width="10" height="2" fill="currentColor"></rect>
        </svg>
      `,
      phone: `
        <svg class="admin-device-icon" viewBox="0 0 24 24" aria-hidden="true">
          <rect x="7" y="3" width="10" height="18" rx="2" fill="none" stroke="currentColor" stroke-width="2"></rect>
          <circle cx="12" cy="17" r="1" fill="currentColor"></circle>
        </svg>
      `,
      tablet: `
        <svg class="admin-device-icon" viewBox="0 0 24 24" aria-hidden="true">
          <rect x="5" y="3" width="14" height="18" rx="2" fill="none" stroke="currentColor" stroke-width="2"></rect>
          <circle cx="12" cy="18" r="0.9" fill="currentColor"></circle>
        </svg>
      `,
      unknown: `
        <svg class="admin-device-icon" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"></circle>
          <circle cx="12" cy="12" r="2" fill="currentColor"></circle>
        </svg>
      `,
    };
    const DEVICE_LABELS = {
      pc: "PC",
      phone: "Phone",
      tablet: "Tablet",
      unknown: "Other",
    };
    const parseUserAgentSummary = (ua) => {
      const raw = String(ua || "").trim();
      if (!raw) {
        return "-";
      }
      const lower = raw.toLowerCase();
      const osMap = [
        { re: /windows nt 10\.0/i, label: "Windows 10" },
        { re: /windows nt 11\.0/i, label: "Windows 11" },
        { re: /windows nt 6\.3/i, label: "Windows 8.1" },
        { re: /windows nt 6\.2/i, label: "Windows 8" },
        { re: /windows nt 6\.1/i, label: "Windows 7" },
        { re: /windows nt 6\.0/i, label: "Windows Vista" },
        { re: /windows nt 5\.1/i, label: "Windows XP" },
        { re: /mac os x 10[_\\.](\d+)[_\\.](\d+)/i, label: (m) => `macOS 10.${m[1]}.${m[2]}` },
        { re: /mac os x 10[_\\.](\d+)/i, label: (m) => `macOS 10.${m[1]}` },
        { re: /iphone os (\d+)[_\\.](\d+)/i, label: (m) => `iOS ${m[1]}.${m[2]}` },
        { re: /ipad; cpu os (\d+)[_\\.](\d+)/i, label: (m) => `iPadOS ${m[1]}.${m[2]}` },
        { re: /android (\d+)(?:\.(\d+))?/i, label: (m) => `Android ${m[1]}${m[2] ? "." + m[2] : ""}` },
        { re: /linux/i, label: "Linux" },
      ];
      let osLabel = "Unknown OS";
      for (const entry of osMap) {
        const match = raw.match(entry.re);
        if (match) {
          osLabel = typeof entry.label === "function" ? entry.label(match) : entry.label;
          break;
        }
      }

      const browserMatchers = [
        { re: /edg\/(\d+)/i, label: (m) => `Edge ${m[1]}` },
        { re: /opr\/(\d+)/i, label: (m) => `Opera ${m[1]}` },
        { re: /chrome\/(\d+)/i, label: (m) => `Chrome ${m[1]}` },
        { re: /firefox\/(\d+)/i, label: (m) => `Firefox ${m[1]}` },
        { re: /version\/(\d+).+safari/i, label: (m) => `Safari ${m[1]}` },
      ];
      let browserLabel = "Unknown Browser";
      if (lower.includes("safari") && !lower.includes("chrome") && !lower.includes("chromium")) {
        const safariMatch = raw.match(/version\/(\d+)/i);
        if (safariMatch) {
          browserLabel = `Safari ${safariMatch[1]}`;
        }
      } else {
        for (const entry of browserMatchers) {
          const match = raw.match(entry.re);
          if (match) {
            browserLabel = entry.label(match);
            break;
          }
        }
      }
      return `${osLabel} / ${browserLabel}`;
    };
    const lessonCoverUrl = "https://i.pinimg.com/736x/71/dd/47/71dd4745ab21b90b5162c0f864fba8e7.jpg";
    let progressUsers = [];
    let enrollmentRequests = [];
    let renewalRequests = [];
    let paymentChecks = [];
    let paymentChecksByUsername = new Map();
    let deviceLog = [];
    let mentorsCache = [];
    let mentorEditId = "";
    let createModalCloseLockUntil = 0;
    let editTargetUsername = "";
    let activeEnrollmentRequest = null;
    const generatedUsernames = new Set();
    let payloadUsersCache = [];
    let pendingEnrollmentRequests = 0;
  let knowledgeAttemptsExpanded = false;
  let knowledgeAttemptsCache = [];
  let adminUsernameFilterQuery = "";
  let adminRequestsSearchQuery = "";
  const KNOWLEDGE_TABLE_VISIBLE_ROWS = 4;
  const normalizeUsernameFilter = (value) => String(value || "").trim().toLowerCase();
  const normalizeRequestsFilter = (value) => String(value || "").trim().toLowerCase();
  const applyTableFilterByUsername = (rowSelector) => {
    const rows = document.querySelectorAll(rowSelector);
    rows.forEach((row) => {
      const rowUsername = normalizeUsernameFilter(row.dataset.username || "");
      const matches = !adminUsernameFilterQuery || rowUsername.includes(adminUsernameFilterQuery);
      row.style.display = matches ? "" : "none";
    });
  };
  const applyRequestsFilter = () => {
    const rows = document.querySelectorAll("#admin-requests-body tr");
    rows.forEach((row) => {
      const rowUsername = normalizeUsernameFilter(row.dataset.username || "");
      const usernameMatches = !adminUsernameFilterQuery || rowUsername.includes(adminUsernameFilterQuery);
      const rowText = normalizeRequestsFilter(row.textContent || "");
      const searchMatches = !adminRequestsSearchQuery || rowText.includes(adminRequestsSearchQuery);
      row.style.display = usernameMatches && searchMatches ? "" : "none";
    });
  };
  const applyAdminUsernameFilters = () => {
    applyTableFilterByUsername("#admin-users-body tr[data-username]");
    applyTableFilterByUsername("#admin-knowledge-body tr[data-username]");
    applyTableFilterByUsername("#admin-level-table-a1 tr[data-username]");
    applyTableFilterByUsername("#admin-level-table-a2 tr[data-username]");
    applyTableFilterByUsername("#admin-level-table-b1 tr[data-username]");
    applyTableFilterByUsername("#admin-level-table-b2 tr[data-username]");
    applyRequestsFilter();
    applyTableFilterByUsername("#admin-renewals-body tr[data-username]");
    applyTableFilterByUsername("#admin-payments-body tr[data-username]");
    applyTableFilterByUsername("#admin-delete-body tr[data-username]");
  };

    const CYRILLIC_MAP = {
      а: "a",
      б: "b",
      в: "v",
      г: "g",
      д: "d",
      е: "e",
      ё: "e",
      ж: "zh",
      з: "z",
      и: "i",
      й: "i",
      к: "k",
      л: "l",
      м: "m",
      н: "n",
      о: "o",
      п: "p",
      р: "r",
      с: "s",
      т: "t",
      у: "u",
      ф: "f",
      х: "h",
      ц: "ts",
      ч: "ch",
      ш: "sh",
      щ: "shch",
      ы: "y",
      э: "e",
      ю: "yu",
      я: "ya",
      ъ: "",
      ь: "",
    };

    const transliterateToLatin = (value) =>
      String(value || "")
        .split("")
        .map((char) => {
          const lower = char.toLowerCase();
          if (/[a-z0-9]/.test(lower)) {
            return lower;
          }
          if (Object.prototype.hasOwnProperty.call(CYRILLIC_MAP, lower)) {
            return CYRILLIC_MAP[lower];
          }
          return "";
        })
        .join("");

    const buildUsernameBase = (fullName) => {
      const firstWord = String(fullName || "").trim().split(/\s+/)[0] || "";
      const latin = transliterateToLatin(firstWord);
      const cleaned = latin.replace(/[^a-z0-9]/g, "");
      return cleaned || "student";
    };

    const buildExistingUsernames = () => {
      const set = new Set();
      payloadUsersCache.forEach((item) => {
        const key = String(item.username || "").trim().toLowerCase();
        if (key) {
          set.add(key);
        }
      });
      (enrollmentRequests || []).forEach((item) => {
        const key = String(item.submitted_username || "").trim().toLowerCase();
        if (key) {
          set.add(key);
        }
      });
      generatedUsernames.forEach((key) => set.add(String(key || "").toLowerCase()));
      return set;
    };

    const generateRandomDigits = (length) => {
      const digits = [];
      for (let i = 0; i < length; i += 1) {
        digits.push(Math.floor(Math.random() * 10));
      }
      return digits.join("");
    };

    const generateUsername = (fullName) => {
      const base = buildUsernameBase(fullName);
      const existing = buildExistingUsernames();
      for (let i = 0; i < 12; i += 1) {
        const candidate = `${base}${generateRandomDigits(5)}`;
        const key = candidate.toLowerCase();
        if (!existing.has(key)) {
          generatedUsernames.add(key);
          return candidate;
        }
      }
      const fallback = `${base}${Date.now().toString().slice(-6)}`;
      generatedUsernames.add(fallback.toLowerCase());
      return fallback;
    };

    const generatePassword = () => {
      const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
      const length = 8;
      let result = "";
      for (let i = 0; i < length; i += 1) {
        result += chars[Math.floor(Math.random() * chars.length)];
      }
      return result;
    };

    const getRequestLevelValue = (item) => {
      const rawLevel = String(item && item.level ? item.level : "").trim().toLowerCase();
      const priceMeta = parseExpressPriceLabel(item && item.price_label ? item.price_label : "");
      if (!rawLevel) {
        return priceMeta.isExpress ? "a1-express" : "a1";
      }
      const base = normalizeCourseLevel(rawLevel) || rawLevel;
      const shouldExpress = priceMeta.isExpress || isExpressLevel(rawLevel);
      if (shouldExpress) {
        return `${base}-express`;
      }
      return rawLevel;
    };
    const hasPaymentApproval = (username) => {
      const key = String(username || "").trim().toLowerCase();
      if (!key) {
        return false;
      }
      const items = paymentChecksByUsername.get(key);
      return Array.isArray(items) && items.length > 0;
    };
    const syncCreateApprovalState = () => {
      if (!createSubmitBtn) {
        return;
      }
      const username = createUsernameInput ? createUsernameInput.value.trim() : "";
      const approved = hasPaymentApproval(username);
      if (approved) {
        createSubmitBtn.classList.remove("is-disabled");
        createSubmitBtn.setAttribute("aria-disabled", "false");
        createSubmitBtn.disabled = false;
      } else {
        createSubmitBtn.classList.add("is-disabled");
        createSubmitBtn.setAttribute("aria-disabled", "true");
        createSubmitBtn.disabled = true;
      }
    };

    const syncCreateScheduleState = () => {
      if (!createScheduleInput || !createLevelInput) {
        return;
      }
      if (activeEnrollmentRequest) {
        createScheduleInput.disabled = true;
        createScheduleInput.setAttribute("aria-disabled", "true");
        if (createScheduleGroup) {
          createScheduleGroup.classList.add("is-hidden");
        }
        return;
      }
      const expressLevel = isExpressLevel(createLevelInput.value);
      if (expressLevel) {
        createScheduleInput.value = "mwf";
        createScheduleInput.disabled = true;
        createScheduleInput.setAttribute("aria-disabled", "true");
        if (createScheduleGroup) {
          createScheduleGroup.classList.add("is-hidden");
        }
      } else {
        createScheduleInput.disabled = false;
        createScheduleInput.setAttribute("aria-disabled", "false");
        if (createScheduleGroup) {
          createScheduleGroup.classList.remove("is-hidden");
        }
      }
    };

    const syncEditScheduleState = () => {
      if (!editScheduleInput || !editLevelInput) {
        return;
      }
      const expressLevel = isExpressLevel(editLevelInput.value);
      if (expressLevel) {
        editScheduleInput.value = "mwf";
        editScheduleInput.disabled = true;
        editScheduleInput.setAttribute("aria-disabled", "true");
      } else {
        editScheduleInput.disabled = false;
        editScheduleInput.setAttribute("aria-disabled", "false");
      }
    };

    const updateRequestsBadge = (count) => {
      if (!requestsBadge) {
        return;
      }
      const safeCount = Math.max(0, Number(count) || 0);
      requestsBadge.textContent = safeCount > 99 ? "99+" : String(safeCount);
      requestsBadge.hidden = safeCount <= 0;
    };

    const updateRenewalsBadge = (count) => {
      if (!renewalsBadge) {
        return;
      }
      const safeCount = Math.max(0, Number(count) || 0);
      renewalsBadge.textContent = safeCount > 99 ? "99+" : String(safeCount);
      renewalsBadge.hidden = safeCount <= 0;
    };

    const updateManageBadge = (count) => {
      if (!manageBadge) {
        return;
      }
      const safeCount = Math.max(0, Number(count) || 0);
      manageBadge.textContent = safeCount > 99 ? "99+" : String(safeCount);
      manageBadge.hidden = safeCount <= 0;
    };
    const renderUsers = (users) => {
      if (!usersTableBody) {
        return;
      }
      usersTableBody.innerHTML = "";
      users.forEach((user) => {
        const row = document.createElement("tr");
        const usernameValue = String(user.username || "").trim();
        const usernameKey = usernameValue.toLowerCase();
        row.dataset.username = usernameKey;
        row.dataset.targetUsername = usernameValue;
        const levelLabel = formatLevelLabel(user.level || "");
        const scheduleLabel = formatScheduleLabel(user.lesson_schedule || "", user.level || "");
        const paymentChecksForUser = paymentChecksByUsername.get(usernameKey) || [];
        let paymentCell = "-";
        if (paymentChecksForUser.length && authState && authState.username) {
          const links = paymentChecksForUser
            .map((item, index) => {
              if (!item || !item.id) {
                return "";
              }
              const paymentLink = `${API_BASE_URL}/api/admin/payment-checks/file?username=${encodeURIComponent(
                authState.username
              )}&id=${encodeURIComponent(item.id)}`;
              return `<a href="${paymentLink}" target="_blank" rel="noopener">Open #${index + 1}</a>`;
            })
            .filter(Boolean);
          if (links.length) {
            paymentCell = links.join("<br>");
          }
        }
        const isStudent = String(user.role || "").toLowerCase() === "student";
        const editBtn = `<button type="button" class="btn admin-user-edit-btn" ${
          isStudent ? "" : "disabled"
        }>Edit</button>`;
        row.innerHTML = `
          <td>${escapeHtml(user.full_name || "-")}</td>
          <td>${escapeHtml(levelLabel || "-")}</td>
          <td>${escapeHtml(usernameValue || "-")}</td>
          <td>${escapeHtml(scheduleLabel)}</td>
          <td>${escapeHtml(user.phone || "-")}</td>
          <td>${escapeHtml(user.password || "-")}</td>
          <td>${escapeHtml(user.role || "-")}</td>
          <td>${escapeHtml(user.created_at || "-")}</td>
          <td>${paymentCell}</td>
          <td>${editBtn}</td>
        `;
        usersTableBody.appendChild(row);
      });
      applyAdminUsernameFilters();
    };

    const renderDeleteUsers = (users) => {
      if (!deleteBody || !deleteNote) {
        return;
      }
      deleteBody.innerHTML = "";
      if (!Array.isArray(users) || users.length === 0) {
        deleteNote.textContent = "No users available.";
        return;
      }
      deleteNote.textContent = `Users: ${users.length}`;
      users.forEach((user) => {
        const row = document.createElement("tr");
        row.dataset.username = String(user.username || "").trim().toLowerCase();
        row.dataset.targetUsername = String(user.username || "").trim();
        const isAdmin = String(user.role || "").toLowerCase() === "admin";
        const levelLabel = formatLevelLabel(user.level || "");
        row.innerHTML = `
          <td>${escapeHtml(user.full_name || "-")}</td>
          <td>${escapeHtml(levelLabel || "-")}</td>
          <td>${escapeHtml(user.username || "-")}</td>
          <td>${escapeHtml(user.role || "-")}</td>
          <td>
            <button type="button" class="btn admin-delete-btn" ${isAdmin ? "disabled" : ""}>Delete</button>
          </td>
        `;
        deleteBody.appendChild(row);
      });
      applyAdminUsernameFilters();
    };

    const renderLevelTables = (levelTables) => {
      const levelWrapMap = {
        a1: levelTableA1,
        a2: levelTableA2,
        b1: levelTableB1,
        b2: levelTableB2,
      };

      const order = ["a1", "a2", "b1", "b2"];
      const hasAnyContainer = order.some((level) => !!levelWrapMap[level]);
      if (!hasAnyContainer) {
        return;
      }

      order.forEach((level) => {
        const container = levelWrapMap[level];
        if (!container) {
          return;
        }

        container.innerHTML = "";

        const payload = levelTables[level] || { lesson_count: 0, users: [] };
        const lessonCount = Number(payload.lesson_count) || 0;
        const users = Array.isArray(payload.users) ? payload.users : [];

        if (users.length === 0) {
          const empty = document.createElement("p");
          empty.className = "admin-empty-note";
          empty.textContent = "No students for this level yet.";
          container.appendChild(empty);
          return;
        }

        const tableWrap = document.createElement("div");
        tableWrap.className = "admin-table-wrap";
        const table = document.createElement("table");
        table.className = "admin-table";

        let headHtml = "<tr><th>Name</th><th>User</th><th>Password</th><th>Date of Registration</th>";
        for (let i = 1; i <= lessonCount; i += 1) {
          headHtml += `<th>L${i}</th>`;
        }
        headHtml += "</tr>";

        const thead = document.createElement("thead");
        thead.innerHTML = headHtml;
        table.appendChild(thead);

        const tbody = document.createElement("tbody");
        users.forEach((user) => {
          const row = document.createElement("tr");
          row.dataset.username = String(user.user || "").trim().toLowerCase();
          let rowHtml = `
            <td>${escapeHtml(user.name || "-")}</td>
            <td>${escapeHtml(user.user || "-")}</td>
            <td>${escapeHtml(user.password || "-")}</td>
            <td>${escapeHtml(user.created_at || "-")}</td>
          `;
          for (let i = 1; i <= lessonCount; i += 1) {
            rowHtml += `<td>${user.lessons && user.lessons[String(i)] ? "✓" : "-"}</td>`;
          }
          row.innerHTML = rowHtml;
          tbody.appendChild(row);
        });

        table.appendChild(tbody);
        tableWrap.appendChild(table);
        container.appendChild(tableWrap);
      });
      applyAdminUsernameFilters();
    };

    const renderKnowledgeAttempts = (attempts) => {
      if (!knowledgeTableBody) {
        return;
      }
      knowledgeAttemptsCache = Array.isArray(attempts) ? attempts : [];
      const visibleAttempts = knowledgeAttemptsExpanded
        ? knowledgeAttemptsCache
        : knowledgeAttemptsCache.slice(0, KNOWLEDGE_TABLE_VISIBLE_ROWS);
      knowledgeTableBody.innerHTML = "";
      visibleAttempts.forEach((attempt) => {
        const row = document.createElement("tr");
        row.dataset.username = String(attempt.username || "").trim().toLowerCase();
        row.innerHTML = `
          <td>${escapeHtml(attempt.username || "-")}</td>
          <td>${escapeHtml(attempt.correct_answers || 0)}</td>
          <td>${escapeHtml(attempt.total_questions || 0)}</td>
          <td>${escapeHtml(attempt.score_points || 0)}</td>
          <td>${escapeHtml((attempt.recommended_level || "-").toUpperCase())}</td>
          <td>${escapeHtml(attempt.submitted_at || "-")}</td>
        `;
        knowledgeTableBody.appendChild(row);
      });
      if (knowledgeToggleBtn) {
        const hasMore = knowledgeAttemptsCache.length > KNOWLEDGE_TABLE_VISIBLE_ROWS;
        knowledgeToggleBtn.hidden = !hasMore;
        knowledgeToggleBtn.textContent = knowledgeAttemptsExpanded ? "Collapse table" : "Expand table";
      }
      applyAdminUsernameFilters();
    };

    const renderEnrollmentRequests = (items) => {
      if (!requestsBody || !requestsNote) {
        return;
      }
      requestsBody.innerHTML = "";
      if (!Array.isArray(items) || items.length === 0) {
        requestsNote.textContent = "No purchase requests yet.";
        return;
      }
      requestsNote.textContent = `Requests: ${items.length}`;
      items.forEach((item) => {
        const priceMeta = parseExpressPriceLabel(item.price_label || "");
        const levelBase = formatLevelLabel(item.level || "-");
        const levelLabel = priceMeta.isExpress && levelBase && !/express/i.test(levelBase) && levelBase !== "-"
          ? `${levelBase} Express`
          : levelBase;
        const priceLabel = priceMeta.price || item.price_label || "-";
        const scheduleLabel = formatScheduleLabel(item.lesson_schedule || "", item.level || "");
        const row = document.createElement("tr");
        const isDone = Number(item.seen_by_admin || 0) === 1;
        const actionHtml = isDone
          ? `<span class="admin-requests-status">Created</span>`
          : `<span class="admin-requests-status">Pending</span>`;
        row.className = `admin-requests-row${isDone ? " is-done" : ""}`;
        row.dataset.username = String(item.submitted_username || "").trim().toLowerCase();
        row.dataset.requestId = String(item.id || "").trim();
        row.innerHTML = `
          <td>${escapeHtml(item.full_name || "-")}</td>
          <td>${escapeHtml(item.phone || "-")}</td>
          <td>${escapeHtml(item.telegram_username ? `@${item.telegram_username}` : "-")}</td>
          <td>${escapeHtml(levelLabel)}</td>
          <td>${escapeHtml(scheduleLabel)}</td>
          <td>${escapeHtml(priceLabel)}</td>
          <td>${escapeHtml(item.submitted_username || "-")}</td>
          <td>${escapeHtml(item.created_at || "-")}</td>
          <td class="admin-requests-done-cell">
            ${actionHtml}
          </td>
        `;
        requestsBody.appendChild(row);
      });
      applyAdminUsernameFilters();
    };

    const renderCreateQueue = (items) => {
      if (!createQueueList || !createQueueNote) {
        return;
      }
      createQueueList.innerHTML = "";
      const pendingItems = Array.isArray(items)
        ? items.filter((item) => Number(item && item.seen_by_admin || 0) !== 1)
        : [];
      if (!pendingItems.length) {
        createQueueNote.textContent = "No purchase requests yet.";
        return;
      }
      createQueueNote.textContent = `Requests: ${pendingItems.length}`;
      pendingItems.forEach((item) => {
        const priceMeta = parseExpressPriceLabel(item.price_label || "");
        const levelBase = formatLevelLabel(item.level || "-");
        const levelLabel = priceMeta.isExpress && levelBase && !/express/i.test(levelBase) && levelBase !== "-"
          ? `${levelBase} Express`
          : levelBase;
        const scheduleLabel = formatScheduleLabel(item.lesson_schedule || "", item.level || "");
        const card = document.createElement("article");
        card.className = "admin-create-queue-card";
        card.dataset.requestId = String(item.id || "");
        card.dataset.username = String(item.submitted_username || "").trim().toLowerCase();
        const submittedUsername = String(item.submitted_username || "").trim();
        const actionHtml = `
          <button type="button" class="btn admin-create-queue-delete-btn">Delete</button>
          <button type="button" class="btn admin-create-queue-create-btn">Create</button>
        `;
        card.innerHTML = `
          <div class="admin-create-queue-header">
            <h4>${escapeHtml(item.full_name || "-")}</h4>
          </div>
          ${submittedUsername ? `<p class="admin-create-queue-meta">Username: ${escapeHtml(submittedUsername)}</p>` : ""}
          <p class="admin-create-queue-meta">Phone: ${escapeHtml(item.phone || "-")}</p>
          <p class="admin-create-queue-meta">Telegram: ${escapeHtml(item.telegram_username ? `@${item.telegram_username}` : "-")}</p>
          <p class="admin-create-queue-meta">Level: ${escapeHtml(levelLabel || "-")}</p>
          <p class="admin-create-queue-meta">Schedule: ${escapeHtml(scheduleLabel)}</p>
          <div class="admin-create-queue-actions">
            ${actionHtml}
          </div>
        `;
        createQueueList.appendChild(card);
      });
      applyAdminUsernameFilters();
    };

    const renderDeviceLog = (items) => {
      if (!devicesBody || !devicesNote) {
        return;
      }
      devicesBody.innerHTML = "";
      if (!Array.isArray(items) || items.length === 0) {
        devicesNote.textContent = "No device data yet.";
        return;
      }
      const deviceMap = new Map();
      items.forEach((item) => {
        const username = String(item.username || "").trim() || "-";
        const key = username.toLowerCase();
        const deviceTypeRaw = String(item.device_type || "unknown").toLowerCase();
        const deviceType = ["pc", "phone", "tablet", "unknown"].includes(deviceTypeRaw) ? deviceTypeRaw : "unknown";
        const lastSeen = String(item.last_seen_at || "").trim();
        const entry = deviceMap.get(key) || {
          username,
          deviceCount: 0,
          types: {},
          lastSeen: "",
          devices: [],
        };
        entry.deviceCount += 1;
        entry.types[deviceType] = (entry.types[deviceType] || 0) + 1;
        if (!entry.lastSeen || (lastSeen && lastSeen > entry.lastSeen)) {
          entry.lastSeen = lastSeen;
        }
        entry.devices.push({
          username,
          deviceType,
          firstSeen: String(item.first_seen_at || "").trim(),
          lastSeen,
          loginCount: Number(item.login_count || 0),
          lastIp: String(item.last_ip || "").trim(),
          city: String(item.city || "").trim(),
          region: String(item.region || "").trim(),
          country: String(item.country || "").trim(),
          timezone: String(item.timezone || "").trim(),
          org: String(item.org || "").trim(),
          userAgent: String(item.user_agent || "").trim(),
        });
        deviceMap.set(key, entry);
      });

      const rows = Array.from(deviceMap.values()).sort((a, b) => (b.lastSeen || "").localeCompare(a.lastSeen || ""));
      devicesNote.textContent = `Users: ${rows.length}`;

      rows.forEach((entry) => {
        const typeCounters = { pc: 0, phone: 0, tablet: 0, unknown: 0 };
        const deviceList = document.createElement("div");
        deviceList.className = "admin-device-list";
        const sortedDevices = [...entry.devices].sort((a, b) => (b.lastSeen || "").localeCompare(a.lastSeen || ""));
        sortedDevices.forEach((device) => {
          const type = device.deviceType;
          typeCounters[type] = (typeCounters[type] || 0) + 1;
          const label = `${DEVICE_LABELS[type]} ${typeCounters[type]}`;
          const button = document.createElement("button");
          button.type = "button";
          button.className = `admin-device-chip admin-device-chip--${type} admin-device-chip-btn`;
          button.innerHTML = `${DEVICE_ICON_SVGS[type] || ""}<span></span>`;
          const labelSpan = button.querySelector("span");
          if (labelSpan) {
            labelSpan.textContent = label;
          }
          button.dataset.username = device.username;
          button.dataset.deviceType = type;
          button.dataset.firstSeen = device.firstSeen || "-";
          button.dataset.lastSeen = device.lastSeen || "-";
          button.dataset.loginCount = String(device.loginCount || 0);
          button.dataset.lastIp = device.lastIp || "-";
          button.dataset.city = device.city || "";
          button.dataset.region = device.region || "";
          button.dataset.country = device.country || "";
          button.dataset.timezone = device.timezone || "";
          button.dataset.org = device.org || "";
          button.dataset.userAgent = device.userAgent || "-";
          deviceList.appendChild(button);
        });

        const row = document.createElement("tr");
        const usernameCell = document.createElement("td");
        usernameCell.textContent = entry.username || "-";
        const countCell = document.createElement("td");
        countCell.textContent = String(entry.deviceCount || 0);
        const typesCell = document.createElement("td");
        if (deviceList.children.length) {
          typesCell.appendChild(deviceList);
        } else {
          typesCell.textContent = "-";
        }
        const lastSeenCell = document.createElement("td");
        lastSeenCell.textContent = entry.lastSeen || "-";
        row.appendChild(usernameCell);
        row.appendChild(countCell);
        row.appendChild(typesCell);
        row.appendChild(lastSeenCell);
        devicesBody.appendChild(row);
      });
    };

    const renderRenewalRequests = (items) => {
      if (!renewalsBody || !renewalsNote) {
        return;
      }
      renewalsBody.innerHTML = "";
      if (!Array.isArray(items) || items.length === 0) {
        renewalsNote.textContent = "No renewal requests yet.";
        return;
      }
      renewalsNote.textContent = `Requests: ${items.length}`;
      items.forEach((item) => {
        const priceMeta = parseExpressPriceLabel(item.price_label || "");
        const levelBase = formatLevelLabel(item.level || "-");
        const levelLabel = priceMeta.isExpress && levelBase && !/express/i.test(levelBase) && levelBase !== "-"
          ? `${levelBase} Express`
          : levelBase;
        const priceLabel = priceMeta.price || item.price_label || "-";
        const row = document.createElement("tr");
        row.dataset.username = String(item.submitted_username || item.username || "").trim().toLowerCase();
        row.dataset.targetUsername = String(item.submitted_username || item.username || "").trim();
        row.dataset.renewalId = String(item.id || "").trim();
        row.innerHTML = `
          <td>${escapeHtml(item.full_name || "-")}</td>
          <td>${escapeHtml(item.phone || "-")}</td>
          <td>${escapeHtml(item.telegram_username ? `@${item.telegram_username}` : "-")}</td>
          <td>${escapeHtml(levelLabel)}</td>
          <td>${escapeHtml(priceLabel)}</td>
          <td>${escapeHtml(item.submitted_username || item.username || "-")}</td>
          <td>
            <div class="admin-renewals-actions">
              <button type="button" class="btn admin-renewals-action-btn admin-renewals-check-btn">Check</button>
              <button type="button" class="btn admin-renewals-action-btn is-primary admin-renewals-extend-btn">Extend</button>
            </div>
          </td>
        `;
        renewalsBody.appendChild(row);
      });
      applyAdminUsernameFilters();
    };

    const renderPaymentChecks = (items) => {
      if (!paymentsBody) {
        return;
      }
      paymentsBody.innerHTML = "";
      if (!Array.isArray(items) || items.length === 0) {
        return;
      }
      items.forEach((item) => {
        const row = document.createElement("tr");
        row.dataset.username = String(item.username || "").trim().toLowerCase();
        const fileLink = item.id && authState && authState.username
          ? `${API_BASE_URL}/api/admin/payment-checks/file?username=${encodeURIComponent(authState.username)}&id=${encodeURIComponent(item.id)}`
          : "";
        const fileCell = fileLink
          ? `<a href="${fileLink}" target="_blank" rel="noopener">Open</a>`
          : escapeHtml(item.original_name || "-");
        row.innerHTML = `
          <td>${escapeHtml(item.username || "-")}</td>
          <td>${escapeHtml(item.payment_date || "-")}</td>
          <td>${fileCell}</td>
        `;
        paymentsBody.appendChild(row);
      });
      applyAdminUsernameFilters();
    };

    const loadDeviceLog = async () => {
      if (!authState || !devicesNote) {
        return;
      }
      devicesNote.textContent = "Loading devices...";
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/admin/device-log?username=${encodeURIComponent(authState.username)}`
        );
        if (!response.ok) {
          devicesNote.textContent = "Failed to load device log.";
          return;
        }
        const payload = await response.json();
        deviceLog = Array.isArray(payload.items) ? payload.items : [];
        renderDeviceLog(deviceLog);
      } catch (error) {
        devicesNote.textContent = "Failed to load device log.";
      }
    };

    const closeProgressModal = () => {
      if (!progressModal) {
        return;
      }
      progressModal.classList.remove("is-open");
      progressModal.setAttribute("aria-hidden", "true");
      syncModalBodyScroll();
    };

    const openProgressModal = () => {
      if (!ENABLE_VIEW_PROGRESS) {
        return;
      }
      if (!progressModal) {
        return;
      }
      progressModal.classList.add("is-open");
      progressModal.setAttribute("aria-hidden", "false");
      syncModalBodyScroll();
      if (progressNote) {
        progressNote.textContent = "Select a student to view lesson progress.";
      }
      if (progressLessons) {
        progressLessons.innerHTML = "";
      }
      if (progressTitle) {
        progressTitle.textContent = "Student Progress";
      }
      renderProgressUsers(progressUsers);
    };

    const closeRequestsModal = () => {
      if (!requestsModal) {
        return;
      }
      requestsModal.classList.remove("is-open");
      requestsModal.setAttribute("aria-hidden", "true");
      syncModalBodyScroll();
    };

    const markEnrollmentRequestsSeen = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/admin/enrollment-requests/mark-seen`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            admin_username: authState.username,
          }),
        });
        if (!response.ok) {
          return;
        }
        pendingEnrollmentRequests = 0;
        enrollmentRequests = (enrollmentRequests || []).map((item) => ({ ...item, seen_by_admin: 1 }));
        updateRequestsBadge(0);
      } catch (error) {
        // Ignore marking errors and keep UI data as-is.
      }
    };

    const markEnrollmentRequestDone = async (requestId) => {
      if (!requestId) {
        return { ok: false };
      }
      try {
        const response = await fetch(`${API_BASE_URL}/api/admin/enrollment-requests/mark-one`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            admin_username: authState.username,
            request_id: requestId,
          }),
        });
        if (!response.ok) {
          return { ok: false };
        }
        const payload = await response.json();
        return {
          ok: true,
          pendingCount: Number(payload.pending_count),
        };
      } catch (error) {
        return { ok: false };
      }
    };

    const deleteEnrollmentRequest = async (requestId) => {
      if (!requestId) {
        return { ok: false };
      }
      try {
        const response = await fetch(`${API_BASE_URL}/api/admin/enrollment-requests/delete`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            admin_username: authState.username,
            request_id: requestId,
          }),
        });
        if (!response.ok) {
          return { ok: false };
        }
        const payload = await response.json();
        return {
          ok: true,
          pendingCount: Number(payload.pending_count),
        };
      } catch (error) {
        return { ok: false };
      }
    };

    const openRequestsModal = async () => {
      if (!requestsModal) {
        return;
      }
      renderEnrollmentRequests(enrollmentRequests);
      requestsModal.classList.add("is-open");
      requestsModal.setAttribute("aria-hidden", "false");
      syncModalBodyScroll();
    };

    const openCreateQueueModal = () => {
      if (!createQueueModal) {
        return;
      }
      renderCreateQueue(enrollmentRequests);
      createQueueModal.classList.add("is-open");
      createQueueModal.setAttribute("aria-hidden", "false");
      syncModalBodyScroll();
    };

    const closeCreateQueueModal = () => {
      if (!createQueueModal) {
        return;
      }
      createQueueModal.classList.remove("is-open");
      createQueueModal.setAttribute("aria-hidden", "true");
      syncModalBodyScroll();
    };

    const openDevicesModal = async () => {
      if (!devicesModal) {
        return;
      }
      devicesModal.classList.add("is-open");
      devicesModal.setAttribute("aria-hidden", "false");
      syncModalBodyScroll();
      await loadDeviceLog();
    };

    const openDeviceDetailModal = (payload) => {
      if (!deviceDetailModal) {
        return;
      }
      if (deviceDetailUsername) deviceDetailUsername.textContent = payload.username || "-";
      if (deviceDetailType) deviceDetailType.textContent = DEVICE_LABELS[payload.deviceType] || "Other";
      if (deviceDetailFirst) deviceDetailFirst.textContent = payload.firstSeen || "-";
      if (deviceDetailLast) deviceDetailLast.textContent = payload.lastSeen || "-";
      if (deviceDetailCount) deviceDetailCount.textContent = payload.loginCount || "0";
      if (deviceDetailIp) deviceDetailIp.textContent = payload.lastIp || "-";
      if (deviceDetailLocation) deviceDetailLocation.textContent = payload.location || "-";
      if (deviceDetailTimezone) deviceDetailTimezone.textContent = payload.timezone || "-";
      if (deviceDetailOrg) deviceDetailOrg.textContent = payload.org || "-";
      if (deviceDetailAgent) deviceDetailAgent.textContent = parseUserAgentSummary(payload.userAgent || "");
      if (deviceDetailUa) deviceDetailUa.textContent = payload.userAgent || "-";
      deviceDetailModal.classList.add("is-open");
      deviceDetailModal.setAttribute("aria-hidden", "false");
      syncModalBodyScroll();
    };

    const closeDeviceDetailModal = () => {
      if (!deviceDetailModal) {
        return;
      }
      deviceDetailModal.classList.remove("is-open");
      deviceDetailModal.setAttribute("aria-hidden", "true");
      syncModalBodyScroll();
    };

    const closeDevicesModal = () => {
      if (!devicesModal) {
        return;
      }
      devicesModal.classList.remove("is-open");
      devicesModal.setAttribute("aria-hidden", "true");
      syncModalBodyScroll();
    };

    const openManageModal = () => {
      if (!manageModal) {
        return;
      }
      manageModal.classList.add("is-open");
      manageModal.setAttribute("aria-hidden", "false");
      syncModalBodyScroll();
    };

    const closeManageModal = () => {
      if (!manageModal) {
        return;
      }
      manageModal.classList.remove("is-open");
      manageModal.setAttribute("aria-hidden", "true");
      syncModalBodyScroll();
    };

    const openRenewalsModal = () => {
      if (!renewalsModal) {
        return;
      }
      renderRenewalRequests(renewalRequests);
      renewalsModal.classList.add("is-open");
      renewalsModal.setAttribute("aria-hidden", "false");
      syncModalBodyScroll();
    };

    const openDeleteModal = () => {
      if (!deleteModal) {
        return;
      }
      renderDeleteUsers(payloadUsersCache);
      deleteModal.classList.add("is-open");
      deleteModal.setAttribute("aria-hidden", "false");
      syncModalBodyScroll();
    };

    const closeDeleteModal = () => {
      if (!deleteModal) {
        return;
      }
      deleteModal.classList.remove("is-open");
      deleteModal.setAttribute("aria-hidden", "true");
      syncModalBodyScroll();
    };

    const openDeleteConfirmModal = (username) => {
      if (!deleteConfirmModal) {
        return;
      }
      if (deleteConfirmUsername) {
        deleteConfirmUsername.textContent = username || "-";
      }
      deleteConfirmModal.dataset.username = username || "";
      deleteConfirmModal.classList.add("is-open");
      deleteConfirmModal.setAttribute("aria-hidden", "false");
      syncModalBodyScroll();
    };

    const closeDeleteConfirmModal = () => {
      if (!deleteConfirmModal) {
        return;
      }
      deleteConfirmModal.classList.remove("is-open");
      deleteConfirmModal.setAttribute("aria-hidden", "true");
      syncModalBodyScroll();
    };

    const openPaymentsModal = async () => {
      if (!paymentsModal) {
        return;
      }
      paymentsModal.classList.add("is-open");
      paymentsModal.setAttribute("aria-hidden", "false");
      syncModalBodyScroll();
      await loadPaymentChecks();
    };

    const closePaymentsModal = () => {
      if (!paymentsModal) {
        return;
      }
      paymentsModal.classList.remove("is-open");
      paymentsModal.setAttribute("aria-hidden", "true");
      syncModalBodyScroll();
    };

    const loadPaymentChecks = async () => {
      if (!authState || !authState.username) {
        return;
      }
      try {
        const response = await fetch(`${API_BASE_URL}/api/admin/payment-checks?username=${encodeURIComponent(authState.username)}`);
        if (!response.ok) {
          return;
        }
        const payload = await response.json();
        paymentChecks = Array.isArray(payload.items) ? payload.items : [];
        const nextMap = new Map();
        paymentChecks.forEach((item) => {
          const key = String(item.username || "").trim().toLowerCase();
          if (!key) {
            return;
          }
          if (!nextMap.has(key)) {
            nextMap.set(key, []);
          }
          nextMap.get(key).push(item);
        });
        paymentChecksByUsername = nextMap;
        renderPaymentChecks(paymentChecks);
        if (payloadUsersCache.length) {
          renderUsers(payloadUsersCache);
        }
        syncCreateApprovalState();
      } catch (error) {
        // Ignore errors for now.
      }
    };

    const closeRenewalsModal = () => {
      if (!renewalsModal) {
        return;
      }
      renewalsModal.classList.remove("is-open");
      renewalsModal.setAttribute("aria-hidden", "true");
      syncModalBodyScroll();
    };

    const renderProgressLessons = (course, lessons, student) => {
      if (!progressLessons || !progressNote) {
        return;
      }
      const courseLessons = LESSONS_BY_COURSE[course] || {};
      const formatSeconds = (value) => {
        const total = Math.max(0, Math.round(Number(value) || 0));
        const minutes = Math.floor(total / 60);
        const seconds = total % 60;
        return `${minutes}:${String(seconds).padStart(2, "0")}`;
      };
      const parseUtcDate = (value) => {
        const raw = String(value || "").trim();
        if (!raw) {
          return null;
        }
        const hasTimezone = /[zZ]|[+-]\d{2}:\d{2}$/.test(raw);
        const candidate = hasTimezone ? raw : `${raw}Z`;
        const date = new Date(candidate);
        return Number.isNaN(date.getTime()) ? null : date;
      };

      const formatTimestamp = (value) => {
        const date = parseUtcDate(value);
        if (date) {
          return date.toLocaleString();
        }
        return value || "-";
      };
      progressLessons.innerHTML = "";
      lessons.forEach((item) => {
        const lessonMeta = courseLessons[item.lesson_number] || { title: `Theme: Lesson ${item.lesson_number}` };
        const correctCount = Number(item.correct_count || 0);
        const wrongCount = Number(item.wrong_count || 0);
        const answeredCount = Math.max(0, correctCount + wrongCount);
        const accuracyPercent = answeredCount > 0 ? Math.round((correctCount * 100) / answeredCount) : 0;
        const accuracyClass = accuracyPercent >= 70 ? "is-good" : "is-bad";
        const videoWatched = Number(item.video_watched_seconds || 0);
        const videoWatchedMinutes = Number(item.video_watched_minutes || 0);
        const videoDuration = Number(item.video_duration_seconds || 0);
        const videoPercent = videoDuration > 0 ? Math.round((videoWatched * 100) / videoDuration) : 0;
        const videoClass = videoDuration > 0 ? (videoPercent >= 70 ? "is-good" : "is-bad") : "is-empty";
        const videoMeta = videoDuration > 0
          ? `${formatSeconds(videoWatched)} / ${formatSeconds(videoDuration)}`
          : "No data";
        const videoMinutesLabel = videoDuration > 0 || videoWatchedMinutes > 0
          ? `${videoWatchedMinutes.toFixed(2)} min`
          : "-";
        const videoLastSeenLabel = item.video_updated_at ? formatTimestamp(item.video_updated_at) : "-";
        const card = document.createElement("article");
        card.className = "admin-progress-lesson-card";
        card.innerHTML = `
          <div class="admin-progress-lesson-cover">
            <img src="${lessonCoverUrl}" alt="Lesson ${item.lesson_number} cover">
          </div>
          <div class="admin-progress-lesson-body">
            <h4>Lesson ${item.lesson_number}: ${escapeHtml((lessonMeta.title || "").replace("Theme: ", ""))}</h4>
            <p class="admin-progress-correct">Correct: ${escapeHtml(correctCount)}</p>
            <p class="admin-progress-wrong">Wrong: ${escapeHtml(wrongCount)}</p>
            <div class="admin-progress-percent ${accuracyClass}">
              <span class="admin-progress-percent-label">Accuracy</span>
              <span class="admin-progress-percent-value">${escapeHtml(accuracyPercent)}%</span>
              <span class="admin-progress-percent-meta">${escapeHtml(answeredCount)} answered</span>
            </div>
            <div class="admin-progress-video ${videoClass}">
              <span class="admin-progress-video-label">Progress of watched video</span>
              <span class="admin-progress-video-value">${videoDuration > 0 ? `${escapeHtml(videoPercent)}%` : "-"}</span>
              <span class="admin-progress-video-meta">${escapeHtml(videoMeta)}</span>
              <span class="admin-progress-video-meta">Watched minutes: ${escapeHtml(videoMinutesLabel)}</span>
              <span class="admin-progress-video-meta">Last watched: ${escapeHtml(videoLastSeenLabel)}</span>
            </div>
          </div>
        `;
        progressLessons.appendChild(card);
      });
      const levelLabel = formatLevelLabel(student.level || "");
      progressNote.textContent = `${student.full_name || student.username} (${levelLabel || "-"})`;
    };

    const loadStudentProgress = async (studentUsername) => {
      if (!ENABLE_VIEW_PROGRESS) {
        return;
      }
      if (!studentUsername) {
        return;
      }
      if (progressNote) {
        progressNote.textContent = "Loading progress...";
      }
      if (progressLessons) {
        progressLessons.innerHTML = "";
      }
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/admin/progress?username=${encodeURIComponent(authState.username)}&student_username=${encodeURIComponent(studentUsername)}`
        );
        if (!response.ok) {
          let serverError = "";
          try {
            const errPayload = await response.json();
            serverError = errPayload && errPayload.error ? String(errPayload.error) : "";
          } catch (error) {
            serverError = "";
          }
          if (progressNote) {
            if (serverError === "not found" || response.status === 404) {
              progressNote.textContent = "Could not load student progress: backend route not found. Restart backend server.";
            } else {
              progressNote.textContent = serverError
                ? `Could not load student progress: ${serverError}.`
                : `Could not load student progress (HTTP ${response.status}).`;
            }
          }
          return;
        }
        const payload = await response.json();
        if (progressTitle) {
          progressTitle.textContent = `Progress: ${payload.student.username}`;
        }
        renderProgressLessons(payload.course, payload.lessons || [], payload.student || {});
      } catch (error) {
        if (progressNote) {
          progressNote.textContent = "Auth server is not running.";
        }
      }
    };

    const renderProgressUsers = (users) => {
      if (!ENABLE_VIEW_PROGRESS) {
        return;
      }
      if (!progressUsersList) {
        return;
      }
      progressUsersList.innerHTML = "";
      if (!Array.isArray(users) || users.length === 0) {
        progressUsersList.innerHTML = "<p class=\"admin-empty-note\">No students yet.</p>";
        return;
      }
      const levelOrder = { A1: 0, A2: 1, B1: 2, B2: 3 };
      const getLevelRank = (user) => {
        const base = normalizeCourseLevel(user.level || "");
        const key = base ? base.toUpperCase() : "";
        return Object.prototype.hasOwnProperty.call(levelOrder, key) ? levelOrder[key] : 99;
      };
      const getNameKey = (user) => (user.full_name || user.username || "").toLowerCase();
      const sortedUsers = [...users].sort((a, b) => {
        const rankDiff = getLevelRank(a) - getLevelRank(b);
        if (rankDiff !== 0) {
          return rankDiff;
        }
        const nameDiff = getNameKey(a).localeCompare(getNameKey(b));
        if (nameDiff !== 0) {
          return nameDiff;
        }
        return String(a.username || "").localeCompare(String(b.username || ""));
      });
      sortedUsers.forEach((user, index) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "admin-progress-user-btn";
        const levelLabel = formatLevelLabel(user.level || "");
        button.innerHTML = `${escapeHtml(user.full_name || user.username)} <span>${escapeHtml(levelLabel || "-")}</span>`;
        button.addEventListener("click", () => {
          const allButtons = progressUsersList.querySelectorAll(".admin-progress-user-btn");
          allButtons.forEach((item) => item.classList.remove("is-active"));
          button.classList.add("is-active");
          loadStudentProgress(user.username);
        });
        progressUsersList.appendChild(button);
        if (index === 0) {
          button.click();
        }
      });
    };

    const fillCreateFormFromRequest = (item) => {
      if (!item) {
        return;
      }
      const scheduleRaw = String(item.lesson_schedule || "").trim().toLowerCase();
      const scheduleValue = scheduleRaw === "tthsa"
        ? "tthsa"
        : scheduleRaw === "mwf"
          ? "mwf"
          : "mwf";
      const levelValue = getRequestLevelValue(item);
      if (createNameInput) {
        createNameInput.value = item.full_name || "";
      }
      if (createPhoneInput) {
        createPhoneInput.value = item.phone || "";
      }
      if (createLevelInput) {
        createLevelInput.value = levelValue;
      }
      if (createScheduleInput) {
        createScheduleInput.value = scheduleValue;
      }
      const username = generateUsername(item.full_name || "");
      const password = generatePassword();
      if (createUsernameInput) {
        createUsernameInput.value = username;
      }
      if (createPasswordInput) {
        createPasswordInput.value = password;
      }
      if (createMessage) {
        createMessage.textContent = "";
        createMessage.classList.remove("is-success");
      }
      syncCreateScheduleState();
      syncCreateApprovalState();
    };

    const openCreateModalForRequest = (item) => {
      if (!createModal || !item) {
        return;
      }
      closeCreateQueueModal();
      activeEnrollmentRequest = item;
      if (createModal.dataset) {
        createModal.dataset.requestId = String(item.id || "");
      }
      fillCreateFormFromRequest(item);
      openCreateModal();
      if (createScheduleInput && !createScheduleInput.disabled && createScheduleGroup) {
        createScheduleInput.focus();
      } else if (createSubmitBtn) {
        createSubmitBtn.focus();
      }
    };

    const openCreateModal = () => {
      if (!createModal) {
        return;
      }
      createModal.classList.add("is-open");
      createModal.setAttribute("aria-hidden", "false");
      if (createMessage) {
        createMessage.textContent = "";
        createMessage.classList.remove("is-success");
      }
      syncCreateApprovalState();
      syncCreateScheduleState();
      if (createScheduleInput && !createScheduleInput.disabled) {
        createScheduleInput.focus();
      } else if (createSubmitBtn) {
        createSubmitBtn.focus();
      }
    };

    const closeCreateModal = (options = {}) => {
      if (!createModal) {
        return;
      }
      const preserveForm = !!options.preserveForm;
      const forceClose = !!options.force;
      if (!forceClose && Date.now() < createModalCloseLockUntil) {
        return;
      }
      createModal.classList.remove("is-open");
      createModal.setAttribute("aria-hidden", "true");
      if (createModal.dataset) {
        createModal.dataset.closeLockUntil = "";
        createModal.dataset.requestId = "";
      }
      if (createForm && !preserveForm) {
        createForm.reset();
      }
      if (createMessage) {
        createMessage.textContent = "";
        createMessage.classList.remove("is-success");
      }
      syncCreateApprovalState();
      syncCreateScheduleState();
      activeEnrollmentRequest = null;
    };

    const openEditModal = (user) => {
      if (!editModal || !user) {
        return;
      }
      editTargetUsername = String(user.username || "").trim();
      if (editNameInput) {
        editNameInput.value = user.full_name || "";
      }
      if (editPhoneInput) {
        editPhoneInput.value = user.phone || "";
      }
      if (editLevelInput) {
        editLevelInput.value = user.level || "";
      }
      if (editScheduleInput) {
        editScheduleInput.value = user.lesson_schedule || "mwf";
      }
      if (editUsernameInput) {
        editUsernameInput.value = editTargetUsername;
      }
      if (editPasswordInput) {
        editPasswordInput.value = "";
      }
      if (editMessage) {
        editMessage.textContent = "";
        editMessage.classList.remove("is-success");
      }
      syncEditScheduleState();
      editModal.classList.add("is-open");
      editModal.setAttribute("aria-hidden", "false");
      if (editNameInput) {
        editNameInput.focus();
      }
    };

    const closeEditModal = () => {
      if (!editModal) {
        return;
      }
      editModal.classList.remove("is-open");
      editModal.setAttribute("aria-hidden", "true");
      editTargetUsername = "";
      if (editForm) {
        editForm.reset();
      }
      if (editMessage) {
        editMessage.textContent = "";
        editMessage.classList.remove("is-success");
      }
      syncEditScheduleState();
    };

    const syncMentorAvatarState = () => {
      if (!mentorSubmitBtn || !mentorAvatarInput) {
        return;
      }
      const hasAvatar = mentorAvatarInput.files && mentorAvatarInput.files[0];
      if (hasAvatar) {
        mentorSubmitBtn.classList.remove("is-disabled");
        mentorSubmitBtn.setAttribute("aria-disabled", "false");
      } else {
        mentorSubmitBtn.classList.add("is-disabled");
        mentorSubmitBtn.setAttribute("aria-disabled", "true");
      }
    };

    const openMentorModal = () => {
      if (!mentorModal) {
        return;
      }
      mentorModal.classList.add("is-open");
      mentorModal.setAttribute("aria-hidden", "false");
      if (mentorMessage) {
        mentorMessage.textContent = "";
        mentorMessage.classList.remove("is-success");
      }
      if (mentorAvatarMessage) {
        mentorAvatarMessage.textContent = "";
        mentorAvatarMessage.classList.remove("is-success");
      }
      if (mentorNameInput) {
        mentorNameInput.focus();
      }
      syncMentorAvatarState();
    };

    const closeMentorModal = () => {
      if (!mentorModal) {
        return;
      }
      mentorModal.classList.remove("is-open");
      mentorModal.setAttribute("aria-hidden", "true");
      if (mentorForm) {
        mentorForm.reset();
      }
      if (mentorAvatarInput) {
        mentorAvatarInput.value = "";
      }
      if (mentorMessage) {
        mentorMessage.textContent = "";
        mentorMessage.classList.remove("is-success");
      }
      if (mentorAvatarMessage) {
        mentorAvatarMessage.textContent = "";
        mentorAvatarMessage.classList.remove("is-success");
      }
      syncMentorAvatarState();
    };

    const openMentorsModal = async () => {
      if (!mentorsModal) {
        return;
      }
      mentorsModal.classList.add("is-open");
      mentorsModal.setAttribute("aria-hidden", "false");
      syncModalBodyScroll();
      if (mentorsNote) {
        mentorsNote.textContent = "Loading mentors...";
      }
      await loadMentors();
    };

    const closeMentorsModal = () => {
      if (!mentorsModal) {
        return;
      }
      mentorsModal.classList.remove("is-open");
      mentorsModal.setAttribute("aria-hidden", "true");
      syncModalBodyScroll();
    };

    const openMentorEditModal = (mentor) => {
      if (!mentorEditModal || !mentor) {
        return;
      }
      mentorEditId = String(mentor.id || "");
      if (mentorEditNameInput) {
        mentorEditNameInput.value = mentor.name || "";
      }
      if (mentorEditLevelInput) {
        mentorEditLevelInput.value = mentor.level || "";
      }
      if (mentorEditPhoneInput) {
        mentorEditPhoneInput.value = mentor.phone || "";
      }
      if (mentorEditEmailInput) {
        mentorEditEmailInput.value = mentor.email || "";
      }
      if (mentorEditTelegramInput) {
        mentorEditTelegramInput.value = mentor.telegram_username || "";
      }
      if (mentorEditInfoInput) {
        mentorEditInfoInput.value = mentor.info || "";
      }
      if (mentorEditAvatarInput) {
        mentorEditAvatarInput.value = "";
      }
      if (mentorEditAvatarMessage) {
        mentorEditAvatarMessage.textContent = "";
        mentorEditAvatarMessage.classList.remove("is-success");
      }
      if (mentorEditMessage) {
        mentorEditMessage.textContent = "";
        mentorEditMessage.classList.remove("is-success");
      }
      mentorEditModal.classList.add("is-open");
      mentorEditModal.setAttribute("aria-hidden", "false");
      syncModalBodyScroll();
    };

    const closeMentorEditModal = () => {
      if (!mentorEditModal) {
        return;
      }
      mentorEditModal.classList.remove("is-open");
      mentorEditModal.setAttribute("aria-hidden", "true");
      mentorEditId = "";
      syncModalBodyScroll();
    };

    const renderMentors = (items) => {
      if (!mentorsBody || !mentorsNote) {
        return;
      }
      mentorsBody.innerHTML = "";
      if (!Array.isArray(items) || items.length === 0) {
        mentorsNote.textContent = "No mentors yet.";
        return;
      }
      mentorsNote.textContent = `Mentors: ${items.length}`;
      items.forEach((mentor) => {
        const row = document.createElement("tr");
        row.dataset.mentorId = String(mentor.id || "");
        const levelLabel = formatLevelLabel(mentor.level || "");
        const avatarRaw = String(mentor.avatar_url || "").trim();
        const avatarUrl = avatarRaw ? (avatarRaw.startsWith("http") ? avatarRaw : `${API_BASE_URL}${avatarRaw}`) : "";
        const avatarCell = avatarUrl
          ? `<img class="admin-mentor-avatar" src="${avatarUrl}" alt="Mentor avatar">`
          : "-";
        const info = String(mentor.info || "");
        const infoShort = info.length > 70 ? `${info.slice(0, 67)}...` : info;
        row.innerHTML = `
          <td>${avatarCell}</td>
          <td>${escapeHtml(mentor.name || "-")}</td>
          <td>${escapeHtml(levelLabel || "-")}</td>
          <td>${escapeHtml(mentor.phone || "-")}</td>
          <td>${escapeHtml(mentor.email || "-")}</td>
          <td>${escapeHtml(mentor.telegram_username || "-")}</td>
          <td title="${escapeHtml(info)}">${escapeHtml(infoShort || "-")}</td>
          <td>
            <button type="button" class="btn admin-mentor-edit-btn">Edit</button>
          </td>
        `;
        mentorsBody.appendChild(row);
      });
    };

    const loadMentors = async () => {
      if (!authState || !authState.username) {
        return;
      }
      try {
        const response = await fetch(`${API_BASE_URL}/api/admin/mentors?username=${encodeURIComponent(authState.username)}`);
        if (!response.ok) {
          if (mentorsNote) {
            mentorsNote.textContent = "Failed to load mentors.";
          }
          return;
        }
        const payload = await response.json();
        mentorsCache = Array.isArray(payload.items) ? payload.items : [];
        renderMentors(mentorsCache);
      } catch (error) {
        if (mentorsNote) {
          mentorsNote.textContent = "Auth server is not running.";
        }
      }
    };

    const submitMentorEdit = async (payload) => {
      if (!authState || !authState.username) {
        return;
      }
      if (!mentorEditId) {
        return;
      }
      const name = mentorEditNameInput ? mentorEditNameInput.value.trim() : "";
      const level = mentorEditLevelInput ? mentorEditLevelInput.value.trim().toLowerCase() : "";
      const phone = mentorEditPhoneInput ? mentorEditPhoneInput.value.trim() : "";
      const email = mentorEditEmailInput ? mentorEditEmailInput.value.trim() : "";
      const telegram = mentorEditTelegramInput ? mentorEditTelegramInput.value.trim() : "";
      const info = mentorEditInfoInput ? mentorEditInfoInput.value.trim() : "";
      if (!name || !level || !phone || !email || !telegram || !info) {
        if (mentorEditMessage) {
          mentorEditMessage.textContent = "Fill all fields before saving.";
          mentorEditMessage.classList.remove("is-success");
        }
        return;
      }
      try {
        const response = await fetch(`${API_BASE_URL}/api/admin/mentors/update`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            admin_username: authState.username,
            mentor_id: mentorEditId,
            name,
            level,
            phone,
            email,
            telegram_username: telegram,
            info,
            ...(payload || {}),
          }),
        });
        const result = await response.json();
        if (!response.ok) {
          if (mentorEditMessage) {
            mentorEditMessage.textContent = result.error || "Could not update mentor.";
            mentorEditMessage.classList.remove("is-success");
          }
          return;
        }
        if (mentorEditMessage) {
          mentorEditMessage.textContent = "Mentor updated.";
          mentorEditMessage.classList.add("is-success");
        }
        await loadMentors();
        setTimeout(() => {
          closeMentorEditModal();
        }, 500);
      } catch (error) {
        if (mentorEditMessage) {
          mentorEditMessage.textContent = "Auth server is not running.";
          mentorEditMessage.classList.remove("is-success");
        }
      }
    };

    const loadAdminOverview = async () => {
      try {
        await ensureApiBaseUrl();
        const response = await fetch(`${API_BASE_URL}/api/admin/overview?username=${encodeURIComponent(authState.username)}`);
        if (!response.ok) {
          if (adminGuard) {
            adminGuard.hidden = false;
            adminGuard.textContent = "Failed to load admin data.";
          }
          if (adminContent) {
            adminContent.hidden = true;
          }
          return;
        }

        const payload = await response.json();
        if (statUsersEl) {
          statUsersEl.textContent = String(payload.stats.total_users || 0);
        }

        payloadUsersCache = Array.isArray(payload.users) ? payload.users : [];
        renderUsers(payloadUsersCache);
        renderKnowledgeAttempts(payload.knowledge_test_attempts || []);
        renderLevelTables(payload.level_tables || {});
        enrollmentRequests = Array.isArray(payload.enrollment_requests) ? payload.enrollment_requests : [];
        renewalRequests = Array.isArray(payload.renewal_requests) ? payload.renewal_requests : [];
        pendingEnrollmentRequests = Number((payload.stats && payload.stats.pending_enrollment_requests) || 0);
        updateRequestsBadge(pendingEnrollmentRequests);
        updateRenewalsBadge(renewalRequests.length);
        updateManageBadge(pendingEnrollmentRequests + renewalRequests.length);
        if (requestsModal && requestsModal.classList.contains("is-open")) {
          renderEnrollmentRequests(enrollmentRequests);
        }
        if (createQueueModal && createQueueModal.classList.contains("is-open")) {
          renderCreateQueue(enrollmentRequests);
        }
        if (renewalsModal && renewalsModal.classList.contains("is-open")) {
          renderRenewalRequests(renewalRequests);
        }
        if (deleteModal && deleteModal.classList.contains("is-open")) {
          renderDeleteUsers(payloadUsersCache);
        }
        await loadPaymentChecks();
        progressUsers = ENABLE_VIEW_PROGRESS
          ? (payload.users || []).filter((user) => (user.role || "").toLowerCase() === "student")
          : [];
        if (ENABLE_VIEW_PROGRESS && progressModal && progressModal.classList.contains("is-open")) {
          renderProgressUsers(progressUsers);
        }
      } catch (error) {
        if (adminGuard) {
          adminGuard.hidden = false;
          adminGuard.textContent = "Auth server is not running.";
        }
        if (adminContent) {
          adminContent.hidden = true;
        }
      }
    };

    if (createCancelBtn) {
      createCancelBtn.addEventListener("click", closeCreateModal);
    }
    if (editCancelBtn) {
      editCancelBtn.addEventListener("click", closeEditModal);
    }
    if (mentorCancelBtn) {
      mentorCancelBtn.addEventListener("click", closeMentorModal);
    }
    if (mentorAvatarBtn) {
      mentorAvatarBtn.addEventListener("click", () => {
        if (mentorAvatarInput) {
          mentorAvatarInput.click();
        }
      });
    }
    if (mentorAvatarInput) {
      mentorAvatarInput.addEventListener("change", () => {
        const file = mentorAvatarInput.files && mentorAvatarInput.files[0];
        if (mentorAvatarMessage) {
          mentorAvatarMessage.textContent = file ? `Avatar selected: ${file.name}` : "";
          mentorAvatarMessage.classList.toggle("is-success", Boolean(file));
        }
        syncMentorAvatarState();
      });
    }
    if (mentorsCloseBtn) {
      mentorsCloseBtn.addEventListener("click", closeMentorsModal);
    }
    if (mentorsCreateBtn) {
      mentorsCreateBtn.addEventListener("click", () => {
        closeMentorsModal();
        openMentorModal();
      });
    }
    if (mentorsModal) {
      mentorsModal.addEventListener("click", (event) => {
        if (event.target === mentorsModal) {
          closeMentorsModal();
        }
      });
    }
    if (mentorsBody) {
      mentorsBody.addEventListener("click", (event) => {
        const target = event.target;
        if (!(target instanceof HTMLElement)) {
          return;
        }
        const editBtn = target.closest(".admin-mentor-edit-btn");
        if (!editBtn) {
          return;
        }
        const row = editBtn.closest("tr");
        const mentorId = row ? String(row.dataset.mentorId || "") : "";
        if (!mentorId) {
          return;
        }
        const mentor = mentorsCache.find((item) => String(item.id || "") === mentorId);
        if (!mentor) {
          return;
        }
        openMentorEditModal(mentor);
      });
    }
    if (mentorEditCancelBtn) {
      mentorEditCancelBtn.addEventListener("click", closeMentorEditModal);
    }
    if (mentorEditAvatarBtn) {
      mentorEditAvatarBtn.addEventListener("click", () => {
        if (mentorEditAvatarInput) {
          mentorEditAvatarInput.click();
        }
      });
    }
    if (mentorEditAvatarInput) {
      mentorEditAvatarInput.addEventListener("change", () => {
        const file = mentorEditAvatarInput.files && mentorEditAvatarInput.files[0];
        if (mentorEditAvatarMessage) {
          mentorEditAvatarMessage.textContent = file ? `Avatar selected: ${file.name}` : "";
          mentorEditAvatarMessage.classList.toggle("is-success", Boolean(file));
        }
      });
    }
    if (mentorEditModal) {
      mentorEditModal.addEventListener("click", (event) => {
        if (event.target === mentorEditModal) {
          closeMentorEditModal();
        }
      });
    }
    if (createPaymentApprovalBtn) {
      createPaymentApprovalBtn.addEventListener("click", () => {
        const username = createUsernameInput ? createUsernameInput.value.trim() : "";
        if (!username) {
          if (createMessage) {
            createMessage.textContent = "Username is missing. Please reopen the request.";
            createMessage.classList.remove("is-success");
          }
          return;
        }
        if (paymentUsername && username) {
          paymentUsername.value = username;
        }
        if (paymentDate && !paymentDate.value) {
          const today = new Date();
          paymentDate.value = today.toISOString().slice(0, 10);
        }
        openPaymentsModal();
      });
    }
    if (createUsernameInput) {
      createUsernameInput.addEventListener("input", () => {
        syncCreateApprovalState();
        if (createMessage) {
          createMessage.textContent = "";
          createMessage.classList.remove("is-success");
        }
      });
    }

    if (createLevelInput) {
      createLevelInput.addEventListener("change", () => {
        syncCreateScheduleState();
      });
    }
    if (editLevelInput) {
      editLevelInput.addEventListener("change", () => {
        syncEditScheduleState();
      });
    }

    if (createModal) {
      createModal.addEventListener("click", (event) => {
        if (event.target === createModal) {
          if (Date.now() < createModalCloseLockUntil) {
            return;
          }
          closeCreateModal();
        }
      });
    }
    if (editModal) {
      editModal.addEventListener("click", (event) => {
        if (event.target === editModal) {
          closeEditModal();
        }
      });
    }
    if (mentorModal) {
      mentorModal.addEventListener("click", (event) => {
        if (event.target === mentorModal) {
          closeMentorModal();
        }
      });
    }

    if (viewProgressBtn && ENABLE_VIEW_PROGRESS) {
      viewProgressBtn.addEventListener("click", () => {
        openProgressModal();
      });
    }

    if (manageBtn) {
      manageBtn.addEventListener("click", () => {
        openManageModal();
      });
    }

    if (manageCloseBtn) {
      manageCloseBtn.addEventListener("click", () => {
        closeManageModal();
      });
    }

    if (createQueueCloseBtn) {
      createQueueCloseBtn.addEventListener("click", () => {
        closeCreateQueueModal();
      });
    }

    if (createQueueModal) {
      createQueueModal.addEventListener("click", (event) => {
        if (event.target === createQueueModal) {
          closeCreateQueueModal();
        }
      });
    }

    if (createQueueList) {
      createQueueList.addEventListener("click", async (event) => {
        const deleteBtn = event.target.closest(".admin-create-queue-delete-btn");
        if (deleteBtn) {
          const card = deleteBtn.closest(".admin-create-queue-card");
          const requestId = card ? Number(card.dataset.requestId) : 0;
          if (!requestId) {
            return;
          }
          const confirmDelete = window.confirm("Delete this request?");
          if (!confirmDelete) {
            return;
          }
          const previousLabel = deleteBtn.textContent;
          deleteBtn.textContent = "Deleting...";
          deleteBtn.disabled = true;
          const result = await deleteEnrollmentRequest(requestId);
          if (!result.ok) {
            deleteBtn.textContent = previousLabel;
            deleteBtn.disabled = false;
            return;
          }
          enrollmentRequests = (enrollmentRequests || []).filter(
            (item) => Number(item && item.id) !== requestId
          );
          const pendingCount = Number.isFinite(result.pendingCount)
            ? Math.max(0, result.pendingCount)
            : countPendingEnrollmentRequests(enrollmentRequests);
          pendingEnrollmentRequests = pendingCount;
          updateRequestsBadge(pendingCount);
          updateManageBadge(pendingCount + renewalRequests.length);
          renderEnrollmentRequests(enrollmentRequests);
          renderCreateQueue(enrollmentRequests);
          return;
        }

        const createBtn = event.target.closest(".admin-create-queue-create-btn");
        if (!createBtn) {
          return;
        }
        const card = createBtn.closest(".admin-create-queue-card");
        const requestId = card ? Number(card.dataset.requestId) : 0;
        if (!requestId) {
          return;
        }
        const requestItem = (enrollmentRequests || []).find((item) => Number(item && item.id) === requestId);
        if (!requestItem) {
          return;
        }
        openCreateModalForRequest(requestItem);
      });
    }

    if (manageRequestsBtn) {
      manageRequestsBtn.addEventListener("click", () => {
        closeManageModal();
        openRequestsModal();
      });
    }

    if (manageRenewalsBtn) {
      manageRenewalsBtn.addEventListener("click", () => {
        closeManageModal();
        openRenewalsModal();
      });
    }

    if (manageCreateBtn) {
      manageCreateBtn.addEventListener("click", () => {
        closeManageModal();
        openCreateQueueModal();
      });
    }

    if (manageMentorBtn) {
      manageMentorBtn.addEventListener("click", () => {
        closeManageModal();
        openMentorsModal();
      });
    }

    if (manageDevicesBtn) {
      manageDevicesBtn.addEventListener("click", () => {
        closeManageModal();
        openDevicesModal();
      });
    }

    if (manageDeleteBtn) {
      manageDeleteBtn.addEventListener("click", () => {
        closeManageModal();
        openDeleteModal();
      });
    }

    if (progressCloseBtn && ENABLE_VIEW_PROGRESS) {
      progressCloseBtn.addEventListener("click", () => {
        closeProgressModal();
      });
    }

    if (progressModal && ENABLE_VIEW_PROGRESS) {
      progressModal.addEventListener("click", (event) => {
        if (event.target === progressModal) {
          closeProgressModal();
        }
      });
    }

    if (requestsCloseBtn) {
      requestsCloseBtn.addEventListener("click", () => {
        closeRequestsModal();
      });
    }

    if (requestsModal) {
      requestsModal.addEventListener("click", (event) => {
        if (event.target === requestsModal) {
          closeRequestsModal();
        }
      });
    }

    if (devicesCloseBtn) {
      devicesCloseBtn.addEventListener("click", () => {
        closeDevicesModal();
      });
    }

    if (devicesModal) {
      devicesModal.addEventListener("click", (event) => {
        if (event.target === devicesModal) {
          closeDevicesModal();
        }
      });
    }

    if (deviceDetailCloseBtn) {
      deviceDetailCloseBtn.addEventListener("click", () => {
        closeDeviceDetailModal();
      });
    }

    if (deviceDetailModal) {
      deviceDetailModal.addEventListener("click", (event) => {
        if (event.target === deviceDetailModal) {
          closeDeviceDetailModal();
        }
      });
    }

    if (devicesBody) {
      devicesBody.addEventListener("click", (event) => {
        const chip = event.target.closest(".admin-device-chip-btn");
        if (!chip) {
          return;
        }
        openDeviceDetailModal({
          username: chip.dataset.username || "-",
          deviceType: chip.dataset.deviceType || "unknown",
          firstSeen: chip.dataset.firstSeen || "-",
          lastSeen: chip.dataset.lastSeen || "-",
          loginCount: chip.dataset.loginCount || "0",
          lastIp: chip.dataset.lastIp || "-",
          location: [chip.dataset.city, chip.dataset.region, chip.dataset.country]
            .filter((value) => value && value.trim())
            .join(", ") || "-",
          timezone: chip.dataset.timezone || "-",
          org: chip.dataset.org || "-",
          userAgent: chip.dataset.userAgent || "-",
        });
      });
    }

    if (usersTableBody) {
      usersTableBody.addEventListener("click", (event) => {
        const target = event.target;
        if (!(target instanceof HTMLElement)) {
          return;
        }
        const editBtn = target.closest(".admin-user-edit-btn");
        if (!editBtn) {
          return;
        }
        const row = editBtn.closest("tr");
        const username = row ? String(row.dataset.targetUsername || "").trim() : "";
        if (!username) {
          return;
        }
        const user = payloadUsersCache.find((item) => String(item.username || "") === username);
        if (!user) {
          return;
        }
        openEditModal(user);
      });
    }

    if (manageModal) {
      manageModal.addEventListener("click", (event) => {
        if (event.target === manageModal) {
          closeManageModal();
        }
      });
    }

    if (renewalsCloseBtn) {
      renewalsCloseBtn.addEventListener("click", () => {
        closeRenewalsModal();
      });
    }

    if (renewalsModal) {
      renewalsModal.addEventListener("click", (event) => {
        if (event.target === renewalsModal) {
          closeRenewalsModal();
        }
      });
    }

    if (paymentApprovalBtn) {
      paymentApprovalBtn.addEventListener("click", () => {
        closeRenewalsModal();
        openPaymentsModal();
      });
    }

    if (paymentsCloseBtn) {
      paymentsCloseBtn.addEventListener("click", () => {
        closePaymentsModal();
      });
    }

    if (paymentsModal) {
      paymentsModal.addEventListener("click", (event) => {
        if (event.target === paymentsModal) {
          closePaymentsModal();
        }
      });
    }

    if (deleteCloseBtn) {
      deleteCloseBtn.addEventListener("click", () => {
        closeDeleteModal();
      });
    }

    if (deleteModal) {
      deleteModal.addEventListener("click", (event) => {
        if (event.target === deleteModal) {
          closeDeleteModal();
        }
      });
    }

    if (deleteBody) {
      deleteBody.addEventListener("click", (event) => {
        const target = event.target;
        if (!(target instanceof HTMLElement)) {
          return;
        }
        if (!target.classList.contains("admin-delete-btn")) {
          return;
        }
        const row = target.closest("tr");
        const username = row ? String(row.dataset.targetUsername || "").trim() : "";
        if (!authState || !authState.username || !username) {
          return;
        }
        openDeleteConfirmModal(username);
      });
    }

    if (deleteConfirmCancel) {
      deleteConfirmCancel.addEventListener("click", () => {
        closeDeleteConfirmModal();
      });
    }

    if (deleteConfirmModal) {
      deleteConfirmModal.addEventListener("click", (event) => {
        if (event.target === deleteConfirmModal) {
          closeDeleteConfirmModal();
        }
      });
    }

    if (deleteConfirmAccept) {
      deleteConfirmAccept.addEventListener("click", async () => {
        if (!authState || !authState.username) {
          return;
        }
        const username = deleteConfirmModal ? String(deleteConfirmModal.dataset.username || "").trim() : "";
        if (!username) {
          return;
        }
        try {
          const response = await fetch(`${API_BASE_URL}/api/admin/users/delete`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              admin_username: authState.username,
              username,
            }),
          });
          if (!response.ok) {
            return;
          }
          closeDeleteConfirmModal();
          await loadAdminOverview();
        } catch (error) {
          // Ignore for now.
        }
      });
    }

    if (renewalsBody) {
      renewalsBody.addEventListener("click", async (event) => {
        const target = event.target;
        if (!(target instanceof HTMLElement)) {
          return;
        }
        const row = target.closest("tr");
        const username = row ? String(row.dataset.targetUsername || "").trim() : "";
        if (target.classList.contains("admin-renewals-check-btn")) {
          if (paymentUsername && username) {
            paymentUsername.value = username;
          }
          if (paymentDate && !paymentDate.value) {
            const today = new Date();
            paymentDate.value = today.toISOString().slice(0, 10);
          }
          closeRenewalsModal();
          openPaymentsModal();
          return;
        }
        if (target.classList.contains("admin-renewals-extend-btn")) {
          if (!authState || !authState.username || !username) {
            return;
          }
          try {
            const response = await fetch(`${API_BASE_URL}/api/admin/users/extend-subscription`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                admin_username: authState.username,
                username,
                renewal_id: row ? row.dataset.renewalId : "",
              }),
            });
            if (!response.ok) {
              return;
            }
            if (row) {
              row.remove();
            }
            const renewalId = row ? String(row.dataset.renewalId || "").trim() : "";
            if (renewalId) {
              renewalRequests = (renewalRequests || []).filter(
                (item) => String(item.id || "").trim() !== renewalId
              );
            } else if (username) {
              const usernameLower = username.toLowerCase();
              renewalRequests = (renewalRequests || []).filter((item) => {
                const target = String(item.submitted_username || item.username || "").toLowerCase();
                return target !== usernameLower;
              });
            }
            renderRenewalRequests(renewalRequests);
            updateRenewalsBadge(renewalRequests.length);
            updateManageBadge(pendingEnrollmentRequests + renewalRequests.length);
          } catch (error) {
            // Ignore for now.
          }
        }
      });
    }

    const handlePaymentUpload = async () => {
      if (!authState || !authState.username) {
        return;
      }
      if (!paymentUsername || !paymentDate || !paymentFile) {
        return;
      }
      const username = paymentUsername.value.trim();
      const dateValue = paymentDate.value;
      const file = paymentFile.files && paymentFile.files[0];
      if (!username || !dateValue || !file) {
        if (paymentMessage) {
          paymentMessage.textContent = "Fill all fields and attach a file.";
        }
        return;
      }
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/api/admin/payment-checks/upload`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              admin_username: authState.username,
              username,
              payment_date: dateValue,
              file_name: file.name,
              file_data: reader.result || "",
            }),
          });
          if (!response.ok) {
            if (paymentMessage) {
              paymentMessage.textContent = "Could not upload payment proof.";
            }
            return;
          }
          if (paymentMessage) {
            paymentMessage.textContent = "Payment proof saved.";
          }
          paymentFile.value = "";
          await loadPaymentChecks();
          createModalCloseLockUntil = Date.now() + 5000;
          if (createModal) {
            createModal.dataset.closeLockUntil = String(createModalCloseLockUntil);
          }
          closePaymentsModal();
          if (createModal && createModal.classList.contains("is-open")) {
            syncCreateApprovalState();
            if (createMessage) {
              createMessage.textContent = "Payment approval added. You can create the user now.";
              createMessage.classList.add("is-success");
            }
          }
        } catch (error) {
          if (paymentMessage) {
            paymentMessage.textContent = "Auth server is not running.";
          }
        }
      };
      reader.readAsDataURL(file);
    };

    if (paymentSubmitBtn) {
      paymentSubmitBtn.addEventListener("click", (event) => {
        if (event) {
          event.preventDefault();
          event.stopPropagation();
        }
        handlePaymentUpload();
      });
    }

    if (knowledgeToggleBtn) {
      knowledgeToggleBtn.addEventListener("click", () => {
        knowledgeAttemptsExpanded = !knowledgeAttemptsExpanded;
        renderKnowledgeAttempts(knowledgeAttemptsCache);
      });
    }

    if (adminUsernameSearchInput) {
      adminUsernameSearchInput.addEventListener("input", () => {
        adminUsernameFilterQuery = normalizeUsernameFilter(adminUsernameSearchInput.value);
        applyAdminUsernameFilters();
      });
    }

    if (requestsSearchInput) {
      requestsSearchInput.addEventListener("input", () => {
        adminRequestsSearchQuery = normalizeRequestsFilter(requestsSearchInput.value);
        applyRequestsFilter();
      });
      requestsSearchInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          adminRequestsSearchQuery = normalizeRequestsFilter(requestsSearchInput.value);
          applyRequestsFilter();
        }
      });
    }
    if (requestsSearchBtn) {
      requestsSearchBtn.addEventListener("click", () => {
        adminRequestsSearchQuery = normalizeRequestsFilter(requestsSearchInput ? requestsSearchInput.value : "");
        applyRequestsFilter();
        if (requestsSearchInput) {
          requestsSearchInput.focus();
        }
      });
    }

    if (adminSearchBtn) {
      adminSearchBtn.addEventListener("click", () => {
        adminUsernameFilterQuery = normalizeUsernameFilter(adminUsernameSearchInput ? adminUsernameSearchInput.value : "");
        applyAdminUsernameFilters();
        if (adminUsernameSearchInput) {
          adminUsernameSearchInput.focus();
        }
      });
    }

    if (createForm) {
      createForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const name = createNameInput ? createNameInput.value.trim() : "";
        const phone = createPhoneInput ? createPhoneInput.value.trim() : "";
        const level = createLevelInput ? createLevelInput.value.trim().toLowerCase() : "";
        const isExpress = isExpressLevel(level);
        const lessonSchedule = isExpress ? "" : (createScheduleInput ? createScheduleInput.value.trim() : "");
        const username = createUsernameInput ? createUsernameInput.value.trim() : "";
        const password = createPasswordInput ? createPasswordInput.value : "";
        if (!name || !phone || !level || !username || !password) {
          if (createMessage) {
            createMessage.textContent = "Missing user data. Please reopen the request.";
            createMessage.classList.remove("is-success");
          }
          return;
        }
        if (!isExpress && !lessonSchedule) {
          if (createMessage) {
            createMessage.textContent = "Select lesson days for this student.";
            createMessage.classList.remove("is-success");
          }
          return;
        }
        if (!hasPaymentApproval(username)) {
          if (createMessage) {
            createMessage.textContent = "Please add Payment Approval first.";
            createMessage.classList.remove("is-success");
          }
          syncCreateApprovalState();
          return;
        }

        try {
          const response = await fetch(`${API_BASE_URL}/api/admin/users/create`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              admin_username: authState.username,
              name,
              phone,
              level,
              lesson_schedule: lessonSchedule,
              username,
              password,
            }),
          });

          const payload = await response.json();
          if (!response.ok) {
            if (createMessage) {
              createMessage.textContent = payload.error || "Could not create user.";
              createMessage.classList.remove("is-success");
            }
            return;
          }

          if (createMessage) {
            createMessage.textContent = `User ${payload.username} created.`;
            createMessage.classList.add("is-success");
          }
          const requestId = activeEnrollmentRequest
            ? Number(activeEnrollmentRequest.id)
            : Number(createModal && createModal.dataset ? createModal.dataset.requestId : 0);
          if (requestId) {
            await markEnrollmentRequestDone(requestId);
          }
          await loadAdminOverview();
          if (createQueueModal && createQueueModal.classList.contains("is-open")) {
            renderCreateQueue(enrollmentRequests);
          }
          setTimeout(() => {
            closeCreateModal({ force: true });
          }, 700);
        } catch (error) {
          if (createMessage) {
            createMessage.textContent = "Auth server is not running.";
            createMessage.classList.remove("is-success");
          }
        }
      });
    }

    if (editForm) {
      editForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        if (!authState || !authState.username) {
          return;
        }
        if (!editTargetUsername) {
          return;
        }
        const name = editNameInput ? editNameInput.value.trim() : "";
        const phone = editPhoneInput ? editPhoneInput.value.trim() : "";
        const level = editLevelInput ? editLevelInput.value.trim().toLowerCase() : "";
        const schedule = editScheduleInput ? editScheduleInput.value.trim() : "";
        const password = editPasswordInput ? editPasswordInput.value.trim() : "";
        if (!name || !phone || !level || !schedule) {
          if (editMessage) {
            editMessage.textContent = "Fill all required fields before saving.";
            editMessage.classList.remove("is-success");
          }
          return;
        }
        try {
          const response = await fetch(`${API_BASE_URL}/api/admin/users/update`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              admin_username: authState.username,
              username: editTargetUsername,
              name,
              phone,
              level,
              lesson_schedule: schedule,
              ...(password ? { password } : {}),
            }),
          });
          const payload = await response.json();
          if (!response.ok) {
            if (editMessage) {
              editMessage.textContent = payload.error || "Could not update user.";
              editMessage.classList.remove("is-success");
            }
            return;
          }
          if (editMessage) {
            editMessage.textContent = `User ${editTargetUsername} updated.`;
            editMessage.classList.add("is-success");
          }
          await loadAdminOverview();
          setTimeout(() => {
            closeEditModal();
          }, 700);
        } catch (error) {
          if (editMessage) {
            editMessage.textContent = "Auth server is not running.";
            editMessage.classList.remove("is-success");
          }
        }
      });
    }

    if (mentorForm) {
      mentorForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        if (!authState || !authState.username) {
          return;
        }
        const name = mentorNameInput ? mentorNameInput.value.trim() : "";
        const level = mentorLevelInput ? mentorLevelInput.value.trim().toLowerCase() : "";
        const phone = mentorPhoneInput ? mentorPhoneInput.value.trim() : "";
        const email = mentorEmailInput ? mentorEmailInput.value.trim() : "";
        const telegram = mentorTelegramInput ? mentorTelegramInput.value.trim() : "";
        const info = mentorInfoInput ? mentorInfoInput.value.trim() : "";
        const file = mentorAvatarInput && mentorAvatarInput.files ? mentorAvatarInput.files[0] : null;
        if (!name || !level || !phone || !email || !telegram || !info || !file) {
          if (mentorMessage) {
            mentorMessage.textContent = "Fill all fields and upload an avatar.";
            mentorMessage.classList.remove("is-success");
          }
          syncMentorAvatarState();
          return;
        }
        const reader = new FileReader();
        reader.onload = async () => {
          try {
            const response = await fetch(`${API_BASE_URL}/api/admin/mentors/create`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                admin_username: authState.username,
                name,
                level,
                phone,
                email,
                telegram_username: telegram,
                info,
                file_name: file.name,
                file_data: reader.result || "",
              }),
            });
            const payload = await response.json();
            if (!response.ok) {
              if (mentorMessage) {
                mentorMessage.textContent = payload.error || "Could not create mentor.";
                mentorMessage.classList.remove("is-success");
              }
              return;
            }
            if (mentorMessage) {
              mentorMessage.textContent = `Mentor ${payload.name || name} created.`;
              mentorMessage.classList.add("is-success");
            }
            if (mentorsModal && mentorsModal.classList.contains("is-open")) {
              await loadMentors();
            }
            setTimeout(() => {
              closeMentorModal();
            }, 700);
          } catch (error) {
            if (mentorMessage) {
              mentorMessage.textContent = "Auth server is not running.";
              mentorMessage.classList.remove("is-success");
            }
          }
        };
        reader.readAsDataURL(file);
      });
    }

    if (mentorEditForm) {
      mentorEditForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const file = mentorEditAvatarInput && mentorEditAvatarInput.files ? mentorEditAvatarInput.files[0] : null;
        if (!file) {
          submitMentorEdit({});
          return;
        }
        const reader = new FileReader();
        reader.onload = async () => {
          await submitMentorEdit({
            file_name: file.name,
            file_data: reader.result || "",
          });
        };
        reader.readAsDataURL(file);
      });
    }

    loadAdminOverview();
  }
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && loginModal && loginModal.classList.contains("is-open")) {
    closeLoginModal();
    return;
  }
  if (event.key === "Escape" && profileModal && profileModal.classList.contains("is-open")) {
    closeProfileModal();
    return;
  }
  if (event.key === "Escape" && achievementsModal && achievementsModal.classList.contains("is-open")) {
    closeAchievementsModal();
    return;
  }
  if (event.key === "Escape" && leaderboardModal && leaderboardModal.classList.contains("is-open")) {
    closeLeaderboardModal();
    return;
  }
  if (event.key === "Escape" && knowledgeTestModal && knowledgeTestModal.classList.contains("is-open")) {
    // Keep knowledge test result open; close only via explicit close button.
    return;
  }
  if (event.key === "Escape" && enrollModal && enrollModal.classList.contains("is-open")) {
    closeEnrollModal();
    return;
  }
  if (event.key === "Escape" && enrollSuccessModal && enrollSuccessModal.classList.contains("is-open")) {
    closeEnrollSuccessModal();
    return;
  }
  if (event.key === "Escape" && upgradeModal && upgradeModal.classList.contains("is-open")) {
    closeUpgradeModal();
    return;
  }
  if (event.key === "Escape" && resultsModal && resultsModal.classList.contains("is-open")) {
    closeResultsModal();
    return;
  }
  if (event.key === "Escape" && termsModal && termsModal.classList.contains("is-open")) {
    closeTermsModal();
    return;
  }
  if (event.key === "Escape" && privacyModal && privacyModal.classList.contains("is-open")) {
    closePrivacyModal();
    return;
  }
  const createModal = document.getElementById("admin-create-modal");
  if (event.key === "Escape" && createModal && createModal.classList.contains("is-open")) {
    const lockUntil = Number(createModal.dataset.closeLockUntil || 0);
    if (lockUntil && Date.now() < lockUntil) {
      return;
    }
    createModal.classList.remove("is-open");
    createModal.setAttribute("aria-hidden", "true");
  }
  const editModal = document.getElementById("admin-edit-modal");
  if (event.key === "Escape" && editModal && editModal.classList.contains("is-open")) {
    editModal.classList.remove("is-open");
    editModal.setAttribute("aria-hidden", "true");
  }
  const mentorModal = document.getElementById("admin-mentor-modal");
  if (event.key === "Escape" && mentorModal && mentorModal.classList.contains("is-open")) {
    mentorModal.classList.remove("is-open");
    mentorModal.setAttribute("aria-hidden", "true");
  }
  const mentorsModal = document.getElementById("admin-mentors-modal");
  if (event.key === "Escape" && mentorsModal && mentorsModal.classList.contains("is-open")) {
    mentorsModal.classList.remove("is-open");
    mentorsModal.setAttribute("aria-hidden", "true");
    syncModalBodyScroll();
  }
  const mentorEditModal = document.getElementById("admin-mentor-edit-modal");
  if (event.key === "Escape" && mentorEditModal && mentorEditModal.classList.contains("is-open")) {
    mentorEditModal.classList.remove("is-open");
    mentorEditModal.setAttribute("aria-hidden", "true");
    syncModalBodyScroll();
  }
  const progressModal = document.getElementById("admin-progress-modal");
  if (event.key === "Escape" && progressModal && progressModal.classList.contains("is-open")) {
    progressModal.classList.remove("is-open");
    progressModal.setAttribute("aria-hidden", "true");
    syncModalBodyScroll();
    return;
  }
  const requestsModal = document.getElementById("admin-requests-modal");
  if (event.key === "Escape" && requestsModal && requestsModal.classList.contains("is-open")) {
    requestsModal.classList.remove("is-open");
    requestsModal.setAttribute("aria-hidden", "true");
    syncModalBodyScroll();
  }
  const createQueueModal = document.getElementById("admin-create-queue-modal");
  if (event.key === "Escape" && createQueueModal && createQueueModal.classList.contains("is-open")) {
    createQueueModal.classList.remove("is-open");
    createQueueModal.setAttribute("aria-hidden", "true");
    syncModalBodyScroll();
  }
  const devicesModal = document.getElementById("admin-devices-modal");
  if (event.key === "Escape" && devicesModal && devicesModal.classList.contains("is-open")) {
    devicesModal.classList.remove("is-open");
    devicesModal.setAttribute("aria-hidden", "true");
    syncModalBodyScroll();
  }
  const deviceDetailModal = document.getElementById("admin-device-detail-modal");
  if (event.key === "Escape" && deviceDetailModal && deviceDetailModal.classList.contains("is-open")) {
    deviceDetailModal.classList.remove("is-open");
    deviceDetailModal.setAttribute("aria-hidden", "true");
    syncModalBodyScroll();
  }
  const manageModal = document.getElementById("admin-manage-modal");
  if (event.key === "Escape" && manageModal && manageModal.classList.contains("is-open")) {
    manageModal.classList.remove("is-open");
    manageModal.setAttribute("aria-hidden", "true");
    syncModalBodyScroll();
  }
  const renewalsModal = document.getElementById("admin-renewals-modal");
  if (event.key === "Escape" && renewalsModal && renewalsModal.classList.contains("is-open")) {
    renewalsModal.classList.remove("is-open");
    renewalsModal.setAttribute("aria-hidden", "true");
    syncModalBodyScroll();
  }
  const paymentsModal = document.getElementById("admin-payments-modal");
  if (event.key === "Escape" && paymentsModal && paymentsModal.classList.contains("is-open")) {
    paymentsModal.classList.remove("is-open");
    paymentsModal.setAttribute("aria-hidden", "true");
    syncModalBodyScroll();
  }
  const deleteModal = document.getElementById("admin-delete-modal");
  if (event.key === "Escape" && deleteModal && deleteModal.classList.contains("is-open")) {
    deleteModal.classList.remove("is-open");
    deleteModal.setAttribute("aria-hidden", "true");
    syncModalBodyScroll();
  }
  const deleteConfirmModal = document.getElementById("admin-delete-confirm-modal");
  if (event.key === "Escape" && deleteConfirmModal && deleteConfirmModal.classList.contains("is-open")) {
    deleteConfirmModal.classList.remove("is-open");
    deleteConfirmModal.setAttribute("aria-hidden", "true");
    syncModalBodyScroll();
  }
});




