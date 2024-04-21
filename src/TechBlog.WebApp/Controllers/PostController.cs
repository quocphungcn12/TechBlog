using Microsoft.AspNetCore.Mvc;
using TechBlog.Core.SeedWorks;
using TechBlog.WebApp.Models;

namespace TechBlog.WebApp.Controllers
{
    public class PostController(IUnitOfWork unitOfWork) : Controller
    {
        private readonly IUnitOfWork _unitOfWork = unitOfWork;
        [Route("posts")]
        public IActionResult Index()
        {
            return View();
        }
        [Route("posts/{categorySlug}")]
        public async Task<IActionResult> ListByCategory([FromRoute] string categorySlug, [FromQuery] int page = 1)
        {
            var post = await _unitOfWork.Posts.GetPostByCategoryPaging(categorySlug, page, 1);
            var category = await _unitOfWork.PostCategory.GetBySlug(categorySlug);
            return View(new PostListByCategoryViewModel
            {
                Category = category,
                Posts = post
            });
        }
        [Route("tag/{tagSlug}")]
        public IActionResult ListByTag([FromRoute] string tagSlug, [FromQuery] int page = 1)
        {
            return View();
        }

        [Route("post/{slug}")]
        public IActionResult Details([FromRoute] string slug)
        {
            return View();
        }
    }
}
