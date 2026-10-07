using QuizApi.DTOs;

namespace QuizApi.Services;

public interface IGroqService
{
    Task<List<QuestionDto>> GenerateQuestions(string category, int easy, int medium, int hard);
    Task<List<string>> GenerateCategories(int count, List<string> excluded);
}
