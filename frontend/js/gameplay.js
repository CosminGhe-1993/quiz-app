import { game } from "./game.js";
import { showScreen, updateScore, updateHeader, updateSkips, showQuestion, showCategorySelection, showPhase, updateTimer, showFinal, updateProgress, showToast } from "./ui.js";

let timerInterval = null;
let stealMode = false;

export function showCurrentQuestion() {
    const team = game.teams[game.currentTeam];
    if (!team.questions || team.questions.length === 0) { console.log("No questions loaded!"); return; }
    const q = team.questions[team.currentQuestion];
    const options = [...q.wrongAnswers, q.correctAnswer];
    options.sort(() => Math.random() - 0.5);
    showQuestion(q.question, options, q.difficulty);
    updateProgress(team.currentQuestion + 1, team.questions.length);
    startTimer();
}

document.getElementById("answer-options").addEventListener("click", (event) => {
    if (event.target.tagName !== "BUTTON") return;
    clearInterval(timerInterval);

    const team = game.teams[game.currentTeam];
    const q = team.questions[team.currentQuestion];
    const chosen = event.target.textContent;
    const isCorrect = chosen === q.correctAnswer;

    if (stealMode) {
        document.querySelectorAll("#answer-options button").forEach(btn => {
            btn.disabled = true;
            if (btn.textContent === q.correctAnswer) btn.style.background = "green";
            else if (btn === event.target) btn.style.background = "red";
        });
        const stealIndex = game.currentTeam === 0 ? 1 : 0;
        if (isCorrect) {
            game.teams[stealIndex].score += calculatePoints(q.difficulty);
            updateScore(game.teams[0], game.teams[1]);
            const d = q.difficulty.toLowerCase();
            if (d === "hard") game.teams[stealIndex].correctAnswers.hard++;
            else if (d === "medium") game.teams[stealIndex].correctAnswers.medium++;
            else game.teams[stealIndex].correctAnswers.easy++;
        }
        stealMode = false;
        setTimeout(() => nextQuestion(), 1500);
    } else {
        if (isCorrect) {
            document.querySelectorAll("#answer-options button").forEach(btn => {
                btn.disabled = true;
                if (btn.textContent === q.correctAnswer) btn.style.background = "rgba(34,197,94,0.5)";
                else if (btn === event.target) btn.style.background = "rgba(239,68,68,0.5)";
            });
            team.score += calculatePoints(q.difficulty);
            updateScore(game.teams[0], game.teams[1]);
            const d = q.difficulty.toLowerCase();
            if (d === "hard") team.correctAnswers.hard++;
            else if (d === "medium") team.correctAnswers.medium++;
            else team.correctAnswers.easy++;
            setTimeout(() => nextQuestion(), 1500);
        } else {
            event.target.style.background = "red";
            event.target.disabled = true;
            initSteal();
        }
    }
});

function calculatePoints(difficulty) {
    const d = difficulty.toLowerCase();
    if (d === "hard") return 3;
    if (d === "medium") return 2;
    return 1;
}

function nextQuestion() {
    stealMode = false;
    const team = game.teams[game.currentTeam];
    team.currentQuestion++;

    if (team.currentQuestion < team.questions.length) {
        updateHeader(game.currentRound + 1, team.name);
        showCurrentQuestion();
    } else if (game.currentTeam === 0) {
        game.currentTeam = 1;
        updateHeader(game.currentRound + 1, game.teams[1].name);
        updateScore(game.teams[0], game.teams[1]);
        updateSkips(3 - game.teams[1].skips);
        showCurrentQuestion();
    } else {
        clearInterval(timerInterval);
        game.currentRound++;
        if (game.currentRound < game.totalRounds) {
            startNewRound();
        } else {
            showFinal(game.teams[0], game.teams[1]);
            showScreen("final");
        }
    }
}

function startNewRound() {
    const usedCategories = [...game.teams[0].categories, ...game.teams[1].categories];
    game.currentCategories = game.currentCategories.filter(c => !usedCategories.includes(c));

    game.remainingChoices = 4;
    game.currentTeam = 0;
    game.teams[0].categories = [];
    game.teams[0].questions = [];
    game.teams[0].currentQuestion = 0;
    game.teams[1].categories = [];
    game.teams[1].questions = [];
    game.teams[1].currentQuestion = 0;

    showScreen("categories");
    showPhase("select");
    document.getElementById("choosing-team-name").textContent = game.teams[0].name;
    showCategorySelection(game.currentCategories);
}

function startTimer() {
    clearInterval(timerInterval);
    let seconds = 20;
    updateTimer(seconds);
    timerInterval = setInterval(() => {
        seconds--;
        updateTimer(seconds);
        if (seconds <= 0) {
            clearInterval(timerInterval);
            initSteal();
        }
    }, 1000);
}

function initSteal() {
    stealMode = true;
    const stealIndex = game.currentTeam === 0 ? 1 : 0;
    updateHeader(game.currentRound + 1, game.teams[stealIndex].name + " steals!");
    let seconds = 10;
    updateTimer(seconds);
    timerInterval = setInterval(() => {
        seconds--;
        updateTimer(seconds);
        if (seconds <= 0) {
            clearInterval(timerInterval);
            stealMode = false;
            nextQuestion();
        }
    }, 1000);
}

function hideSkipConfirm() {
    document.getElementById("btn-skip").style.display = "";
    document.getElementById("skip-confirm").style.display = "none";
}

document.getElementById("btn-skip").addEventListener("click", () => {
    const team = game.teams[game.currentTeam];
    if (!team.canSkip()) return;
    document.getElementById("btn-skip").style.display = "none";
    document.getElementById("skip-confirm").style.display = "flex";
});

document.getElementById("btn-skip-yes").addEventListener("click", () => {
    const team = game.teams[game.currentTeam];
    team.skips++;
    updateSkips(3 - team.skips);
    clearInterval(timerInterval);
    initSteal();
    hideSkipConfirm();
});

document.getElementById("btn-skip-no").addEventListener("click", () => {
    hideSkipConfirm();
});

showScreen("start");
