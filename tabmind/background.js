chrome.tabs.onActivated.addListener((activeInfo) => {
    chrome.tabs.get(activeInfo.tabId, (tab) => {
        const url = tab.url;
        const timeStamp = Date.now();

        saveTabVisit(activeInfo.tabId,url,timeStamp);
    });
});

function saveTabVisit(tabId,url,timeStamp){
    const key = `tab_${tabId}`;
    const data = {url , timeStamp};

    chrome.storage.local.set({ [key] : data}, () =>{
        console.log(`Tab ${tabId} saved : `, data);
    });
}
