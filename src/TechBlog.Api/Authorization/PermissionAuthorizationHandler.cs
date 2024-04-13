using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using System.Security.Claims;
using TechBlog.Core.Domain.Identity;
using TechBlog.Core.SeedWorks.Constants;

namespace TechBlog.Api.Authorization
{
    public class PermissionAuthorizationHandler(RoleManager<AppRole> roleManager, UserManager<AppUser> userManager) : AuthorizationHandler<PermissionRequirement>
    {
        private readonly RoleManager<AppRole> _roleManager = roleManager;
        private readonly UserManager<AppUser> _userManager = userManager;

        protected override async Task HandleRequirementAsync(AuthorizationHandlerContext context, PermissionRequirement requirement)
        {
            if (context.User.Identity?.IsAuthenticated == false)
            {
                return;
            }
            var user = await _userManager.FindByNameAsync(context.User.Identity!.Name!);
            IList<string> roles = user is not null ? await _userManager.GetRolesAsync(user) : [];
            if (roles.Any() && roles.Contains(Roles.Admin))
            {
                context.Succeed(requirement);
            }
            var allPermissions = new List<Claim>();
            foreach (var role in roles)
            {
                var roleEntity = await _roleManager.FindByNameAsync(role);
                var roleClaims = await _roleManager.GetClaimsAsync(roleEntity!);
                allPermissions.AddRange(roleClaims);
            }
            var permissions = allPermissions.Where(x => x.Type == "Permission" && x.Value == requirement.Permission && x.Issuer == "LOCAL AUTHORITY");
            if(permissions.Any())
            {
                context.Succeed(requirement);
                return;
            }
        }
    }
}
