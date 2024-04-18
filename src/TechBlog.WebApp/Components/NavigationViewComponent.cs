using Microsoft.AspNetCore.Mvc;
using TechBlog.Core.SeedWorks;
using TechBlog.WebApp.Models;

namespace TechBlog.WebApp.Components
{
    public class NavigationViewComponent(IUnitOfWork unitOfWork) : ViewComponent
    {
        private readonly IUnitOfWork _unitOfWork = unitOfWork;
        public async Task<IViewComponentResult> InvokeAsync()
        {
            var model = await _unitOfWork.PostCategory.GetAllAsync();
            var navItem = model.Select(x => new NavigationItemViewModel()
            {
                Slug = x.Slug,
                Name = x.Name,
                Children = model.Where(x => x.ParentId == x.Id).Select(i => new NavigationItemViewModel
                {
                    Name = x.Name,
                    Slug = x.Slug,
                }).ToList()
            }).ToList();
            return View(navItem);
        }
    }
}
