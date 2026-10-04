(() => {
  const toKata = s => s.replace(/[ぁ-ゖ]/g, c => String.fromCharCode(c.charCodeAt(0) + 0x60));

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  // ---- Build decks from data.js ----

  const TYPE_SHORT = { o: 'on', k: 'kun', i: 'whole-word', l: 'loanword' };
  const TYPE_LONG = {
    o: 'On reading (音読み)',
    k: 'Kun reading (訓読み)',
    i: 'Whole-word reading (熟字訓)',
    l: 'Loanword reading',
  };

  function parseSpec(spec) {
    const s = spec.trim();
    if (!s) return [];
    return s.split(/\s+/).map(t => {
      const [chars, used, type] = t.split(':');
      return { chars, used, type };
    });
  }

  function patternLabel(tokens) {
    if (!tokens.length) return 'Kana word (no kanji)';
    if (tokens.length === 1) return TYPE_LONG[tokens[0].type];
    let label = tokens.map(t => TYPE_SHORT[t.type]).join(' + ');
    const types = tokens.map(t => t.type).join('');
    if (types === 'ko') label += ' (湯桶読み)';
    if (types === 'ok') label += ' (重箱読み)';
    return label;
  }

  function usedDisplay(token) {
    return token.type === 'o' ? toKata(token.used) : token.used;
  }

  const groups = GROUPS.map(g => ({
    id: g.id,
    name: g.name,
    desc: g.desc,
    unit: 'words',
    cards: g.entries.map(([word, kr, meaning, spec, note]) => {
      const [kana, romaji] = kr.split('|');
      return { kind: 'word', front: word, kana, romaji, meaning, tokens: parseSpec(spec), note };
    }),
  }));

  const usage = {};
  const kanjiOrder = [];
  groups.forEach(g => g.cards.forEach(card => card.tokens.forEach(token => {
    [...token.chars].forEach(ch => {
      if (!usage[ch]) { usage[ch] = []; kanjiOrder.push(ch); }
      usage[ch].push({ word: card.front, kana: card.kana, used: usedDisplay(token), type: token.type });
    });
  })));

  groups.push({
    id: 'kanji',
    name: 'Kanji Readings',
    desc: 'Each kanji on its own: on and kun readings, and which reading each of your words uses',
    unit: 'kanji',
    cards: kanjiOrder.filter(ch => KANJI[ch]).map(ch => {
      const [on, kun, meaning, parts] = KANJI[ch];
      return { kind: 'kanji', front: ch, on, kun, meaning, parts, uses: usage[ch] };
    }),
  });

  function getGroup(id) {
    return groups.find(g => g.id === id) || null;
  }

  // ---- Views ----

  const views = {
    home: document.getElementById('view-home'),
    rules: document.getElementById('view-rules'),
    learn: document.getElementById('view-learn'),
  };

  function showView(name) {
    Object.entries(views).forEach(([key, node]) => { node.hidden = key !== name; });
    window.scrollTo(0, 0);
  }

  // ---- Home ----

  const groupListEl = document.getElementById('group-list');

  function renderHome() {
    groupListEl.replaceChildren();
    groups.forEach(group => {
      const card = el('div', 'group-card');
      const info = el('div', 'group-card-info');
      info.append(
        el('div', 'group-card-name', group.name),
        el('div', 'group-card-count', `${group.cards.length} ${group.unit}`),
        el('div', 'group-card-desc', group.desc),
      );
      const learnBtn = el('button', 'btn btn-learn-inline', 'Learn');
      learnBtn.addEventListener('click', () => startLearning(group.id));
      card.append(info, learnBtn);
      groupListEl.append(card);
    });
  }

  document.getElementById('btn-open-rules').addEventListener('click', () => showView('rules'));
  document.getElementById('btn-rules-back').addEventListener('click', () => showView('home'));

  // ---- Card faces ----

  const backEl = document.getElementById('card-back');

  function aloneLine(ch) {
    const d = KANJI[ch];
    if (!d) return null;
    const [on, kun, meaning] = d;
    const parts = [];
    if (on) parts.push(`on ${on}`);
    if (kun) parts.push(`kun ${kun}`);
    parts.push(meaning);
    return `${ch} alone · ${parts.join(' · ')}`;
  }

  function renderWordBack(card) {
    backEl.replaceChildren();
    backEl.append(el('div', 'card-meaning', card.meaning));

    const reading = el('div', 'card-reading');
    reading.append(el('span', 'kana', card.kana), el('span', 'romaji', card.romaji));
    backEl.append(reading);

    backEl.append(el('div', 'pattern-tag', patternLabel(card.tokens)));

    if (card.tokens.length) {
      const list = el('div', 'breakdown');
      card.tokens.forEach(token => {
        const row = el('div', 'bd-row');
        const head = el('div', 'bd-head');
        head.append(
          el('span', 'bd-kanji', token.chars),
          el('span', 'bd-arrow', '→'),
          el('span', 'bd-used', usedDisplay(token)),
          el('span', `bd-type bd-${token.type}`, TYPE_SHORT[token.type]),
        );
        row.append(head);
        [...token.chars].forEach(ch => {
          const line = aloneLine(ch);
          if (line) row.append(el('div', 'bd-alone', line));
        });
        list.append(row);
      });
      backEl.append(list);
    }

    if (card.note) backEl.append(el('div', 'rule-note', card.note));

    const seen = new Set();
    const parts = [];
    card.tokens.forEach(token => [...token.chars].forEach(ch => {
      if (seen.has(ch)) return;
      seen.add(ch);
      if (KANJI[ch] && KANJI[ch][3]) parts.push(`${ch} ${KANJI[ch][3]}`);
    }));
    if (parts.length) backEl.append(el('div', 'parts', `Parts: ${parts.join(' · ')}`));
  }

  function renderKanjiBack(card) {
    backEl.replaceChildren();
    backEl.append(el('div', 'card-meaning', card.meaning));

    const readings = el('div', 'kanji-readings');
    const onRow = el('div', 'kr-row');
    onRow.append(el('span', 'kr-label', 'On'), el('span', 'kr-value', card.on || '—'));
    const kunRow = el('div', 'kr-row');
    kunRow.append(el('span', 'kr-label', 'Kun'), el('span', 'kr-value', card.kun || '—'));
    readings.append(onRow, kunRow);
    backEl.append(readings);

    if (card.parts) backEl.append(el('div', 'parts', `Parts: ${card.parts}`));

    if (card.uses && card.uses.length) {
      backEl.append(el('div', 'uses-title', 'In your cards'));
      const list = el('div', 'uses');
      card.uses.forEach(u => {
        const row = el('div', 'use-row');
        row.append(
          el('span', 'use-word', u.word),
          el('span', 'use-kana', u.kana),
          el('span', 'use-arrow', '→'),
          el('span', 'use-reading', u.used),
          el('span', `bd-type bd-${u.type}`, TYPE_SHORT[u.type]),
        );
        list.append(row);
      });
      backEl.append(list);
    }
  }

  function frontSize(text) {
    const n = [...text].length;
    if (n <= 1) return '6rem';
    if (n === 2) return '4.5rem';
    if (n === 3) return '3.5rem';
    if (n === 4) return '2.8rem';
    if (n <= 6) return '2.2rem';
    return '1.8rem';
  }

  // ---- Learn ----

  let currentGroupId = null;
  let learnOrder = [];
  let learnPos = 0;

  const learnProgressEl = document.getElementById('learn-progress');
  const flashcardEl = document.getElementById('flashcard');
  const cardCharEl = document.getElementById('card-char');
  const cardAreaEl = document.getElementById('card-area');
  const learnControlsEl = document.querySelector('.learn-controls');
  const learnDoneEl = document.getElementById('learn-done');
  const prevBtn = document.getElementById('btn-prev');

  function shuffledIndices(n) {
    const arr = Array.from({ length: n }, (_, i) => i);
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function startLearning(groupId) {
    const group = getGroup(groupId);
    if (!group || group.cards.length === 0) return;
    currentGroupId = groupId;
    learnOrder = shuffledIndices(group.cards.length);
    learnPos = 0;
    showView('learn');
    renderLearnCard();
  }

  function renderLearnCard() {
    const group = getGroup(currentGroupId);
    if (!group) return;

    flashcardEl.classList.remove('flipped');

    if (learnPos >= learnOrder.length) {
      cardAreaEl.hidden = true;
      learnControlsEl.hidden = true;
      learnDoneEl.hidden = false;
      learnProgressEl.textContent = `${group.cards.length} / ${group.cards.length}`;
      return;
    }

    cardAreaEl.hidden = false;
    learnControlsEl.hidden = false;
    learnDoneEl.hidden = true;

    const card = group.cards[learnOrder[learnPos]];
    cardCharEl.textContent = card.front;
    cardCharEl.style.fontSize = frontSize(card.front);
    backEl.scrollTop = 0;
    if (card.kind === 'kanji') renderKanjiBack(card); else renderWordBack(card);

    learnProgressEl.textContent = `${learnPos + 1} / ${learnOrder.length}`;
    prevBtn.disabled = learnPos === 0;
  }

  function toggleFlip() {
    flashcardEl.classList.toggle('flipped');
  }

  flashcardEl.addEventListener('click', toggleFlip);
  document.getElementById('btn-flip').addEventListener('click', toggleFlip);

  document.getElementById('btn-next').addEventListener('click', () => {
    learnPos++;
    renderLearnCard();
  });

  prevBtn.addEventListener('click', () => {
    if (learnPos > 0) {
      learnPos--;
      renderLearnCard();
    }
  });

  document.getElementById('btn-restart-shuffle').addEventListener('click', () => {
    const group = getGroup(currentGroupId);
    if (!group) return;
    learnOrder = shuffledIndices(group.cards.length);
    learnPos = 0;
    renderLearnCard();
  });

  document.getElementById('btn-learn-back').addEventListener('click', () => showView('home'));

  document.addEventListener('keydown', (e) => {
    if (views.learn.hidden) return;
    if (e.key === 'ArrowRight') document.getElementById('btn-next').click();
    else if (e.key === 'ArrowLeft') prevBtn.click();
    else if (e.key === ' ') { e.preventDefault(); toggleFlip(); }
  });

  renderHome();
  showView('home');
})();
