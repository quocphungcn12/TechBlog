using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using TechBlog.Api.Extensions;
using TechBlog.Core.Domain.Royalty;
using TechBlog.Core.Models;
using TechBlog.Core.Models.Royalty;
using TechBlog.Core.SeedWorks;
using TechBlog.Core.SeedWorks.Constants;
using TechBlog.Core.Services;

namespace TechBlog.Api.Controllers.AdminApi
{
    [Route("api/[controller]")]
    [ApiController]
    public class RoyaltyController(IUnitOfWork unitOfWork, IRoyaltyService royaltyService) : ControllerBase
    {
        #region Fields
        private readonly IUnitOfWork _unitOfWork = unitOfWork;
        private readonly IRoyaltyService _royaltyService = royaltyService;
        #endregion

        [HttpGet("transaction-histories")]
        [Authorize(Permissions.Royalty.View)]
        public async Task<ActionResult<PagedResult<TransactionDto>>> GetTransactionHistory(string? keyword, int fromMonth, int fromYear, int toMonth, int toYear, int pageIndex, int pageSize = 10)
        {
            var result = await _unitOfWork.Transactions.GetAllPaging(keyword, fromMonth, fromYear, toMonth, toYear, pageIndex, pageSize);
            return Ok(result);
        }

        [HttpGet("Royalty-report-by-user")]
        [Authorize(Permissions.Royalty.View)]
        public async Task<ActionResult<List<RoyaltyReportByUserDto>>> GetRoyaltyReportByUser(Guid? userId, int fromMonth, int fromYear, int toMonth, int toYear)
        {
            var result = await _royaltyService.GetRoyaltyReportByUserAsync(userId, fromMonth, fromYear, toMonth, toYear);
            return Ok(result);
        }

        [HttpGet("Royalty-report-by-month")]
        [Authorize(Permissions.Royalty.View)]
        public async Task<ActionResult<List<RoyaltyReportByMonthDto>>> GetRoyaltyReportByMonth(Guid? userId, int fromMonth, int fromYear, int toMonth, int toYear)
        {
            var result = await _royaltyService.GetRoyaltyReportByMonthAsync(userId, fromMonth, fromYear, toMonth, toYear);
            return Ok(result);
        }

        [HttpPost("{userId}")]
        [Authorize(Permissions.Royalty.Pay)]
        public async Task<IActionResult> PayRoyalty(Guid userId)
        {
            var fromUser = User.GetUserId();
            await _royaltyService.PayRoyaltyForUserAsync(userId, fromUser);
            return Ok();
        }
    }
}
