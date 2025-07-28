chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "STALE_TAB") {
        const minutesAgo = Math.floor((Date.now() - message.lastVisit) / (1000 * 60));

        const existing = document.getElementById("tabmind-reminder");
        if (existing) existing.remove();

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

        const messageText = document.createElement('div');
        messageText.innerText = `⏳ You last visited this tab ${minutesAgo} minute(s) ago.`;
        reminder.appendChild(messageText);

        const closeButton = document.createElement("span");
        closeButton.innerText = "❌";
        closeButton.title = "Close";
        closeButton.style.cssText = `
            position: fixed;
            top: 10px;
            right: 14px;
            cursor: pointer;
            color: #bbb;
        `;
        closeButton.onclick = () => reminder.remove();
        reminder.appendChild(closeButton);

        const noteButton = document.createElement('button');
        noteButton.innerText = "📝 Add Note";
        noteButton.style.cssText = `
            display : block;
            margin : auto;
            margin-top: 10px;
            background-color: #007BFF;
            color: white;
            border: none;
            padding: 6px 12px;
            border-radius: 4px;
            cursor: pointer;
        `;
        reminder.appendChild(noteButton);

        document.body.appendChild(reminder);

        noteButton.addEventListener("click", () => {
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

            // —— Pre-fill existing note —— 
            const tabUrl = window.location.href;
            chrome.storage.local.get([tabUrl], (res) => {
                const entry = res[tabUrl];
                if (entry && entry.note) {
                    noteInput.value = entry.note;
                }
            });

            saveButton.addEventListener("click", () => {
                const note = noteInput.value.trim();
                if (note) {
                    chrome.runtime.sendMessage({ type: "SAVE_NOTE", note }, (response) => {
                        if (response?.status === "success") {
                            saveButton.innerText = "✅ Saved!";
                            setTimeout(() => reminder.remove(), 1500);
                        } else {
                            saveButton.innerText = "❌ Failed!";
                        }
                    });
                }
            });
        });

        setTimeout(() => {
            if (!document.getElementById("tabmind-note-input")) {
                reminder.remove();
            }
        }, 7000);

        sendResponse({ status: "received" });
        return true;
    }
});
