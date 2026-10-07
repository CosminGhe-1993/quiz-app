import { Team, game } from "./game.js";
import { showScreen, showPhase, showToast } from "./ui.js";

document.getElementById("btn-start").addEventListener("click", () => {
    const name1 = document.getElementById("input-team1").value.trim();
    const name2 = document.getElementById("input-team2").value.trim();
    if (name1 === "" || name2 === "") 
    { 
        showToast("Enter names for both teams!"); return; 
    }
    game.teams = [new Team(name1), new Team(name2)];
    showScreen("categories");
    showPhase("generate");
});

document.getElementById("btn-new-game").addEventListener("click", () => {
    location.reload();
});

document.addEventListener("keydown", (e) => {
    if (document.getElementById("screen-game").style.display === "none") return;
    const buttons = document.querySelectorAll("#answer-options button:not(:disabled)");
    if (e.key >= "1" && e.key <= "4") {
        const index = parseInt(e.key) - 1;
        if (buttons[index]) buttons[index].click();
    }
    if (e.key === " ") {
        e.preventDefault();
        document.getElementById("btn-skip").click();
    }
});