import { game } from "./game.js";
import { generateCategories } from "./api.js";
import { showGeneratedCategories, showCategorySelection, getSelectedCategories, showPhase, showToast, showDistribution, showScreen } from "./ui.js";

document.getElementById("btn-generate").addEventListener("click", async () => {
    const btn = document.getElementById("btn-generate");
    const selected = getSelectedCategories();
    const isReplacement = game.currentCategories.length > 0 && selected.length > 0;

    btn.disabled = true;
    btn.textContent = "Generating...";
    try {
        if (isReplacement) {
            const newOnes = await generateCategories(selected.length, game.seenCategories);
            let newIndex = 0;
            game.currentCategories = game.currentCategories.map(cat => selected.includes(cat) ? newOnes[newIndex++] : cat);
            game.seenCategories = [...game.seenCategories, ...newOnes];
        } else {
            const newOnes = await generateCategories(24, game.seenCategories);
            game.currentCategories = newOnes;
            game.seenCategories = [...game.seenCategories, ...newOnes];
            if (game.currentCategories.length >= 24) {
                document.getElementById("btn-next").style.display = "inline-block";
            } else {
                document.getElementById("btn-generate-rest").style.display = "inline-block";
            }
            document.querySelector(".top-buttons").style.justifyContent = "space-between";
        }
        showGeneratedCategories(game.currentCategories);
    } catch (e) {
        showToast("Error generating categories. Try again.");
    } finally {
        btn.disabled = true;
        btn.textContent = "Generate categories";
    }
});

document.getElementById("list-generated-categories").addEventListener("change", () => {
    const selected = getSelectedCategories();
    const btn = document.getElementById("btn-generate");
    if (selected.length > 0) {
        btn.disabled = false;
        btn.textContent = "Generate others";
    } else {
        btn.disabled = true;
        btn.textContent = "Generate categories";
    }
});

document.getElementById("btn-next").addEventListener("click", () => {
    showPhase("select");
    game.currentTeam = 0;
    document.getElementById("choosing-team-name").textContent = game.teams[0].name;
    showCategorySelection(game.currentCategories);
});

document.getElementById("list-select-categories").addEventListener("click", (event) => {
    if (event.target.tagName !== "BUTTON") return;
    const categoryName = event.target.dataset.category;
    if (!game.teams[game.currentTeam].categories) game.teams[game.currentTeam].categories = [];
    game.teams[game.currentTeam].categories.push(categoryName);
    event.target.disabled = true;
    game.remainingChoices--;
    if (game.remainingChoices === 0) {
        game.currentTeam = 0;
        document.getElementById("distribution-team-name").textContent = game.teams[0].name;
        showDistribution(game.teams[0]);
        showScreen("distribution");
    } else {
        game.currentTeam = game.currentTeam === 0 ? 1 : 0;
        document.getElementById("choosing-team-name").textContent = game.teams[game.currentTeam].name;
    }
});

document.getElementById("btn-generate-rest").addEventListener("click", async () => {
    const btn = document.getElementById("btn-generate-rest");
    btn.disabled = true;
    btn.textContent = "Generating...";
    try {
        const missing = 24 - game.currentCategories.length;
        const newOnes = await generateCategories(missing, game.seenCategories);
        game.currentCategories = [...game.currentCategories, ...newOnes];
        game.seenCategories = [...game.seenCategories, ...newOnes];
        showGeneratedCategories(game.currentCategories);
        if (game.currentCategories.length >= 24) {
            btn.style.display = "none";
            document.getElementById("btn-next").style.display = "inline-block";
        }
    } catch (e) {
        showToast("Error generating categories.");
        btn.disabled = false;
        btn.textContent = "Generate rest";
    } finally {
        if (!btn.style.display || btn.style.display !== "none") {
            btn.disabled = false;
            btn.textContent = "Generate rest";
        }
    }
});