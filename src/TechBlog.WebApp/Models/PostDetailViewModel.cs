using TechBlog.Core.Models.Content;

namespace TechBlog.WebApp.Models
{
    public class PostDetailViewModel
    {
        public required PostDto Post { get; set; }
        public required PostCategoryDto Category { get; set; }
    }
}
