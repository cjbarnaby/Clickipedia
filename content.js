// The JS in this file is invoked by the getPageDetails function in event.js, which is called on doc.ready. It is injected into the DOM of the active Chrome tab by event.js, and will send a response (.sendMessage) back to event.js, which is listening for that response.

chrome.runtime.sendMessage({
    'selection': window.getSelection().toString()
});
