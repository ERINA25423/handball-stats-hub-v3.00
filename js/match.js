/* =========================================
   Handball Stats Hub
   match.js
========================================= */

let currentMatch = null;

let selectedTeam = "home";

const teamPlayerNumbers = {
    home: {
        LW: "",
        PV: "",
        RW: "",
        LB: "",
        CB: "",
        RB: "",
        EP: "",
        GK: ""
    },

    away: {
        LW: "",
        PV: "",
        RW: "",
        LB: "",
        CB: "",
        RB: "",
        EP: "",
        GK: ""
    }
};

let selectedPlayer = "";
let selectedPosition = "";
let selectedCourse = "";
let selectedResult = "";
let selectedAttack = "";

let matchSeconds = 0;
let clockInterval = null;
let clockRunning = false;


/* =========================================
   初期化
========================================= */

document.addEventListener("DOMContentLoaded", () => {

    initializeMatchPage();

});


function initializeMatchPage() {

    const savedMatch = getCurrentMatch();

    if (savedMatch) {

        currentMatch = savedMatch;

        showLiveMatch();

        updateMatchDisplay();

       renderEventHistory();

    }

    setupEventListeners();


}



/* =========================================
   イベント設定
========================================= */

function setupEventListeners() {

    const createButton =
        document.getElementById("createMatchButton");

    if (createButton) {

        createButton.addEventListener(
            "click",
            createNewMatch
        );

    }


    document
        .querySelectorAll(".team-switch-button")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    selectTeam(
                        button.dataset.team
                    );

                }
            );

        });


    document
    .querySelectorAll(".position-player-card")
    .forEach(card => {

        card.addEventListener("click", () => {

            const position =
                card.querySelector(".position-label")
                    ?.textContent
                    .trim();

            if (!position) {
                return;
            }

            selectPositionPlayer(
                position,
                card
            );

        });

    });



document
    .querySelectorAll(".player-number-input")
    .forEach(input => {

        input.addEventListener("input", () => {

            const position =
                input.dataset.positionPlayer;

            if (!position) {
                return;
            }

            teamPlayerNumbers[selectedTeam][position] =
                input.value.trim();

            if (selectedPosition === position) {

                selectedPlayer =
                    input.value.trim();

                updateStatusDisplay();

            }

        });

    });

function selectPositionPlayer(
    position,
    card
) {

    selectedPosition = position;

    const input =
        card.querySelector(
            ".player-number-input"
        );

    selectedPlayer =
        input
            ? input.value.trim()
            : "";

    document
        .querySelectorAll(
            ".position-player-card"
        )
        .forEach(item => {

            item.classList.remove(
                "active"
            );

        });

    card.classList.add("active");

    updateStatusDisplay();
}

    document
        .querySelectorAll("[data-position]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    selectPosition(
                        button.dataset.position
                    );

                }
            );

        });


    document
        .querySelectorAll("[data-course]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    selectCourse(
                        button.dataset.course
                    );

                }
            );

        });


    document
        .querySelectorAll("[data-result]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    selectResult(
                        button.dataset.result
                    );

                }
            );

        });


    document
        .querySelectorAll("[data-attack]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    selectAttack(
                        button.dataset.attack
                    );

                }
            );

        });


    const otherButton =
        document.getElementById("otherButton");

    if (otherButton) {

        otherButton.addEventListener(
            "click",
            toggleOtherMenu
        );

    }


    document
        .querySelectorAll("[data-other]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    openOtherModal(
                        button.dataset.other
                    );

                }
            );

        });


    const closeOtherModal =
        document.getElementById("closeOtherModal");

    if (closeOtherModal) {

        closeOtherModal.addEventListener(
            "click",
            closeModal
        );

    }


    const saveButton =
        document.getElementById("saveEventButton");

    if (saveButton) {

        saveButton.addEventListener(
            "click",
            saveCurrentEvent
        );

    }


    const clearButton =
        document.getElementById("clearInputButton");

    if (clearButton) {

        clearButton.addEventListener(
            "click",
            clearCurrentInput
        );

    }


    const startButton =
        document.getElementById("clockStartButton");

    if (startButton) {

        startButton.addEventListener(
            "click",
            startClock
        );

    }


    const stopButton =
        document.getElementById("clockStopButton");

    if (stopButton) {

        stopButton.addEventListener(
            "click",
            stopClock
        );

    }


    const finishButton =
        document.getElementById("finishMatchButton");

    if (finishButton) {

        finishButton.addEventListener(
            "click",
            finishCurrentMatch
        );

    }

}


/* =========================================
   新規試合
========================================= */

function createNewMatch() {

    const competition =
        document.getElementById("competition").value.trim();

    const date =
        document.getElementById("matchDate").value;

    const homeTeam =
        document.getElementById("homeTeam").value.trim();

    const awayTeam =
        document.getElementById("awayTeam").value.trim();


    if (!homeTeam || !awayTeam) {

        alert(
            "自チームと相手チームを入力してください。"
        );

        return;

    }


    currentMatch = createMatch({

        competition,
        date,
        homeTeam,
        awayTeam

    });


    selectedTeam = "home";

    matchSeconds = 0;

    updateClockDisplay();

    showLiveMatch();

    updateMatchDisplay();

}


/* =========================================
   試合画面表示
========================================= */

function showLiveMatch() {

    const setup =
        document.getElementById("matchSetup");

    const live =
        document.getElementById("liveMatchArea");


    if (setup) {

        setup.classList.add("hidden");

    }

    if (live) {

        live.classList.remove("hidden");

    }

}


/* =========================================
   チーム選択
========================================= */

function selectTeam(team) {

    if (team !== "home" && team !== "away") {
        return;
    }

    // 現在のチームの背番号を保存
    document
        .querySelectorAll(".player-number-input")
        .forEach(input => {

            const position =
                input.dataset.positionPlayer;

            if (position) {
                teamPlayerNumbers[selectedTeam][position] =
                    input.value.trim();
            }
        });

    selectedTeam = team;

    // 切り替えたチームの背番号を表示
    document
        .querySelectorAll(".player-number-input")
        .forEach(input => {

            const position =
                input.dataset.positionPlayer;

            if (position) {
                input.value =
                    teamPlayerNumbers[selectedTeam][position] || "";
            }
        });

    document
        .querySelectorAll(".team-switch-button")
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.team === selectedTeam
            );
        });

    selectedPlayer = "";
    selectedPosition = "";

    document
        .querySelectorAll(".position-player-card")
        .forEach(card => {
            card.classList.remove("active");
        });

    updateSelectedTeamLabel();
    updateStatusDisplay();
}


/* =========================================
   選手
========================================= */

function selectPlayer(player) {

    selectedPlayer = player;


    document
        .querySelectorAll("[data-player]")
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.player === player
            );

        });


    updateStatusDisplay();

}


/* =========================================
   ポジション
========================================= */

function selectPosition(position) {

    selectedPosition = position;


    document
        .querySelectorAll("[data-position]")
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.position === position
            );

        });


    updateStatusDisplay();

}


/* =========================================
   シュートコース
========================================= */

function selectCourse(course) {

    selectedCourse = course;


    document
        .querySelectorAll("[data-course]")
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.course === course
            );

        });


    updateStatusDisplay();

}


/* =========================================
   結果
========================================= */

function selectResult(result) {

    selectedResult = result;


    document
        .querySelectorAll("[data-result]")
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.result === result
            );

        });


    updateStatusDisplay();

}


/* =========================================
   攻撃
========================================= */

function selectAttack(attack) {

    selectedAttack = attack;


    document
        .querySelectorAll("[data-attack]")
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.attack === attack
            );

        });

}


/* =========================================
   表示更新
========================================= */

function updateStatusDisplay() {

    const player =
        document.getElementById(
            "selectedPlayerLabel"
        );

    const position =
        document.getElementById(
            "selectedPositionLabel"
        );

    const course =
        document.getElementById(
            "selectedCourseLabel"
        );

    const result =
        document.getElementById(
            "selectedResultLabel"
        );


    if (player) {

        player.textContent =
            selectedPlayer || "-";

    }

    if (position) {

        position.textContent =
            selectedPosition || "-";

    }

    if (course) {

        course.textContent =
            selectedCourse || "-";

    }

    if (result) {

        result.textContent =
            selectedResult || "-";

    }

}


function updateSelectedTeamLabel() {

    const label =
        document.getElementById(
            "selectedTeamLabel"
        );

    if (!label) {

        return;

    }


    label.textContent =
        selectedTeam === "home"
            ? "自チーム"
            : "相手チーム";

}


/* =========================================
   試合表示
========================================= */

function updateMatchDisplay() {

    if (!currentMatch) {

        return;

    }


    const homeName =
        document.getElementById(
            "displayHomeTeam"
        );

    const awayName =
        document.getElementById(
            "displayAwayTeam"
        );


    const homeScore =
        document.getElementById(
            "homeScore"
        );

    const awayScore =
        document.getElementById(
            "awayScore"
        );


    if (homeName) {

        homeName.textContent =
            currentMatch.homeTeam ||
            "自チーム";

    }

    if (awayName) {

        awayName.textContent =
            currentMatch.awayTeam ||
            "相手チーム";

    }

    if (homeScore) {

        homeScore.textContent =
            currentMatch.homeScore || 0;

    }

    if (awayScore) {

        awayScore.textContent =
            currentMatch.awayScore || 0;

    }


    updateSelectedTeamLabel();

    updateStatusDisplay();

}


/* =========================================
   イベント保存
========================================= */

function saveCurrentEvent() {

    if (!currentMatch) {

        alert(
            "先に試合を開始してください。"
        );

        return;

    }


    const event = saveEvent(
        currentMatch.id,
        {

            time: formatClock(
                matchSeconds
            ),

            period:
                getCurrentPeriod(),

            team:
                selectedTeam,

            playerNumber:
                selectedPlayer,

            position:
                selectedPosition,

            attackType:
                selectedAttack,

            shotCourse:
                selectedCourse,

            result:
                selectedResult

        }
    );


    if (!event) {

        alert(
            "記録の保存に失敗しました。"
        );

        return;

    }


    currentMatch =
        getMatch(currentMatch.id);


    updateMatchDisplay();

   renderEventHistory();
   
    clearCurrentInput();


    /*
        保存完了後も試合時間は
        そのまま継続します。
    */

    showSaveMessage();

}


/* =========================================
   保存完了表示
========================================= */

function showSaveMessage() {

    const button =
        document.getElementById(
            "saveEventButton"
        );

    if (!button) {

        return;

    }


    const originalText =
        button.textContent;


    button.textContent =
        "保存しました";


    setTimeout(() => {

        button.textContent =
            originalText;

    }, 800);

}


/* =========================================
   入力クリア
========================================= */

function clearCurrentInput() {

    selectedPlayer = "";
    selectedPosition = "";
    selectedCourse = "";
    selectedResult = "";
    selectedAttack = "";


    document
        .querySelectorAll(
            ".player-grid button.active,"
            + ".position-grid button.active,"
            + ".shot-course-grid button.active,"
            + ".result-grid button.active,"
            + ".attack-grid button.active"
        )
        .forEach(button => {

            button.classList.remove(
                "active"
            );

        });


    updateStatusDisplay();

}


/* =========================================
   OTHER
========================================= */

function toggleOtherMenu() {

    const menu =
        document.getElementById(
            "otherMenu"
        );

    if (!menu) {

        return;

    }


    menu.classList.toggle(
        "hidden"
    );

}


/* =========================================
   OTHERモーダル
========================================= */

function openOtherModal(type) {

    const modal =
        document.getElementById(
            "otherModal"
        );

    const title =
        document.getElementById(
            "otherModalTitle"
        );

    const content =
        document.getElementById(
            "otherModalContent"
        );


    if (!modal || !title || !content) {

        return;

    }


    content.innerHTML = "";


    if (type === "MISS") {

        title.textContent = "ミス";

        createOtherButtons(
            content,
            [
                "パスミス",
                "キャッチミス",
                "ドリブルミス",
                "オーバーステップ",
                "オフェンスチャージ",
                "その他"
            ],
            "miss"
        );

    }


    if (type === "PENALTY") {

        title.textContent = "ペナルティ";

        createOtherButtons(
            content,
            [
                "イエロー",
                "2分退場",
                "レッド"
            ],
            "penalty"
        );

    }


    if (type === "TIMEOUT") {

        title.textContent =
            "タイムアウト";

        createOtherButtons(
            content,
            [
                "自チーム",
                "相手チーム"
            ],
            "timeout"
        );

    }


    if (type === "FREETHROW") {

        title.textContent =
            "フリースロー";

        createOtherButtons(
            content,
            [
                "獲得",
                "再開"
            ],
            "freethrow"
        );

    }


    if (type === "SUBSTITUTION") {

        title.textContent =
            "選手交代";

        createOtherButtons(
            content,
            [
                "交代"
            ],
            "substitution"
        );

    }


    modal.classList.remove(
        "hidden"
    );

}


function createOtherButtons(
    container,
    labels,
    type
) {

    labels.forEach(label => {

        const button =
            document.createElement(
                "button"
            );

        button.type = "button";

        button.textContent = label;

        button.addEventListener(
            "click",
            () => {

                saveOtherEvent(
                    type,
                    label
                );

                closeModal();

            }
        );

        container.appendChild(
            button
        );

    });

}


/* =========================================
   OTHERイベント保存
========================================= */

function saveOtherEvent(
    type,
    value
) {

    if (!currentMatch) {

        return;

    }


    const data = {

        time:
            formatClock(
                matchSeconds
            ),

        period:
            getCurrentPeriod(),

        team:
            selectedTeam,

        playerNumber:
            selectedPlayer,

        position:
            selectedPosition,

        attackType:
            "",

        shotCourse:
            "",

        result:
            "",

        missType:
            type === "miss"
                ? value
                : "",

        penaltyType:
            type === "penalty"
                ? value
                : "",

        timeoutTeam:
            type === "timeout"
                ? value
                : "",

        freeThrow:
            type === "freethrow"
                ? value
                : "",

        notes:
            type === "substitution"
                ? value
                : ""

    };


    const event =
        saveEvent(
            currentMatch.id,
            data
        );


    if (event) {

        currentMatch =
            getMatch(
                currentMatch.id
            );

        updateMatchDisplay();

        clearCurrentInput();

    }

}


/* =========================================
   モーダル閉じる
========================================= */

function closeModal() {

    const modal =
        document.getElementById(
            "otherModal"
        );

    if (modal) {

        modal.classList.add(
            "hidden"
        );

    }

}


/* =========================================
   タイマー
========================================= */

function startClock() {

    if (clockRunning) {

        return;

    }


    clockRunning = true;


    clockInterval =
        setInterval(() => {

            matchSeconds++;

            updateClockDisplay();

        }, 1000);

}


function stopClock() {

    clockRunning = false;

    clearInterval(
        clockInterval
    );

    clockInterval = null;

}


function updateClockDisplay() {

    const clock =
        document.getElementById(
            "matchClock"
        );

    if (clock) {

        clock.textContent =
            formatClock(
                matchSeconds
            );

    }

}


function formatClock(seconds) {

    const minutes =
        Math.floor(
            seconds / 60
        );

    const remainingSeconds =
        seconds % 60;


    return (
        String(minutes).padStart(2, "0")
        + ":" +
        String(remainingSeconds).padStart(2, "0")
    );

}


/* =========================================
   前半・後半
========================================= */

function getCurrentPeriod() {

    const display =
        document.getElementById(
            "periodDisplay"
        );

    if (
        display &&
        display.textContent.includes("後半")
    ) {

        return "2H";

    }

    return "1H";

}


/* =========================================
   試合終了
========================================= */

function finishCurrentMatch() {

    if (!currentMatch) {

        return;

    }


    const confirmed =
        confirm(
            "試合を終了して保存しますか？"
        );


    if (!confirmed) {

        return;

    }


    stopClock();


    currentMatch =
        finishMatch(
            currentMatch.id
        );


    clearCurrentMatch();

    window.location.href =
        "running-score.html";

}


/* =========================================
   ランニングスコア
========================================= */

function openRunningScore() {

    if (!currentMatch) {

        alert(
            "試合が開始されていません。"
        );

        return;

    }


    window.location.href =
        "running-score.html"
        + "?match="
        + encodeURIComponent(
            currentMatch.id
        );

}

/* =========================================
   EVENT HISTORY
========================================= */

function renderEventHistory() {

    if (!currentMatch) {
        return;
    }

    const homeHistory =
        document.getElementById("homeHistory");

    const awayHistory =
        document.getElementById("awayHistory");

    if (!homeHistory || !awayHistory) {
        return;
    }

    homeHistory.innerHTML = "";
    awayHistory.innerHTML = "";

    const events =
        currentMatch.events || [];

    const homeEvents =
        events.filter(event =>
            event.team === "home"
        );

    const awayEvents =
        events.filter(event =>
            event.team === "away"
        );

    renderHistoryList(
        homeHistory,
        homeEvents
    );

    renderHistoryList(
        awayHistory,
        awayEvents
    );
}


/* =========================================
   HISTORY リスト生成
========================================= */

function renderHistoryList(
    container,
    events
) {

    if (!events.length) {

        container.innerHTML = `
            <div class="history-empty">
                記録はありません
            </div>
        `;

        return;
    }

    events.forEach(event => {

        const row =
            document.createElement("div");

        row.className =
            "history-event";


        const time =
            document.createElement("div");

        time.className =
            "history-time";

        time.textContent =
            event.time || "--:--";


        const main =
            document.createElement("div");

        main.className =
            "history-main";


        const player =
            document.createElement("span");

        player.className =
            "history-player";

        player.textContent =
            event.playerNumber
                ? `#${event.playerNumber}`
                : "-";


        const position =
            document.createElement("span");

        position.className =
            "history-position";

        position.textContent =
            event.position || "-";


        const course =
            document.createElement("span");

        course.className =
            "history-course";

        course.textContent =
            event.shotCourse || "";


        const result =
            document.createElement("span");

        result.className =
            "history-result";

        result.textContent =
            event.result || "";


        const attack =
            document.createElement("span");

        attack.className =
            "history-attack";

        attack.textContent =
            event.attackType || "";


        main.appendChild(player);
        main.appendChild(position);

        if (event.shotCourse) {
            main.appendChild(course);
        }

        if (event.result) {
            main.appendChild(result);
        }

        if (event.attackType) {
            main.appendChild(attack);
        }


        row.appendChild(time);
        row.appendChild(main);

        container.appendChild(row);

    });

}


/* =========================================
   HISTORY TEAM SWITCH
========================================= */

function switchHistoryTeam(team) {

    const history =
        document.getElementById(
            team === "home"
                ? "homeHistory"
                : "awayHistory"
        );

    const button =
        document.querySelector(
            `.history-team-button[data-history-team="${team}"]`
        );

    if (!history || !button) {
        return;
    }

    const isOpen =
        !history.classList.contains("history-closed");

    if (isOpen) {

        history.classList.add("history-closed");
        button.classList.remove("active");

    } else {

        history.classList.remove("history-closed");
        button.classList.add("active");

    }
}


document.addEventListener(
    "click",
    event => {

        const button =
            event.target.closest(
                ".history-team-button"
            );

        if (!button) {
            return;
        }

        switchHistoryTeam(
            button.dataset.historyTeam
        );

    }
);
