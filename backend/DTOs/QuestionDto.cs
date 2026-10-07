using System.Text.Json.Serialization;

namespace QuizApi.DTOs;

public class QuestionDto
{
    [JsonPropertyName("question")]
    public string Question { get; set; } = string.Empty;

    [JsonPropertyName("correctAnswer")]
    public string CorrectAnswer { get; set; } = string.Empty;

    [JsonPropertyName("wrongAnswers")]
    public List<string> WrongAnswers { get; set; } = new();

    [JsonPropertyName("difficulty")]
    public string Difficulty { get; set; } = string.Empty;
}
