chrome.tabs.onActivated.addListener((activeInfo) => {
    chrome.tabs.get(activeInfo.tabId, (tab) => {
        const url = tab.url;
        const currentTimeStamp = Date.now();
        const key = `tab_${activeInfo.tabId}`;

        chrome.storage.local.get([key], (result) =>{
            const previousData =  result[key];

            if(previousData){
                const lastTimeStamp  = previousData.timeStamp;
                const timeDifference = currentTimeStamp - lastTimeStamp;

                // Stale for 5 hrs (as time in ms)
                if(timeDifference > 5*60*60*1000){
                    console.log(`🕒 Stale Tab Detacted : ${url}`);
                }
            }
        })

        // Always update visit time
        saveTabVisit(activeInfo.tabId,url,currentTimeStamp);
    });
});

function saveTabVisit(tabId,url,timeStamp){
    const key = `tab_${tabId}`;
    const data = {url , timeStamp};

    chrome.storage.local.set({ [key] : data}, () =>{
        console.log(`Tab ${tabId} saved : `, data);
    });
}
