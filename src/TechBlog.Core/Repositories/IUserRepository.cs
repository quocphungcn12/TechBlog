using TechBlog.Core.Domain.Identity;
using TechBlog.Core.SeedWorks;

namespace TechBlog.Core.Repositories
{
    public interface IUserRepository : IRepository<AppUser, Guid>
    {
        Task RemoveUserFromRoles(Guid userId, string[] roleNames); 
    }
}
