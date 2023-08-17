// ==UserScript==
// @name         AMQ Ranked Tracker
// @namespace    https://github.com/Terasuki
// @version      1.1
// @description  Tracks personal ranked results, current position and song distribution for Novice ranked.
// @author       Terasuki
// @match        https://animemusicquiz.com/*
// @require      https://raw.githubusercontent.com/TheJoseph98/AMQ-Scripts/master/common/amqWindows.js
// @require      https://raw.githubusercontent.com/TheJoseph98/AMQ-Scripts/master/common/amqScriptInfo.js
// ==/UserScript==

(() => {

    let rankedWindow;
    let rate = {
        opCorrect: 0,
        ops: 0,
        edCorrect: 0,
        eds: 0,
        inCorrect: 0,
        ins: 0
    };
    
    let songsPlayed = [
    // [OP, ED, IN] 
        [0, 0, 0], // [60, 100]
        [0, 0, 0], // [45, 60)
        [0, 0, 0], // [25, 45)
        [0, 0, 0]  // [10, 25)
    ];

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

        //if (quiz.gameMode !== 'Ranked') return;

        updateResults(result);
        updateDistribution(result);
    }).bindListener();

    // Before game.
    new Listener('quiz ready', (data) => {
        resetData();
    }).bindListener();

    function updateResults(result) {
        
        let allScores = [];
        let playerPos = 0;
        setTimeout(() => {
            result.players.forEach((player) => {

                allScores.push(player.score);
    
                if (quiz.players[player.gamePlayerId]._name !== selfName) return;

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
            });
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
    }

    function updateDistribution(result) {

        setTimeout(() => {
            let songDiff = result.songInfo.animeDifficulty;
            let songType = result.songInfo.type;

            let matrix_j = songType-1;
            let matrix_i = 0;
            if (songDiff > 60) {matrix_i = 0;}
            else if (songDiff > 45 && songDiff <= 60) {matrix_i = 1;}
            else if (songDiff > 25 && songDiff <= 45) {matrix_i = 2;}
            else if (songDiff <= 25) {matrix_i = 3;}
            songsPlayed[matrix_i][matrix_j] = songsPlayed[matrix_i][matrix_j] + 1;

            $('#hard').text(`${songsPlayed[3][0]}[2] / ${songsPlayed[3][1]}[2] / ${songsPlayed[3][2]}[1]`)
            $('#med_hard').text(`${songsPlayed[2][0]}[8] / ${songsPlayed[2][1]}[4] / ${songsPlayed[2][2]}[4]`)
            $('#med_easy').text(`${songsPlayed[1][0]}[8] / ${songsPlayed[1][1]}[2] / ${songsPlayed[1][2]}[2]`)
            $('#easy').text(`${songsPlayed[0][0]}[9] / ${songsPlayed[0][1]}[2] / ${songsPlayed[0][2]}[1]`)
        }, 1)
    }

    function toggleWindow(window) {

        if (window.isVisible()) {
            window.close();
        }
        else {
            window.open();
        }
    }

    function resetData() {

        rate = {
            opCorrect: 0,
            ops: 0,
            edCorrect: 0,
            eds: 0,
            inCorrect: 0,
            ins: 0
        };
    }

    function createRankedWindow() {

        rankedWindow = new AMQWindow({
            title: 'Ranked Stats',
            width: 300,
            height: 370,
            draggable: true,
            zIndex: 1000,
            id: 'rankedWindow'
        });

        rankedWindow.addPanel({
            width: 1.0,
            height: 180,
            id: 'rankedResults'
        });

        rankedWindow.addPanel({
            width: 1.0,
            height: 100,
            position: {
                x: 0,
                y: 180
            },
            id: 'diffTracker'
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
            $(`<div id='trackerContainer'></div>`)
            .append(
                $(
                    `<div id='trackerLeft'>
                        <p>Difficulties</p>
                        <p>10-25</p>
                        <p>25-45</p>
                        <p>45-60</p>
                        <p>60-100</p>
                    </div>`
                )
            )
            .append(
                $(
                    `<div id='trackerRight'>
                        <p>OP / ED / IN</p>
                        <p id='hard'>0</p>
                        <p id='med_hard'>0</p>
                        <p id='med_easy'>0</p>
                        <p id='easy'>0</p>
                    </div>`
                )
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

    function setup() {

        createRankedWindow();
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
        #trackerRight {
            padding-right: 5px;
            text-align: right;
            float: right;
            width: 50%;
        }
        #trackerLeft {
            padding-left: 5px;
            text-align: left;
            float: left;
            width: 50%;
        }
        #trackerRight > p {
            margin-bottom: 0;
        }
        #trackerLeft > p {
            margin-bottom: 0;
        }
    `);

    AMQ_addScriptData({
        name: 'AMQ Ranked Records',
        author: 'Terasuki',
        description: `
            <p>Tracks current ranked position information and song distribution, useful for Novice runs.</p>
            <p>Thanks to TheJoseph98 for providing window code.</p>
        `
    });
})();
