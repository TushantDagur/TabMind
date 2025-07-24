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

                    // Stale for 1 min (for testing; increase for real use)
                    if (timeDifference > 1 * 60 * 1000) {
                        console.log(`🕒 Stale Tab Detected : ${url}`);

                        // ✅ Check if content script is injected/allowed
                        chrome.scripting.executeScript({
                            target: { tabId: activeInfo.tabId },
                            files: ['content.js']
                        }, () => {
                            if (chrome.runtime.lastError) {
                                console.warn("⚠️ Manual injection failed:", chrome.runtime.lastError.message);
                            } else {
                                chrome.tabs.sendMessage(activeInfo.tabId, {
                                    type: "STALE_TAB",
                                    url: url,
                                    lastVisit: lastTimeStamp
                                });
                            }
                        });
                    }
                }

                // ✅ Always update visit timestamp
                saveTabVisit(activeInfo.tabId, url, currentTimeStamp);
            });
        }
    });
});

function saveTabVisit(tabId, url, timeStamp) {
    const key = `tab_${tabId}`;
    const data = { url, timeStamp };

    chrome.storage.local.set({ [key]: data }, () => {
        console.log(`💾 Tab ${tabId} saved : `, data);
    });
}
