chrome.tabs.onActivated.addListener((activeInfo) => {
    chrome.tabs.get(activeInfo.tabId, (tab) => {
        if (tab.status === 'complete' && tab.url.startsWith('http')) {
            const url = tab.url;
            const currentTimeStamp = Date.now();
            const key = `tab_${activeInfo.tabId}`;

            chrome.storage.local.get([key], (result) => {
                const previousData = result[key];
                if (previousData) {
                    const lastTimeStamp = previousData.timeStamp;
                    const timeDifference = currentTimeStamp - lastTimeStamp;
                    if (timeDifference > 4 * 60 * 60 * 1000) {    //4 hrs in ms
                        chrome.scripting.executeScript({
                            target: { tabId: activeInfo.tabId },
                            files: ['content.js']
                        }, () => {
                            if (!chrome.runtime.lastError) {
                                chrome.tabs.sendMessage(activeInfo.tabId, {
                                    type: "STALE_TAB",
                                    url: url,
                                    lastVisit: lastTimeStamp
                                });
                            }
                        });
                    }
                }
                saveTabVisit(activeInfo.tabId, url, currentTimeStamp);
            });
        }
    });
});

function saveTabVisit(tabId, url, timeStamp) {
    const key = `tab_${tabId}`;
    chrome.storage.local.set({ [key]: { url, timeStamp } });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "SAVE_NOTE" && sender.tab) {
        const url = sender.tab.url;
        const tabId = sender.tab.id;
        chrome.storage.local.set({
            [url]: { note: message.note, tabId: tabId }
        }, () => {
            sendResponse({ status: "success" });
        });
        return true; // keep sendResponse alive
    }

    if (message.type === "FOCUS_TAB") {
        chrome.tabs.update(message.tabId, { active: true });
        chrome.windows.update(message.windowId || chrome.windows.WINDOW_ID_CURRENT, { focused: true });
    }
});
