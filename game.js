/**

- game.js
- ==============================================================
- Handball Stats Hub
- Game Logic
- 
- このファイルは以下と連携する:
- - App.Timer  : タイマー/ハーフの状態管理・表示(timer.js)
- - App.Analysis: 分析画面の集計・描画(analysis.js)
- - App.Storage : 試合データの永続化(storage.js)
- 
- イベントのデータ形式は analysis.js の集計ロジックが前提とする
- 形式に合わせている:
- {
- ```
  type: "shot" | "mistake",
  ```
- ```
  team: "my" | "opponent",
  ```
- ```
  number: "7" (背番号。未入力なら ""),
  ```
- ```
  position: "LW" 等,
  ```
- ```
  shotCourse: "LT" 等 (mistakeの場合は null),
  ```
- ```
  shotType: "Normal" | "Fast Break" | "7m" (mistakeの場合は null),
  ```
- ```
  result: "GOAL" | "SAVED" | "MISS" | "BLOCK" (mistakeの場合は mistakeType),
  ```
- ```
  half: 1 | 2,
  ```
- ```
  timestamp: number
  ```
- }
- ==============================================================
  */

window.App = window.App || {};

/* ==============================================================
Screen Utility
============================================================== */

App.UI = App.UI || {};

App.UI.showScreen = function (screenId) {

document.querySelectorAll(”.screen”).forEach(screen => {
screen.classList.remove(“active”);
});

const target = document.getElementById(screenId);

if (target) {
target.classList.add(“active”);
}

};

/* ==============================================================
Game Module
============================================================== */

App.Game = (function () {

“use strict”;

/* ==========================================================
Constants
========================================================== */

const POSITIONS = [
“LW”,
“PV”,
“RW”,
“LB”,
“CB”,
“RB”,
“GK”,
“EP”
];

const MISTAKE_TYPES = [
{
key: “offensive_foul”,
label: “オフェンスファウル”
},
{
key: “steps”,
label: “ステップ”
},
{
key: “pass_catch”,
label: “パス・キャッチミス”
},
{
key: “other”,
label: “その他”
}
];

/* ==========================================================
Internal State
========================================================== */

let currentMatch = null;

let selectedTeam = “my”;

let selectedPosition = null;

let selectedCourse = null;

let selectedShotType = null;

let selectedResult = null;

let positionNumbers = {
my: {},
opponent: {}
};

/* ==========================================================
Utility
========================================================== */

function emptyPositionMap() {

```
const map = {};

POSITIONS.forEach(position => {
  map[position] = "";
});

return map;
```

}

function clone(value) {

```
return JSON.parse(JSON.stringify(value));
```

}

function generateId() {

```
if (window.crypto && typeof window.crypto.randomUUID === "function") {
  return window.crypto.randomUUID();
}

return "e_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 10);
```

}

function getCurrentHalf() {

```
if (window.App && App.Timer && typeof App.Timer.getHalf === "function") {
  return App.Timer.getHalf();
}

return 1;
```

}

/* ==========================================================
DOM
========================================================== */

function els() {

```
return {

  // Home screen
  btnGotoNewMatch:
    document.getElementById("btn-goto-new-match"),

  btnGotoHistory:
    document.getElementById("btn-goto-history"),

  // New match screen
  btnStartMatch:
    document.getElementById("btn-start-match"),

  btnBackHome:
    document.getElementById("btn-back-home"),

  matchDate:
    document.getElementById("match-date"),

  myTeamName:
    document.getElementById("input-my-team"),

  opponentName:
    document.getElementById("opponent-name"),

  matchStatusLabel:
    document.getElementById("match-status-label"),

  // Record screen
  btnSaveEvent:
    document.getElementById("btn-save-event"),

  btnUndo:
    document.getElementById("btn-undo"),

  btnEndMatch:
    document.getElementById("btn-end-match"),

  btnOther:
    document.getElementById("btn-other"),

  btnInMatchHistory:
    document.getElementById("btn-inmatch-history"),

  // History screen
  btnBackFromHistory:
    document.getElementById("btn-back-from-history"),

  history:
    document.getElementById("history-list"),

  // Modal
  modalOverlay:
    document.getElementById("modal-overlay"),

  modalContent:
    document.getElementById("modal-content"),

  modalClose:
    document.getElementById("modal-close")

};
```

}

/* ==========================================================
Reset
========================================================== */

function resetSelections() {

```
selectedPosition = null;
selectedCourse = null;
selectedShotType = null;
selectedResult = null;
```

}

function resetNewMatchForm() {

```
const e = els();

if (e.matchDate) {
  e.matchDate.valueAsDate = new Date();
}

if (e.myTeamName) {
  e.myTeamName.value = "";
}

if (e.opponentName) {
  e.opponentName.value = "";
}

positionNumbers.my = emptyPositionMap();
positionNumbers.opponent = emptyPositionMap();

resetSelections();

if (e.matchStatusLabel) {
  e.matchStatusLabel.textContent = "NO MATCH STARTED";
}
```

}

/* ==========================================================
Match
========================================================== */

function createMatchObject() {

```
const e = els();

return {

  id:
    generateId(),

  date:
    e.matchDate ? e.matchDate.value : "",

  myTeam:
    e.myTeamName ? e.myTeamName.value.trim() : "",

  opponent:
    e.opponentName ? e.opponentName.value.trim() : "",

  myPlayers:
    clone(positionNumbers.my),

  opponentPlayers:
    clone(positionNumbers.opponent),

  events: []

};
```

}

/* ==========================================================
Screen Handlers
========================================================== */

function handleGotoNewMatch() {

```
resetNewMatchForm();

App.UI.showScreen("screen-new-match");
```

}

function handleBackHome() {

```
App.UI.showScreen("screen-home");
```

}

async function handleGotoHistory() {

```
App.UI.showScreen("screen-history");

await renderMatchHistoryList();
```

}

function handleBackFromHistory() {

```
App.UI.showScreen("screen-home");
```

}

function handleStartMatch() {

```
const e = els();

const opponentName =
  e.opponentName ? e.opponentName.value.trim() : "";

if (!opponentName) {

  alert("対戦相手名を入力してください。");

  return;

}

currentMatch = createMatchObject();

selectedTeam = "my";

resetSelections();

if (window.App && App.Timer && typeof App.Timer.reset === "function") {
  App.Timer.reset();
}

App.UI.showScreen("screen-record");

renderCurrentMatch();
```

}

/* ==========================================================
Render
========================================================== */

function renderCurrentMatch() {

```
if (!currentMatch) {
  return;
}

renderInMatchHistory();
```

}

/* ==========================================================
Team / Position
========================================================== */

function setSelectedTeam(team) {

```
if (team !== "my" && team !== "opponent") {
  return;
}

selectedTeam = team;

renderTeamToggle();

refreshNumberInputs();
```

}

function renderTeamToggle() {

```
document
  .querySelectorAll("[data-team]")
  .forEach(button => {

    const active =
      button.dataset.team === selectedTeam;

    button.classList.toggle("active", active);

  });
```

}

function updatePositionNumber(team, position, number) {

```
if (!positionNumbers[team]) {
  return;
}

positionNumbers[team][position] = number;
```

}

function getPositionNumber(team, position) {

```
if (!positionNumbers[team]) {
  return "";
}

return positionNumbers[team][position] || "";
```

}

function selectPosition(position) {

```
if (!POSITIONS.includes(position)) {
  return;
}

selectedPosition = position;

renderSelectedPosition();
```

}

function renderSelectedPosition() {

```
document
  .querySelectorAll("[data-position]")
  .forEach(button => {

    button.classList.toggle(
      "active",
      button.dataset.position === selectedPosition
    );

  });
```

}

/* ==========================================================
Shot Selection
========================================================== */

function selectShotCourse(course) {

```
selectedCourse = course;

renderSelectedShotCourse();
```

}

function selectShotType(type) {

```
selectedShotType = type;

renderSelectedShotType();
```

}

function selectResult(result) {

```
selectedResult = result;

renderSelectedResult();
```

}

function renderSelectedShotCourse() {

```
document
  .querySelectorAll("[data-course]")
  .forEach(button => {

    button.classList.toggle(
      "active",
      button.dataset.course === selectedCourse
    );

  });
```

}

function renderSelectedShotType() {

```
document
  .querySelectorAll("[data-shot-type]")
  .forEach(button => {

    button.classList.toggle(
      "active",
      button.dataset.shotType === selectedShotType
    );

  });
```

}

function renderSelectedResult() {

```
document
  .querySelectorAll("[data-result]")
  .forEach(button => {

    button.classList.toggle(
      "active",
      button.dataset.result === selectedResult
    );

  });
```

}

function bindShotSelectionEvents() {

```
document
  .querySelectorAll("[data-course]")
  .forEach(button => {

    button.addEventListener("click", () => {

      selectShotCourse(
        button.dataset.course
      );

    });

  });

document
  .querySelectorAll("[data-shot-type]")
  .forEach(button => {

    button.addEventListener("click", () => {

      selectShotType(
        button.dataset.shotType
      );

    });

  });

document
  .querySelectorAll("[data-result]")
  .forEach(button => {

    button.addEventListener("click", () => {

      selectResult(
        button.dataset.result
      );

    });

  });
```

}

/* ==========================================================
Event Save
========================================================== */

function createEventObject() {

```
return {

  id: generateId(),

  type: "shot",

  team: selectedTeam,

  number: getPositionNumber(selectedTeam, selectedPosition),

  position: selectedPosition,

  shotCourse: selectedCourse,

  shotType: selectedShotType,

  // analysis.js は "GOAL" / "SAVED" / "MISS" / "BLOCK" という
  // 大文字表記をそのまま期待しているため、そのまま保存する
  result: selectedResult,

  half: getCurrentHalf(),

  timestamp: Date.now()

};
```

}

function canSaveEvent() {

```
return (
  selectedPosition &&
  selectedCourse &&
  selectedShotType &&
  selectedResult
);
```

}

function saveEvent() {

```
if (!currentMatch) {
  return;
}

if (!canSaveEvent()) {

  alert("入力が完了していません。");

  return;

}

currentMatch.events.push(
  createEventObject()
);

renderInMatchHistory();

resetSelections();

renderSelectedPosition();

renderSelectedShotCourse();

renderSelectedShotType();

renderSelectedResult();
```

}

function formatEventLabel(event, index) {

```
if (event.type === "mistake") {

  const mistakeDef =
    MISTAKE_TYPES.find(m => m.key === event.mistakeType);

  return (
    `${index + 1}. [${event.team === "my" ? "MY" : "OPP"}] `
    + `MISTAKE - ${mistakeDef ? mistakeDef.label : event.mistakeType}`
  );

}

const numberLabel =
  event.number ? `#${event.number}` : "#-";

return (
  `${index + 1}. `
  + `[${event.team === "my" ? "MY" : "OPP"}] `
  + `${numberLabel} ${event.position} `
  + `${event.shotType} ${event.shotCourse} `
  + `${event.result}`
);
```

}

/* ==========================================================
In-Match History (record screen “HISTORY” button/modal)
========================================================== */

function renderInMatchHistory() {

```
const e = els();

if (!e.history) {
  return;
}

e.history.innerHTML = "";

if (!currentMatch) {
  return;
}

currentMatch.events.forEach((event, index) => {

  const row = document.createElement("div");

  row.className = "history-item";

  row.textContent = formatEventLabel(event, index);

  e.history.appendChild(row);

});
```

}

function undoLastEvent() {

```
if (!currentMatch) {
  return;
}

if (currentMatch.events.length === 0) {
  return;
}

currentMatch.events.pop();

renderInMatchHistory();
```

}

function handleSaveEvent() {

```
saveEvent();
```

}

function handleUndo() {

```
undoLastEvent();
```

}

/* ==========================================================
Modal (OTHER / IN-MATCH HISTORY)
========================================================== */

function openModal(html) {

```
const e = els();

if (!e.modalOverlay || !e.modalContent) {
  return;
}

e.modalContent.innerHTML = html;

e.modalOverlay.classList.remove("hidden");
```

}

function closeModal() {

```
const e = els();

if (!e.modalOverlay) {
  return;
}

e.modalOverlay.classList.add("hidden");
```

}

function handleInMatchHistoryButton() {

```
if (!currentMatch) {
  return;
}

let html = `<h3 class="modal-title">イベント履歴</h3>`;

if (currentMatch.events.length === 0) {

  html += `<p class="modal-empty">まだイベントがありません。</p>`;

} else {

  html += `<div class="history-modal-list">`;

  currentMatch.events.forEach((event, index) => {

    html += `<div class="history-row">${formatEventLabel(event, index)}</div>`;

  });

  html += `</div>`;

}

openModal(html);
```

}

function handleOther() {

```
const html = `
  <h3 class="modal-title">その他 / ミス記録</h3>
  <div class="modal-option-list">
    ${MISTAKE_TYPES.map(m => `
      <button type="button" class="btn btn-modal-option" data-mistake="${m.key}">
        ${m.label}
      </button>
    `).join("")}
  </div>
`;

openModal(html);

document
  .querySelectorAll("[data-mistake]")
  .forEach(button => {

    button.addEventListener("click", () => {

      recordMistake(button.dataset.mistake);

      closeModal();

    });

  });
```

}

function recordMistake(mistakeKey) {

```
if (!currentMatch) {
  return;
}

currentMatch.events.push({

  id: generateId(),

  type: "mistake",

  team: selectedTeam,

  number: getPositionNumber(selectedTeam, selectedPosition),

  position: selectedPosition,

  shotCourse: null,

  shotType: null,

  result: null,

  mistakeType: mistakeKey,

  half: getCurrentHalf(),

  timestamp: Date.now()

});

renderInMatchHistory();
```

}

/* ==========================================================
End Match
========================================================== */

async function endMatch() {

```
if (!currentMatch) {
  return;
}

try {

  if (
    window.App &&
    window.App.Storage &&
    typeof window.App.Storage.saveMatch === "function"
  ) {

    await window.App.Storage.saveMatch(currentMatch);

  }

  alert("試合を保存しました。");

  currentMatch = null;

  resetSelections();

  if (window.App && App.Timer && typeof App.Timer.reset === "function") {
    App.Timer.reset();
  }

  App.UI.showScreen("screen-home");

} catch (error) {

  console.error(error);

  alert("試合の保存に失敗しました。");

}
```

}

function handleEndMatch() {

```
if (!currentMatch) {
  return;
}

const confirmed = confirm("試合を終了して保存しますか？");

if (!confirmed) {
  return;
}

endMatch();
```

}

/* ==========================================================
Match History (list screen)
========================================================== */

function formatMatchCardLabel(match) {

```
const date = match.date || "----/--/--";

const myTeam = match.myTeam || "MY TEAM";

const opponent = match.opponent || "Opponent";

return `${date} — ${myTeam} vs ${opponent}`;
```

}

async function getAllMatches() {

```
if (
  window.App &&
  window.App.Storage &&
  typeof window.App.Storage.getMatches === "function"
) {

  try {

    return await window.App.Storage.getMatches();

  } catch (error) {

    console.error(error);

    return [];

  }

}

return [];
```

}

async function renderMatchHistoryList() {

```
const e = els();

if (!e.history) {
  return;
}

e.history.innerHTML = `<p class="history-empty">読み込み中...</p>`;

const matches = await getAllMatches();

e.history.innerHTML = "";

if (!matches || matches.length === 0) {

  e.history.innerHTML = `<p class="history-empty">保存された試合がありません。</p>`;

  return;

}

matches.forEach(match => {

  const card = document.createElement("div");

  card.className = "match-card";

  const shotCount =
    Array.isArray(match.events)
      ? match.events.filter(ev => ev.type === "shot").length
      : 0;

  card.innerHTML = `
    <div class="match-card-header">
      <span class="match-card-date">${match.date || "----/--/--"}</span>
    </div>
    <div class="match-card-title">${match.myTeam || "MY TEAM"} vs ${match.opponent || "Opponent"}</div>
    <div class="match-card-sub">${shotCount} shots recorded</div>
    <div class="match-card-actions">
      <button type="button" class="btn btn-view" data-view-match="${match.id}">VIEW ANALYSIS</button>
      <button type="button" class="btn btn-delete" data-delete-match="${match.id}">DELETE</button>
    </div>
  `;

  e.history.appendChild(card);

});

e.history
  .querySelectorAll("[data-view-match]")
  .forEach(button => {

    button.addEventListener("click", () => {

      openHistoryItem(button.dataset.viewMatch);

    });

  });

e.history
  .querySelectorAll("[data-delete-match]")
  .forEach(button => {

    button.addEventListener("click", async () => {

      const confirmed = confirm("この試合データを削除しますか？");

      if (!confirmed) {
        return;
      }

      await handleDeleteMatch(button.dataset.deleteMatch);

    });

  });
```

}

async function handleDeleteMatch(matchId) {

```
try {

  if (
    window.App &&
    window.App.Storage &&
    typeof window.App.Storage.deleteMatch === "function"
  ) {

    await window.App.Storage.deleteMatch(matchId);

  }

  await renderMatchHistoryList();

} catch (error) {

  console.error(error);

  alert("試合データの削除に失敗しました。");

}
```

}

function loadMatchForAnalysis(match) {

```
if (!match) {
  return;
}

App.UI.showScreen("screen-analysis");

if (
  window.App &&
  window.App.Analysis &&
  typeof window.App.Analysis.renderForMatch === "function"
) {

  window.App.Analysis.renderForMatch(match);

}
```

}

async function loadSavedMatch(matchId) {

```
try {

  if (
    window.App &&
    window.App.Storage &&
    typeof window.App.Storage.getMatch === "function"
  ) {

    const match =
      await window.App.Storage.getMatch(matchId);

    loadMatchForAnalysis(match);

  } else {

    alert("ストレージ機能が読み込まれていません。");

  }

} catch (error) {

  console.error(error);

  alert("試合データを読み込めませんでした。");

}
```

}

function openHistoryItem(matchId) {

```
loadSavedMatch(matchId);
```

}

/* ==========================================================
CSV Export
========================================================== */

function convertEventsToCSV() {

```
if (!currentMatch) {
  return "";
}

const rows = [];

rows.push([
  "Type",
  "Team",
  "Number",
  "Position",
  "ShotType",
  "ShotCourse",
  "Result",
  "Half",
  "Timestamp"
].join(","));

currentMatch.events.forEach(event => {

  rows.push([

    event.type,

    event.team,

    event.number || "",

    event.position || "",

    event.shotType || "",

    event.shotCourse || "",

    event.result || event.mistakeType || "",

    event.half,

    event.timestamp

  ].join(","));

});

return rows.join("\n");
```

}

function downloadCSV() {

```
if (!currentMatch) {
  return;
}

const csv = convertEventsToCSV();

const blob = new Blob(
  [csv],
  {
    type: "text/csv;charset=utf-8;"
  }
);

const url = URL.createObjectURL(blob);

const link = document.createElement("a");

link.href = url;

link.download =
  `${currentMatch.date || "match"}_${currentMatch.opponent || "opponent"}.csv`;

document.body.appendChild(link);

link.click();

document.body.removeChild(link);

URL.revokeObjectURL(url);
```

}

/* ==========================================================
Binding helpers
========================================================== */

function bindTeamToggleEvents() {

```
document
  .querySelectorAll("[data-team]")
  .forEach(button => {

    button.addEventListener("click", () => {

      setSelectedTeam(button.dataset.team);

    });

  });
```

}

function bindPositionEvents() {

```
document
  .querySelectorAll("[data-position]")
  .forEach(button => {

    button.addEventListener("click", () => {

      selectPosition(button.dataset.position);

    });

  });
```

}

function bindNumberInputs() {

```
document
  .querySelectorAll("[data-number-position]")
  .forEach(input => {

    // 番号入力欄クリックが親の position-btn の
    // click(=selectPosition)にバブリングしないようにする
    input.addEventListener("click", (evt) => {
      evt.stopPropagation();
    });

    input.addEventListener("input", () => {

      updatePositionNumber(
        selectedTeam,
        input.dataset.numberPosition,
        input.value.trim()
      );

    });

  });
```

}

function refreshNumberInputs() {

```
document
  .querySelectorAll("[data-number-position]")
  .forEach(input => {

    input.value = getPositionNumber(
      selectedTeam,
      input.dataset.numberPosition
    );

  });
```

}

function bindModalEvents() {

```
const e = els();

if (e.modalClose) {

  e.modalClose.addEventListener("click", closeModal);

}

if (e.modalOverlay) {

  e.modalOverlay.addEventListener("click", (evt) => {

    if (evt.target === e.modalOverlay) {
      closeModal();
    }

  });

}
```

}

function bindEvents() {

```
const e = els();

if (e.btnGotoNewMatch) {
  e.btnGotoNewMatch.addEventListener(
    "click",
    handleGotoNewMatch
  );
}

if (e.btnGotoHistory) {
  e.btnGotoHistory.addEventListener(
    "click",
    handleGotoHistory
  );
}

if (e.btnBackHome) {
  e.btnBackHome.addEventListener(
    "click",
    handleBackHome
  );
}

if (e.btnStartMatch) {
  e.btnStartMatch.addEventListener(
    "click",
    handleStartMatch
  );
}

if (e.btnBackFromHistory) {
  e.btnBackFromHistory.addEventListener(
    "click",
    handleBackFromHistory
  );
}

// 注: btn-back-from-analysis, タブ切り替え(#analysis-tabs)は
// analysis.js の init() 内(bindBackButton / bindTabs)で
// バインド済みのため、ここでは重複してバインドしない。

// 注: タイマー関連ボタン(btn-timer-start / -10s / -1s / +1s / +10s /
// btn-change-half)は timer.js の init() 内で既にバインドされて
// いるため、ここでは重複してバインドしない。

bindTeamToggleEvents();

bindPositionEvents();

bindNumberInputs();

bindShotSelectionEvents();

bindModalEvents();

if (e.btnSaveEvent) {
  e.btnSaveEvent.addEventListener("click", handleSaveEvent);
}

if (e.btnUndo) {
  e.btnUndo.addEventListener("click", handleUndo);
}

if (e.btnEndMatch) {
  e.btnEndMatch.addEventListener("click", handleEndMatch);
}

if (e.btnOther) {
  e.btnOther.addEventListener("click", handleOther);
}

if (e.btnInMatchHistory) {
  e.btnInMatchHistory.addEventListener(
    "click",
    handleInMatchHistoryButton
  );
}
```

}

/* ==========================================================
Initialize
========================================================== */

function init() {

```
resetSelections();

positionNumbers.my = emptyPositionMap();

positionNumbers.opponent = emptyPositionMap();

bindEvents();

if (window.App && window.App.Timer && typeof window.App.Timer.init === "function") {
  App.Timer.init();
}

if (window.App && window.App.Analysis && typeof window.App.Analysis.init === "function") {
  App.Analysis.init();
}

if (window.App && window.App.Storage && typeof window.App.Storage.init === "function") {
  App.Storage.init();
}
```

}

/* ==========================================================
Public API
========================================================== */

return {

```
init,

getCurrentMatch() {
  return currentMatch;
},

getSelectedTeam() {
  return selectedTeam;
},

downloadCSV,

openHistoryItem,

renderMatchHistoryList
```

};

})();

/* ==============================================================
Auto Initialize
============================================================== */
document.addEventListener(“DOMContentLoaded”, () => {

if (
window.App &&
window.App.Game &&
typeof window.App.Game.init === “function”
) {
window.App.Game.init();
}

});
