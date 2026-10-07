using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using QuizApi.DTOs;

namespace QuizApi.Services;

public class GroqService : IGroqService
{
    private const string GroqApiUrl = "https://api.groq.com/openai/v1/chat/completions";
    private const string GroqModel = "llama-3.3-70b-versatile";

    private readonly HttpClient _httpClient;

    public GroqService(HttpClient httpClient, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _httpClient.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", configuration["GroqApiKey"]!);
    }

    public async Task<List<QuestionDto>> GenerateQuestions(string category, int easy, int medium, int hard)
    {
        var prompt = $"Generate a JSON array of trivia questions about {category}. " +
                     $"It must contain exactly: {easy} questions with difficulty 'easy', {medium} with difficulty 'medium', {hard} with difficulty 'hard'. " +
                     "Each object must have exactly these fields: question, correctAnswer, wrongAnswers (array of 3 elements), difficulty. " +
                     "Avoid questions about time-sensitive information: current presidents or leaders, current champions or records, winners of recent competition editions. " +
                     "Return only the JSON array, no other text, no markdown.";

        var requestBody = new
        {
            model = GroqModel,
            messages = new[] { new { role = "user", content = prompt } }
        };

        var json = JsonSerializer.Serialize(requestBody);
        var content = new StringContent(json, Encoding.UTF8, "application/json");
        var response = await _httpClient.PostAsync(GroqApiUrl, content);
        var responseJson = await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode)
            throw new Exception($"Groq error: {responseJson}");

        using var doc = JsonDocument.Parse(responseJson);
        var text = doc.RootElement.GetProperty("choices")[0].GetProperty("message").GetProperty("content").GetString()!;
        text = text.Trim().TrimStart('`').TrimEnd('`');
        if (text.StartsWith("json")) text = text[4..].Trim();

        var results = JsonSerializer.Deserialize<List<QuestionDto>>(text)!;
        var total = easy + medium + hard;

        if (results.Count < total)
        {
            var receivedEasy = results.Count(q => q.Difficulty.ToLower() == "easy");
            var receivedMedium = results.Count(q => q.Difficulty.ToLower() == "medium");
            var receivedHard = results.Count(q => q.Difficulty.ToLower() == "hard");

            var missingEasy = Math.Max(0, easy - receivedEasy);
            var missingMedium = Math.Max(0, medium - receivedMedium);
            var missingHard = Math.Max(0, hard - receivedHard);

            if (missingEasy > 0 || missingMedium > 0 || missingHard > 0)
            {
                var supplementary = await GenerateQuestions(category, missingEasy, missingMedium, missingHard);
                results.AddRange(supplementary);
            }
        }

        return results;
    }

    public async Task<List<string>> GenerateCategories(int count, List<string> excluded)
    {
        var result = new List<string>();
        var allExcluded = new List<string>(excluded);
        int attempts = 0;

        while (result.Count < count && attempts < 3)
        {
            var missing = count - result.Count;
            var excludedText = allExcluded.Count > 0 ? $"Exclude: {string.Join(", ", allExcluded)}." : "";
            var prompt = $"Generate exactly {missing} interesting and diverse trivia categories. {excludedText} " +
                         "Return only a JSON array of strings, no other text, no markdown. " +
                         "Example: [\"Sport\", \"Music\", \"Geography\"]";

            var requestBody = new { model = GroqModel, messages = new[] { new { role = "user", content = prompt } } };
            var json = JsonSerializer.Serialize(requestBody);
            var content = new StringContent(json, Encoding.UTF8, "application/json");
            var response = await _httpClient.PostAsync(GroqApiUrl, content);
            var responseJson = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
                throw new Exception($"Groq error: {responseJson}");

            using var doc = JsonDocument.Parse(responseJson);
            var text = doc.RootElement.GetProperty("choices")[0].GetProperty("message").GetProperty("content").GetString()!;
            text = text.Trim().TrimStart('`').TrimEnd('`');
            if (text.StartsWith("json"))
                text = text[4..].Trim();

            var newItems = JsonSerializer.Deserialize<List<string>>(text)!;
            var toAdd = newItems.Take(missing).ToList();
            result.AddRange(toAdd);
            allExcluded.AddRange(toAdd);
            attempts++;
        }

        return result;
    }
}
