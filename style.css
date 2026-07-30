/**

- game.js
- ==============================================================
- Handball Stats Hub
- Game Logic
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

function nowISO() {

```
return new Date().toISOString();
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

  venue:
    document.getElementById("venue"),

  // Record screen
  btnSaveEvent:
    document.getElementById("btn-save-event"),

  btnUndo:
    document.getElementById("btn-undo"),

  btnChangeHalf:
    document.getElementById("btn-change-half"),

  btnEndMatch:
    document.getElementById("btn-end-match"),

  btnOther:
    document.getElementById("btn-other"),

  btnInMatchHistory:
    document.getElementById("btn-inmatch-history"),

  firstTeamToggle:
    document.getElementById("toolbar-row") ||
    document.querySelector(".toolbar-row"),

  timer:
    document.getElementById("timer-display"),

  // History screen
  btnBackFromHistory:
    document.getElementById("btn-back-from-history"),

  history:
    document.getElementById("history-list"),

  // Analysis screen
  btnBackFromAnalysis:
    document.getElementById("btn-back-from-analysis"),

  analysis:
    document.getElementById("tab-overview"),

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

if (e.venue) {
  e.venue.value = "";
}

positionNumbers.my = emptyPositionMap();
positionNumbers.opponent = emptyPositionMap();

resetSelections();
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
    crypto.randomUUID(),

  createdAt:
    nowISO(),

  date:
    e.matchDate ? e.matchDate.value : "",

  myTeam:
    e.myTeamName ? e.myTeamName.value.trim() : "",

  opponent:
    e.opponentName ? e.opponentName.value.trim() : "",

  venue:
    e.venue ? e.venue.value.trim() : "",

  myPlayers:
    clone(positionNumbers.my),

  opponentPlayers:
    clone(positionNumbers.opponent),

  events: [],

  analysis: {

    my: {},

    opponent: {},

    team: {}

  }

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

function handleBackFromAnalysis() {

```
App.UI.showScreen("screen-history");
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

resetTimer();

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

const e = els();

if (e.history) {
  e.history.innerHTML = "";
}

if (e.timer) {
  e.timer.textContent = "00:00";
}
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

  id: crypto.randomUUID(),

  team: selectedTeam,

  position: selectedPosition,

  shotCourse: selectedCourse,

  shotType: selectedShotType,

  // normalize to lowercase so analysis comparisons
  // ("goal" / "save") match correctly
  result: (selectedResult || "").toLowerCase(),

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

updateAnalysis();

renderHistory();

renderAnalysis();

renderAnalysisDetails();

renderPlayerAnalysis();

renderPlayerDetails();

renderRanking();

renderGoalkeeperAnalysis();

renderCourtPlayerAnalysis();

resetSelections();

renderSelectedPosition();

renderSelectedShotCourse();

renderSelectedShotType();

renderSelectedResult();
```

}

function renderHistory() {

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

  row.textContent =
    `${index + 1}. `
    + `[${event.team}] `
    + `${event.position} `
    + `${event.shotType} `
    + `${event.shotCourse} `
    + `${event.result}`;

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

updateAnalysis();

renderHistory();
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
In-match History Modal / Other Modal
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

function handleInMatchHistory() {

```
if (!currentMatch) {
  return;
}

let html = `<h3>イベント履歴</h3>`;

if (currentMatch.events.length === 0) {

  html += `<p>まだイベントがありません。</p>`;

} else {

  html += `<div class="modal-history-list">`;

  currentMatch.events.forEach((event, index) => {

    html += `
      <div class="history-item">
        ${index + 1}. [${event.team}] ${event.position}
        ${event.shotType} ${event.shotCourse} ${event.result}
      </div>
    `;

  });

  html += `</div>`;

}

openModal(html);
```

}

function handleOther() {

```
const html = `
  <h3>その他 / ミス記録</h3>
  <div class="mistake-list">
    ${MISTAKE_TYPES.map(m => `
      <button class="btn btn-action mistake-btn" data-mistake="${m.key}">
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

  id: crypto.randomUUID(),

  team: selectedTeam,

  position: selectedPosition,

  shotCourse: null,

  shotType: null,

  result: "mistake",

  mistakeType: mistakeKey,

  timestamp: Date.now()

});

updateAnalysis();

renderHistory();
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

  resetTimer();

  App.UI.showScreen("screen-home");

} catch (error) {

  console.error(error);

  alert("試合の保存に失敗しました。");

}
```

}

function handleEndMatch() {

```
const confirmed = confirm("試合を終了して保存しますか？");

if (!confirmed) {
  return;
}

endMatch();
```

}

/* ==========================================================
Match Timer
========================================================== */

let timerInterval = null;

let elapsedSeconds = 0;

let currentHalf = 1;

function formatTime(totalSeconds) {

```
const minutes = Math.floor(totalSeconds / 60);

const seconds = totalSeconds % 60;

return (
  String(minutes).padStart(2, "0") +
  ":" +
  String(seconds).padStart(2, "0")
);
```

}

function renderTimer() {

```
const e = els();

if (!e.timer) {
  return;
}

e.timer.textContent = formatTime(elapsedSeconds);
```

}

function startTimer() {

```
if (timerInterval) {
  return;
}

timerInterval = setInterval(() => {

  elapsedSeconds++;

  renderTimer();

}, 1000);
```

}

function stopTimer() {

```
if (!timerInterval) {
  return;
}

clearInterval(timerInterval);

timerInterval = null;
```

}

function resetTimer() {

```
stopTimer();

elapsedSeconds = 0;

renderTimer();
```

}

function adjustTimer(seconds) {

```
elapsedSeconds = Math.max(0, elapsedSeconds + seconds);

renderTimer();
```

}

function toggleHalf() {

```
currentHalf =
  currentHalf === 1 ? 2 : 1;

const label = document.getElementById("half-label");

if (label) {

  label.textContent =
    currentHalf === 1 ? "1st Half" : "2nd Half";

}
```

}

function handleChangeHalf() {

```
toggleHalf();
```

}

function handleTimerToggle() {

```
if (timerInterval) {

  stopTimer();

} else {

  startTimer();

}
```

}

function bindTimerEvents() {

```
const btnStart = document.getElementById("btn-timer-start");

if (btnStart) {

  btnStart.addEventListener("click", handleTimerToggle);

}

document
  .querySelectorAll("[data-timer-adjust]")
  .forEach(button => {

    button.addEventListener("click", () => {

      adjustTimer(
        parseInt(button.dataset.timerAdjust, 10)
      );

    });

  });
```

}

/* ==========================================================
Analysis
========================================================== */

function buildAnalysis() {

```
if (!currentMatch) {
  return null;
}

const analysis = {

  totalShots: 0,

  totalGoals: 0,

  totalSaves: 0,

  byPosition: {},

  byCourse: {},

  byShotType: {}

};

currentMatch.events.forEach(event => {

  // mistakes are recorded separately and not counted as shots
  if (event.result === "mistake") {
    return;
  }

  analysis.totalShots++;

  if (!analysis.byPosition[event.position]) {

    analysis.byPosition[event.position] = {

      shots: 0,

      goals: 0,

      saves: 0

    };

  }

  if (!analysis.byCourse[event.shotCourse]) {

    analysis.byCourse[event.shotCourse] = {

      shots: 0,

      goals: 0,

      saves: 0

    };

  }

  if (!analysis.byShotType[event.shotType]) {

    analysis.byShotType[event.shotType] = {

      shots: 0,

      goals: 0,

      saves: 0

    };

  }

  analysis.byPosition[event.position].shots++;

  analysis.byCourse[event.shotCourse].shots++;

  analysis.byShotType[event.shotType].shots++;

  if (event.result === "goal") {

    analysis.totalGoals++;

    analysis.byPosition[event.position].goals++;

    analysis.byCourse[event.shotCourse].goals++;

    analysis.byShotType[event.shotType].goals++;

  }

  if (event.result === "saved" || event.result === "save") {

    analysis.totalSaves++;

    analysis.byPosition[event.position].saves++;

    analysis.byCourse[event.shotCourse].saves++;

    analysis.byShotType[event.shotType].saves++;

  }

});

return analysis;
```

}

function updateAnalysis() {

```
if (!currentMatch) {
  return;
}

currentMatch.analysis = buildAnalysis();
currentMatch.analysis.players = buildPlayerAnalysis();
```

}

function renderAnalysis() {

```
const e = els();

if (!e.analysis) {
  return;
}

if (!currentMatch || !currentMatch.analysis) {

  e.analysis.innerHTML = "";

  return;

}

const a = currentMatch.analysis;

const goalRate =
  a.totalShots === 0
    ? 0
    : Math.round((a.totalGoals / a.totalShots) * 100);

const saveRate =
  a.totalShots === 0
    ? 0
    : Math.round((a.totalSaves / a.totalShots) * 100);

e.analysis.innerHTML = `
  <div class="analysis-card">
    <h3>Match Summary</h3>

    <p><strong>Shots:</strong> ${a.totalShots}</p>

    <p><strong>Goals:</strong> ${a.totalGoals}</p>

    <p><strong>Saves:</strong> ${a.totalSaves}</p>

    <p><strong>Goal %:</strong> ${goalRate}%</p>

    <p><strong>Save %:</strong> ${saveRate}%</p>

  </div>
`;
```

}

function renderAnalysisDetails() {

```
const e = els();

if (!e.analysis) {
  return;
}

if (!currentMatch || !currentMatch.analysis) {
  return;
}

const a = currentMatch.analysis;

let html = e.analysis.innerHTML;

/* -------------------------
   Position
------------------------- */

html += `
  <div class="analysis-card">
    <h3>Position Analysis</h3>
`;

Object.entries(a.byPosition).forEach(([position, value]) => {

  const rate =
    value.shots === 0
      ? 0
      : Math.round(value.goals / value.shots * 100);

  html += `
    <p>
      <strong>${position}</strong><br>
      Shots: ${value.shots}
      /
      Goals: ${value.goals}
      /
      Saves: ${value.saves}
      /
      Goal%: ${rate}%
    </p>
  `;

});

html += `</div>`;

/* -------------------------
   Shot Course
------------------------- */

html += `
  <div class="analysis-card">
    <h3>Shot Course Analysis</h3>
`;

Object.entries(a.byCourse).forEach(([course, value]) => {

  const rate =
    value.shots === 0
      ? 0
      : Math.round(value.goals / value.shots * 100);

  html += `
    <p>
      <strong>${course}</strong><br>
      Shots: ${value.shots}
      /
      Goals: ${value.goals}
      /
      Saves: ${value.saves}
      /
      Goal%: ${rate}%
    </p>
  `;

});

html += `</div>`;

/* -------------------------
   Shot Type
------------------------- */

html += `
  <div class="analysis-card">
    <h3>Shot Type Analysis</h3>
`;

Object.entries(a.byShotType).forEach(([type, value]) => {

  const rate =
    value.shots === 0
      ? 0
      : Math.round(value.goals / value.shots * 100);

  html += `
    <p>
      <strong>${type}</strong><br>
      Shots: ${value.shots}
      /
      Goals: ${value.goals}
      /
      Saves: ${value.saves}
      /
      Goal%: ${rate}%
    </p>
  `;

});

html += `</div>`;

e.analysis.innerHTML = html;
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
  typeof window.App.Storage.getAllMatches === "function"
) {

  try {

    return await window.App.Storage.getAllMatches();

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

e.history.innerHTML = `<p class="loading-text">読み込み中...</p>`;

const matches = await getAllMatches();

e.history.innerHTML = "";

if (!matches || matches.length === 0) {

  e.history.innerHTML = `<p class="empty-text">保存された試合がありません。</p>`;

  return;

}

matches.forEach(match => {

  const card = document.createElement("button");

  card.type = "button";

  card.className = "history-card";

  card.textContent = formatMatchCardLabel(match);

  card.addEventListener("click", () => {

    openHistoryItem(match.id);

  });

  e.history.appendChild(card);

});
```

}

function loadMatch(match) {

```
if (!match) {
  return;
}

currentMatch = clone(match);

updateAnalysis();

App.UI.showScreen("screen-analysis");

renderAnalysis();

renderAnalysisDetails();

renderPlayerAnalysis();

renderPlayerDetails();

renderRanking();

renderGoalkeeperAnalysis();

renderCourtPlayerAnalysis();
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

    loadMatch(match);

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
Player Analysis
========================================================== */

function buildPlayerAnalysis() {

```
if (!currentMatch) {
  return {};
}

const players = {};

currentMatch.events.forEach(event => {

  if (event.result === "mistake") {
    return;
  }

  const key =
    `${event.team}_${event.position}`;

  if (!players[key]) {

    players[key] = {

      team: event.team,

      position: event.position,

      shots: 0,

      goals: 0,

      saves: 0,

      results: {},

      courses: {},

      shotTypes: {}

    };

  }

  const p = players[key];

  p.shots++;

  if (event.result === "goal") {
    p.goals++;
  }

  if (event.result === "saved" || event.result === "save") {
    p.saves++;
  }

  p.results[event.result] =
    (p.results[event.result] || 0) + 1;

  p.courses[event.shotCourse] =
    (p.courses[event.shotCourse] || 0) + 1;

  p.shotTypes[event.shotType] =
    (p.shotTypes[event.shotType] || 0) + 1;

});

return players;
```

}

function getPlayerSuccessRate(player) {

```
if (!player) {
  return 0;
}

if (player.shots === 0) {
  return 0;
}

return Math.round(
  player.goals / player.shots * 100
);
```

}

function renderPlayerAnalysis() {

```
const e = els();

if (!e.analysis) {
  return;
}

if (
  !currentMatch ||
  !currentMatch.analysis ||
  !currentMatch.analysis.players
) {
  return;
}

let html = e.analysis.innerHTML;

html += `
  <div class="analysis-card">
    <h3>Player Analysis</h3>
`;

Object.values(currentMatch.analysis.players)
  .forEach(player => {

    const success =
      getPlayerSuccessRate(player);

    html += `
      <div class="player-analysis">

        <h4>
          ${player.team}
          /
          ${player.position}
        </h4>

        <p>Shots : ${player.shots}</p>

        <p>Goals : ${player.goals}</p>

        <p>Saves : ${player.saves}</p>

        <p>Success : ${success}%</p>

      </div>
    `;

  });

html += `</div>`;

e.analysis.innerHTML = html;
```

}

function getMostUsedKey(data) {

```
let bestKey = "-";
let bestValue = 0;

Object.entries(data).forEach(([key, value]) => {

  if (value > bestValue) {

    bestValue = value;
    bestKey = key;

  }

});

return bestKey;
```

}

function renderPlayerDetails() {

```
const e = els();

if (!e.analysis) {
  return;
}

if (
  !currentMatch ||
  !currentMatch.analysis ||
  !currentMatch.analysis.players
) {
  return;
}

let html = e.analysis.innerHTML;

html += `
  <div class="analysis-card">
    <h3>Player Details</h3>
`;

Object.values(currentMatch.analysis.players)
  .forEach(player => {

    const success =
      getPlayerSuccessRate(player);

    const favoriteCourse =
      getMostUsedKey(player.courses);

    const favoriteShot =
      getMostUsedKey(player.shotTypes);

    const misses =
      player.results.miss || 0;

    html += `
      <div class="player-analysis">

        <h4>${player.team} / ${player.position}</h4>

        <p>Success : ${success}%</p>

        <p>Favorite Course : ${favoriteCourse}</p>

        <p>Favorite Shot : ${favoriteShot}</p>

        <p>Misses : ${misses}</p>

      </div>
    `;

  });

html += `</div>`;

e.analysis.innerHTML = html;
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
  "Team",
  "Position",
  "ShotType",
  "ShotCourse",
  "Result",
  "Timestamp"
].join(","));

currentMatch.events.forEach(event => {

  rows.push([

    event.team,

    event.position,

    event.shotType,

    event.shotCourse,

    event.result,

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
Goalkeeper / Court Analysis
========================================================== */

function buildGoalkeeperAnalysis() {

```
if (
  !currentMatch ||
  !currentMatch.analysis ||
  !currentMatch.analysis.players
) {
  return [];
}

return Object.values(
  currentMatch.analysis.players
).filter(player => player.position === "GK");
```

}

function buildCourtPlayerAnalysis() {

```
if (
  !currentMatch ||
  !currentMatch.analysis ||
  !currentMatch.analysis.players
) {
  return [];
}

return Object.values(
  currentMatch.analysis.players
).filter(player => player.position !== "GK");
```

}

function renderGoalkeeperAnalysis() {

```
const e = els();

if (!e.analysis) {
  return;
}

const keepers = buildGoalkeeperAnalysis();

let html = e.analysis.innerHTML;

html += `
  <div class="analysis-card">
    <h3>Goalkeeper Analysis</h3>
`;

keepers.forEach(gk => {

  const rate =
    gk.shots === 0
      ? 0
      : Math.round(gk.saves / gk.shots * 100);

  html += `
    <div class="player-analysis">

      <h4>${gk.team} / GK</h4>

      <p>Shots : ${gk.shots}</p>

      <p>Saves : ${gk.saves}</p>

      <p>Save % : ${rate}%</p>

    </div>
  `;

});

html += `</div>`;

e.analysis.innerHTML = html;
```

}

function renderCourtPlayerAnalysis() {

```
const e = els();

if (!e.analysis) {
  return;
}

const players = buildCourtPlayerAnalysis();

let html = e.analysis.innerHTML;

html += `
  <div class="analysis-card">
    <h3>Court Player Analysis</h3>
`;

players.forEach(player => {

  const rate =
    getPlayerSuccessRate(player);

  html += `
    <div class="player-analysis">

      <h4>
        ${player.team}
        /
        ${player.position}
      </h4>

      <p>Shots : ${player.shots}</p>

      <p>Goals : ${player.goals}</p>

      <p>Goal % : ${rate}%</p>

    </div>
  `;

});

html += `</div>`;

e.analysis.innerHTML = html;
```

}

/* ==========================================================
Ranking
========================================================== */

function buildRanking() {

```
if (
  !currentMatch ||
  !currentMatch.analysis ||
  !currentMatch.analysis.players
) {
  return [];
}

return Object.values(
  currentMatch.analysis.players
)
  .map(player => ({

    ...player,

    successRate:
      getPlayerSuccessRate(player)

  }))
  .sort(
    (a, b) =>
      b.successRate - a.successRate
  );
```

}

function renderRanking() {

```
const e = els();

if (!e.analysis) {
  return;
}

const ranking = buildRanking();

let html = e.analysis.innerHTML;

html += `
  <div class="analysis-card">
    <h3>Player Ranking</h3>
`;

ranking.forEach((player, index) => {

  html += `
    <div class="ranking-row">

      <strong>#${index + 1}</strong>

      ${player.team}

      /

      ${player.position}

      -

      ${player.successRate}%

    </div>
  `;

});

html += `</div>`;

e.analysis.innerHTML = html;
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

    // Prevent the click from bubbling up to the parent
    // position-btn and re-triggering selectPosition oddly
    // while typing in the number field.
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

function bindTabEvents() {

```
document
  .querySelectorAll(".tab-btn")
  .forEach(button => {

    button.addEventListener("click", () => {

      document
        .querySelectorAll(".tab-btn")
        .forEach(b => b.classList.remove("active"));

      document
        .querySelectorAll(".tab-panel")
        .forEach(p => p.classList.remove("active"));

      button.classList.add("active");

      const panel =
        document.getElementById(`tab-${button.dataset.tab}`);

      if (panel) {
        panel.classList.add("active");
      }

    });

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

if (e.btnBackFromAnalysis) {
  e.btnBackFromAnalysis.addEventListener(
    "click",
    handleBackFromAnalysis
  );
}

bindTeamToggleEvents();

bindPositionEvents();

bindNumberInputs();

bindShotSelectionEvents();

bindTimerEvents();

bindTabEvents();

bindModalEvents();

if (e.btnSaveEvent) {
  e.btnSaveEvent.addEventListener("click", handleSaveEvent);
}

if (e.btnUndo) {
  e.btnUndo.addEventListener("click", handleUndo);
}

if (e.btnChangeHalf) {
  e.btnChangeHalf.addEventListener("click", handleChangeHalf);
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
    handleInMatchHistory
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

openHistoryItem
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
