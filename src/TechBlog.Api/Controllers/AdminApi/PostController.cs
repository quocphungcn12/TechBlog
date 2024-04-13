using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using TechBlog.Api.Extensions;
using TechBlog.Core.Domain.Content;
using TechBlog.Core.Domain.Identity;
using TechBlog.Core.Models;
using TechBlog.Core.Models.Content;
using TechBlog.Core.SeedWorks;
using TechBlog.Core.SeedWorks.Constants;

namespace TechBlog.Api.Controllers.AdminApi
{
    [Route("api/admin/[controller]")]
    [ApiController]
    public class PostController(IUnitOfWork unitOfWork, IMapper mapper, UserManager<AppUser> userManager) : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork = unitOfWork;
        private readonly IMapper _mapper = mapper;
        private readonly UserManager<AppUser> _userManager = userManager;
        [HttpPost]
        [Authorize(Permissions.Posts.Create)]
        public async Task<IActionResult> CreatePost([FromBody] CreateUpdatePostRequest request)
        {
            if (await _unitOfWork.Posts.IsSlugAlreadyExisted(request.Slug))
            {
                return BadRequest("Đã tồn tại slug");
            }
            var post = _mapper.Map<CreateUpdatePostRequest, Post>(request);
            var category = await _unitOfWork.PostCategory.GetByIdAsync(request.CategoryId);
            post.CategoryName = category.Name;
            post.CategorySlug = category.Slug;

            var userId = User.GetUserId();
            var user = await _userManager.FindByIdAsync(userId.ToString());
            post.AuthorUserId = userId;
            post.AuthorName = user!.UserName;
            _unitOfWork.Posts.Add(post);
            return await _unitOfWork.CompleteAsync() > 0 ? Ok() : BadRequest();
        }
        [HttpPut]
        [Authorize(Permissions.Posts.Edit)]
        public async Task<IActionResult> UpdatePost(Guid id, [FromBody] CreateUpdatePostRequest request)
        {
            if (await _unitOfWork.Posts.IsSlugAlreadyExisted(request.Slug, id))
            {
                return BadRequest("Đã tồn tại slug");
            }

            var post = await _unitOfWork.Posts.GetByIdAsync(id);
            if (post is null)
            {
                return NotFound();
            }
            if (post.CategoryId != request.CategoryId)
            {
                var category = await _unitOfWork.PostCategory.GetByIdAsync(request.CategoryId);
                post.CategoryName = category.Name;
                post.CategorySlug = category.Slug;
            }
            _mapper.Map(request, post);
            await _unitOfWork.CompleteAsync();
            return Ok();
        }

        [HttpDelete]
        [Authorize(Permissions.Posts.Delete)]
        public async Task<IActionResult> DeletePosts([FromQuery] Guid[] ids)
        {
            foreach (var id in ids)
            {
                var post = await _unitOfWork.Posts.GetByIdAsync(id);
                if (post is null)
                {
                    return NotFound();
                }
                _unitOfWork.Posts.Remove(post);
            }
            var result = await _unitOfWork.CompleteAsync();
            return result > 0 ? Ok() : BadRequest();
        }
        [HttpGet]
        [Route("{id}")]
        [Authorize(Permissions.Posts.View)]
        public async Task<ActionResult<PostDto>> GetPostById(Guid id)
        {
            var post = await _unitOfWork.Posts.GetByIdAsync(id);
            if (post == null)
            {
                return NotFound();
            }
            return Ok(post);
        }

        [HttpGet("paging")]
        [Authorize(Permissions.Posts.View)]
        public async Task<ActionResult<PagedResult<PostInListDto>>> GetPostPaging(string? keyword, Guid? categoryId, int pageIndex, int pageSize = 10)
        {
            var userId = User.GetUserId();
            var result = await _unitOfWork.Posts.GetAllPaging(keyword, userId, categoryId, pageIndex, pageSize);
            return Ok(result);
        }

        [HttpGet]
        [Route("series-belong/{postId}")]
        [Authorize(Permissions.Posts.View)]
        public async Task<ActionResult<List<SeriesInListDto>>> GetSeriesBelong(Guid postId)
        {
            var result = await _unitOfWork.Posts.GetAllSeries(postId);
            return Ok(result);
        }

        [HttpGet("approve/{id}")]
        [Authorize(Permissions.Posts.Approve)]
        public async Task<IActionResult> ApprovePost(Guid id)
        {
            await _unitOfWork.Posts.Approve(id, User.GetUserId());
            await _unitOfWork.CompleteAsync();
            return Ok();
        }

        [HttpGet("approval-submit/{id}")]
        [Authorize(Permissions.Posts.Edit)]
        public async Task<IActionResult> SendToApprove(Guid id)
        {
            await _unitOfWork.Posts.SendToApprove(id, User.GetUserId());
            await _unitOfWork.CompleteAsync();
            return Ok();
        }

        [HttpPost("return-back/{id}")]
        [Authorize(Permissions.Posts.Approve)]
        public async Task<IActionResult> ReturnBack(Guid id, [FromBody] ReturnBackRequest request)
        {
            await _unitOfWork.Posts.ReturnBack(id, User.GetUserId(), request.Reason);
            await _unitOfWork.CompleteAsync();
            return Ok();
        }

        [HttpGet("return-reason/{id}")]
        [Authorize(Permissions.Posts.Approve)]
        public async Task<ActionResult<string>> GetReson(Guid id)
        {
            var note = await _unitOfWork.Posts.GetReturnReason(id);
            return Ok(note);
        }

        [HttpGet("activity-logs/{id}")]
        [Authorize(Permissions.Posts.Approve)]
        public async Task<ActionResult<List<PostActivityLogDto>>> GetActivityLogs(Guid id)
        {
            var logs = await _unitOfWork.Posts.GetActivityLogs(id);
            return Ok(logs);
        }
    }
}
