/**
 * @file Index page scripts
 * @author Vera Konigin vera@groundedwren.com
 */

window.addEventListener("load", () => {
	GW.Hangman.Display.updatePrefs();

	GW.Hangman.Data = JSON.parse(localStorage.getItem("data"));
	if(!GW.Hangman.Data) {
		GW.Hangman.generateGameData(new FormData(document.getElementById("frmNew")));
	}

	document.querySelector(`gw-keyboard`).addEventListener("key-click", GW.Hangman.onKeyClick);
	GW.Hangman.renderGame();
});