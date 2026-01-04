* on itch only? next button is broken on firefox and calendar icon. and i had concurrency issues
* purchase influencers and chat proper flows and balance
* allow removal of streamers to alleviate softlock
* protect chatters from spawning in the same place
* update IRC when getting new streamers
* add a chat counter somewhere
* STREAMER LIST RN IS HARDCODED
* farm starts everyone in the corner maybe on firefox anyway
* vertical scroll messes with bounce. in general the boundaries are pretyt shit
* i dont understand but when im hiding and reopening the iframed farm and hive, everything spawns in the top left corner, wtf
* file:// protocol isnt supported =x
* game.js has major polish problems. See if you can fix it by migrating the game to pixi.min.js, could make it a fixed game space on top of the whole thing.
the wall collision is very approximative, not to mention it doesnt deal well with vertical scrolling.
the click/touch reaction is a bit weird, sometimes it doesnt go through, idk if its because the zindex isnt high enough or maybe its registered as a drag not a touch ? id rather be lenient and count drags as click rather than miss click, as long as we dont double count. ofc im saying click but it also includes touch for mobile screens.
can you try and overhaul that a little? dont forget that you have access to web search and deepseek for support, as well as the ability to run the website on :8000 (the webserver is already launched
make sure to keep the game behaviour and logic only work on the polish

* ok so for itch.io i have to bundle the app in a zip and send them, ive done that, they serve it on their side, and it says:

Loading module from “https://html-classic.itch.zone/html/16038256/resource/twitch.js” was blocked because of a disallowed MIME type (“application/xml”).

Loading module from “https://html-classic.itch.zone/html/16038256/resource/game.js” was blocked because of a disallowed MIME type (“application/xml”).

try to look for options, feel free to use web search or deepseek, mb its as simple as specifying file type in the script html tags...



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
==================

    
    
* sometimes clicks dont register i think mb because they conflict with drag?
* add login page (streamer choice) to initialize streamer list
* add bgm
* add sound effect
* add disclaimer/explanation about cognitive science
* add OS start
* post on itch with screenshots and descriptions
* mb adjust speed for phone screens
