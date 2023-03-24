let notes = [{
		title: "Welcome!",
		content: "This is basically just https://westtle.github.io/simple-note/, but with more features. You can now add more notes and remove them if you want to.\n\nThere are also some tools that you can use below. For example, you can paste from your clipboard, copy, cut, delete, and enable word wrapping.",
		id: 0,
		lastOpened: true
}];

// HTML.
const newTabButton = document.querySelector(".new-note_");
const noteTitleInput = document.querySelector("._title input");
const noteBody = document.querySelector("._body textarea");

function addTab() {

	// Create note & append to HTML.
	const newTab = document.createElement("button");
	newTab.classList.add("_tab");
	newTab.title = "New Note"
	newTab.innerText = "New Note";
	newTab.setAttribute("data-id", +new Date());
	newTab.setAttribute("data-open", "true");
	newTab.addEventListener("click", openTab);

	document.querySelector(".__tabs").insertBefore(newTab, newTabButton);

	// Add a new note object.
	const newNote = {
		title: "New Note",
		content: "",
		id: newTab.dataset.id,
		lastOpened: true
	};

	notes.push(newNote);

	// Open the new tab when created & save it to local storage.
	newTab.click();
	saveNote();

	noteTitleInput.select();
};

function openTab() {
	const tabs = document.querySelectorAll(".__tabs ._tab:not(._tab-tools)");
	const currentNote = notes.find(note => note.id == this.dataset.id);

	// Change data-open attribute to "false" for all note, except the current one to "true".
	tabs.forEach(tab => tab.dataset.open = "false");
	this.dataset.open = "true";

	// Update the notes object.
	notes.forEach(note => note.lastOpened = false);
	currentNote.lastOpened = true;

	// Change note title & textarea in DOM.
	noteTitleInput.value = currentNote.title;
	noteBody.value = currentNote.content;

	saveNote();
};

function saveNote() {
	let currentNote = document.querySelector("[data-open='true']");

	notes.find(note => {
		if (note.id == currentNote.dataset.id) {

			// Update the notes object.
			note.title = noteTitleInput.value;
			note.content = noteBody.value;

			// Update title attribute in DOM.
			currentNote.title = note.title;

			// If title input is empty then name the tab & title in notes object "Unnamed".
			if (noteTitleInput.value == "") {
				note.title = "Unnamed";
				currentNote.textContent = "Unnamed";
				currentNote.title = "Unnamed";
			} else {
				currentNote.textContent = note.title;
			};
		
			// Save to Local Storage.
			localStorage.setItem("Notes", JSON.stringify(notes));
		};
	});
};

function loadNotes() {
	const notesFromStorage = JSON.parse(localStorage.getItem("Notes"));
	notes = notesFromStorage || notes;
	
	const noteConfigFromStorage = JSON.parse(localStorage.getItem("Note Config"));
	noteConfig = noteConfigFromStorage || noteConfig;

	noteBody.style.fontSize = noteConfig.fontSize + "rem";
	noteBody.dataset.enableWrap = noteConfig.wordWrap;
	wrapButton.dataset.enableWrap = noteConfig.wordWrap;

	notes.forEach(note => {
		const newTab = document.createElement("button");
		newTab.classList.add("_tab");
		newTab.title = `${note.title}`;
		newTab.innerText = `${note.title}`;
		newTab.setAttribute("data-id", `${note.id}`);
		newTab.setAttribute("data-open", `${note.lastOpened}`);
		newTab.addEventListener("click", openTab);

		document.querySelector(".__tabs").insertBefore(newTab, newTabButton);
	});

	// Open the last selected tab.
	document.querySelector("[data-open='true']").click();
};

newTabButton.addEventListener("click", addTab);
noteTitleInput.addEventListener("input", () => {
	debouncedsaveNote();
	debouncedtoolMessage("Saved...");
});
noteBody.addEventListener("input", () => {
	debouncedsaveNote();
	debouncedtoolMessage("Saved...");
});

document.addEventListener("DOMContentLoaded", () => loadNotes());