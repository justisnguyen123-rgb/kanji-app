(() => {
  /** @typedef {{char: string, reading: string, meaning: string, notes: string}} Kanji */

  const GROUPS = [
    {
      id: 'food',
      name: 'Food',
      kanji: [
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
        ["鮪","Maguro (まぐろ)","Tuna (general)","鮪 = Maguro / まぐろ\nRadicals: 魚 (Fish radical) + 有 (Possess)"],
        ["赤身","Akami (あかみ)","Lean tuna cut","赤 = Aka / あか\n身 = Mi / み\nRadicals: 赤 (赤 Red radical); 身 (身 Body radical)"],
        ["中トロ","Chūtoro (ちゅうトロ)","Medium fatty tuna","中 = Chū / ちゅう\nRadicals: 中 (丨 Line through 口 Center)"],
        ["鮭 / サーモン","Sake (さけ) / Sāmon","Salmon","鮭 = Sake / さけ\nRadicals: 魚 (Fish radical) + 圭 (Jewel/Square)"],
        ["海老","Ebi (えび)","Shrimp / Prawn","海 = E / え\n老 = Bi / び\nRadicals: 海 (氵 Water + 每 Sea); 老 (老 Old/Elder radical)"],
        ["烏賊","Ika (いか)","Squid","烏 = I / い\n賊 = Ka / か\nRadicals: 烏 (Crow/Black) + 賊 (Rebel)"],
        ["蛸","Tako (たこ)","Octopus","蛸 = Tako / たこ\nRadicals: 虫 (Insect/Creepy-crawly) + 肖"],
        ["軍艦","Gunkan (ぐんかん)","\"Battleship\" style (wrapped in nori)","軍 = Gun / ぐん\n艦 = Kan / かん\nRadicals: 軍 (車 Chariot + 冖 Covered); 艦 (舟 Boat + 監)"],
        ["サビ抜き","Sabi-nuki (サビぬき)","Without wasabi","抜 = Nuki / ぬき\nRadicals: 抜 (扌 Hand + 友 Extract/Remove)"],
        ["蕎麦","Soba (そば)","Buckwheat noodles","蕎 = So / そ\n麦 = Ba / ば\nRadicals: 艹 (Grass/Plant) + 麦 (麦 Wheat/Grain)"],
        ["烏冬 / うどん","Udon (うどん)","Thick wheat noodles","N/A (usually Hiragana)\nThick wheat-based flour noodles"],
        ["温かい","Atsukai (あたたかい)","Hot (broth/noodles)","温 = Atsu(kai) / あたた\nRadicals: 温 (氵 Water + 日 + 皿 Warm liquid)"],
        ["冷たい","Tsumetai (つめたい)","Cold (chilled noodles)","冷 = Tsume(tai) / つめ\nRadicals: 冷 (冫 Ice + 令 Command/Cold)"],
        ["ざる","Zaru","Chilled noodles on bamboo tray","N/A (usually Hiragana)\nServed dry with dipping sauce (tsuyu)"],
        ["かけ","Kake","Hot noodles in clear broth","N/A (usually Hiragana)\nBasic noodle bowl preparation"],
        ["天ぷら","Tempura (てんぷら)","Battered fried seafood/veggies","天 = Ten / てん\nRadicals: 天 (天 Sky/Heaven radical)"],
        ["狐 / きつね","Kitsune (きつね)","Sweet fried tofu topping","狐 = Kitsune / きつね\nRadicals: 狐 (犭 Beast/Dog + 瓜 Fox)"],
        ["狸 / たぬき","Tanuki (たぬき)","Crunchy tempura batter flakes","狸 = Tanuki / たぬき\nRadicals: 狸 (犭 Beast/Dog + 里 Raccoon dog)"],
        ["洋食","Yōshoku (ようしょく)","Western-style Japanese food","洋 = Yō / よう\n食 = Shoku / しょく\nRadicals: 洋 (氵 Water + 羊 Ocean/Foreign); 食 (飠 Food/Meal)"],
        ["オムライス","Omuraisu","Omelet rice","N/A (Katakana)\nFluffy omelet over seasoned rice"],
        ["ハンバーグ","Hanbāgu","Salisbury-style hamburger steak","N/A (Katakana)\nGround meat patty served with sauce"],
        ["海老フライ","Ebi Furai (えびフライ)","Panko-breaded fried shrimp","海 = E / え\n老 = Bi / び\nRadicals: 海 (氵 Water); 老 (老 Elder/Old)"],
        ["豚カツ / とんかつ","Tonkatsu (とんかつ)","Deep-fried pork cutlet","豚 = Ton / とん\nRadicals: 豚 (月 Meat + 豕 Pig)"],
        ["コロッケ","Korokke","Potato/meat croquette","N/A (Katakana)\nDeep-fried breaded croquette"],
        ["カレーライス","Karē Raisu","Japanese curry rice","N/A (Katakana)\nMild thick brown curry over rice"],
        ["天丼","Tendon (てんどん)","Tempura rice bowl","天 = Ten / てん\n丼 = Don / どん\nRadicals: 天 (Heaven); 丼 (井 Well frame + center dot)"],
        ["穴子","Anago (あなご)","Saltwater eel","穴 = Ana / あな\n子 = Go / ご\nRadicals: 穴 (穴 Hole/Cave); 子 (子 Child)"],
        ["南瓜","Kabocha (かぼちゃ)","Japanese pumpkin","南 = Ka / か\n瓜 = Bocha\nRadicals: 南 (South); 瓜 (瓜 Melon/Gourd)"],
        ["茄子","Nasu (なす)","Eggplant","茄 = Na / な\n子 = Su / す\nRadicals: 茄 (艹 Grass/Plant); 子 (子 Child)"],
        ["天つゆ","Tentsuyu (てんつゆ)","Tempura dipping sauce","天 = Ten / てん\nDashi, soy, and mirin sauce base"],
        ["牛丼","Gyūdon (ぎゅうどん)","Beef rice bowl","牛 = Gyū / ぎゅう\n丼 = Don / どん\nRadicals: 牛 (牛 Cow radical); 丼 (井 Well frame + center dot)"],
        ["並盛り","Namimori (なみもり)","Regular size bowl","並 = Nami / なみ\n盛 = Mori / もり\nRadicals: 並 (Line up/Average); 盛 (皿 Dish/Plate)"],
        ["頭の大盛り","Atama no Oomori","Extra meat, regular rice","頭 = Atama / あたま\n盛 = Mori / もり\nRadicals: 頭 (頁 Head/Top); 盛 (皿 Dish/Plate)"],
        ["特盛り","Tokumori (とくもり)","Special extra large size","特 = Toku / とく\n盛 = Mori / もり\nRadicals: 特 (牛 Cow + 寺 Temple); 盛 (皿 Dish/Plate)"],
        ["玉子","Tamago (たまご)","Raw egg (topping)","玉 = Tama / たま\n子 = Go / ご\nRadicals: 玉 (玉 Jewel/Sphere); 子 (子 Child)"],
        ["紅生姜","Beni-shōga (べにしょうが)","Red pickled ginger","紅 = Beni / べに\n生 = Shō / しょう\n姜 = Ga / が\nRadicals: 紅 (糸 Thread + 工 Crimson); 生 (生 Fresh) + 姜 (女)"],
        ["七味","Shichimi (しちみ)","7-spice chili blend","七 = Shichi / しち\n味 = Mi / み\nRadicals: 七 (Seven); 味 (口 Mouth + 未 Flavor)"],
        ["つゆだく","Tsuyu-daku","Extra sauce/broth in bowl","N/A (Slang)\nRequest for extra broth poured over rice"],
        ["お好み焼き","Okonomiyaki (おこのみやき)","Savory griddled pancake","好 = Kono(mi) / この\n焼 = Yaki / やき\nRadicals: 好 (女 Woman + 子 Child); 焼 (火 Fire/Grill)"],
        ["鉄板焼き","Teppanyaki (てっぱんやき)","Iron griddle cooking","鉄 = Tetsu / てつ\n板 = Pan / ぱん\n焼 = Yaki / やき\nRadicals: 鉄 (金 Metal/Gold); 板 (木 Wood/Board); 焼 (火 Fire)"],
        ["豚玉","Butatama (ぶたたま)","Pork & egg okonomiyaki","豚 = Buta / ぶた\n玉 = Tama / たま\nRadicals: 豚 (月 Meat + 豕 Pig); 玉 (玉 Ball/Egg)"],
        ["海鮮焼き","Kaisen-yaki (かいせんやき)","Mixed seafood pancake","海 = Kai / かい\n鮮 = Sen / せん\n焼 = Yaki / やき\nRadicals: 海 (氵 Water/Sea); 鮮 (魚 Fish + 羊 Fresh); 焼 (火 Fire)"],
        ["モダン焼き","Modan-yaki (モダンやき)","Okonomiyaki topped with yakisoba noodles","焼 = Yaki / やき\nRadicals: Katakana \"Modern\" + 焼 (火 Fire)"],
        ["もんじゃ焼き","Monjayaki (もんじゃやき)","Runny Tokyo-style griddle batter","焼 = Yaki / やき\nRadicals: Usually in Hiragana + 焼 (火 Fire)"],
        ["青のり","Aonori (あおのり)","Dried green seaweed flakes","青 = Ao / あお\n海苔 = Nori / のり\nRadicals: 青 (青 Blue/Green radical); 海 (氵 Water) + 苔 (艹 Grass)"],
        ["鰹節","Katsuobushi (かつおぶし)","Bonito flake shavings","鰹 = Katsuo / かつお\n節 = Bushi / ぶし\nRadicals: 鰹 (魚 Fish + 堅 Hard); 節 (竹 Bamboo + 即 Joint)"],
      ].map(([char, reading, meaning, notes]) => ({ char, reading, meaning, notes })),
    },
  ];

  // ---- View elements ----

  const views = {
    home: document.getElementById('view-home'),
    learn: document.getElementById('view-learn'),
  };

  function showView(name) {
    Object.entries(views).forEach(([key, el]) => {
      el.hidden = key !== name;
    });
  }

  function getGroup(id) {
    return GROUPS.find(g => g.id === id) || null;
  }

  // ---- Home view ----

  const groupListEl = document.getElementById('group-list');

  function renderHome() {
    groupListEl.innerHTML = '';
    GROUPS.forEach(group => {
      const card = document.createElement('div');
      card.className = 'group-card';

      const info = document.createElement('div');
      info.className = 'group-card-info';
      info.innerHTML = `
        <div class="group-card-name"></div>
        <div class="group-card-count"></div>
      `;
      info.querySelector('.group-card-name').textContent = group.name;
      info.querySelector('.group-card-count').textContent = `${group.kanji.length} kanji`;

      const learnBtn = document.createElement('button');
      learnBtn.className = 'btn btn-learn-inline';
      learnBtn.textContent = 'Learn';
      learnBtn.addEventListener('click', () => startLearning(group.id));

      card.appendChild(info);
      card.appendChild(learnBtn);
      groupListEl.appendChild(card);
    });
  }

  // ---- Learn view ----

  let currentGroupId = null;
  let learnOrder = [];   // array of kanji indices into current group, shuffled
  let learnPos = 0;

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
    const group = getGroup(groupId);
    if (!group || group.kanji.length === 0) return;
    learnOrder = shuffledIndices(group.kanji.length);
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
    const group = getGroup(currentGroupId);
    if (!group) return;
    learnOrder = shuffledIndices(group.kanji.length);
    learnPos = 0;
    renderLearnCard();
  });

  document.getElementById('btn-learn-back').addEventListener('click', () => {
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
