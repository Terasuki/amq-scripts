# AMQ Scripts
Tampermonkey scripts for [AMQ](https://animemusicquiz.com/). I made the scripts here to help me automate statistic recording I did manually; expect bad coding/practices as I never coded an app nor used JavaScript/HTML/CSS before, thanks to other userscripts for helping me. Feedback appreciated.

Use them at your own risk. You can contact me thorugh Discord (terasuki) or through AMQ's website itself (TrueXC).

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

This script tracks some statistics about your current performance, this is aimed to be more useful in Ranked, though by default works in all rooms. It tracks:
- Guess rates by song type.
- Your current top percent in the room.
- The points needed to reach certain milestones in the room (Top 50%, 20%, 5%, and top 3 overall).
- Song distribution by difficulty and type. This is aimed towards Novice ranked, with the total amount per type/difficulty marked in brackets.
