console.log("✅ TabMind content script injected and running.");
chrome.runtime.onMessage.addListener((message) => {
    if (message.type === "STALE_TAB") {
        console.log("📌 Reminder from TabMind: ", message);
    }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if(message.type == "STALE_TAB"){
        const hoursAgo = Math.floor((Date.now() - message.lastVisit) / (1000*60));

        const reminder = document.createElement('div');
        reminder.innerText = `⏳ You last visited this tab ${hoursAgo} minute(s) ago.`;
        reminder.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: #222;
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            font-size: 14px;
            z-index: 99999;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
        `;

        document.body.appendChild(reminder);
        setTimeout(()=> reminder.remove(), 7000);

        sendResponse({ status: "received" }); // ✅ this prevents the warning
        return true; // Needed if response is async
    }
});