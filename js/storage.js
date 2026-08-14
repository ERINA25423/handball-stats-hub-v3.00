/* =========================================
   Handball Stats Hub
   storage.js

   試合・イベントデータの保存管理
   ========================================= */

const STORAGE_KEYS = {
    MATCHES: "hsh_matches",
    CURRENT_MATCH: "hsh_current_match",
    PLAYERS: "hsh_players",
    TEAMS: "hsh_teams"
};


/* =========================================
   共通ユーティリティ
========================================= */

function generateId(prefix = "id") {
    return (
        prefix +
        "_" +
        Date.now().toString(36) +
        "_" +
        Math.random().toString(36).substring(2, 8)
    );
}


function getStorage(key, defaultValue = []) {
    try {
        const data = localStorage.getItem(key);

        if (!data) {
            return defaultValue;
        }

        return JSON.parse(data);

    } catch (error) {
        console.error("Storage read error:", error);
        return defaultValue;
    }
}


function setStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;

    } catch (error) {
        console.error("Storage write error:", error);
        return false;
    }
}


/* =========================================
   試合データ
========================================= */

function getMatches() {
    return getStorage(STORAGE_KEYS.MATCHES, []);
}


function getMatch(matchId) {
    const matches = getMatches();

    return matches.find(
        match => match.id === matchId
    ) || null;
}


function createMatch(matchData = {}) {

    const now = new Date().toISOString();

    const match = {

        id: generateId("match"),

        createdAt: now,
        updatedAt: now,

        date: matchData.date || "",
        competition: matchData.competition || "",

        homeTeam: matchData.homeTeam || "",
        awayTeam: matchData.awayTeam || "",

        homeScore: 0,
        awayScore: 0,

        period: "1H",

        status: "not_started",

        events: [],

        notes: ""

    };

    const matches = getMatches();

    matches.unshift(match);

    setStorage(
        STORAGE_KEYS.MATCHES,
        matches
    );

    setCurrentMatchId(match.id);

    return match;
}


/* =========================================
   試合更新
========================================= */

function updateMatch(matchId, updates = {}) {

    const matches = getMatches();

    const index = matches.findIndex(
        match => match.id === matchId
    );

    if (index === -1) {
        return null;
    }

    matches[index] = {

        ...matches[index],

        ...updates,

        updatedAt: new Date().toISOString()

    };

    setStorage(
        STORAGE_KEYS.MATCHES,
        matches
    );

    return matches[index];
}


/* =========================================
   試合削除
========================================= */

function deleteMatch(matchId) {

    const matches = getMatches();

    const filtered = matches.filter(
        match => match.id !== matchId
    );

    setStorage(
        STORAGE_KEYS.MATCHES,
        filtered
    );

    const currentMatchId = getCurrentMatchId();

    if (currentMatchId === matchId) {
        clearCurrentMatch();
    }

    return true;
}


/* =========================================
   現在の試合
========================================= */

function setCurrentMatchId(matchId) {

    localStorage.setItem(
        STORAGE_KEYS.CURRENT_MATCH,
        matchId
    );
}


function getCurrentMatchId() {

    return localStorage.getItem(
        STORAGE_KEYS.CURRENT_MATCH
    );
}


function getCurrentMatch() {

    const matchId = getCurrentMatchId();

    if (!matchId) {
        return null;
    }

    return getMatch(matchId);
}


function clearCurrentMatch() {

    localStorage.removeItem(
        STORAGE_KEYS.CURRENT_MATCH
    );
}


/* =========================================
   イベント
========================================= */

/*
    1プレー = 1イベント

    情報が一部空欄でも保存可能。

    例：

    {
        id,
        time,
        period,
        team,
        playerNumber,
        position,
        attackType,
        shotCourse,
        result,
        missType,
        penaltyType,
        timeoutTeam,
        freeThrow,
        notes
    }
*/


function createEvent(eventData = {}) {

    return {

        id: generateId("event"),

        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),

        time: eventData.time || "",

        period: eventData.period || "1H",

        team: eventData.team || "",

        playerNumber:
            eventData.playerNumber ?? "",

        position:
            eventData.position || "",

        attackType:
            eventData.attackType || "",

        shotCourse:
            eventData.shotCourse || "",

        result:
            eventData.result || "",

        missType:
            eventData.missType || "",

        penaltyType:
            eventData.penaltyType || "",

        timeoutTeam:
            eventData.timeoutTeam || "",

        freeThrow:
            eventData.freeThrow || "",

        notes:
            eventData.notes || ""

    };
}


/* =========================================
   イベント保存
========================================= */

function saveEvent(matchId, eventData) {

    const matches = getMatches();

    const matchIndex = matches.findIndex(
        match => match.id === matchId
    );

    if (matchIndex === -1) {
        return null;
    }

    const event = createEvent(eventData);

    matches[matchIndex].events.push(event);

    matches[matchIndex].updatedAt =
        new Date().toISOString();

    updateMatchScore(matches[matchIndex]);

    setStorage(
        STORAGE_KEYS.MATCHES,
        matches
    );

    return event;
}


/* =========================================
   イベント編集
========================================= */

function updateEvent(
    matchId,
    eventId,
    updates = {}
) {

    const matches = getMatches();

    const matchIndex = matches.findIndex(
        match => match.id === matchId
    );

    if (matchIndex === -1) {
        return null;
    }

    const eventIndex =
        matches[matchIndex].events.findIndex(
            event => event.id === eventId
        );

    if (eventIndex === -1) {
        return null;
    }

    matches[matchIndex].events[eventIndex] = {

        ...matches[matchIndex].events[eventIndex],

        ...updates,

        updatedAt: new Date().toISOString()

    };

    matches[matchIndex].updatedAt =
        new Date().toISOString();

    updateMatchScore(matches[matchIndex]);

    setStorage(
        STORAGE_KEYS.MATCHES,
        matches
    );

    return matches[matchIndex].events[eventIndex];
}


/* =========================================
   イベント削除
========================================= */

function deleteEvent(matchId, eventId) {

    const matches = getMatches();

    const matchIndex = matches.findIndex(
        match => match.id === matchId
    );

    if (matchIndex === -1) {
        return false;
    }

    matches[matchIndex].events =
        matches[matchIndex].events.filter(
            event => event.id !== eventId
        );

    matches[matchIndex].updatedAt =
        new Date().toISOString();

    updateMatchScore(matches[matchIndex]);

    setStorage(
        STORAGE_KEYS.MATCHES,
        matches
    );

    return true;
}


/* =========================================
   イベント取得
========================================= */

function getEvents(matchId) {

    const match = getMatch(matchId);

    if (!match) {
        return [];
    }

    return match.events || [];
}


function getEvent(matchId, eventId) {

    const events = getEvents(matchId);

    return events.find(
        event => event.id === eventId
    ) || null;
}


/* =========================================
   スコア自動計算
========================================= */

function updateMatchScore(match) {

    let homeScore = 0;
    let awayScore = 0;

    const homeTeam = match.homeTeam;
    const awayTeam = match.awayTeam;

    match.events.forEach(event => {

        if (event.result !== "GOAL") {
            return;
        }

        if (event.team === "home") {
            homeScore++;

        } else if (event.team === "away") {
            awayScore++;
        }

        /*
            チーム名で保存されている場合にも
            対応できるようにする。
        */

        else if (
            event.team === homeTeam &&
            homeTeam !== ""
        ) {
            homeScore++;

        } else if (
            event.team === awayTeam &&
            awayTeam !== ""
        ) {
            awayScore++;
        }

    });

    match.homeScore = homeScore;
    match.awayScore = awayScore;

    return match;
}


/* =========================================
   試合ステータス
========================================= */

function startMatch(matchId) {

    return updateMatch(
        matchId,
        {
            status: "live"
        }
    );
}


function finishMatch(matchId) {

    return updateMatch(
        matchId,
        {
            status: "finished"
        }
    );
}


/* =========================================
   選手データ
========================================= */

function getPlayers() {

    return getStorage(
        STORAGE_KEYS.PLAYERS,
        []
    );
}


function savePlayer(playerData = {}) {

    const players = getPlayers();

    const player = {

        id: generateId("player"),

        number:
            playerData.number ?? "",

        name:
            playerData.name || "",

        position:
            playerData.position || "",

        team:
            playerData.team || ""

    };

    players.push(player);

    setStorage(
        STORAGE_KEYS.PLAYERS,
        players
    );

    return player;
}


/* =========================================
   チームデータ
========================================= */

function getTeams() {

    return getStorage(
        STORAGE_KEYS.TEAMS,
        []
    );
}


function saveTeam(teamData = {}) {

    const teams = getTeams();

    const team = {

        id: generateId("team"),

        name:
            teamData.name || "",

        shortName:
            teamData.shortName || ""

    };

    teams.push(team);

    setStorage(
        STORAGE_KEYS.TEAMS,
        teams
    );

    return team;
}


/* =========================================
   全データ削除
========================================= */

function clearAllData() {

    localStorage.removeItem(
        STORAGE_KEYS.MATCHES
    );

    localStorage.removeItem(
        STORAGE_KEYS.CURRENT_MATCH
    );

    localStorage.removeItem(
        STORAGE_KEYS.PLAYERS
    );

    localStorage.removeItem(
        STORAGE_KEYS.TEAMS
    );

}


/* =========================================
   デバッグ用
========================================= */

window.HandballStorage = {

    getMatches,
    getMatch,
    createMatch,
    updateMatch,
    deleteMatch,

    setCurrentMatchId,
    getCurrentMatchId,
    getCurrentMatch,
    clearCurrentMatch,

    createEvent,
    saveEvent,
    updateEvent,
    deleteEvent,
    getEvents,
    getEvent,

    updateMatchScore,

    startMatch,
    finishMatch,

    getPlayers,
    savePlayer,

    getTeams,
    saveTeam,

    clearAllData

};
