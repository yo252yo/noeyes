
================== THINKING
should diary be paginated or big flow? should it appear character by character?
corporate sponsor modifiers ???
another lesson about before the fall explaining that they had class division based on money etc...
file:// protocol isnt supported =x
================== GAME ENGINE

* game.js has major polish problems. See if you can fix it by migrating the game to pixi.min.js (its in resource/pixi.min.js use this local copy of the famous library but its the same as the public code), could make it a fixed game space on top of the whole page if the clicks can still go through to some html elements below. pixi is a major well documented framework
right now the wall collision is very approximative, not to mention it doesnt deal well with vertical scrolling.
the click/touch reaction is a bit weird, sometimes it doesnt go through, idk if its because the zindex isnt high enough or maybe its registered as a drag not a touch ? id rather be lenient and count drags as click rather than miss click, as long as we dont double count. ofc im saying click but it also includes touch for mobile screens.
can you try and overhaul that a little? dont forget that you have access to web search and deepseek for support, as well as the ability to run the website on :8000 (the webserver is already launched). you have access to logs dont give me a buggy mess ok
you can look at /mnt/ddboi/work/which/ for inspiration in my last project i used that and tried to make it clean
make sure to keep the game behaviour and logic, it should be easy to understand tbh. take your time be thourough do your best work write great code carefully! I believe in you.
TLDR: port game.js to the pixi engine in the best possible way!
Don't forget to include the pixi library where you use it :)
dont come back to me until it's in working condition, observe your own web browser on :8000 with yout mcp for testing i want something that runs and spawns targets on 1_5.html, farm.html and hive.html
    

* make sure that the +/-Att popups and the COLAB/INTERACTION notifications are all well handled in the same place, and most importantly make sure that they do not extend the canvas or webpage i dont want them to cause scrolling i want them to be hidden silently when they go over the boundaries

* sometimes new elements of the game make it so that the boundaries of the page are extended and i can scroll right for instance. i dont want that make sure that all overflow from the pixi canvas is hidden. reminder that the game affects 1_A 2_A 3_A farm and hive, and that i absolutely need the scrollbars on all the time

* sometimes i see the actual avatar portrait disconnect from its hitbox it remains static and the hitbox keeps moving please fix this

* sometimes clicking counts as double click, mostly on username, can you make it so that clicks are only counted once? if needed you can add for each target a timestamp of when they last received a click and only accept a click if its further than 500ms for instance

* Sometimes targets, mostly usernames, seem to change direction arbitrarily i think mb they collide with notification divs or something can you make sure 


* the default avatar resource is failing


* accentuate chat/streamer ratio, in particular make influencers consume more att and make chat smaller and cheaper


* add farmbot feature (class and feature day 6), Ending I shows you your stats if they're machine enough, ending c could show you the list of chats who died 

* add login page (streamer choice) to initialize streamer list, right now its hardcoded

* i got the same color for hive and farm by default

* add disclaimer/explanation about cognitive science

* achivevements for certification every day

* farm should display the current number of influencers

* Make sure that names of dead schater can appear twice 


================== LONG TERM
* proofread/edit text with grok or chatgpt
* mb adjust speed for phone screens
* add OS start
* update IRC when getting new streamers
* neurosama narration
* iterate on title screen
* rewrite ending.html blurb
* better BGM ???
