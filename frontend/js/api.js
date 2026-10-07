const API_URL = "http://localhost:5057/api";

export async function fetchQuestions(category, easy, medium, hard) {
    const url = `${API_URL}/questions?category=${category}&easy=${easy}&medium=${medium}&hard=${hard}`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error("Server error: " + response.status);
    }
    return await response.json();
}

export async function loadTeamQuestions(distributions) {
    const allQuestions = [];
    for (const d of distributions) {
        const questions = await fetchQuestions(d.category, d.easy, d.medium, d.hard);
        allQuestions.push(...questions);
    }
    return allQuestions;
}

export async function generateCategories(count, excluded = []) {
    const excludedParam = excluded.length > 0 ? `&excluded=${excluded.join(',')}` : '';
    const response = await fetch(`${API_URL}/categories?count=${count}${excludedParam}`);
    return await response.json();
}
