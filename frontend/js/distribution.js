import { game } from "./game.js";
import { loadTeamQuestions, fetchQuestions } from "./api.js";
import { showToast, showDistribution, showScreen, updateScore, updateHeader, updateSkips } from "./ui.js";
import { showCurrentQuestion } from "./gameplay.js";

document.getElementById("distribution-container").addEventListener("input", () => {
    const total = [...document.querySelectorAll(".count-easy, .count-medium, .count-hard")]
        .reduce((sum, el) => sum + Number(el.value), 0);
    document.getElementById("total-questions").textContent = total;
});

document.getElementById("btn-confirm-distribution").addEventListener("click", async () => {
    const team = game.teams[game.currentTeam];
    const distributions = [];
    let total = 0;
    let valid = true;

    team.categories.forEach((cat, index) => {
        const easy = Number(document.querySelector(`.count-easy[data-cat="${index}"]`).value);
        const medium = Number(document.querySelector(`.count-medium[data-cat="${index}"]`).value);
        const hard = Number(document.querySelector(`.count-hard[data-cat="${index}"]`).value);
        if (easy < 1) valid = false;
        distributions.push({ category: cat, easy, medium, hard });
        total += easy + medium + hard;
    });

    const totalMedium = distributions.reduce((sum, d) => sum + d.medium, 0);
    const totalHard = distributions.reduce((sum, d) => sum + d.hard, 0);

    if (!valid) { showToast("Each category must have at least one easy question!"); return; }
    if (totalMedium < 1) { showToast("There must be at least one medium question!"); return; }
    if (totalHard < 1) { showToast("There must be at least one hard question!"); return; }
    if (total !== 10) { showToast("Total must be exactly 10 questions!"); return; }

    team.distributions = distributions;

    if (game.currentTeam === 0) {
        game.currentTeam = 1;
        document.getElementById("distribution-team-name").textContent = game.teams[1].name;
        showDistribution(game.teams[1]);
    } else {
        const btn = document.getElementById("btn-confirm-distribution");
        btn.disabled = true;
        btn.textContent = "Loading...";
        try {
            await loadQuestions();
            for (const team of game.teams) {
                const seen = new Set();
                team.questions = team.questions.filter(q => {
                    if (seen.has(q.question)) return false;
                    seen.add(q.question);
                    return true;
                });
            }
        } catch (e) {
            showToast("Error loading questions.");
            btn.disabled = false;
            btn.textContent = "Confirm";
            return;
        }
        btn.disabled = false;
        btn.textContent = "Confirm";
        game.currentTeam = 0;
        showScreen("game");
        updateScore(game.teams[0], game.teams[1]);
        updateHeader(game.currentRound + 1, game.teams[0].name);
        updateSkips(3 - game.teams[0].skips);
        showCurrentQuestion();
    }
});

async function loadQuestions() {
    for (const team of game.teams) {
        team.questions = await loadTeamQuestions(team.distributions);
        team.currentQuestion = 0;
    }

    for (let i = 0; i < game.teams.length; i++) {
        const otherTeam = game.teams[i === 0 ? 1 : 0];
        for (const dist of otherTeam.distributions) {
            const bonus = await fetchQuestions(dist.category, 1, 0, 0);
            game.teams[i].questions.push(...bonus);
        }
    }
}