using Microsoft.AspNetCore.Mvc;

namespace TechBlog.WebApp.Components
{
    public class NavigationViewComponent : ViewComponent
    {
        public async Task<IViewComponentResult> InvokeAsync()
        {
            return View();
        }
    }
}
