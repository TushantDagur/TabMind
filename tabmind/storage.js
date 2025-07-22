// function saveTabVisit(tabId, url, timeStamp) {
//     const key = 'tab_${tabId}';
//     const data = { url, timeStamp };

//     chrome.storage.local.set({ [key]: data }, () => {
//         console.log('Tab ${tabId} saved : ', data);
//     });
// }

function getTabVisit(tabId, callback) {
    const key = 'tab_${tabId}';
    chrome.storage.local.get([key], (result) => {
        callback(result[key]);
    });
}