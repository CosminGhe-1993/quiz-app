export class Team {
    constructor(name) {
        this.name = name;
        this.score = 0;
        this.skips = 0;
        this.correctAnswers = {
            hard: 0,
            medium: 0,
            easy: 0
        };
    }

    canSkip() {
        return this.skips < 3;
    }
}

export const game = {
    teams: [],
    currentRound: 0,
    totalRounds: 6,
    availableCategories: [],
    roundCategories: [],
    currentTeam: 0,
    currentCategories: [],
    seenCategories: [],
    remainingChoices: 4,
};
