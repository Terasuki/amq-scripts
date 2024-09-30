// ==UserScript==
// @name         Song List Auto Download
// @namespace    https://github.com/Terasuki
// @version      1.1
// @description  Automatically downloads latest game's JSON file.
// @author       Terasuki
// @match        https://*.animemusicquiz.com/*
// @require      https://raw.githubusercontent.com/TheJoseph98/AMQ-Scripts/master/common/amqWindows.js
// @require      https://raw.githubusercontent.com/TheJoseph98/AMQ-Scripts/master/common/amqScriptInfo.js
// @grant        none
// ==/UserScript==

(() => {

    // Do not load on start page.
    if (document.getElementById('startPage')) return;

    // Wait for game to start before starting script.
    let loadInterval = setInterval(() => {
        if (document.getElementById('loadingScreen').classList.contains('hidden')) {
            setup();
            clearInterval(loadInterval);
        }
    }, 500);

    let quizId = 'no_id';
    let quizOverExport = new Listener('quiz end result', (result) => {
        if (quizId == 'no_id') {
            gameChat.systemMessage('Auto download failed: No game found.');
            return;
        }
        let game_map = songHistoryWindow.gamesTab.gameMap[quiz.quizDescription.quizId]
        let file = new Blob([game_map.downloadJsonString], {type: 'application/json'});
        let filename = `amq_song_expoert-${game_map.startTime.format('YYYY-MM-DD_HH-mm-ss')}.json`

        // Code from Song List UI, by TheJoseph98
        let tmpLink = $(`<a href="${URL.createObjectURL(file)}" download="${filename}"></a>`);
        $(document.body).append(tmpLink);
        tmpLink.get(0).click();
        tmpLink.remove();
    });

    let obtainQuizId = new Listener('answer results', (result) => {
        quizId = quiz.quizDescription.quizId;
    });

    function setup() {
        quizOverExport.bindListener();
        obtainQuizId.bindListener();
    }
    
    AMQ_addScriptData({
        name: 'Song List Auto Download',
        author: 'Terasuki',
        description: `
            <p>Automatically downloads latest game's JSON file, from AMQ's Song History.</p>
            <p>Thanks to TheJoseph98 for download and window code.</p>
        `
    });
})();
