using TechBlog.Core.Models.Content;

namespace TechBlog.WebApp.Models
{
    public class HomeViewModel
    {
        public List<PostInListDto> LatestPosts { get; set; } = new List<PostInListDto>();
    }
}
