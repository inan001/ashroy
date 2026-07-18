(() => {
  "use strict";

  const STRINGS = {
    bn: {
      title: "আশ্রয় — অফলাইন জরুরি সহায়ক",
      brandName: "আশ্রয়",
      disclaimer: "এটি সাধারণ প্রস্তুতিমূলক নির্দেশনা, জরুরি সেবার বিকল্প নয়।",
      call999Label: "৯৯৯",
      call999Aria: "৯৯৯ নম্বরে কল করুন",
      statusOnline: "লোকাল",
      statusOffline: "অফলাইন",
      statusChecking: "যাচাই হচ্ছে",
      langToggleAria: "ভাষা পরিবর্তন করুন / Switch language",
      langToggleLabel: "EN",
      emptyStateTitle: "আশ্রয়ে স্বাগতম",
      emptyStateBody: "একটি পরিস্থিতি বেছে নিন, অথবা নিচে আপনার প্রশ্ন লিখুন।",
      scenarioGroupLabel: "পরিস্থিতি বেছে নিন",
      scenarioFlood: "বন্যা",
      scenarioCyclone: "ঘূর্ণিঝড়",
      scenarioFirstaid: "প্রাথমিক চিকিৎসা",
      scenarioKit: "জরুরি ব্যাগ",
      inputLabel: "আপনার বার্তা লিখুন",
      inputPlaceholder: "এখানে লিখুন…",
      sendAria: "পাঠান",
      thinking: "আশ্রয় ভাবছে",
      thinkingSlow: "একটু সময় লাগছে, অপেক্ষা করুন…",
      errorGeneric: "উত্তর পাওয়া যায়নি। আবার চেষ্টা করুন, অথবা জরুরি অবস্থায় ৯৯৯ নম্বরে কল করুন।",
      seedFlood: "বন্যার সময় আমার কী করা উচিত?",
      seedCyclone: "ঘূর্ণিঝড়ের জন্য আমার কীভাবে প্রস্তুতি নেওয়া উচিত?",
      seedFirstaid: "রক্তক্ষরণ হলে আমি কীভাবে প্রাথমিক চিকিৎসা দেব?",
      seedKit: "আমার জরুরি ব্যাগে কী কী থাকা উচিত?",
    },
    en: {
      title: "Ashroy — Offline Emergency Companion",
      brandName: "Ashroy",
      disclaimer: "This is general preparedness guidance, not a substitute for emergency services.",
      call999Label: "999",
      call999Aria: "Call 999",
      statusOnline: "LOCAL",
      statusOffline: "OFFLINE",
      statusChecking: "Checking",
      langToggleAria: "Switch language / ভাষা পরিবর্তন করুন",
      langToggleLabel: "বাং",
      emptyStateTitle: "Welcome to Ashroy",
      emptyStateBody: "Pick a scenario, or type your question below.",
      scenarioGroupLabel: "Pick a scenario",
      scenarioFlood: "Flood",
      scenarioCyclone: "Cyclone",
      scenarioFirstaid: "First Aid",
      scenarioKit: "Emergency Kit",
      inputLabel: "Type your message",
      inputPlaceholder: "Type here…",
      sendAria: "Send",
      thinking: "Ashroy is thinking",
      thinkingSlow: "Still working, this can take a bit longer…",
      errorGeneric: "Couldn't get a reply. Try again, or call 999 if this is an emergency.",
      seedFlood: "What should I do during a flood?",
      seedCyclone: "How should I prepare for a cyclone?",
      seedFirstaid: "How do I give first aid for a bleeding injury?",
      seedKit: "What should be in my emergency kit?",
    },
  };

  const SCENARIO_SEED_KEYS = {
    flood: "seedFlood",
    cyclone: "seedCyclone",
    firstaid: "seedFirstaid",
    kit: "seedKit",
  };

  const HEALTH_POLL_MS = 10000;
  const THINKING_SLOW_MS = 8000;
  const MAX_TEXTAREA_HEIGHT = 136;

  const state = {
    lang: localStorage.getItem("ashroy_lang") || "bn",
    sessionId: null,
    scenario: null,
    sending: false,
  };

  const els = {
    html: document.documentElement,
    brandName: document.getElementById("brandName"),
    statusBadge: document.getElementById("statusBadge"),
    statusLabel: document.getElementById("statusLabel"),
    langToggle: document.getElementById("langToggle"),
    disclaimerText: document.getElementById("disclaimerText"),
    call999: document.getElementById("call999"),
    call999Label: document.getElementById("call999Label"),
    chatMain: document.getElementById("chatMain"),
    messageList: document.getElementById("messageList"),
    emptyState: document.getElementById("emptyState"),
    emptyStateTitle: document.getElementById("emptyStateTitle"),
    emptyStateBody: document.getElementById("emptyStateBody"),
    scenarioRow: document.getElementById("scenarioRow"),
    composerForm: document.getElementById("composerForm"),
    inputLabel: document.getElementById("inputLabel"),
    messageInput: document.getElementById("messageInput"),
    sendBtn: document.getElementById("sendBtn"),
  };

  function t(key) {
    return STRINGS[state.lang][key];
  }

  function applyTranslations() {
    const s = STRINGS[state.lang];
    els.html.lang = state.lang;
    document.title = s.title;
    els.brandName.textContent = s.brandName;
    els.disclaimerText.textContent = s.disclaimer;
    els.call999Label.textContent = s.call999Label;
    els.call999.setAttribute("aria-label", s.call999Aria);
    els.langToggle.textContent = s.langToggleLabel;
    els.langToggle.setAttribute("aria-label", s.langToggleAria);
    els.emptyStateTitle.textContent = s.emptyStateTitle;
    els.emptyStateBody.textContent = s.emptyStateBody;
    els.scenarioRow.setAttribute("aria-label", s.scenarioGroupLabel);
    els.inputLabel.textContent = s.inputLabel;
    els.messageInput.placeholder = s.inputPlaceholder;
    els.sendBtn.setAttribute("aria-label", s.sendAria);

    document.querySelectorAll("[data-i18n]").forEach((node) => {
      const key = node.getAttribute("data-i18n");
      node.textContent = s[key];
    });

    updateStatusBadge(els.statusBadge.dataset.state);
  }

  function setLang(lang) {
    state.lang = lang;
    localStorage.setItem("ashroy_lang", lang);
    applyTranslations();
  }

  els.langToggle.addEventListener("click", () => {
    setLang(state.lang === "bn" ? "en" : "bn");
  });

  // ---------- Status badge ----------

  function updateStatusBadge(uiState, mode) {
    els.statusBadge.dataset.state = uiState;
    if (uiState === "checking") {
      els.statusLabel.textContent = t("statusChecking");
    } else if (uiState === "online") {
      els.statusLabel.textContent = mode ? mode.toUpperCase() : t("statusOnline");
    } else {
      els.statusLabel.textContent = t("statusOffline");
    }
  }

  async function pollHealth() {
    try {
      const res = await fetch("/api/health");
      if (!res.ok) throw new Error("health check failed");
      const data = await res.json();
      updateStatusBadge(data.ollama === "online" ? "online" : "offline", data.mode);
    } catch {
      updateStatusBadge("offline");
    }
  }

  pollHealth();
  setInterval(pollHealth, HEALTH_POLL_MS);

  // ---------- Message rendering ----------

  function scrollToBottom() {
    els.chatMain.scrollTop = els.chatMain.scrollHeight;
  }

  function hideEmptyState() {
    if (els.emptyState.parentNode) {
      els.emptyState.remove();
    }
  }

  function addUserMessage(text) {
    hideEmptyState();
    const el = document.createElement("div");
    el.className = "message message--user";
    const bubble = document.createElement("div");
    bubble.className = "bubble";
    bubble.textContent = text;
    el.appendChild(bubble);
    els.messageList.appendChild(el);
    scrollToBottom();
    return el;
  }

  function addAssistantMessage(text) {
    const el = document.createElement("div");
    el.className = "message message--assistant";
    const bubble = document.createElement("div");
    bubble.className = "bubble";
    bubble.textContent = text;
    el.appendChild(bubble);
    els.messageList.appendChild(el);
    scrollToBottom();
    return el;
  }

  function addThinkingMessage() {
    const el = document.createElement("div");
    el.className = "message message--thinking";
    const bubble = document.createElement("div");
    bubble.className = "bubble";

    const label = document.createElement("span");
    label.textContent = t("thinking");
    bubble.appendChild(label);

    const dots = document.createElement("span");
    dots.className = "typing-dots";
    dots.setAttribute("aria-hidden", "true");
    dots.innerHTML = "<span></span><span></span><span></span>";
    bubble.appendChild(dots);

    el.appendChild(bubble);
    els.messageList.appendChild(el);
    scrollToBottom();

    const slowTimer = setTimeout(() => {
      label.textContent = t("thinkingSlow");
    }, THINKING_SLOW_MS);

    return { el, slowTimer };
  }

  function addErrorMessage(text) {
    const el = document.createElement("div");
    el.className = "message message--error";
    const bubble = document.createElement("div");
    bubble.className = "bubble";

    const icon = document.createElement("span");
    icon.className = "error-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = "⚠";
    bubble.appendChild(icon);

    const text_ = document.createElement("span");
    text_.textContent = text;
    bubble.appendChild(text_);

    el.appendChild(bubble);
    els.messageList.appendChild(el);
    scrollToBottom();
  }

  // ---------- Sending ----------

  function setSending(sending) {
    state.sending = sending;
    els.messageInput.disabled = sending;
    els.sendBtn.disabled = sending;
    document.querySelectorAll(".scenario-btn").forEach((btn) => {
      btn.disabled = sending;
    });
  }

  async function sendMessage(text) {
    if (state.sending || !text.trim()) return;

    addUserMessage(text.trim());
    setSending(true);

    const { el: thinkingEl, slowTimer } = addThinkingMessage();

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text.trim(),
          sessionId: state.sessionId,
          scenario: state.scenario,
        }),
      });

      const data = await res.json();
      clearTimeout(slowTimer);
      thinkingEl.remove();

      if (!res.ok) {
        addErrorMessage(t("errorGeneric"));
        return;
      }

      state.sessionId = data.sessionId;
      addAssistantMessage(data.reply);
    } catch {
      clearTimeout(slowTimer);
      thinkingEl.remove();
      addErrorMessage(t("errorGeneric"));
    } finally {
      setSending(false);
      els.messageInput.focus();
    }
  }

  els.composerForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = els.messageInput.value;
    if (!text.trim()) return;
    els.messageInput.value = "";
    autoGrowTextarea();
    sendMessage(text);
  });

  els.messageInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      els.composerForm.requestSubmit();
    }
  });

  function autoGrowTextarea() {
    els.messageInput.style.height = "auto";
    els.messageInput.style.height =
      Math.min(els.messageInput.scrollHeight, MAX_TEXTAREA_HEIGHT) + "px";
  }
  els.messageInput.addEventListener("input", autoGrowTextarea);

  // ---------- Scenario buttons ----------

  document.querySelectorAll(".scenario-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (state.sending) return;
      const scenario = btn.dataset.scenario;
      state.scenario = scenario;

      document.querySelectorAll(".scenario-btn").forEach((b) => {
        b.setAttribute("aria-pressed", String(b === btn));
      });

      const seedText = t(SCENARIO_SEED_KEYS[scenario]);
      sendMessage(seedText);
    });
  });

  // ---------- Init ----------

  applyTranslations();
})();
