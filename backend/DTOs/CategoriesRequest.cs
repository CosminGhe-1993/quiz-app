namespace QuizApi.DTOs;

public class CategoriesRequest
{
    public int Count { get; set; }
    public List<string> Excluded { get; set; } = new();
}
