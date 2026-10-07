const screens = {
    start: document.getElementById("screen-start"),
    categories: document.getElementById("screen-categories"),
    distribution: document.getElementById("screen-distribution"),
    game: document.getElementById("screen-game"),
    final: document.getElementById("screen-final")
};

export function showScreen(screenName) {
    Object.values(screens).forEach(screen => screen.style.display = "none");
    screens[screenName].style.display = "block";
}

const elements = {
    team1Name: document.getElementById("team1-name"),
    team1Score: document.getElementById("team1-score"),
    team2Name: document.getElementById("team2-name"),
    team2Score: document.getElementById("team2-score"),
    currentRound: document.getElementById("current-round"),
    currentTeamName: document.getElementById("current-team-name"),
    timer: document.getElementById("timer"),
    questionText: document.getElementById("question-text"),
    answerOptions: document.getElementById("answer-options"),
    skipsRemaining: document.getElementById("skips-remaining"),
    distributionTeamName: document.getElementById("distribution-team-name"),
    choosingTeamName: document.getElementById("choosing-team-name")
};

export function updateScore(team1, team2) {
    elements.team1Name.textContent = team1.name;
    elements.team1Score.textContent = team1.score;
    elements.team2Name.textContent = team2.name;
    elements.team2Score.textContent = team2.score;
}

export function updateHeader(round, teamName) {
    elements.currentRound.textContent = round;
    elements.currentTeamName.textContent = teamName;
}

export function updateTimer(seconds) {
    elements.timer.textContent = seconds;
}

export function showQuestion(text, options, difficulty) {
    const d = difficulty.toLowerCase();
    let label, color;
    if (d === "hard") {
        label = "Hard • 3 pts"; color = "rgba(239,68,68,0.7)";
    } else if (d === "medium") {
        label = "Medium • 2 pts"; color = "rgba(245,158,11,0.7)";
    } else {
        label = "Easy • 1 pt"; color = "rgba(34,197,94,0.7)";
    }
    const badge = document.getElementById("difficulty-badge");
    badge.textContent = label;
    badge.style.background = color;

    elements.questionText.textContent = text;
    elements.answerOptions.innerHTML = "";
    options.forEach(option => {
        const btn = document.createElement("button");
        btn.textContent = option;
        elements.answerOptions.appendChild(btn);
    });
}

export function updateSkips(skips) {
    elements.skipsRemaining.textContent = skips;
}

export function showGeneratedCategories(categories) {
    const list = document.getElementById("list-generated-categories");
    list.innerHTML = "";
    categories.forEach(cat => {
        const label = document.createElement("label");
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.value = cat;
        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(cat));
        list.appendChild(label);
    });
}

export function showCategorySelection(categories) {
    const list = document.getElementById("list-select-categories");
    list.innerHTML = "";
    categories.forEach(cat => {
        const btn = document.createElement("button");
        btn.textContent = cat;
        btn.dataset.category = cat;
        list.appendChild(btn);
    });
}

export function getSelectedCategories() {
    const checked = document.querySelectorAll("#list-generated-categories input[type='checkbox']:checked");
    return Array.from(checked).map(cb => cb.value);
}

export function showPhase(phase) {
    document.getElementById("phase-generate").style.display = phase === "generate" ? "block" : "none";
    document.getElementById("phase-select").style.display = phase === "select" ? "block" : "none";
}

export function showDistribution(team) {
    const container = document.getElementById("distribution-container");
    container.innerHTML = "";
    document.getElementById("total-questions").textContent = 0;

    team.categories.forEach((cat, index) => {
        const div = document.createElement("div");
        div.innerHTML = `
            <h3>${cat}</h3>
            <label>Easy (1 pt): <input class="count-easy" data-cat="${index}" type="number" min="0" value="0"></label>
            <label>Medium (2 pts): <input class="count-medium" data-cat="${index}" type="number" min="0" value="0"></label>
            <label>Hard (3 pts): <input class="count-hard" data-cat="${index}" type="number" min="0" value="0"></label>
        `;
        container.appendChild(div);
    });
}

export function showFinal(team1, team2) {
    const winner = team1.score > team2.score ? team1 : team2.score > team1.score ? team2 : null;

    document.getElementById("final-title").textContent = winner ? `${winner.name} wins!` : "It's a tie!";

    document.getElementById("team1-final-name").textContent = team1.name;
    document.getElementById("team1-final-score").textContent = team1.score;
    document.getElementById("team1-hard-count").textContent = team1.correctAnswers.hard;
    document.getElementById("team1-medium-count").textContent = team1.correctAnswers.medium;
    document.getElementById("team1-easy-count").textContent = team1.correctAnswers.easy;

    document.getElementById("team2-final-name").textContent = team2.name;
    document.getElementById("team2-final-score").textContent = team2.score;
    document.getElementById("team2-hard-count").textContent = team2.correctAnswers.hard;
    document.getElementById("team2-medium-count").textContent = team2.correctAnswers.medium;
    document.getElementById("team2-easy-count").textContent = team2.correctAnswers.easy;
}

export function updateProgress(current, total) {
    document.getElementById("question-progress").textContent = `${current} / ${total}`;
}

export function showToast(message) {
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add("toast-visible"), 10);
    setTimeout(() => {
        toast.classList.remove("toast-visible");
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}