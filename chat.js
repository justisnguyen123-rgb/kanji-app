(() => {
  const App = window.KanjiApp;

  const KEY_STORE = 'kc_gemini_key';
  const MODEL_STORE = 'kc_gemini_model';
  const LEVEL_STORE = 'kc_level';

  const MODELS = [
    { id: 'gemini-3.5-flash-lite', label: 'Gemini 3.5 Flash-Lite (fast)' },
    { id: 'gemini-3.8-flash', label: 'Gemini 3.8 Flash (smarter, slower)' },
  ];

  const LEVELS = {
    beginner: {
      label: 'Beginner',
      prompt: 'Beginner (about JLPT N5). Use very short, simple sentences and common vocabulary. At most one short sentence plus one short question per turn.',
      lines: '1-2 short sentences',
    },
    intermediate: {
      label: 'Intermediate',
      prompt: 'Intermediate (about JLPT N4-N3). Use natural staff speech with some variety, and add a small complication when it fits (for example an item is sold out, or there is a wait).',
      lines: '1-3 sentences',
    },
  };

  const FIRST_TURN = "Begin the scene now with the staff member's first line. There is no learner message yet, so correction.needed must be false.";
  const SUMMARY_PROMPT = 'The practice is over. Ignore the role-play fields and fill the summary schema instead: briefly say how I did, what went well, what to review (with the better Japanese), and the useful new words from this conversation.';

  const str = { type: 'STRING' };

  const TURN_SCHEMA = {
    type: 'OBJECT',
    properties: {
      reply_ja: str,
      reply_kana: str,
      reply_en: str,
      correction: {
        type: 'OBJECT',
        properties: {
          needed: { type: 'BOOLEAN' },
          better_ja: str,
          better_kana: str,
          explanation_en: str,
        },
        required: ['needed'],
      },
      hint_ja: str,
      hint_kana: str,
      hint_en: str,
      scene_finished: { type: 'BOOLEAN' },
    },
    required: ['reply_ja', 'reply_kana', 'reply_en', 'correction', 'hint_ja', 'hint_kana', 'hint_en'],
  };

  const SUMMARY_SCHEMA = {
    type: 'OBJECT',
    properties: {
      summary_en: str,
      went_well: { type: 'ARRAY', items: str },
      to_review: {
        type: 'ARRAY',
        items: { type: 'OBJECT', properties: { ja: str, kana: str, en: str, note: str } },
      },
      new_words: {
        type: 'ARRAY',
        items: { type: 'OBJECT', properties: { ja: str, kana: str, en: str } },
      },
    },
    required: ['summary_en', 'went_well', 'to_review', 'new_words'],
  };

  class ChatError extends Error {}

  // ---- helpers ----

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function load(key, fallback) {
    try { return localStorage.getItem(key) || fallback; } catch (e) { return fallback; }
  }
  function save(key, value) {
    try { localStorage.setItem(key, value); return true; } catch (e) { return false; }
  }
  function drop(key) {
    try { localStorage.removeItem(key); } catch (e) { /* storage unavailable */ }
  }

  const bodyEl = document.getElementById('practice-body');
  const titleEl = document.getElementById('practice-title');
  const backBtn = document.getElementById('btn-practice-back');

  let chat = null;

  // ---- API ----

  function friendlyError(status, data) {
    const detail = data && data.error && data.error.message ? String(data.error.message).slice(0, 220) : '';
    if (status === 429) return 'You have hit the free-tier rate limit. Wait a minute and try again.';
    if (status === 400 && /api key/i.test(detail)) return 'Google rejected the API key. Open settings, remove it and paste it again.';
    if (status === 401 || status === 403) return `Access denied for this key. ${detail}`.trim();
    if (status === 404) return `That model is not available to your key. Try the other model in settings. ${detail}`.trim();
    return `Request failed (${status}). ${detail}`.trim();
  }

  async function callGemini(history, schema) {
    const key = load(KEY_STORE, '');
    const model = load(MODEL_STORE, MODELS[0].id);
    const body = {
      systemInstruction: { parts: [{ text: chat.system }] },
      contents: history.map(h => ({ role: h.role, parts: [{ text: h.text }] })),
      generationConfig: {
        temperature: 0.8,
        responseMimeType: 'application/json',
        responseSchema: schema,
      },
    };

    let res;
    try {
      res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
        body: JSON.stringify(body),
      });
    } catch (e) {
      throw new ChatError('Network error. Check your connection and try again.');
    }

    let data = null;
    try { data = await res.json(); } catch (e) { /* non-JSON error body */ }
    if (!res.ok) throw new ChatError(friendlyError(res.status, data));

    const block = data && data.promptFeedback && data.promptFeedback.blockReason;
    if (block) throw new ChatError(`The request was blocked (${block}). Try rephrasing.`);

    const parts = (data && data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) || [];
    const text = parts.map(p => p.text || '').join('');
    if (!text) throw new ChatError('The AI returned an empty reply. Try again.');
    return text;
  }

  function parseJson(raw, requiredField) {
    let obj;
    try {
      obj = JSON.parse(raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, ''));
    } catch (e) {
      throw new ChatError('The AI reply was not in the expected format. Try again.');
    }
    if (!obj || typeof obj[requiredField] !== 'string' && !Array.isArray(obj[requiredField])) {
      throw new ChatError('The AI reply was missing fields. Try again.');
    }
    return obj;
  }

  function buildSystemPrompt(scenario, levelKey) {
    const level = LEVELS[levelKey];
    const vocab = scenario.vocab.map(w => {
      const card = App.wordMap[w];
      return card ? `${w} (${card.kana}) = ${card.meaning}` : w;
    }).join('\n');

    return `You are a role-play partner helping an English-speaking learner practise spoken Japanese for eating out in Japan.

SCENE: ${scenario.setting}
LEARNER'S GOAL: ${scenario.goal}
YOUR ROLE: the restaurant staff member. Stay in character and speak natural, polite Japanese suited to restaurant staff (です/ます, standard shop phrases).

LEVEL: ${level.prompt}

TARGET VOCABULARY the learner is studying. Use some of it naturally when it fits; never list it:
${vocab}

RULES
- Keep each of your lines to ${level.lines}. Ask only one thing at a time.
- reply_ja: normal Japanese with kanji where natural. reply_kana: the complete reading in kana only (no kanji, no romaji). reply_en: a natural English translation.
- Look at the learner's latest message. If it is natural Japanese for the situation, set correction.needed to false and leave the other correction fields as empty strings. If it has mistakes, is unnatural, or is written in English or romaji, set correction.needed to true, give better_ja (what they should have said), better_kana, and explanation_en (one or two short sentences). When the problem involves a kanji reading, an on/kun choice, a counter or a sound change, say so briefly. Do not be pedantic about small style points.
- Do not stop the scene to correct. Correct in the correction fields and carry on as staff in the same turn.
- hint_ja / hint_kana / hint_en: one good thing the learner could say next, suited to their level.
- scene_finished: true only when the learner's goal is complete and you have given a natural closing line.
- If the learner asks in English how to say something, put the Japanese in the correction fields (needed true) and reply as staff waiting patiently.
- Never break character except through the correction and hint fields.
- When the learner says the practice is over, ignore the role-play fields and fill the summary schema instead.`;
  }

  // ---- menu screens ----

  function renderMenu() {
    chat = null;
    if (App.canSpeak) window.speechSynthesis.cancel();
    titleEl.textContent = 'Practice with AI';
    bodyEl.replaceChildren();

    if (!load(KEY_STORE, '')) {
      bodyEl.append(setupCard());
      return;
    }

    bodyEl.append(settingsCard());
    bodyEl.append(el('h2', 'pr-heading', 'Choose a scenario'));
    const list = el('div', 'group-list');
    SCENARIOS.forEach(scenario => {
      const card = el('div', 'group-card');
      const info = el('div', 'group-card-info');
      info.append(el('div', 'group-card-name', scenario.title), el('div', 'group-card-desc', scenario.blurb));
      const start = el('button', 'btn btn-learn-inline', 'Start');
      start.addEventListener('click', () => startScenario(scenario));
      card.append(info, start);
      list.append(card);
    });
    bodyEl.append(list);
  }

  function setupCard() {
    const card = el('div', 'pr-card');
    card.append(el('h2', 'pr-heading', 'Connect a free Gemini key'));

    const steps = el('ol', 'pr-steps');
    const step1 = el('li');
    const link = el('a', null, 'aistudio.google.com/apikey');
    link.href = 'https://aistudio.google.com/apikey';
    link.target = '_blank';
    link.rel = 'noopener';
    step1.append('Open ', link, ' and create an API key (free, no payment needed).');
    steps.append(step1, el('li', null, 'Paste it below. It is saved only in this browser on this device.'));
    card.append(steps);

    const input = el('input', 'pr-input');
    input.type = 'password';
    input.placeholder = 'Paste API key';
    input.autocomplete = 'off';
    input.spellcheck = false;
    input.autocapitalize = 'off';

    const msg = el('div', 'pr-msg');
    const saveBtn = el('button', 'btn btn-primary', 'Save key');
    saveBtn.addEventListener('click', () => {
      const value = input.value.trim();
      if (value.length < 20 || /\s/.test(value)) {
        msg.textContent = 'That does not look like an API key. Copy the whole key with no spaces.';
        return;
      }
      if (!save(KEY_STORE, value)) {
        msg.textContent = 'Could not save the key: this browser is blocking storage.';
        return;
      }
      renderMenu();
    });

    card.append(input, saveBtn, msg);
    card.append(el('p', 'pr-fine', 'Privacy: on the free tier, Google may use your chats to improve its products, so do not type personal details. The key is sent only to Google, never to this site.'));
    return card;
  }

  function settingsCard() {
    const card = el('div', 'pr-card');

    const levelRow = el('div', 'pr-row');
    levelRow.append(el('span', 'pr-label', 'Level'));
    const seg = el('div', 'pr-seg');
    const current = load(LEVEL_STORE, 'beginner');
    Object.entries(LEVELS).forEach(([key, level]) => {
      const btn = el('button', `btn pr-seg-btn${key === current ? ' active' : ''}`, level.label);
      btn.addEventListener('click', () => {
        save(LEVEL_STORE, key);
        seg.querySelectorAll('.pr-seg-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
      seg.append(btn);
    });
    levelRow.append(seg);

    const modelRow = el('div', 'pr-row');
    modelRow.append(el('span', 'pr-label', 'Model'));
    const select = el('select', 'pr-select');
    const savedModel = load(MODEL_STORE, MODELS[0].id);
    MODELS.forEach(m => {
      const opt = el('option', null, m.label);
      opt.value = m.id;
      opt.selected = m.id === savedModel;
      select.append(opt);
    });
    select.addEventListener('change', () => save(MODEL_STORE, select.value));
    modelRow.append(select);

    const keyRow = el('div', 'pr-row');
    keyRow.append(el('span', 'pr-label', 'API key saved on this device'));
    const remove = el('button', 'btn', 'Remove key');
    remove.addEventListener('click', () => {
      if (confirm('Remove the saved API key from this device?')) {
        drop(KEY_STORE);
        renderMenu();
      }
    });
    keyRow.append(remove);

    card.append(levelRow, modelRow, keyRow);
    return card;
  }

  // ---- chat screen ----

  function startScenario(scenario) {
    const level = load(LEVEL_STORE, 'beginner');
    chat = {
      scenario,
      level,
      system: buildSystemPrompt(scenario, level),
      history: [],
      busy: false,
      hint: null,
      ended: false,
    };
    renderChat();
    sendTurn(FIRST_TURN, true);
  }

  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

  function renderChat() {
    titleEl.textContent = chat.scenario.title;
    bodyEl.replaceChildren();

    const wrap = el('div', 'chat-wrap');
    const goal = el('div', 'chat-goal');
    goal.append(el('b', null, 'Goal: '), chat.scenario.goal);

    chat.log = el('div', 'chat-log');

    const actions = el('div', 'chat-actions');
    chat.hintBtn = el('button', 'btn btn-small', 'Hint');
    chat.hintBtn.addEventListener('click', showHint);
    chat.finishBtn = el('button', 'btn btn-small', 'Finish and review');
    chat.finishBtn.addEventListener('click', finish);
    actions.append(chat.hintBtn, chat.finishBtn);

    const form = el('div', 'chat-input');
    chat.input = el('textarea', 'chat-textarea');
    chat.input.rows = 1;
    chat.input.placeholder = '日本語で話してみましょう';
    chat.input.setAttribute('enterkeyhint', 'send');
    chat.input.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey && !e.isComposing && e.keyCode !== 229) {
        e.preventDefault();
        submit();
      }
    });
    form.append(chat.input);

    if (SR) {
      chat.micBtn = el('button', 'btn btn-mic', 'Mic');
      chat.micBtn.addEventListener('click', listen);
      form.append(chat.micBtn);
    }

    chat.sendBtn = el('button', 'btn btn-primary', 'Send');
    chat.sendBtn.addEventListener('click', submit);
    form.append(chat.sendBtn);

    wrap.append(goal, chat.log, actions, form);
    bodyEl.append(wrap);
  }

  function setBusy(busy) {
    chat.busy = busy;
    [chat.sendBtn, chat.hintBtn, chat.finishBtn, chat.micBtn].forEach(b => { if (b) b.disabled = busy || chat.ended; });
    chat.input.disabled = chat.ended;
  }

  function scrollDown() {
    chat.log.scrollTop = chat.log.scrollHeight;
  }

  function addUser(text) {
    const bubble = el('div', 'bubble user');
    bubble.append(el('div', 'bubble-text', text));
    chat.log.append(bubble);
    scrollDown();
    return bubble;
  }

  function listenButton(kana) {
    if (!App.canSpeak || !kana) return null;
    const btn = el('button', 'chip', 'Listen');
    btn.addEventListener('click', () => App.speak(kana));
    return btn;
  }

  function addStaff(turn) {
    const bubble = el('div', 'bubble staff');
    bubble.append(el('div', 'bubble-text', turn.reply_ja));

    const reveals = el('div', 'bubble-reveals');
    const kana = el('div', 'reveal', turn.reply_kana || '');
    const en = el('div', 'reveal', turn.reply_en || '');
    kana.hidden = true;
    en.hidden = true;

    const row = el('div', 'bubble-actions');
    const kanaBtn = el('button', 'chip', 'Reading');
    kanaBtn.addEventListener('click', () => { kana.hidden = !kana.hidden; });
    const enBtn = el('button', 'chip', 'English');
    enBtn.addEventListener('click', () => { en.hidden = !en.hidden; });
    row.append(kanaBtn, enBtn);
    const listen = listenButton(turn.reply_kana);
    if (listen) row.append(listen);

    reveals.append(kana, en);
    bubble.append(row, reveals);
    chat.log.append(bubble);
    scrollDown();
  }

  function addFeedback(userBubble, correction) {
    const box = el('div', 'feedback');
    if (correction && correction.needed) {
      box.classList.add('needs-fix');
      const better = el('div', 'feedback-better');
      better.append(el('b', null, 'Better: '), correction.better_ja || '');
      box.append(better);
      if (correction.better_kana) box.append(el('div', 'feedback-kana', correction.better_kana));
      if (correction.explanation_en) box.append(el('div', 'feedback-why', correction.explanation_en));
      const listen = listenButton(correction.better_kana);
      if (listen) box.append(listen);
    } else {
      box.append(el('div', 'feedback-ok', 'Sounds natural.'));
    }
    userBubble.append(box);
    scrollDown();
  }

  function addNotice(text, retry) {
    const note = el('div', 'bubble notice', text);
    if (retry) {
      const btn = el('button', 'chip', 'Retry');
      btn.addEventListener('click', () => { note.remove(); retry(); });
      note.append(btn);
    }
    chat.log.append(note);
    scrollDown();
    return note;
  }

  function addTyping() {
    const typing = el('div', 'bubble staff typing', '…');
    chat.log.append(typing);
    scrollDown();
    return typing;
  }

  async function sendTurn(text, hidden) {
    if (chat.busy) return;
    setBusy(true);
    const userBubble = hidden ? null : addUser(text);
    chat.history.push({ role: 'user', text });
    const typing = addTyping();

    try {
      const raw = await callGemini(chat.history, TURN_SCHEMA);
      const turn = parseJson(raw, 'reply_ja');
      chat.history.push({ role: 'model', text: raw });
      typing.remove();
      if (userBubble) addFeedback(userBubble, turn.correction);
      addStaff(turn);
      chat.hint = turn;
      if (turn.scene_finished) addNotice('Scene complete. Tap "Finish and review" for your summary, or keep chatting.');
    } catch (err) {
      typing.remove();
      chat.history.pop();
      if (userBubble) {
        userBubble.remove();
        chat.input.value = text;
      }
      const message = err instanceof ChatError ? err.message : 'Something went wrong. Try again.';
      addNotice(message, hidden ? () => sendTurn(text, true) : null);
    } finally {
      setBusy(false);
    }
  }

  function submit() {
    if (!chat || chat.busy || chat.ended) return;
    const text = chat.input.value.trim();
    if (!text) return;
    chat.input.value = '';
    sendTurn(text, false);
  }

  function showHint() {
    if (!chat.hint || !chat.hint.hint_ja) {
      addNotice('No hint yet. Wait for the staff to speak first.');
      return;
    }
    const bubble = el('div', 'bubble hint');
    bubble.append(el('div', 'bubble-text', `Try: ${chat.hint.hint_ja}`));
    if (chat.hint.hint_kana) bubble.append(el('div', 'feedback-kana', chat.hint.hint_kana));
    if (chat.hint.hint_en) bubble.append(el('div', 'feedback-why', chat.hint.hint_en));
    const listen = listenButton(chat.hint.hint_kana);
    if (listen) bubble.append(listen);
    chat.log.append(bubble);
    scrollDown();
  }

  function listen() {
    if (!SR) return;
    const rec = new SR();
    rec.lang = 'ja-JP';
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    chat.micBtn.classList.add('active');
    rec.onresult = e => {
      const heard = e.results[0][0].transcript;
      chat.input.value = (chat.input.value ? chat.input.value + ' ' : '') + heard;
    };
    rec.onerror = () => addNotice('The microphone did not work. Check the browser has permission to use it.');
    rec.onend = () => chat.micBtn.classList.remove('active');
    try { rec.start(); } catch (e) { chat.micBtn.classList.remove('active'); }
  }

  async function finish() {
    if (!chat || chat.busy || chat.ended) return;
    setBusy(true);
    const typing = addTyping();
    try {
      const raw = await callGemini([...chat.history, { role: 'user', text: SUMMARY_PROMPT }], SUMMARY_SCHEMA);
      const summary = parseJson(raw, 'summary_en');
      typing.remove();
      chat.ended = true;
      renderSummary(summary);
    } catch (err) {
      typing.remove();
      addNotice(err instanceof ChatError ? err.message : 'Could not make the summary. Try again.', finish);
    } finally {
      setBusy(false);
    }
  }

  function renderSummary(summary) {
    const card = el('div', 'bubble summary');
    card.append(el('h3', 'pr-heading', 'Practice review'), el('p', null, summary.summary_en));

    if (summary.went_well && summary.went_well.length) {
      card.append(el('div', 'uses-title', 'Went well'));
      const ul = el('ul', 'pr-list');
      summary.went_well.forEach(item => ul.append(el('li', null, item)));
      card.append(ul);
    }

    if (summary.to_review && summary.to_review.length) {
      card.append(el('div', 'uses-title', 'To review'));
      summary.to_review.forEach(item => {
        const row = el('div', 'sum-row');
        row.append(el('div', 'sum-ja', item.ja));
        if (item.kana) row.append(el('div', 'feedback-kana', item.kana));
        if (item.en) row.append(el('div', 'feedback-why', item.en));
        if (item.note) row.append(el('div', 'feedback-why', item.note));
        const l = listenButton(item.kana);
        if (l) row.append(l);
        card.append(row);
      });
    }

    if (summary.new_words && summary.new_words.length) {
      card.append(el('div', 'uses-title', 'New words'));
      summary.new_words.forEach(w => {
        const row = el('div', 'sum-row');
        row.append(el('span', 'sum-ja', w.ja), el('span', 'feedback-kana', ` ${w.kana || ''}`), el('span', 'feedback-why', ` ${w.en || ''}`));
        card.append(row);
      });
    }

    const again = el('button', 'btn btn-primary', 'Back to scenarios');
    again.addEventListener('click', renderMenu);
    card.append(again);
    chat.log.append(card);
    scrollDown();
  }

  // ---- wiring ----

  backBtn.addEventListener('click', () => {
    if (chat) {
      renderMenu();
    } else {
      App.showView('home');
    }
  });

  App.openPractice = () => {
    renderMenu();
    App.showView('practice');
  };
})();
