// ==UserScript==
// @name         AMQ Instance Practice
// @namespace    https://github.com/Terasuki
// @version      0.4
// @description  Records scores.
// @author       Terasuki
// @match        https://animemusicquiz.com/*
// @require      https://raw.githubusercontent.com/TheJoseph98/AMQ-Scripts/master/common/amqWindows.js
// @require      https://raw.githubusercontent.com/TheJoseph98/AMQ-Scripts/master/common/amqScriptInfo.js
// @grant        none
// ==/UserScript==

(() => {

    let results;
    let active = false;
    let loaded = false;
    let settingId = '';
    let saves;

    let statsWindow;

    // Do not load on start page.
    if (document.getElementById("startPage")) return;

    // Wait for game to start before starting script.
    let loadInterval = setInterval(() => {
        if (document.getElementById("loadingScreen").classList.contains("hidden")) {
            setup();
            clearInterval(loadInterval);
        }
    }, 500);

    // Initialise on game start.
    new Listener("Game Starting", initialise).bindListener();

    // Chat commands.
    new Listener("game chat update", (payload) => {
        payload.messages.forEach((message) => {

            if (message.sender !== selfName) return;
            
            // Toggle script.
            if (message.message.startsWith('.t ')) {

                if (!(message.message.length >= 4)) return;

                settingId = message.message.substring(3);
                active = true;
                gameChat.systemMessage('Results recording is now ON using instance ' + settingId + '.');
                gameChat.systemMessage('This will only apply after starting next round.');
            }

            // Print current scores.
            if (message.message.startsWith('.c') && loaded) {
                gameChat.systemMessage('Current stats of instance ' + settingId + '.');
                gameChat.systemMessage('Correct: ' + results.correct);
                gameChat.systemMessage('Missed: ' + results.missed);
            }

            // Stops the script.
            if (message.message.startsWith('.p')) {

                gameChat.systemMessage('Scipt has been turned OFF.');
                stopScript();
            }

            // Deletes an instance.
            if (message.message.startsWith('.r ')) {

                if (!(message.message.length >= 4)) return;
                const removal = message.message.substring(3);

                localStorage.removeItem(removal);

                gameChat.systemMessage('Instance ' + removal + ' has been deleted (if it existed).');

                // Remove from save if it was saved.
                if (!(saves.includes(removal))) return;

                saves = saves.filter((save) => save !== removal);
            }

            // Opens the stats window.
            if (message.message.startsWith('.w')) {
                toggleStatsWindow();
            }

            // Prints all saved instances.
            if (message.message.startsWith('.i')) {

                if (!saves.length) {
                    gameChat.systemMessage('No saved instances found.');
                    return;
                }
                gameChat.systemMessage('Current saved instances:');
                gameChat.systemMessage(saves.toString());
            }

            // Saves an instance.
            if (message.message.startsWith('.s ')) {

                if (!(message.message.length >= 4)) return;

                const save = message.message.substring(3);
                saveInstance(save);
            }
        });
    }).bindListener();

    // Count results.
    new Listener("answer results", (result) => {
        
        if (!loaded) return;

        if (result.players[0].correct) {
            results.correct++;
        }
        else {
            results.missed++;
        }

        updateResults();
        
    }).bindListener();

    function initialise() {
        
        if (!active) return;

        // Load previous results.
        loadResults();
    }

    function loadResults() {

        let loadedResults = localStorage.getItem(settingId);
        
        if (!loadedResults) {
            // Creates new instance if it doesn't exists.
            results = {
                correct: 0,
                missed: 0,
                id: settingId,
                isSetting: true
            };
        }
        else {
            try {
                results = JSON.parse(loadedResults);
                if (!results.isSetting) {
                    throw new Error('Not a setting');
                }
            } catch (error) {
                gameChat.systemMessage('Invalid key, most likely used by another script. Please use another name for the instance.');
                active = false;
                loaded = false;
                return;
            }
        }
        loaded = true;
    }

    function saveResults() {
        localStorage.setItem(settingId, JSON.stringify(results));
    }

    function updateResults() {

        if (!loaded) return;

        saveResults();

        let guessRate = ((results.correct / (results.missed + results.correct)) * 100).toFixed(2);
        $("#statsInstance").text(settingId);
        $("#statsCorrect").text(results.correct);
        $("#statsMissed").text(results.missed);
        $("#statsGuessRate").text(guessRate);
    }

    function stopScript() {

        $("#statsInstance").text('No selected instance');
        $("#statsCorrect").text(0);
        $("#statsMissed").text(0);
        $("#statsGuessRate").text(0);
        
        active = false;
        loaded = false;
    }

    function toggleStatsWindow() {
        if (statsWindow.isVisible()) {
            statsWindow.close();
        }
        else {
            statsWindow.open();
        }
    }

    function loadSaves() {

        let loadedSaves = localStorage.getItem('instancesSaves');

        if(!loadedSaves) {
            // Creates new saves array if one doesn't exist
            saves = [];
            return;
        }

        saves = JSON.parse(loadedSaves);
    }

    function saveInstance(instance) {

        const save = instance.toString();

        // Do not save if not an instance or already saved.
        if (!(localStorage.getItem(save))) return;
        if (saves.includes(save)) return;

        saves.push(save);
        localStorage.setItem('instancesSaves', JSON.stringify(saves));
    }

    function createStatsWindow() {

        statsWindow = new AMQWindow({
            title: 'Stats',
            width: 300,
            height: 500,
            draggable: true,
            zIndex: 1000,
            id: 'statsWindow'
        });

        statsWindow.addPanel({
            width: 1.0,
            height: 200,
            id: 'resultsPanel'
        });

        statsWindow.addPanel({
            width: 1.0,
            height: 50,
            position: {
                x: 0,
                y: 200
            },
            id: 'controlPanel'
        });

        statsWindow.addPanel({
            width: 1.0,
            height: 100,
            position: {
                x: 0,
                y: 250
            },
            id: 'inputPanel'
        });

        statsWindow.panels[0].panel.append(
            $(`<div id="resultsPanelContainer"></div>`)
            .append(
                $(
                    `<div id="resultsPanelLeft">
                        <p>Current instance</p>
                        <p>Correct</p>
                        <p>Missed</p>
                        <p>Guess rate (%)</p>
                    </div>`
                )
            )
            .append(
                $(
                    `<div id="resultsPanelRight">
                        <p id="statsInstance">No selected instance</p>
                        <p id="statsCorrect">0</p>
                        <p id="statsMissed">0</p>
                        <p id="statsGuessRate">0</p>
                    </div>`
                )
            )
        );

        statsWindow.panels[1].panel.append(
            $(`<div id="controlPanelContainer"></div>`)
            .append(
                $(`<button id="controlStop" class="btn btn-default">Stop</button>`).click(() => {
                    stopScript();
                    gameChat.systemMessage('Stopping results recording.');
                })
            )
        );

        statsWindow.panels[2].panel.append(
            $(`<div id="inputPanelContainer"></div>`)
            .append(
                $(`<input type="text" id="inputInstance" placeholder="Enter instance...">`)
            )
            .append(
                $(`<button id="inputEnter" class="btn btn-primary">Select</button>`).click(() => {
                    settingId = $("#inputInstance").val();

                    if (!settingId) return;

                    active = true;
                    gameChat.systemMessage('Results recording is now ON using instance ' + settingId + '.');
                    gameChat.systemMessage('This will only apply after starting next round.');
                })
            )
            .append(
                $(`<button id="inputSave" class="btn btn-default">Save</button>`).click(() => {
                    const save = $("#inputInstance").val();

                    if (!save) return;

                    saveInstance(save);

                })
            )
            .append(
                $(`<button id="inputClear" class="btn btn-default">Clear</button>`).click(() => {
                    $("#inputInstance").val('');
                })
            )
        );

        let oldWidth = $("#qpOptionContainer").width();
        $("#qpOptionContainer").width(oldWidth + 35);
        $("#qpOptionContainer > div")
            .append($(`<div id="qpStatsTracker" class="clickAble qpOption"><i aria-hidden="true" class="fa fa-music qpMenuItem"></i></div>`)
                .click(() => {
                    toggleStatsWindow();
                })
                .popover({
                    content: "Instance Stats",
                    trigger: "hover",
                    placement: "bottom"
                })
            );
    }

    function setup() {

        createStatsWindow();
        loadSaves();

    }
    
    AMQ_addStyle(`
        #qpStatsTracker {
            width: 30px;
            margin-right: 5px;
        }
        #resultsPanelRight {
            padding-right: 5px;
            text-align: right;
            float: right;
            width: 50%;
        }
        #resultsPanelLeft {
            padding-left: 5px;
            text-align: left;
            float: left;
            width: 50%;
        }
        #controlPanel {
            text-align: center;     
        }
        #controlPanelContainer > button {
            width: 70px;
        }
        #inputInstance {
            text-overflow: ellipsis;
            color: black;
        }
    `);

    AMQ_addScriptData({
        name: "Guess rate tracker",
        author: "Terasuki",
        description: `
            <p>Track your stats across custom set instances. Useful for practice.</p>
            <p>Thanks to TheJoseph98 for providing window code.</p>
        `
    });
    
})();
