// This is the interface between popup.html and the DOM of the active Chrome tab.
// When the getDetails function is called, it will inject the content.js content script into the DOM of the active Chrome tab and execute that Javascript. It then sets up a listener to listen for the 'onMessage' event that will be triggered by content.js

// This function is called on doc.ready from popup.js. The callback passed in is the 'onPageDetailsRecieved' function in popup.js
function getPageDetails(callback) {
    // Inject the content.js script (a content script to get current selection) into the current page
    chrome.tabs.executeScript(null, { file: 'content.js' });
    // Perform the callback when a message is received from the content script
    chrome.runtime.onMessage.addListener(function(message)  {
        // Call the callback function
        callback(message);
    });
}

// 
// // CONTEXT MENU CODE:
// function onClickHandler(callback) {
//   chrome.tabs.executeScript(null, { file: 'content.js' });
//
//   // Perform the callback when a message is received from the content script
//   chrome.runtime.onMessage.addListener(function(message)  {
//       // Call the callback function
//       callback(message);
//   });
// }
//
// // chrome.contextMenus.onClicked.addListener(onClickHandler);
//
// chrome.runtime.onInstalled.addListener(function() {
//   chrome.contextMenus.create({"title": "Clickipedia", "contexts": ["selection"], "id": "getClickipedia"});
// });
