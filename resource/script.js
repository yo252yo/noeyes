console.log('script');

// Listen for postMessage from parent iframes
window.addEventListener('message', (event) => {
    if (event.data.type === 'chatters') {
        if (window.location.pathname.includes('diary.html')) {
            // // Display chatters in diary.html
            // let chatterDiv = document.getElementById('chatters-list');
            // if (!chatterDiv) {
            //     chatterDiv = document.createElement('div');
            //     chatterDiv.id = 'chatters-list';
            //     document.body.appendChild(chatterDiv);
            // }
            // const list = event.data.data.join(', ');
            // chatterDiv.innerHTML = '<br><br>Chatters: ' + list;
        } else {
            // Forward to child iframes
            const iframes = document.querySelectorAll('iframe');
            iframes.forEach(iframe => {
                if (iframe.contentWindow) {
                    iframe.contentWindow.postMessage(event.data, '*');
                }
            });
        }
    }
});
