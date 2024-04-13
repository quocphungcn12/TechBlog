using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Reflection;
using TechBlog.Api.Extensions;
using TechBlog.Api.Fillters;
using TechBlog.Core.Domain.Identity;
using TechBlog.Core.Models;
using TechBlog.Core.Models.System;
using TechBlog.Core.SeedWorks.Constants;
using System.Linq;

namespace TechBlog.Api.Controllers.AdminApi
{
    [Route("api/admin/[controller]")]
    [ApiController]
    public class RoleController(RoleManager<AppRole> roleManager, IMapper mapper) : ControllerBase
    {
        private readonly RoleManager<AppRole> _roleManager = roleManager;
        private readonly IMapper _mapper = mapper;

        [HttpPost]
        [ValidateModel]
        [Authorize(Permissions.Roles.Create)]
        public async Task<IActionResult> CreateRole([FromBody] CreateUpdateRoleRequest request)
        {
            await _roleManager.CreateAsync(new AppRole
            {
                Id = Guid.NewGuid(),
                Name = request.Name,
                DisplayName = request.DisplayName,
            });
            return new OkResult();
        }

        [HttpPut("{id}")]
        [ValidateModel]
        [Authorize(Permissions.Roles.Edit)]
        public async Task<IActionResult> UpdateRole(Guid id, [FromBody] CreateUpdateRoleRequest request)
        {
            var role = await _roleManager.FindByIdAsync(id.ToString());
            if (role is null) return NotFound();
            role.Name = request.Name;
            role.DisplayName = request.DisplayName;
            await _roleManager.UpdateAsync(role);
            return Ok();
        }

        [HttpDelete]
        [Authorize(Permissions.Roles.Delete)]
        public async Task<IActionResult> DeleteRoles([FromQuery] Guid[] ids)
        {
            foreach (var id in ids)
            {
                var role = await _roleManager.FindByIdAsync(id.ToString());
                if (role is null) return NotFound();
                await _roleManager.DeleteAsync(role);
            }
            return Ok();
        }

        [HttpGet("{id}")]
        [Authorize(Permissions.Roles.View)]
        public async Task<ActionResult<RoleDto>> GetRoleById(Guid id)
        {
            var role = await _roleManager.FindByIdAsync(id.ToString());
            if (role is null) return NotFound();
            return Ok(_mapper.Map<AppRole, RoleDto>(role));
        }

        [HttpGet]
        [Route("paging")]
        [Authorize(Permissions.Roles.View)]
        public async Task<ActionResult<PagedResult<RoleDto>>> GetRolesAllPaging(string? keyword, int pageIndex = 1, int pageSize = 10)
        {
            var query = _roleManager.Roles;
            if (!string.IsNullOrEmpty(keyword))
            {
                query = query.Where(x => x.Name!.Contains(keyword) || x.DisplayName.Contains(keyword));
            }
            int totalRow = query.Count();
            query = query.Skip((pageIndex - 1) * pageSize).Take(pageSize);

            var data = await _mapper.ProjectTo<RoleDto>(query).ToListAsync();
            var paginationSet = new PagedResult<RoleDto>
            {
                PageSize = pageSize,
                Result = data,
                RowCount = totalRow,
                CurrentPage = pageIndex
            };
            return Ok(paginationSet);
        }

        [HttpGet("all")]
        [Authorize(Permissions.Roles.View)]
        public async Task<ActionResult<List<RoleDto>>> GetAllRoles()
        {
            var data = await _mapper.ProjectTo<RoleDto>(_roleManager.Roles).ToListAsync();
            return Ok(data);
        }

        [HttpGet("{roleId}/permissions")]
        [Authorize(Permissions.Roles.View)]
        public async Task<ActionResult<PermissionDto>> GetAllRolePermissions(string roleId)
        {
            var model = new PermissionDto();
            var allPermissions = new List<RoleClaimsDto>();
            var types = typeof(Permissions).GetTypeInfo().DeclaredNestedTypes;
            foreach (var type in types)
            {
                allPermissions.GetPermissions(type);
            }

            var role = await _roleManager.FindByIdAsync(roleId);
            if (role is null) return NotFound();
            model.RoleId = roleId;
            var claims = await _roleManager.GetClaimsAsync(role);
            var allClaimValues = allPermissions.Select(x => x.Value).ToList();
            var roleClaimValues = claims.Select(a => a.Value).ToList();
            var authorizedClaims = allClaimValues.Intersect(roleClaimValues).ToList();
            foreach (var permission in allPermissions.Where(permission => authorizedClaims.Exists(x => x == permission.Value)))
            {
                permission.Selected = true;
            }
            model.RoleClaims = allPermissions;
            return Ok(model);
        }

        [HttpPut("permissions")]
        [Authorize(Permissions.Roles.Edit)]
        public async Task<IActionResult> SavePermission([FromBody] PermissionDto permission)
        {
            var role = await _roleManager.FindByIdAsync(permission.RoleId!);
            if(role is null) return NotFound();
            var claims = await _roleManager.GetClaimsAsync(role);
            foreach(var claim in claims)
            {
                await _roleManager.RemoveClaimAsync(role, claim);
            }
            var selectedClaims = permission.RoleClaims!.Where(x => x.Selected).ToList();
            foreach(var claim in selectedClaims)
            {
                await _roleManager.AddPermissionClaim(role, claim.Value);
            }
            return Ok();
        }
    }
}
