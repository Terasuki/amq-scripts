// ==UserScript==
// @name         AMQ Ranked Records
// @namespace    https://github.com/Terasuki
// @version      0.1.1
// @description  Tracks personal ranked results.
// @author       Terasuki
// @match        https://animemusicquiz.com/*
// @require      https://raw.githubusercontent.com/TheJoseph98/AMQ-Scripts/master/common/amqWindows.js
// @require      https://raw.githubusercontent.com/TheJoseph98/AMQ-Scripts/master/common/amqScriptInfo.js
// @connect      script.google.com
// @connect      script.googleusercontent.com
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(() => {
    
    // Insert here Google Script App deployment link.
    const scriptLink = '';

    let playerResults = {
        name: '',
        pointsArray: [0]
    };

    // Do not load on start page.
    if (document.getElementById('startPage')) return;

    if (quiz.gameMode !== 'Ranked') return;

    // Wait for game to start before starting script.
    let loadInterval = setInterval(() => {
        if (document.getElementById('loadingScreen').classList.contains('hidden')) {
            setup();
            clearInterval(loadInterval);
        }
    }, 500);

    // Answer reveal.
    new Listener('answer results', (result) => {
        result.players.forEach((player) => {

            if (quiz.players[player.gamePlayerId]._name !== selfName) return;

            playerResults.pointsArray.push(player.score);
        });
    }).bindListener();

    // Game end.
    new Listener('quiz end result', (result) => {
        GM_xmlhttpRequest({
            method: 'POST',
            url: scriptLink,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: 'data=' + encodeURIComponent(JSON.stringify(playerResults)),
            onload: (response) => {
                console.log('Sent data');
            },
            onerror: (response) => {
                console.log('Error');
            } 
        });
    }).bindListener();

    function setup() {

        playerResults.name = selfName;
    }
})();
