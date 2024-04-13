using Microsoft.AspNetCore.Identity;
using System.ComponentModel;
using System.Reflection;
using System.Security.Claims;
using TechBlog.Core.Domain.Identity;
using TechBlog.Core.Models.System;

namespace TechBlog.Api.Extensions
{
    public static class ClaimExtensions
    {
        public static void GetPermissions(this List<RoleClaimsDto> allPermissions, Type policy)
        {
            FieldInfo[] fields = policy.GetFields(BindingFlags.Static | BindingFlags.Public);
            foreach(FieldInfo field in fields)
            {
                var attribute = field.GetCustomAttributes(typeof(DescriptionAttribute), true);
                string? displayName = field.GetValue(null)?.ToString();
                if (attribute.Length > 0)
                {
                    var description = (DescriptionAttribute)attribute[0];
                    displayName = description?.Description;
                }
                allPermissions.Add(new RoleClaimsDto
                {
                    Value =  field.GetValue(null)?.ToString() ?? "",
                    Type = "Permissions",
                    DisplayName = displayName
                });
            }
        }

        public static async Task AddPermissionClaim(this RoleManager<AppRole> roleManager, AppRole role, string permission)
        {
            var allClaims = await roleManager.GetClaimsAsync(role);
            if(!allClaims.Any(x=>x.Type == "Permisson" && x.Value == permission))
            {
                await roleManager.AddClaimAsync(role, new Claim("Permisson", permission));
            }
        }
    }
}
