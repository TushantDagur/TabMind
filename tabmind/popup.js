document.addEventListener("DOMContentLoaded", () => {
    chrome.storage.local.get(null, (items) => {
        const tbody = document.getElementById("notesBody");
        const noNotes = document.getElementById("noNotesMessage");

        const entries = Object.entries(items).filter(([key, value]) =>
            typeof value === "object" && value.note
        );

        if (entries.length === 0) {
            noNotes.style.display = "block";
            return;
        }

        for (const [url, data] of entries) {
            const row = document.createElement("tr");

            const urlCell = document.createElement("td");
            const link = document.createElement("a");
            link.href = url;
            link.innerText = url.length > 50 ? url.slice(0, 47) + "..." : url;
            link.style.cursor = "pointer";
            link.onclick = () => {
                chrome.runtime.sendMessage({ type: "FOCUS_TAB", tabId: data.tabId });
            };
            urlCell.appendChild(link);

            const noteCell = document.createElement("td");
            noteCell.innerText = data.note;

            const dltCell = document.createElement("td");
            const dltButton = document.createElement("button");
            dltButton.innerText = "Delete";
            dltButton.style.cssText = `
            background-color: #dc3545;
            color: white;
            border: none;
            padding: 6px 12px;
            border-radius: 4px;
            cursor: pointer;
        `;
            
            dltButton.onclick = () => {
                if (confirm("Are you sure you want to delete this note?")){
                    chrome.storage.local.remove(url, () => {
                        row.remove();
                    });
                }
            };
            dltCell.appendChild(dltButton);

            row.appendChild(urlCell);
            row.appendChild(noteCell);
            row.appendChild(dltCell);
            tbody.appendChild(row);
        }

        // Add search filter
        document.getElementById("searchInput").addEventListener("input", function () {
            const query = this.value.toLowerCase();
            const rows = document.querySelectorAll("#notesTable tbody tr");

            rows.forEach(row => {
                const url = row.cells[0]?.innerText.toLowerCase();
                const note = row.cells[1]?.innerText.toLowerCase();

                if (url.includes(query) || note.includes(query)) {
                    row.style.display = "";
                } else {
                    row.style.display = "none";
                }
            });
        });

        // clear all notes
        document.getElementById("clearAllBtn").addEventListener("click", () => {
            if (confirm("Are you sure you want to delete all notes?")){
                chrome.storage.local.clear(() => {
                    location.reload(); //refresh popup to reflet cleared state
                });
            }
        });
    });
});
