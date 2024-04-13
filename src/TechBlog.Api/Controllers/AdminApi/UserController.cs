using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TechBlog.Api.Extensions;
using TechBlog.Api.Fillters;
using TechBlog.Core.Domain.Identity;
using TechBlog.Core.Models;
using TechBlog.Core.Models.System;
using TechBlog.Core.SeedWorks.Constants;

namespace TechBlog.Api.Controllers.AdminApi
{
    [Route("api/admin/[controller]")]
    [ApiController]
    public class UserController(IMapper mapper, UserManager<AppUser> userManager) : ControllerBase
    {
        private readonly UserManager<AppUser> _userManager = userManager;
        private readonly IMapper _mapper = mapper;

        [HttpGet("{id}")]
        [Authorize(Permissions.Users.View)]
        public async Task<ActionResult<UserDto>> GetUserById(Guid id)
        {
            var user = await _userManager.FindByIdAsync(id.ToString());
            if (user is null) return NotFound();
            var userDto = _mapper.Map<AppUser, UserDto>(user);
            var roles = await _userManager.GetRolesAsync(user);
            userDto.Roles = roles;
            return Ok(userDto);
        }

        [HttpGet("paging")]
        [Authorize(Permissions.Users.View)]
        public async Task<ActionResult<PagedResult<UserDto>>> GetAllUserPaging(string? keyword, int pageIndex, int pageSize)
        {
            var query = _userManager.Users;

            if (!string.IsNullOrEmpty(keyword))
            {
                query = query.Where(x => x.FirstName.Contains(keyword)
                    || x.UserName!.Contains(keyword)
                    || x.Email!.Contains(keyword)
                    || x.PhoneNumber!.Contains(keyword)
                );
            }
            int totalRow = await query.CountAsync();
            query = query.OrderByDescending(x => x.DateCreated).Skip((pageIndex - 1) * pageSize).Take(pageSize);
            var pagedResponse = new PagedResult<UserDto>()
            {
                Result = await _mapper.ProjectTo<UserDto>(query).ToListAsync(),
                PageSize = pageSize,
                CurrentPage = pageIndex,
                RowCount = totalRow
            };
            return Ok(pagedResponse);
        }

        [HttpPost]
        [ValidateModel]
        [Authorize(Permissions.Users.Create)]
        public async Task<IActionResult> CreateUser([FromBody] CreateUserRequest request)
        {
            if (await _userManager.FindByNameAsync(request.UserName) is not null) return BadRequest();
            if (await _userManager.FindByEmailAsync(request.Email) is not null) return BadRequest();
            var user = _mapper.Map<CreateUserRequest, AppUser>(request);
            var result = await _userManager.CreateAsync(user, request.Password);
            if (result.Succeeded) return Ok();
            return BadRequest(string.Join("<br>", result.Errors.Select(x => x.Description)));
        }

        [HttpPut("{id}")]
        [ValidateModel]
        [Authorize(Permissions.Users.Edit)]
        public async Task<IActionResult> UpdateUser(Guid id, [FromBody] UpdateUserRequest request)
        {
            var user = await _userManager.FindByIdAsync(id.ToString());
            if (user is null) return NotFound();
            _mapper.Map(request, user);
            var result = await _userManager.UpdateAsync(user);
            if (!result.Succeeded)
            {
                return BadRequest(string.Join("<br>", result.Errors.Select(x => x.Description)));
            }
            return Ok();
        }

        [HttpPut("password-change-current-user")]
        [ValidateModel]
        public async Task<IActionResult> ChangeMyPassword([FromBody] ChangeMyPasswordRequest request)
        {
            var user = await _userManager.FindByIdAsync(User.GetUserId().ToString());
            if (user is null) return NotFound();
            var result = await _userManager.ChangePasswordAsync(user, request.OldPassword, request.NewPassword);
            if (result.Succeeded) return Ok();
            return BadRequest(string.Join("<br>", result.Errors.Select(x => x.Description)));
        }

        [HttpDelete]
        [Authorize(Permissions.Users.Delete)]
        public async Task<IActionResult> DeleteUsers([FromQuery] string[] ids)
        {
            foreach (var id in ids)
            {
                var user = await _userManager.FindByIdAsync(id);
                if (user is null) return NotFound();
                await _userManager.DeleteAsync(user);
            }
            return Ok();
        }

        [HttpPost("set-password/{id}")]
        [ValidateModel]
        [Authorize(Permissions.Users.Edit)]
        public async Task<IActionResult> SetPassword(Guid id, [FromBody] SetPasswordRequest request)
        {
            var user = await _userManager.FindByIdAsync(id.ToString());
            if (user is null) return NotFound();
            user.PasswordHash = _userManager.PasswordHasher.HashPassword(user, request.NewPassword);
            var result = await _userManager.UpdateAsync(user);
            if (result.Succeeded) return Ok();
            return BadRequest(string.Join("<br>", result.Errors.Select(x => x.Description)));
        }

        [HttpPost("change-email/{id}")]
        [Authorize(Permissions.Users.Edit)]
        public async Task<IActionResult> ChangeEmail(Guid id, [FromBody] ChangeEmailRequest request)
        {
            var user = await _userManager.FindByIdAsync(id.ToString());
            if (user is null) return NotFound();
            var token = await _userManager.GenerateChangeEmailTokenAsync(user, request.Email);
            var result = await _userManager.ChangeEmailAsync(user, request.Email, token);
            if (!result.Succeeded)
                return BadRequest(string.Join("<br>", result.Errors.Select(x => x.Description)));
            return Ok();
        }

        [HttpPut("{id}/assign-users")]
        [Authorize(Permissions.Users.Edit)]
        public async Task<IActionResult> AssignRoleToUser(string id, [FromBody] string[] roles)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user is null) return NotFound();
            var currentRoles = await _userManager.GetRolesAsync(user);
            var removedResult = await _userManager.RemoveFromRolesAsync(user, currentRoles);
            var addedResult = await _userManager.AddToRolesAsync(user, roles);
            if (!addedResult.Succeeded || !removedResult.Succeeded)
            {
                List<IdentityError> addedErrorLst = addedResult.Errors.ToList();
                List<IdentityError> removeErrorLst = removedResult.Errors.ToList();
                var errorList = new List<IdentityError>();
                errorList.AddRange(addedErrorLst);
                errorList.AddRange(removeErrorLst);
                return BadRequest(string.Join("<br/>", errorList.Select(x => x.Description)));
            }
            return Ok();
        }
    }
}
