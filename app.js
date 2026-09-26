(() => {
  const STORAGE_KEY = 'kanjiCardsData';

  /** @typedef {{char: string, meaning: string, reading: string, notes: string}} Kanji */
  /** @typedef {{id: string, name: string, kanji: Kanji[]}} Group */

  /** @type {{groups: Group[]}} */
  let state = loadState();

  // ---- Persistence ----

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { groups: [] };
      const parsed = JSON.parse(raw);
      if (!parsed || !Array.isArray(parsed.groups)) return { groups: [] };
      return parsed;
    } catch (e) {
      return { groups: [] };
    }
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function uid() {
    return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
  }

  // ---- View elements ----

  const views = {
    home: document.getElementById('view-home'),
    edit: document.getElementById('view-edit'),
    learn: document.getElementById('view-learn'),
  };

  function showView(name) {
    Object.entries(views).forEach(([key, el]) => {
      el.hidden = key !== name;
    });
  }

  // ---- App / navigation state ----

  let currentGroupId = null;
  let learnOrder = [];   // array of kanji indices into current group, shuffled
  let learnPos = 0;

  // ---- Home view ----

  const groupListEl = document.getElementById('group-list');
  const emptyStateEl = document.getElementById('empty-state');

  function renderHome() {
    groupListEl.innerHTML = '';
    if (state.groups.length === 0) {
      emptyStateEl.hidden = false;
      return;
    }
    emptyStateEl.hidden = true;

    state.groups.forEach(group => {
      const card = document.createElement('div');
      card.className = 'group-card';

      const info = document.createElement('div');
      info.className = 'group-card-info';
      info.innerHTML = `
        <div class="group-card-name"></div>
        <div class="group-card-count"></div>
      `;
      info.querySelector('.group-card-name').textContent = group.name || 'Untitled group';
      info.querySelector('.group-card-count').textContent =
        `${group.kanji.length} kanji`;
      info.addEventListener('click', () => openEditGroup(group.id));

      const learnBtn = document.createElement('button');
      learnBtn.className = 'btn btn-learn';
      learnBtn.textContent = 'Learn';
      learnBtn.style.width = 'auto';
      learnBtn.style.marginTop = '0';
      learnBtn.disabled = group.kanji.length === 0;
      learnBtn.addEventListener('click', () => startLearning(group.id));

      card.appendChild(info);
      card.appendChild(learnBtn);
      groupListEl.appendChild(card);
    });
  }

  document.getElementById('btn-new-group').addEventListener('click', () => {
    const group = { id: uid(), name: 'New Group', kanji: [] };
    state.groups.push(group);
    saveState();
    openEditGroup(group.id);
  });

  // ---- Edit group view ----

  const editNameInput = document.getElementById('edit-group-name');
  const kanjiListEl = document.getElementById('kanji-list');
  const editEmptyStateEl = document.getElementById('edit-empty-state');
  const learnFromEditBtn = document.getElementById('btn-learn-from-edit');
  const addKanjiForm = document.getElementById('form-add-kanji');
  const inputTerm = document.getElementById('input-term');
  const inputMeaning = document.getElementById('input-meaning');
  const inputReading = document.getElementById('input-reading');
  const inputNotes = document.getElementById('input-notes');
  const bulkAddTextarea = document.getElementById('bulk-add-textarea');
  const bulkAddDetails = document.getElementById('bulk-add-details');

  function getCurrentGroup() {
    return state.groups.find(g => g.id === currentGroupId) || null;
  }

  function openEditGroup(groupId) {
    currentGroupId = groupId;
    const group = getCurrentGroup();
    if (!group) { showView('home'); return; }
    editNameInput.value = group.name;
    renderEditGroup();
    showView('edit');
    if (group.name === 'New Group') {
      editNameInput.focus();
      editNameInput.select();
    }
  }

  function renderEditGroup() {
    const group = getCurrentGroup();
    if (!group) return;

    kanjiListEl.innerHTML = '';
    if (group.kanji.length === 0) {
      editEmptyStateEl.hidden = false;
    } else {
      editEmptyStateEl.hidden = true;
    }
    learnFromEditBtn.hidden = group.kanji.length === 0;

    group.kanji.forEach((k, idx) => {
      const li = document.createElement('li');
      li.className = 'kanji-row';

      li.innerHTML = `
        <div class="kanji-row-char"></div>
        <div class="kanji-row-info">
          <div class="kanji-row-meaning"></div>
          <div class="kanji-row-readings"></div>
        </div>
        <button class="btn-remove" title="Remove">&times;</button>
      `;
      li.querySelector('.kanji-row-char').textContent = k.char;
      li.querySelector('.kanji-row-meaning').textContent = k.meaning;
      li.querySelector('.kanji-row-readings').textContent = k.reading || '';
      li.querySelector('.btn-remove').addEventListener('click', () => {
        group.kanji.splice(idx, 1);
        saveState();
        renderEditGroup();
      });

      kanjiListEl.appendChild(li);
    });
  }

  editNameInput.addEventListener('input', () => {
    const group = getCurrentGroup();
    if (!group) return;
    group.name = editNameInput.value;
    saveState();
  });

  addKanjiForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const group = getCurrentGroup();
    if (!group) return;

    const char = inputTerm.value.trim();
    const meaning = inputMeaning.value.trim();
    if (!char || !meaning) return;

    group.kanji.push({
      char,
      meaning,
      reading: inputReading.value.trim(),
      notes: inputNotes.value.trim(),
    });
    saveState();
    renderEditGroup();

    addKanjiForm.reset();
    inputTerm.focus();
  });

  bulkAddDetails.querySelector('#btn-bulk-add').addEventListener('click', () => {
    const group = getCurrentGroup();
    if (!group) return;

    const lines = bulkAddTextarea.value.split('\n').map(l => l.trim()).filter(Boolean);
    let added = 0;
    lines.forEach(line => {
      const parts = line.split('|').map(p => p.trim());
      const [char, reading = '', meaning = '', notes = ''] = parts;
      if (!char || !meaning) return;
      group.kanji.push({ char, meaning, reading, notes });
      added++;
    });

    if (added > 0) {
      saveState();
      renderEditGroup();
      bulkAddTextarea.value = '';
      bulkAddDetails.open = false;
    }
  });

  document.getElementById('btn-delete-group').addEventListener('click', () => {
    const group = getCurrentGroup();
    if (!group) return;
    if (!confirm(`Delete group "${group.name || 'Untitled group'}"? This cannot be undone.`)) return;
    state.groups = state.groups.filter(g => g.id !== currentGroupId);
    saveState();
    currentGroupId = null;
    renderHome();
    showView('home');
  });

  document.getElementById('btn-edit-back').addEventListener('click', () => {
    currentGroupId = null;
    renderHome();
    showView('home');
  });

  learnFromEditBtn.addEventListener('click', () => {
    if (currentGroupId) startLearning(currentGroupId);
  });

  // ---- Learn view ----

  const learnProgressEl = document.getElementById('learn-progress');
  const flashcardEl = document.getElementById('flashcard');
  const cardCharEl = document.getElementById('card-char');
  const cardMeaningEl = document.getElementById('card-meaning');
  const cardReadingsEl = document.getElementById('card-readings');
  const cardNotesEl = document.getElementById('card-notes');
  const cardAreaEl = document.getElementById('card-area');
  const learnControlsEl = document.querySelector('.learn-controls');
  const learnDoneEl = document.getElementById('learn-done');

  function shuffledIndices(n) {
    const arr = Array.from({ length: n }, (_, i) => i);
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function startLearning(groupId) {
    currentGroupId = groupId;
    const group = getCurrentGroup();
    if (!group || group.kanji.length === 0) return;
    learnOrder = shuffledIndices(group.kanji.length);
    learnPos = 0;
    showView('learn');
    renderLearnCard();
  }

  function renderLearnCard() {
    const group = getCurrentGroup();
    if (!group) return;

    flashcardEl.classList.remove('flipped');

    if (learnPos >= learnOrder.length) {
      cardAreaEl.hidden = true;
      learnControlsEl.hidden = true;
      learnDoneEl.hidden = false;
      learnProgressEl.textContent = `${group.kanji.length} / ${group.kanji.length}`;
      return;
    }

    cardAreaEl.hidden = false;
    learnControlsEl.hidden = false;
    learnDoneEl.hidden = true;

    const kanji = group.kanji[learnOrder[learnPos]];
    cardCharEl.textContent = kanji.char;
    cardCharEl.style.fontSize = kanji.char.length > 2 ? '3rem' : kanji.char.length === 2 ? '4.5rem' : '6rem';
    cardMeaningEl.textContent = kanji.meaning;
    cardReadingsEl.textContent = kanji.reading || '';
    cardNotesEl.textContent = kanji.notes || '';

    learnProgressEl.textContent = `${learnPos + 1} / ${learnOrder.length}`;

    document.getElementById('btn-prev').disabled = learnPos === 0;
  }

  flashcardEl.addEventListener('click', () => {
    flashcardEl.classList.toggle('flipped');
  });

  document.getElementById('btn-flip').addEventListener('click', () => {
    flashcardEl.classList.toggle('flipped');
  });

  document.getElementById('btn-next').addEventListener('click', () => {
    learnPos++;
    renderLearnCard();
  });

  document.getElementById('btn-prev').addEventListener('click', () => {
    if (learnPos > 0) {
      learnPos--;
      renderLearnCard();
    }
  });

  document.getElementById('btn-restart-shuffle').addEventListener('click', () => {
    const group = getCurrentGroup();
    if (!group) return;
    learnOrder = shuffledIndices(group.kanji.length);
    learnPos = 0;
    renderLearnCard();
  });

  document.getElementById('btn-learn-back').addEventListener('click', () => {
    renderHome();
    showView('home');
  });

  // Keyboard shortcuts during learn session
  document.addEventListener('keydown', (e) => {
    if (views.learn.hidden) return;
    if (e.key === 'ArrowRight') document.getElementById('btn-next').click();
    else if (e.key === 'ArrowLeft') document.getElementById('btn-prev').click();
    else if (e.key === ' ') { e.preventDefault(); flashcardEl.classList.toggle('flipped'); }
  });

  // ---- Init ----

  renderHome();
  showView('home');
})();
