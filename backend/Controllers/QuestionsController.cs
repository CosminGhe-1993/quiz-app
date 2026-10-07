using Microsoft.AspNetCore.Mvc;
using QuizApi.Services;
using QuizApi.DTOs;

namespace QuizApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class QuestionsController : ControllerBase
{
    private readonly IGroqService _groqService;

    public QuestionsController(IGroqService groqService)
    {
        _groqService = groqService;
    }

    [HttpGet]
    public async Task<ActionResult<List<QuestionDto>>> GetQuestions([FromQuery] string category, [FromQuery] int easy, [FromQuery] int medium, [FromQuery] int hard)
    {
        var questions = await _groqService.GenerateQuestions(category, easy, medium, hard);
        return Ok(questions);
    }

    [HttpGet("/api/categories")]
    public async Task<ActionResult<List<string>>> GetCategories([FromQuery] int count, [FromQuery] string excluded = "")
    {
        var excludedList = string.IsNullOrEmpty(excluded) ? new List<string>() : excluded.Split(',').ToList();
        var categories = await _groqService.GenerateCategories(count, excludedList);
        return Ok(categories);
    }
}
