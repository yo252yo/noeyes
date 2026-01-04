* purchase influencers and chat proper flows and balance
* allow removal of streamers to alleviate softlock

* add a chat counter somewhere
* STREAMER LIST RN IS HARDCODED
* farm starts everyone in the corner maybe on firefox anyway
* vertical scroll messes with bounce. in general the boundaries are pretyt shit
* I think chat usernames can accidentally collide with the divs of the +1Att notifications, can you double check for sure, i saw some chat usernames just disappear



    <!-- <div id="chatters-list" style="margin-top: 20px; padding: 10px; border: 1px solid #ccc; background-color: #f9f9f9;">
    </div>

    <script>
        function updateChattersDisplay() {
            const chatters = getChatters();
            const chattersDiv = document.getElementById('chatters-list');
            if (chatters.length > 0) {
                chattersDiv.innerHTML = '<strong>Live Chatters:</strong><br>' + chatters.join(', ');
            } else {
                chattersDiv.innerHTML = '<em>No chatters yet...</em>';
            }
        }

        // Update chatters display immediately and then every 5 seconds
        updateChattersDisplay();
        setInterval(updateChattersDisplay, 5000);
    </script> -->



==================
should diary be paginated or big flow? should it appear character by character?
corporate sponsor modifiers ???
another lesson about before the fall explaining that they had class division based on money etc...
file:// protocol isnt supported =x
==================

* game.js has major polish problems. See if you can fix it by migrating the game to pixi.min.js (its in resource/pixi.min.js use this local copy of the famous library), could make it a fixed game space on top of the whole page.
right now the wall collision is very approximative, not to mention it doesnt deal well with vertical scrolling.
the click/touch reaction is a bit weird, sometimes it doesnt go through, idk if its because the zindex isnt high enough or maybe its registered as a drag not a touch ? id rather be lenient and count drags as click rather than miss click, as long as we dont double count. ofc im saying click but it also includes touch for mobile screens.
can you try and overhaul that a little? dont forget that you have access to web search and deepseek for support, as well as the ability to run the website on :8000 (the webserver is already launched). you have access to logs dont give me a buggy mess ok
make sure to keep the game behaviour and logic, it should be easy to understand tbh
    
==================
    
* sometimes clicks dont register i think mb because they conflict with drag? (lets pray for pixi solution)
* add login page (streamer choice) to initialize streamer list
* add bgm
* add sound effect
* add disclaimer/explanation about cognitive science
* post on itch with screenshots and descriptions

==================

* mb adjust speed for phone screens
* add OS start
* update IRC when getting new streamers

