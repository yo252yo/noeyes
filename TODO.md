
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
    


* I think chat usernames can accidentally collide with the divs of the +1Att notifications, can you double check for sure, i saw some chat usernames just disappear
* vertical scroll messes with bounce. in general the boundaries are pretyt shit
* sometimes clicks dont register i think mb because they conflict with drag? (lets pray for pixi solution)


==================




ok sometimes the avatar stops moving and its -1Att appears in a random location im confused



can you maybe rework the wall collistion? sometimes things go through the walls, especially the usernames, id love for the collision to be more precise, and to not make the parent have extra scrollbars



add the sfx for games
play_value_sfx on colab and emoji 
play_click_sfx on click on username
play_problem_sfx on overlap of usernames (with '💣interaction💣' notification)


================== v1
* accentuate chat/streamer ratio, in particular make influencers consume more att and make chat smaller and cheaper
* new game engine
* add farmbot feature (class and feature day 6)
* add login page (streamer choice) to initialize streamer list, right now its hardcoded
* i got the same color for hive and farm by default
* add disclaimer/explanation about cognitive science
* achivevements for certification every day
* farm should display the current number of influencers


================== LONG TERM
* proofread/edit text with grok or chatgpt
* mb adjust speed for phone screens
* add OS start
* update IRC when getting new streamers
* neurosama narration
* iterate on title screen
* rewrite ending.html blurb
* better BGM ???
