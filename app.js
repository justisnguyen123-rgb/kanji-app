(() => {
  const STORAGE_KEY = 'kanjiCardsData';

  /** @typedef {{char: string, meaning: string, reading: string, notes: string}} Kanji */
  /** @typedef {{id: string, name: string, kanji: Kanji[]}} Group */

  const DEFAULT_FOOD_KANJI = [
    ["固め","Katame (かため)","Firm (noodles)","固 = Kata(i) / かた\nRadicals: 固 (口 Enclosure + 古 Old)"],
    ["柔らかめ","Yawarakame (やわらかめ)","Soft (noodles)","柔 = Yawara(kai) / やわら\nRadicals: 柔 (木 Tree/Wood + 矛 Spear)"],
    ["普通","Futsuu (ふつう)","Normal / Regular","普 = Fu / ふ\n通 = Tsuu / つう\nRadicals: 普 (日 Sun + 並 Line up); 通 (⻌ Road + 甬 Pass through)"],
    ["濃いめ","Koime (こいめ)","Strong / Rich flavor","濃 = Ko(i) / こ\nRadicals: 濃 (氵 Water/Liquid + 農 Agriculture)"],
    ["薄め","Usume (うすめ)","Lighter flavor","薄 = Usu(i) / うす\nRadicals: 薄 (艹 Grass/Plant + 溥 Wide/Water)"],
    ["多め","Oome (おおめ)","Extra / More","多 = Oo(i) / おお\nRadicals: 多 (夕 Evening doubled)"],
    ["少なめ","Sukuname (すくなめ)","Less / Light","少 = Sukuna(i) / すくな\nRadicals: 少 (小 Small + extra stroke)"],
    ["抜き","Nuki (ぬき)","Without / Omit","抜 = Nu(ku) / ぬ\nRadicals: 抜 (扌 Hand + 友 Friend/Pull)"],
    ["替え玉","Kaedama (かえだま)","Noodle refill","替 = Kae / かえ\n玉 = Tama (Dama) / だま\nRadicals: 替 (日 Sun + 夫 Men); 玉 (玉 Jewel/Ball)"],
    ["大盛り","Oomori (おおもり)","Large portion","大 = Oo / おお\n盛 = Mori / もり\nRadicals: 大 (Big); 盛 (皿 Dish/Plate + 成)"],
    ["豚骨","Tonkotsu (とんこつ)","Pork bone broth","豚 = Ton / とん\n骨 = Kotsu / こつ\nRadicals: 豚 (月 Meat + 豕 Pig); 骨 (骨 Bone)"],
    ["醤油","Shōyu (しょうゆ)","Soy sauce","醬 = Shō / しょう\n油 = Yu / ゆ\nRadicals: 醬 (酉 Fermentation + 將); 油 (氵 Water/Liquid + 由)"],
    ["味噌","Miso (みそ)","Fermented soybean paste","味 = Mi / み\n噌 = So / そ\nRadicals: 味 (口 Mouth + 未); 噌 (口 Mouth + 曾)"],
    ["塩","Shio (しお)","Salt","塩 = Shio / しお\nRadicals: 塩 (土 Earth + 臣 Servant + 鹵 Salt land)"],
    ["つけ麺","Tsukemen (つけめん)","Dipping noodles","麺 = Men / めん\nRadicals: 麺 (麥 Wheat/Grain + 面 Face)"],
    ["家系","Iekei (いえけい)","Yokohama-style rich pork/soy","家 = Ie / いえ\n系 = Kei / けい\nRadicals: 家 (宀 Roof + 豕 Pig); 系 (糸 Thread/Lineage)"],
    ["叉焼","Chāshū (チャーシュー)","Braised pork belly","叉 = Chā / ちゃ\n焼 = Shū / しゅう\nRadicals: 叉 (Fork/Cross); 焼 (火 Fire + 尭)"],
    ["味玉","Ajitama (あじたま)","Seasoned soft-boiled egg","味 = Aji / あじ\n玉 = Tama / たま\nRadicals: 味 (Taste); 玉 (玉 Ball/Egg)"],
    ["煮卵","Nitamago (にたまご)","Seasoned boiled egg","煮 = Ni / に\n卵 = Tamago / たまご\nRadicals: 煮 (灬 Fire/Heat + 者); 卵 (Egg/Oval)"],
    ["海苔","Nori (のり)","Dried seaweed","海 = No / の\n苔 = Ri / り\nRadicals: 海 (氵 Water/Sea + 每); 苔 (艹 Grass/Plant + 台)"],
    ["木耳","Kikurage (きくらげ)","Wood ear mushroom","木 = Ki / き\n耳 = Kurage / くらげ\nRadicals: 木 (木 Tree/Wood); 耳 (耳 Ear)"],
    ["白飯","Shiromeshi (しろめし)","Plain white rice","白 = Shiro / しろ\n飯 = Meshi / めし\nRadicals: 白 (白 White); 飯 (飠 Food/Eat + 反)"],
    ["生ビール","Nama Biiru (なまビール)","Draft beer","生 = Nama / なま\nRadicals: 生 (生 Life/Fresh/Raw)"],
    ["日本酒","Nihonshu (にほんしゅ)","Japanese Sake","日 = Ni / に\n本 = Hon / ほん\n酒 = Shu / しゅ\nRadicals: 日 (Sun); 本 (Origin/Tree); 酒 (氵 Water + 酉 Fermentation)"],
    ["焼酎","Shōchū (しょうちゅう)","Distilled spirit","焼 = Shō / しょう\n酎 = Chū / ちゅう\nRadicals: 焼 (火 Fire); 酎 (酉 Fermentation + 寸)"],
    ["枝豆","Edamame (えだまめ)","Steamed soybeans","枝 = E / え\n豆 = Mame / まめ\nRadicals: 枝 (木 Tree/Branch); 豆 (豆 Bean/Pod)"],
    ["焼き鳥","Yakitori (やきとり)","Grilled chicken skewers","焼 = Yaki / やき\n鳥 = Tori / とり\nRadicals: 焼 (火 Fire/Grill); 鳥 (鳥 Bird/Poultry)"],
    ["唐揚げ","Karaage (からあげ)","Japanese fried chicken","唐 = Kara / から\n揚 = Age / あげ\nRadicals: 唐 (Foreign/China); 揚 (扌 Hand + 昜 Hoist/Fry)"],
    ["餃子","Gyōza (ぎょうざ)","Pan-fried dumplings","餃 = Gyō / ぎょう\n子 = Za / ざ\nRadicals: 餃 (飠 Food + 交); 子 (子 Child/Small)"],
    ["玉子焼き","Tamagoyaki (たまごやき)","Rolled omelet","玉 = Tama / たま\n子 = Go / ご\n焼 = Yaki / やき\nRadicals: 玉 (Ball); 子 (Child); 焼 (火 Fire)"],
    ["刺身","Sashimi (さしみ)","Sliced raw fish","刺 = Sashi / さし\n身 = Mi / み\nRadicals: 刺 (刂 Knife/Pierce + 朿); 身 (身 Body)"],
    ["串焼き","Kushiyaki (くしやき)","Skewered grilled items","串 = Kushi / くし\n焼 = Yaki / やき\nRadicals: 串 (串 Skewer piercing items); 焼 (火 Fire)"],
    ["ねぎま","Negima","Chicken thigh & green onion","葱 = Negi / ねぎ\n間 = Ma / ま\nRadicals: 葱 (艹 Grass) + 間 (門 Gate + 日 Sun)"],
    ["もも","Momo","Chicken thigh","N/A (usually Hiragana)\nRepresents thigh meat"],
    ["つくね","Tsukune","Chicken meatball","N/A (usually Hiragana)\nFinely minced chicken patty"],
    ["皮","Kawa (かわ)","Chicken skin","皮 = Kawa / かわ\nRadicals: 皮 (皮 Skin/Hide radical)"],
    ["砂肝","Sunagimo (すなぎも)","Gizzard","砂 = Suna / すな\n肝 = Gimo / ぎも\nRadicals: 砂 (石 Stone) + 肝 (月 Meat + 干)"],
    ["手羽先","Tebasaki (てばさき)","Chicken wing tip","手 = Te / て\n羽 = Ba / ば\n先 = Saki / さき\nRadicals: 手 (Hand) + 羽 (Feather/Wing) + 先 (Ahead)"],
    ["軟骨","Nankotsu (なんこつ)","Cartilage","軟 = Nan / なん\n骨 = Kotsu / こつ\nRadicals: 軟 (車 Cart + 欠) + 骨 (骨 Bone)"],
    ["塩","Shio (しお)","Seasoning: Salt","塩 = Shio / しお\nRadicals: 塩 (土 Earth + 鹵 Salt land)"],
    ["タレ","Tare","Seasoning: Sweet soy glaze","N/A (Katakana)\nRich basting sauce"],
    ["カルビ","Karubi","Boneless short rib","N/A (Katakana from Korean)\nMarbled beef short rib"],
    ["ロース","Rōsu","Chuck / Loin cut","N/A (Katakana from \"Roast\")\nLeaner beef cut"],
    ["牛タン","Gyūtan (ぎゅうタン)","Beef tongue","牛 = Gyū / ぎゅう\nタン = Tan (Tongue)\nRadicals: 牛 (牛 Cow radical) + Katakana"],
    ["ハラミ","Harami","Skirt steak","N/A (usually Katakana)\nTender diaphragm muscle"],
    ["ホルモン","Horumon","Offal / Intestines","N/A (Katakana)\nMixed organ meats"],
    ["豚バラ","Butabara (ぶたバラ)","Pork belly","豚 = Buta / ぶた\nRadicals: 豚 (月 Meat + 豕 Pig)"],
    ["サンチュ","Sanchu","Wrap lettuce","N/A (Katakana)\nLettuce used to wrap grilled meat"],
    ["網","Ami (あみ)","Wire grill grate","網 = Ami / あみ\nRadicals: 網 (糸 Thread + 罔 Net)"],
  ].map(([char, reading, meaning, notes]) => ({ char, reading, meaning, notes }));

  function defaultState() {
    return { groups: [{ id: 'food-default', name: 'Food', kanji: DEFAULT_FOOD_KANJI }] };
  }

  /** @type {{groups: Group[]}} */
  let state = loadState();

  // ---- Persistence ----

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultState();
      const parsed = JSON.parse(raw);
      if (!parsed || !Array.isArray(parsed.groups)) return defaultState();
      return parsed;
    } catch (e) {
      return defaultState();
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
