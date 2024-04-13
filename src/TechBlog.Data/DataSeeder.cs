using Microsoft.AspNetCore.Identity;
using TechBlog.Core.Domain.Identity;

namespace TechBlog.Data
{
    public class DataSeeder
    {
        public async Task SeedAsync(TechBlogContext context)
        {
            var passwordHasher = new PasswordHasher<AppUser>();
            var rootAdminRole = Guid.NewGuid();
            if (!context.Roles.Any())
            {
                await context.Roles.AddAsync(new AppRole()
                {
                    Id = rootAdminRole,
                    Name = "admin",
                    NormalizedName = "ADMIN",
                    DisplayName = "Quản trị viên"
                });
                await context.SaveChangesAsync();
            }
            if (!context.Users.Any())
            {
                var user = new AppUser()
                {
                    Id = Guid.NewGuid(),
                    FirstName = "Phung",
                    LastName = "Phan Quốc",
                    Email = "quocphungccq1911h@gmail.com",
                    NormalizedEmail = "QUOCPHUNGCCQ1911H@GMAIL.COM",
                    UserName = "admin",
                    NormalizedUserName = "ADMIN",
                    IsActive = true,
                    SecurityStamp = Guid.NewGuid().ToString(),
                    LockoutEnabled = false,
                    DateCreated = DateTime.Now
                };
                user.PasswordHash = passwordHasher.HashPassword(user, "QuocPhung1994@");
                await context.Users.AddAsync(user);
                await context.UserRoles.AddAsync(new IdentityUserRole<Guid>()
                {
                    RoleId = rootAdminRole,
                    UserId = user.Id
                });
                await context.SaveChangesAsync();
            }
        }
    }
}
