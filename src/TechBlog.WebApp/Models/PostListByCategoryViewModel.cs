using TechBlog.Core.Models;
using TechBlog.Core.Models.Content;

namespace TechBlog.WebApp.Models
{
    public class PostListByCategoryViewModel
    {
        public required PostCategoryDto Category { get; set; }
        public required PagedResult<PostInListDto> Posts { get; set; }
    }
}
