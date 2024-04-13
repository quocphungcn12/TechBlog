using Microsoft.AspNetCore.Authorization;

namespace TechBlog.Api.Authorization
{
    public class PermissionRequirement(string? permission) : IAuthorizationRequirement
    {
        public string? Permission { get; private set; } = permission;
    }
}
