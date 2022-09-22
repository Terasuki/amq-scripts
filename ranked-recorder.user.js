// ==UserScript==
// @name         AMQ Ranked Records
// @namespace    https://github.com/Terasuki
// @version      0.2
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

    // This object is sent to the spreadsheet.
    let playerResults = {
        name: '',
        topPercent: 100,
        pointsArray: [0],
        opsRate: 0,
        edsRate: 0,
        insRate: 0
    };

    let recording = false;
    let rankedWindow;
    let rate = {
        opCorrect: 0,
        ops: 0,
        edCorrect: 0,
        eds: 0,
        inCorrect: 0,
        ins: 0
    }

    // Do not load on start page.
    if (document.getElementById('startPage')) return;

    // Wait for game to start before starting script.
    let loadInterval = setInterval(() => {
        if (document.getElementById('loadingScreen').classList.contains('hidden')) {
            setup();
            clearInterval(loadInterval);
        }
    }, 500);

    // Answer reveal.
    new Listener('answer results', (result) => {

        // if (quiz.gameMode !== 'Ranked') return;

        updateResults(result);
    }).bindListener();

    // Game end.
    new Listener('quiz end result', (result) => {

        // if (quiz.gameMode !== 'Ranked') return;
        if (!recording) return;

        playerResults.topPercent = $('#currentTop').text();
        playerResults.opsRate = rate.ops !== 0 ? ((rate.opCorrect/rate.ops)*100).toFixed(2) : 'n/a';
        playerResults.edsRate = rate.eds !== 0 ? ((rate.edCorrect/rate.eds)*100).toFixed(2) : 'n/a';
        playerResults.insRate = rate.ins !== 0 ? ((rate.inCorrect/rate.ins)*100).toFixed(2) : 'n/a';

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

        // Turn off script after game finishes.
        recording = false;
        $('#recordCheckbox').prop('checked', false);
    }).bindListener();

    function updateResults(result) {
        
        let allScores = [];
        let playerPos = 0;
        result.players.forEach((player) => {

            setTimeout(() => {
                allScores.push(player.score);

                if (quiz.players[player.gamePlayerId]._name !== selfName) return;
                
                playerResults.pointsArray.push(player.score);
                playerPos = player.position;
                if (result.songInfo.type === 1) {
                    rate.ops++;
                    if(player.correct) {rate.opCorrect++;}
                }
                else if (result.songInfo.type === 2) {
                    rate.eds++;
                    if(player.correct) {rate.edCorrect++;}
                }
                else {
                    rate.ins++;
                    if(player.correct) {rate.inCorrect++;}
                }

                console.log(rate);
                allScores.sort((a, b) => a - b);
                $('#top5').text(allScores[allScores.length - Math.ceil(allScores.length/20)]);
                $('#top20').text(allScores[allScores.length - Math.ceil(allScores.length/5)]);
                $('#top50').text(allScores[allScores.length - Math.ceil(allScores.length/2)]);
                $('#currentTop').text((playerPos/allScores.length *100).toFixed(2));
                $('#opR').text(rate.ops !== 0 ? ((rate.opCorrect/rate.ops)*100).toFixed(2) : 'n/a');
                $('#edR').text(rate.eds !== 0 ? ((rate.edCorrect/rate.eds)*100).toFixed(2) : 'n/a');
                $('#inR').text(rate.ins !== 0 ? ((rate.inCorrect/rate.ins)*100).toFixed(2) : 'n/a');

                if (allScores.length < 4) return;
                $('#top3').text(allScores[allScores.length - 3]);
            }, 1);
        });

        
    }

    function createRankedWindow() {

        rankedWindow = new AMQWindow({
            title: 'Ranked Stats',
            width: 300,
            height: 350,
            draggable: true,
            zIndex: 1000,
            id: 'rankedWindow'
        });

        rankedWindow.addPanel({
            width: 1.0,
            height: 200,
            id: 'rankedResults'
        });

        rankedWindow.addPanel({
            width: 1.0,
            height: 50,
            position: {
                x: 0,
                y: 200
            },
            id: 'rankedControl'
        });

        rankedWindow.panels[0].panel.append(
            $(`<div id='rankedResultsContainer'></div>`)
            .append(
                $(
                    `<div id='rankedResultsLeft'>
                        <p>Top 3</p>
                        <p>Top 5%</p>
                        <p>Top 20%</p>
                        <p>Top 50%</p>
                        <p>Your Top%</p>
                        <p>Openings Rate%<p>
                        <p>Endings Rate%<p>
                        <p>Inserts Rate%<p>
                    </div>`
                )
            )
            .append(
                $(
                    `<div id='rankedResultsRight'>
                        <p id='top3'>0</p>
                        <p id='top5'>0</p>
                        <p id='top20'>0</p>
                        <p id='top50'>0</p>
                        <p id='currentTop'>100</p>
                        <p id='opR'>0</p>
                        <p id='edR'>0</p>
                        <p id='inR'>0</p>
                    </div>`
                )
            )
        );

        rankedWindow.panels[1].panel.append(
            $(`<div id='rankedControlContainer'></div>`)
            .append(
                $(`<input type='checkbox' id='recordCheckbox'>`).click(() => {
                    if ($(this).prop('checked')) {
                        recording = false;
                    }
                    else {
                        recording = true;
                    }
                })
            )
            .append(
                $(`<label for='recordCheckbox'>Record current round</label>`)
            )
        );

        let oldWidth = $('#qpOptionContainer').width();
        $('#qpOptionContainer').width(oldWidth + 35);
        $('#qpOptionContainer > div')
            .append($(`<div id='qpRankedTracker' class='clickAble qpOption'><i aria-hidden='true' class='fa fa-music qpMenuItem'></i></div>`)
                .click(() => {
                    toggleWindow(rankedWindow);
                })
                .popover({
                    content: 'Ranked Stats',
                    trigger: 'hover',
                    placement: 'bottom'
                })
            );
    }

    function toggleWindow(window) {

        if (window.isVisible()) {
            window.close();
        }
        else {
            window.open();
        }
    }

    function setup() {

        createRankedWindow();
        playerResults.name = selfName;
    }

    AMQ_addStyle(`
        #qpRankedTracker {
            width: 30px;
            margin-right: 5px;
        }
        #rankedResultsRight {
            padding-right: 5px;
            text-align: right;
            float: right;
            width: 50%;
        }
        #rankedResultsLeft {
            padding-left: 5px;
            text-align: left;
            float: left;
            width: 50%;
        }
        #rankedResultsRight > p {
            margin-bottom: 0;
        }
        #rankedResultsLeft > p {
            margin-bottom: 0;
        }
    `);

    AMQ_addScriptData({
        name: 'AMQ Ranked Records',
        author: 'Terasuki',
        description: `
            <p>Tracks current ranked position information and exports results to a designed spreadsheet.</p>
            <p>Thanks to TheJoseph98 for providing window code.</p>
        `
    });
})();
