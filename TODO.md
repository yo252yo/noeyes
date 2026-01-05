
actually i can do a roundup with chatgpt for style etc... i think everything is there but its messy
* have grok do a typo and orthograph/grammar check
* put the word smile in bold in the diary  
* write ending.html blurb
* i got the same color for hive and farm by default
* prevent select for the whole game
* add login page (streamer choice) to initialize streamer list, right now its hardcoded
* add bgm
* add sound effect
* remove X cross and mb add an option in menu to reset the game
* add disclaimer/explanation about cognitive science
* post on itch with screenshots and descriptions
* achivevements for certification every day
* add farmbot feature (class and feature day 6)

==================
should diary be paginated or big flow? should it appear character by character?
corporate sponsor modifiers ???
another lesson about before the fall explaining that they had class division based on money etc...
file:// protocol isnt supported =x
==================

* game.js has major polish problems. See if you can fix it by migrating the game to pixi.min.js (its in resource/pixi.min.js use this local copy of the famous library but its the same as the public code), could make it a fixed game space on top of the whole page if the clicks can still go through to some html elements below.
right now the wall collision is very approximative, not to mention it doesnt deal well with vertical scrolling.
the click/touch reaction is a bit weird, sometimes it doesnt go through, idk if its because the zindex isnt high enough or maybe its registered as a drag not a touch ? id rather be lenient and count drags as click rather than miss click, as long as we dont double count. ofc im saying click but it also includes touch for mobile screens.
can you try and overhaul that a little? dont forget that you have access to web search and deepseek for support, as well as the ability to run the website on :8000 (the webserver is already launched). you have access to logs dont give me a buggy mess ok
you can look at /mnt/ddboi/work/which/ for inspiration in my last project i used that
make sure to keep the game behaviour and logic, it should be easy to understand tbh. take your time be thourough do your best work write great code carefully! I believe in you.
TLDR: port game.js to the pixi engine in the best possible way!
Don't forget to include the pixi library where you use it :)
    


* I think chat usernames can accidentally collide with the divs of the +1Att notifications, can you double check for sure, i saw some chat usernames just disappear
* vertical scroll messes with bounce. in general the boundaries are pretyt shit
* sometimes clicks dont register i think mb because they conflict with drag? (lets pray for pixi solution)
==================


* mb adjust speed for phone screens
* add OS start
* update IRC when getting new streamers

* neurosama narration
