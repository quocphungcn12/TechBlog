using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;
using TechBlog.Core.SeedWorks;
using TechBlog.WebApp.Models;

namespace TechBlog.WebApp.Controllers
{
    public class HomeController(ILogger<HomeController> logger, IUnitOfWork unitOfWork) : Controller
    {
        private readonly ILogger<HomeController> _logger = logger;
        private readonly IUnitOfWork _unitOfWork = unitOfWork;

        public async Task<IActionResult> Index()
        {
            var viewModel = new HomeViewModel
            {
                LatestPosts = await _unitOfWork.Posts.GetLatestPublishPost(10)
            };
            return View(viewModel);
        }

        public IActionResult Privacy()
        {
            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
