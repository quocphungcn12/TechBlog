using TechBlog.Core.Domain.Content;
using TechBlog.Core.Models.Content;
using TechBlog.Core.SeedWorks;

namespace TechBlog.Core.Repositories
{
    public interface ITagRepository : IRepository<Tag, Guid>
    {
        Task<TagDto?> GetBySlug(string slug);
    }
}
