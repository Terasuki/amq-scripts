# AMQ Scripts
Tampermonkey scripts for [AMQ](https://animemusicquiz.com/). I made the scripts here to help me automate statistic recording I did manually; expect bad coding/practices as I never coded an app nor used JavaScript/HTML/CSS before, thanks to other userscripts for helping me. Feedback appreciated.

Use them at your own risk. You can contact me thorugh Discord (Terasuki#0655) or through AMQ's website itself (TrueXC).

## Instance Tracker 

Tracks your correct and missed guesses for the selected instance, saving them on localStorage. Also provides additional stats such as guess rate.

Basic functionality is provided via chat commands.

**.w**: opens the main menu.

**.t <instance>**: selects an instance or creates a new one if it does not exist.

**.c**: prints to chat loaded instance results.

**.p**: stops the script.

**.r <instance>**: deletes an instance if it does exist. Bug: needs page refresh to properly update.

**.s <instance>**: saves an instance. Bug: needs page refresh to properly update.

**.i**: prints out all saved instances.

## Ranked Records

Tracks your results from ranked and writes them in a spreadsheet. Also provides a window with some additional information.

[Click here to find the spreadsheet](https://docs.google.com/spreadsheets/d/1__fuLTrf1Aonf8sQ3yeyWWgBelWlQuPBJ5rBFFKM77g/edit?usp=sharing)

To use, simply join a (ranked) room, open the interface once the game starts and check 'Record current game'. This is required to send the results to the spreadsheet.

The script can be used outside of Ranked by commenting out the guard clauses.

If you want to run the script privately, you can find the script for the sheet [here](macros/ranked-sheet.gs) and the template for the sheets [here](https://docs.google.com/spreadsheets/d/1uMkyW8L-qEYOEVpyRV4g3A_nApwa7boo9NIwq9z9-98/edit?usp=sharing). Lastly, change the value of the constant `scriptLink` to your app deployment link.
