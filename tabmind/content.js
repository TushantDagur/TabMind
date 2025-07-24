console.log("✅ TabMind content script injected and running.");

// Listen for messages from background.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "STALE_TAB") {
        console.log("📌 Reminder from TabMind: ", message);

        const minutesAgo = Math.floor((Date.now() - message.lastVisit) / (1000 * 60));

        // Remove any existing popup to prevent overlap
        const existing = document.getElementById("tabmind-reminder");
        if(existing)    existing.remove();

        // Main container for the reminder popup
        const reminder = document.createElement('div');
        reminder.id = "tabmind-reminder";
        reminder.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: #222;
            color: white;
            padding: 16px;
            border-radius: 8px;
            font-size: 14px;
            z-index: 99999;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
            max-width: 300px;
        `;

        // Text message
        const messageText = document.createElement('div');
        messageText.innerText = `⏳ You last visited this tab ${minutesAgo} minute(s) ago.`;
        reminder.appendChild(messageText);

        // Close Button
        const closeButton = document.createElement("span");
        closeButton.innerText = "❌"
        closeButton.title = "Close";
        closeButton.style.cssText = `
            position: fixed;
            top: 10px;
            right: 14px;
            cursor: pointer;
            color: #bbb;
        `;
        closeButton.onclick = ()=> reminder.remove();
        reminder.appendChild(closeButton);

        // Add Note button
        const noteButton = document.createElement('button');
        noteButton.innerText = "📝 Add Note";
        noteButton.style.cssText = `
            margin: auto;
            display : block;
            // background-color: #007BFF;
            // color: white;
            border: none;
            padding: 6px 12px;
            border-radius: 4px;
            cursor: pointer;
        `;
        reminder.appendChild(noteButton);

        // Add the reminder box to the page
        document.body.appendChild(reminder);

        // Handle note button click
        noteButton.addEventListener("click", () => {
            // Prevent duplicate input
            if (document.getElementById("tabmind-note-input")) return;

            const noteInput = document.createElement("textarea");
            noteInput.id = "tabmind-note-input";
            noteInput.placeholder = "Write your note here...";
            noteInput.style.cssText = `
                display: block;
                margin-top: 8px;
                width: 100%;
                height: 60px;
                font-size: 14px;
                color: black;
            `;

            // Fetch and pre-fill existing note for this tab URL
            const url = window.location.href;
            chrome.storage.local.get(url, (data) => {
                if (data[url]) {
                    noteInput.value = data[url];
                }
            });


            const saveButton = document.createElement("button");
            saveButton.innerText = "💾 Save";
            saveButton.style.cssText = `
                display: block;
                margin: auto;
                margin-top: 10px;
                background-color: #28a745;
                color: white;
                border: none;
                padding: 6px 12px;
                border-radius: 4px;
                cursor: pointer;
            `;

            reminder.appendChild(noteInput);
            reminder.appendChild(saveButton);

            saveButton.addEventListener("click", () => {
                const note = noteInput.value.trim();
                if (note) {
                    console.log("📝 Saved Note:", note);
                    saveButton.innerText = "✅ Saved!";

                    const url = window.location.href;
                    chrome.storage.local.set({[url] : note}, () => {
                        console.log("🧠 Note saved for URL:", url);
                    });

                    setTimeout(() => {
                        reminder.remove();
                    }, 1500);
                }
            });
        });

        // Don't auto-remove if user is typing
        setTimeout(() => {
            if (!document.getElementById("tabmind-note-input")) {
                reminder.remove();
            }
        }, 7000);

        sendResponse({ status: "received" });
        return true;
    }
});
