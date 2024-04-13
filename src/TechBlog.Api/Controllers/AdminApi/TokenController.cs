using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using TechBlog.Api.Services;
using TechBlog.Core.Domain.Identity;
using TechBlog.Core.Models.Auth;

namespace TechBlog.Api.Controllers.AdminApi
{
    [Route("api/admin/[controller]")]
    [ApiController]
    public class TokenController(UserManager<AppUser> userManager, ITokenService tokenService) : ControllerBase
    {
        private readonly UserManager<AppUser> _userManager = userManager;
        private readonly ITokenService _tokenService = tokenService;

        [HttpPost]
        [Route("refresh")]
        public async Task<ActionResult<AuthenticatedResult>> Refresh(TokenRequest tokenRequest)
        {
            if (tokenRequest is null)
                return BadRequest("Invalid client request");
            string accessToken = tokenRequest.AccessToken;
            string refreshToken = tokenRequest.RefreshToken;

            var principal = _tokenService.GetPrincipalFromExpiredToken(accessToken);

            if (principal is null || principal.Identity is null || principal.Identity.Name is null)
                return BadRequest("Invalid Token");
            string userName = principal.Identity.Name;
            var user =await _userManager.FindByNameAsync(userName);

            if (user is null || user.RefreshToken != refreshToken || user.RefreshTokenExpiryTime <= DateTime.Now) return BadRequest("Invalid client request");

            string newAccessToken = _tokenService.GenerateAccessToken(principal.Claims);
            string newRefreshToken = _tokenService.GenerateRefreshToken();
            user.RefreshToken = newRefreshToken;
            await _userManager.UpdateAsync(user);

            return Ok(new AuthenticatedResult()
            {
                RefreshToken = newAccessToken,
                Token = newAccessToken
            });
        }

        [HttpPost, Authorize]
        [Route("revoke")]
        public async Task<IActionResult> Revoke()
        {
            AppUser? user = await _userManager.FindByNameAsync(User.Identity!.Name!);
            if(user is null) return BadRequest();
            user.RefreshToken = null;
            user.RefreshTokenExpiryTime = null;
            await _userManager.UpdateAsync(user);
            return NoContent();
        }
    }
}
