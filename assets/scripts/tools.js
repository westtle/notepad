let noteConfig = {
	fontSize: "",
	wordWrap: false
};

// HTML.
const toolButtons = [...document.querySelectorAll(".__tools ._tool")];
const [cutButton, copyButton, pasteButton, deleteButton, wrapButton, selectAllButton, zoomInButton, zoomOutButton, downloadButton] = toolButtons;

const deleteNoteButton = document.querySelector(".delete-note_");
const confirmDeleteButton = document.querySelector(".confirm-delete_");

// Delete note.
deleteNoteButton.addEventListener("click", () => {
	if (deleteNoteButton.dataset.showConfirm == "false") {
		deleteNoteButton.dataset.showConfirm = "true";
		confirmDeleteButton.tabIndex = 0;
	} else {
		deleteNoteButton.dataset.showConfirm = "false";
		confirmDeleteButton.tabIndex = -1;
	}
});

confirmDeleteButton.addEventListener("click", () => {
	const toDelete = document.querySelector("[data-open='true']");

	notes.forEach((note, index) => {
		if (note.id == toDelete.dataset.id) {
			if (document.querySelectorAll(".__tabs ._tab:not(._tab-tools)").length > 1) {
				notes.splice(index, 1);
				toDelete.remove();

				let previousNote = document.querySelectorAll(".__tabs ._tab:not(._tab-tools)")[index];
				if (previousNote == undefined) previousNote = document.querySelectorAll(".__tabs ._tab:not(._tab-tools)")[index - 1] || document.querySelectorAll(".__tabs ._tab:not(._tab-tools)")[0];

				previousNote.click();

				// Hide, disable tabindexing, and change focus for confirm button after delete.
				deleteNoteButton.dataset.showConfirm = "false";
				confirmDeleteButton.tabIndex = -1;
				deleteNoteButton.focus();

				toolMessage("Deleted...");
				saveNote();
			};
		};
	});
});

// Cut selected.
cutButton.addEventListener("click", () => {
	let start = noteBody.selectionStart;
	let end = noteBody.selectionEnd;

	// Only cut if a text is selected.
	if (start !== end) {
		navigator.clipboard.writeText(noteBody.value.substring(start, end));
		noteBody.value = noteBody.value.slice(0, start) + noteBody.value.slice(end);

		toolMessage("Cutted...");
		saveNote();
	};

	// Select textarea after it was cutted.
	noteBody.select();
	noteBody.setSelectionRange(start, start);
});

// Copy selected.
copyButton.addEventListener("click", () => {
	let start = noteBody.selectionStart;
	let end = noteBody.selectionEnd;

	// Only copy if a text is selected.
	if (start !== end) {
		navigator.clipboard.writeText(noteBody.value.substring(start, end));

		toolMessage("Copied...");
	};

	// Keep text highlight even after copied.
	noteBody.select();
	noteBody.setSelectionRange(start, end);
});

// Paste from clipboard.
pasteButton.addEventListener("click", () => {
	navigator.clipboard.readText().then((clipText) => {
		let start = noteBody.selectionStart;
		let end = noteBody.selectionEnd;

		noteBody.select();
		noteBody.setSelectionRange(start, end);

		// See if there is multiple letter selected or not (i forget what this does).
		if (start == end || start - end > -5) {
			noteBody.value = noteBody.value.slice(0, start) + clipText + noteBody.value.slice(end);
		} else {
			noteBody.value = noteBody.value.replace(noteBody.value.substring(start, end), clipText);
		};

		// Select at the end of pasted text after it was pasted.
		noteBody.select();
		noteBody.setSelectionRange(start + clipText.length, start + clipText.length);

		toolMessage("Pasted...");
		saveNote();
	});
});

// Delete selected.
deleteButton.addEventListener("click", () => {
	let start = noteBody.selectionStart;
	let end = noteBody.selectionEnd;

	// Don't delete if nothing is selected.
	if (start !== end) {
		noteBody.value = noteBody.value.slice(0, start) + noteBody.value.slice(end);
		
		toolMessage("Deleted...");
		saveNote();
	};

	noteBody.select();
	noteBody.setSelectionRange(start, start);
});

// Enable word wrap.
wrapButton.addEventListener("click", () => {
	if (noteBody.dataset.enableWrap == "false") {
		noteBody.dataset.enableWrap = "true";
		wrapButton.dataset.enableWrap = "true";

		noteConfig.wordWrap = true;
	} else {
		noteBody.dataset.enableWrap = "false";
		wrapButton.dataset.enableWrap = "false";

		noteConfig.wordWrap = false;
	};

	localStorage.setItem("Note Config", JSON.stringify(noteConfig));
});

// Select all.
selectAllButton.addEventListener("click", () => {
	noteBody.select();
	noteBody.setSelectionRange(0, 99999);

	toolMessage("Selected...");
});

// Zoom in.
zoomInButton.addEventListener("click", () => {
	let currentFontSize = parseFloat(getComputedStyle(noteBody).fontSize.replace("px", ""));
	let remValue = currentFontSize / getDefaultFontSize();

	if (remValue >= 1.869) return;

	noteBody.style.fontSize = `calc(${remValue}rem + 0.1rem)`;

	noteConfig.fontSize = remValue + 0.1;
	localStorage.setItem("Note Config", JSON.stringify(noteConfig));
});

// Zoom out.
zoomOutButton.addEventListener("click", () => {
	let currentFontSize = parseFloat(getComputedStyle(noteBody).fontSize.replace("px", ""));
	let remValue = currentFontSize / getDefaultFontSize();
	
	if (remValue <= 0.469) return;
	
	noteBody.style.fontSize = `calc(${remValue}rem - 0.1rem)`;

	noteConfig.fontSize = remValue - 0.1;
	localStorage.setItem("Note Config", JSON.stringify(noteConfig));
});

// Download to local.
downloadButton.addEventListener("click", () => {
	let currentNote = document.querySelector("[data-open='true']");

	notes.forEach((note, index) => {
		if (note.id == currentNote.dataset.id) {
			let title = note.title;
			let text = note.content;

			let element = document.createElement('a');
			element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(text));
			element.setAttribute("download", title);

			element.style.display = "none";
			document.body.appendChild(element);

			element.click();

			document.body.removeChild(element);
		};
	});
});

function toolMessage(message) {
	document.querySelector(".action-message_").innerText = message;
	document.querySelector(".action-message_").style.opacity = 1;
	setTimeout(() => document.querySelector(".action-message_").style.opacity = 0, 250);
};

// Not my code.
const getDefaultFontSize = () => {
    const element = document.createElement('div');
    element.style.width = '1rem';
    element.style.display = 'none';
    document.body.append(element);

    const widthMatch = window
        .getComputedStyle(element)
        .getPropertyValue('width')
        .match(/\d+/);

    element.remove();

    if (!widthMatch || widthMatch.length < 1) {
        return null;
    }

    const result = Number(widthMatch[0]);
    return !isNaN(result) ? result : null;
};

// Debounce for oninput event only.
function debounce(func, delay = 250) {
    let timerId;
    return (...args) => {
        clearTimeout(timerId);
        timerId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}

const debouncedsaveNote = debounce(saveNote);
const debouncedtoolMessage = debounce(toolMessage);