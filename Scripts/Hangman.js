/**
 * @file Hangman scripts
 * @author Vera Konigin vera@groundedwren.com
 */
 
window.GW = window.GW || {};
(function Hangman(ns) {
	ns.Data;

	const ImageDatabase = {
		"Hangman": {
			LightPrefix: "./Img/Drawings/Hangman-Light",
			DarkPrefix: "./Img/Drawings/Hangman-Dark",
			Steps: 9,
			Alts: [
				"A singular horizontal line",
				"An empty gallows",
				"A smiling head inside a gallows",
				"A smiling head and torso inside a gallows",
				"A smiling head and torso with one arm inside a gallows",
				"A smiling head and torso with both arms inside a gallows",
				"A smiling head and torso with both arms and one leg inside a gallows",
				"A worried man inside a gallows",
				"A hung man",
			],
		},
	};
	
	ns.onNewGame = (event) => {
		event.preventDefault();

		ns.generateGameData(new FormData(event.target));
		ns.renderGame();
	};

	ns.onCustomChecked = (event) => {
		const form = document.getElementById("frmNew");
		const customWordEl = form.querySelector(`[name="customWord"]`);
		const wordLengthEl = form.querySelector(`[name="wordLength"]`);
		if(event.target.checked) {
			customWordEl.setAttribute("required", "true");
			customWordEl.closest(`label`).classList.remove("hidden");
			wordLengthEl.removeAttribute("required");
			wordLengthEl.closest(`label`).classList.add("hidden");
		}
		else {
			wordLengthEl.setAttribute("required", "true");
			wordLengthEl.closest(`label`).classList.remove("hidden");
			customWordEl.removeAttribute("required");
			customWordEl.closest(`label`).classList.add("hidden");
		}
	};

	ns.generateGameData = (formData) => {
		ns.Data = {
			Step: 1,
			MaxSteps: parseInt(formData.get("guessCount")) + 1 || 9,
			Word: formData.get("useCustom")
				? formData.get("customWord").toUpperCase()
				: pickWord(parseInt(formData.get("wordLength")) || 5),
			ImgSet: formData.get("imgSet") || "Hangman",
			Guesses: GW.Controls.KeyboardEl.Alphabet.reduce((accu, key) => {
				accu[key] = {
					Guessed: false,
					Matches: "?",
				};
				return accu;
			},  {}),
		};
	};

	function pickWord(wordLength) {
		const filteredWords = ns.Words.filter(word => word.length === wordLength);
		return filteredWords[Math.floor(Math.random()*filteredWords.length)];
	}

	ns.renderGame = function renderGame() {
		updateHangman();
		updateWord();

		ns.Data.Guesses = document.querySelector(`gw-keyboard`).bindData(ns.Data.Guesses);

		localStorage.setItem("data", JSON.stringify(ns.Data));
	}

	ns.onKeyClick = (event) => {
		if(ns.IsPaused) { return; }
		
		const numMatches = ns.Data.Word.split(event.detail).length - 1;
		ns.Data.Guesses[event.detail] = {Guessed: true, Matches: numMatches};
		if(!numMatches) {
			ns.Data.Step = Math.min(ns.Data.Step + 1, ns.Data.MaxSteps);
		}

		updateHangman();
		updateWord();

		if(!document.querySelector(`#figWord .char .sr-only`)) {
			GW.Controls.Toaster.showToast("You win! 🥳");
		}
		else if(ns.Data.Step === ns.Data.MaxSteps) {
			GW.Controls.Toaster.showToast("Hangman! 💀");
		}

		setTimeout(() => {
			GW.Controls.Toaster.showToast(
				[...document.querySelectorAll(`#figWord .char`)].map(charEl => charEl.innerText).join(". ")
					+ `${ns.Data.MaxSteps - ns.Data.Step} guesses remain!`,
				{invisible: true}
			);
		}, 0);
		localStorage.setItem("data", JSON.stringify(ns.Data));
	};

	ns.revealWord = function revealWord() {
		ns.IsPaused = true;

		Object.keys(ns.Data.Guesses).forEach(key => {
			const numMatches = ns.Data.Word.split(key).length - 1;
			ns.Data.Guesses[key] = {Guessed: true, Matches: numMatches}
		});

		ns.IsPaused = false;

		updateHangman();
		updateWord();
	}

	function updateHangman() {
		const figHangman = document.getElementById("figHangman");
		const imgData = ImageDatabase[ns.Data.ImgSet];

		const adjustedStep = Math.floor((ns.Data.Step / ns.Data.MaxSteps) * ImageDatabase[ns.Data.ImgSet].Steps);

		figHangman.innerHTML = `
			<img src="${imgData.LightPrefix}${adjustedStep}.png" alt="${imgData.Alts[adjustedStep - 1]}" class="light">
			<img src="${imgData.DarkPrefix}${adjustedStep}.png" alt="${imgData.Alts[adjustedStep - 1]}" class="dark">
			<figcaption>Step ${ns.Data.Step} of ${ns.Data.MaxSteps}</figcaption>
		`;
		figHangman.querySelectorAll(`img`).forEach(imgEl => {
			imgEl.onload = () => {
				setTimeout(() => { imgEl.style.opacity = "1"; }, 50);
			};
		});
	}

	function updateWord() {
		const characters = ns.Data.Word.split("");
		document.getElementById("figWord").innerHTML = `
		<span class="sr-only">Word: </span>
		${characters.map(character => 
			`<div class="char">${
				ns.Data.Guesses[character].Guessed
					? character
					: `<span class="sr-only">Blank</span>`
			}</div>`
		).join("")}`;
	}
}) (window.GW.Hangman = window.GW.Hangman || {});