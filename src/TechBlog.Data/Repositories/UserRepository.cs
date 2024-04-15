using Microsoft.EntityFrameworkCore;
using TechBlog.Core.Domain.Identity;
using TechBlog.Core.Repositories;
using TechBlog.Data.SeedWorks;

namespace TechBlog.Data.Repositories
{
    public class UserRepository(TechBlogContext context) : RepositoryBase<AppUser, Guid>(context), IUserRepository
    {
        public async Task RemoveUserFromRoles(Guid userId, string[] roleNames)
        {
            if(roleNames ==  null || roleNames.Length == 0) { return; }
            foreach(var roleName in roleNames)
            {
                var role = await _context.Roles.FirstOrDefaultAsync(x=>x.Name == roleName);
                if(role == null) return;
                var userRole = await _context.UserRoles.FirstOrDefaultAsync(x => x.RoleId == role.Id && x.UserId == userId);
                if(userRole == null) return;
                _context.UserRoles.Remove(userRole);
            }
        }
    }
}
