using TechBlog.Core.Domain.Content;
using TechBlog.Core.Models;
using TechBlog.Core.Models.Content;
using TechBlog.Core.SeedWorks;

namespace TechBlog.Core.Repositories
{
    public interface IPostCategoryRepository : IRepository<PostCategory, Guid>
    {
        Task<PagedResult<PostCategoryDto>> GetAllPaging(string? keyword, int pageIndex = 1, int pageSize = 10);
    }
}
