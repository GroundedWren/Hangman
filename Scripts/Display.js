/**
 * @file Display scripts
 * @author Vera Konigin vera@groundedwren.com
 */
 
window.GW = window.GW || {};
window.GW.Hangman = window.GW.Hangman || {};
(function Display(ns) {
	ns.onLayoutChange = (event) => {
		localStorage.setItem("keyboard-layout", event.detail);
		ns.updatePrefs();
	};

	ns.updatePrefs = function updatePrefs() {
		const cbxDarkMode = document.getElementById("cbxDarkMode");
		const theme = localStorage.getItem("theme");
		switch(theme) {
			case "light":
				cbxDarkMode.checked = false;
				break;
			case "dark":
				cbxDarkMode.checked = true;
				break;
			default:
				cbxDarkMode.checked = window.matchMedia("(prefers-color-scheme: dark)").matches;
				break;
		}
		document.documentElement.classList.toggle("theme-dark", cbxDarkMode.checked);

		const kbdLayout = localStorage.getItem("keyboard-layout");
		document.querySelector(`gw-keyboard`).setLayout(kbdLayout);
	}
}) (window.GW.Hangman.Display = window.GW.Hangman.Display || {});