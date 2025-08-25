/**
 * @file Keyboard control
 * @author Vera Konigin vera@groundedwren.com
 */
 
window.GW = window.GW || {};
(function Controls(ns) {
	ns.KeyboardEl = class KeyboardEl extends HTMLElement {
		static Alphabet = [
			"A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M",
			"N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"
		];

		static InstanceCount = 0; // Global count of instances created
		static InstanceMap = {}; // Dynamic map of IDs to instances of the element currently attached

		//Element name
		static Name = "gw-keyboard";
		// Element CSS rules
		static Style = `${KeyboardEl.Name} {
			background-color: var(--background-color-2);

			--key-width: 50px;
			@container(width < 550px) {
				--key-width: 40px;
			}

			@container(width < 440px) {
				--key-width: 35px;
			}

			@container(width < 400px) {
				--key-width: 30px;
			}

			@container(width < 360px) {
				--key-width: 28px;
			}

			.key {
				min-width: initial;
				padding-inline: 0;
				width: var(--key-width);
				display: grid;
				grid-auto-flow: row;

				.keydesc {
					font-size: 0.8em;
				}

				&[aria-disabled="true"] {
					border: 1px solid var(--border-color, black);
					background-color: var(--background-color, white);
					cursor: not-allowed;
					&:hover {
						background-color: var(--background-color, white);
					}
				}
			}

			.app {
				display: grid;
				grid-template-rows: auto auto auto;
				justify-items: center;
				gap: 4px;
			}

			.keys {
				display: grid;
				grid-template-areas:
					"Q Q Q W W W E E E R R R T T T Y Y Y U U U I I I O O O P P P"
					"0 A A A S S S D D D F F F G G G H H H J J J K K K L L L 1 1"
					"2 2 Z Z Z X X X C C C V V V B B B N N N M M M 3 3 3 3 3 3 3";
				gap: 2px;
				padding: 2px;
			}

			&:has(option[value="AZERTY"]:checked) {
				.keys {
					grid-template-areas:
						"A A A Z Z Z E E E R R R T T T Y Y Y U U U I I I O O O P P P 0"
						"1 Q Q Q S S S D D D F F F G G G H H H J J J K K K L L L M M M"
						"2 2 W W W X X X C C C V V V B B B N N N 3 3 3 3 3 3 3 3 3 3 3";
				}
			}

			&:has(option[value="Dvorak"]:checked) {
				.keys {
					grid-template-areas:
						"0 0 0 0 0 0 0 0 P P P Y Y Y F F F G G G C C C R R R L L L 1 1"
						"A A A O O O E E E U U U I I I D D D H H H T T T N N N S S S 3"
						"4 4 4 4 Q Q Q J J J K K K X X X B B B M M M W W W V V V Z Z Z";
				}
			}
			
			${KeyboardEl.Alphabet.map(keyName => `
				[data-key="${keyName}"] {
					grid-area: ${keyName}
				}
			`).join("")}

			.hidden {
				display: none !important;
			}
		}`;

		InstanceId; // Identifier for this instance of the element
		IsInitialized; // Whether the element has rendered its content

		/** Creates an instance */
		constructor() {
			super();
			if(!this.getId) {
				// We're not initialized correctly. Attempting to fix:
				Object.setPrototypeOf(this, customElements.get(KeyboardEl.Name).prototype);
			}
			this.InstanceId = KeyboardEl.InstanceCount++;
		}

		/** Shortcut for the root node of the element */
		get Root() {
			return this.getRootNode();
		}
		/** Looks up the <head> element (or a fascimile thereof in the shadow DOM) for the element's root */
		get Head() {
			if(this.Root.head) {
				return this.Root.head;
			}
			if(this.Root.getElementById("gw-head")) {
				return this.Root.getElementById("gw-head");
			}
			const head = document.createElement("div");
			head.setAttribute("id", "gw-head");
			this.Root.prepend(head);
			return head;
		}

		/**
		 * Generates a globally unique ID for a key unique to the custom element instance
		 * @param {String} key Unique key within the custom element
		 * @returns A globally unique ID
		 */
		getId(key) {
			return `${KeyboardEl.Name}-${this.InstanceId}-${key}`;
		}
		/**
		 * Finds an element within the custom element created with an ID from getId
		 * @param {String} key Unique key within the custom element
		 * @returns The element associated with the key
		 */
		getRef(key) {
			return this.querySelector(`#${CSS.escape(this.getId(key))}`);
		}

		/** Handler invoked when the element is attached to the page */
		connectedCallback() {
			this.onAttached();
		}
		/** Handler invoked when the element is moved to a new document via adoptNode() */
		adoptedCallback() {
			this.onAttached();
		}
		/** Handler invoked when the element is disconnected from the document */
		disconnectedCallback() {
			delete KeyboardEl.InstanceMap[this.InstanceId];
		}

		/** Performs setup when the element has been sited */
		onAttached() {
			if(!this.Root.querySelector(`style.${KeyboardEl.Name}`)) {
				this.Head.insertAdjacentHTML(
					"beforeend",
					`<style class=${KeyboardEl.Name}>${KeyboardEl.Style}</style>`
				);
			}

			KeyboardEl.InstanceMap[this.InstanceId] = this;
			if(document.readyState === "loading") {
				document.addEventListener("DOMContentLoaded", () => {
					this.#initialize();
				});
			}
			else {
				this.#initialize();
			}
		}

		/** First-time setup */
		#initialize() {
			if(this.IsInitialized) { return; }
			this.IsInitialized = true;
			this.renderContent();
		}

		/** Invoked when the element is ready to render */
		renderContent() {
			this.innerHTML = `
			<div
				class="app"
				role="application"
				aria-roledescription="Character selection control"
				aria-describedby="${this.getId("emAppDesc")}"
				tabindex="-1"
			>
				<label>Layout: <select id="${this.getId("selLayout")}">
					<option value="QWERTY">QWERTY</option>
					<option value="AZERTY">AZERTY</option>
					<option value="Dvorak">Dvorak</option>
				</select></label>
				<div
					class="keys"
					tabindex="0"
					role="group"
					aria-label="Keys"
					aria-describedby="${this.getId("spnKeysDesc")}"
				>${KeyboardEl.Alphabet.map(key => `
					<button
						class="key"
						data-key="${key}"
						tabindex="-1"
						aria-labelledby="${this.getId(`keytext-${key}`)}"
						aria-describedby="${this.getId(`keydesc-${key}`)}"
					>
						<span id="${this.getId(`keytext-${key}`)}">${key}</span>
						<span id="${this.getId(`keydesc-${key}`)}" class="keydesc">
							(<span class="matches">?</span>)
						</span>
					</button>`).join("")}
				</div>
				<em id="${this.getId("emAppDesc")}">Type-ahead available</em>
				<span id="${this.getId("spnKeysDesc")}" class="hidden">Arrow key navigation available</span>
			</div>`;
			this.querySelectorAll(`.key`).forEach(keyEl => {
				keyEl.addEventListener("click", this.#onKeyClick);
				keyEl.addEventListener("focusin", this.#onKeyFocusin);
			});
			this.querySelector(`.keys`).addEventListener("focus", () => {
				this.#getKeysAndRects().sort((keyObjA, keyObjB) => {
					if(keyObjA.Rect.top === keyObjB.Rect.top) {
						return keyObjA.Rect.left - keyObjB.Rect.left;
					}
					return keyObjA.Rect.top - keyObjB.Rect.top;
				})[0].Element.focus();
			});
			this.querySelector(`.keys`).addEventListener("keydown", this.#onKeysKeydown);
			this.querySelector(`.app`).addEventListener("keydown", this.#onAppKeydown);
			this.getRef("selLayout").addEventListener("change", this.#onLayoutChange);
		}

		bindData(data) {
			Object.entries(data).forEach(([key, keyData]) => this.#updateKey(key, keyData));
			return new Proxy(data, {
				set(_target, property, value, _receiver) {
					const returnVal = Reflect.set(...arguments);
					this.Keyboard.#updateKey(property, value);
					return returnVal;
				},
				Keyboard: this,
			});
		}

		#updateKey(key, keyData) {
			const keyEl = this.querySelector(`[data-key="${key}"]`);
			if(keyData.Guessed) {
				keyEl.setAttribute("aria-disabled", "true");
			}
			else {
				keyEl.removeAttribute("aria-disabled");
			}
			keyEl.querySelector(`.matches`).innerText = keyData.Matches;
		}

		#onKeyClick = (event) => {
			if(event.currentTarget.getAttribute("aria-disabled") === "true") {
				return;
			}
			this.dispatchEvent(new CustomEvent("key-click", {detail: event.currentTarget.getAttribute("data-key")}));
		};

		#onKeyFocusin = (event) => {
			this.querySelectorAll(`.key, .keys`).forEach(
				tabbableEl => tabbableEl.setAttribute("tabindex", "-1")
			);
			event.target.setAttribute("tabindex", "0");
		};

		#onLayoutChange = (event) => {
			this.querySelectorAll(`.key`).forEach(
				tabbableEl => tabbableEl.setAttribute("tabindex", "-1")
			);
			this.querySelector(`.keys`).setAttribute("tabindex", "0");
		};

		#onKeysKeydown = (event) => {
			let above = false;
			let below = false;
			let left = false;
			let right = false;
			switch(event.key) {
				case "ArrowUp":
					above = true;
					break;
				case "ArrowDown":
					below = true;
					break;
				case "ArrowLeft":
					left = true;
					break;
				case "ArrowRight":
					right = true;
					break;
			}
			if(!above && !below && !left && !right) {
				return;
			}

			const currentKey = event.target;
			const currentKeyRect = currentKey.getBoundingClientRect();
			let keyObjs = this.#getKeysAndRects(currentKey);
			keyObjs = keyObjs.filter(keyObj => {
				if(above) {
					return keyObj.Rect.y < currentKeyRect.y;
				}
				if(below) {
					return keyObj.Rect.y > currentKeyRect.y;
				}
				if(left) {
					return keyObj.Rect.x < currentKeyRect.x
						&& keyObj.Rect.y === currentKeyRect.y;
				}
				if(right) {
					return keyObj.Rect.x > currentKeyRect.x
						&& keyObj.Rect.y === currentKeyRect.y;
				}
			});
			const nearestKeyObj = keyObjs.sort((keyObjA, keyObjB) => keyObjA.Distance - keyObjB.Distance)[0];
			if(nearestKeyObj) {
				nearestKeyObj.Element.focus();
			}
		};

		#onAppKeydown = (event) => {
			const key = event.key.toUpperCase();
			this.querySelector(`[data-key="${key}"]`)?.focus();
		};

		#getKeysAndRects(distanceKey) {
			const distanceKeyRect = distanceKey?.getBoundingClientRect();
			return [...this.querySelectorAll(`.key`)].map(keyEl => {
				const rect = keyEl.getBoundingClientRect();
				return {
					Element: keyEl,
					Rect: rect,
					Distance: distanceKey
						? Math.sqrt(Math.pow((rect.x - distanceKeyRect.x), 2)
							+ Math.pow((rect.y - distanceKeyRect.y), 2))
						: undefined
				}
			});
		}
	}
	if(!customElements.get(ns.KeyboardEl.Name)) {
		customElements.define(ns.KeyboardEl.Name, ns.KeyboardEl);
	}
}) (window.GW.Controls = window.GW.Controls || {});
GW?.Controls?.Veil?.clearDefer("GW.Controls.KeyboardEl");