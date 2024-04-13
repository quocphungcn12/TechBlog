using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TechBlog.Core.Domain.Content;
using TechBlog.Core.Models;
using TechBlog.Core.Models.Content;
using TechBlog.Core.SeedWorks;
using TechBlog.Core.SeedWorks.Constants;

namespace TechBlog.Api.Controllers.AdminApi
{
    [Route("api/admin/[controller]")]
    [ApiController]
    public class PostCategoryController(IUnitOfWork unitOfWork, IMapper mapper) : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork = unitOfWork;
        private readonly IMapper _mapper = mapper;

        [HttpPost]
        [Authorize(Permissions.PostCategories.Create)]
        public async Task<IActionResult> CreatePostCategory([FromBody] CreateUpdatePostCategoryRequest request)
        {
            var post = _mapper.Map<CreateUpdatePostCategoryRequest, PostCategory>(request);
            _unitOfWork.PostCategory.Add(post);
            int result = await _unitOfWork.CompleteAsync();
            return result > 0 ? Ok(result) : BadRequest();
        }

        [HttpPut]
        [Authorize(Permissions.PostCategories.Edit)]
        public async Task<IActionResult> UpdatePostCategory(Guid id, [FromBody] CreateUpdatePostCategoryRequest request)
        {
            var post = await _unitOfWork.PostCategory.GetByIdAsync(id);
            if (post is null) return NotFound();
            _mapper.Map(request, post);
            await _unitOfWork.CompleteAsync();
            return Ok();
        }

        [HttpDelete]
        [Authorize(Permissions.PostCategories.Delete)]
        public async Task<IActionResult> DeletePostCategory(Guid[] ids)
        {
            foreach (var id in ids)
            {
                var post = await _unitOfWork.PostCategory.GetByIdAsync(id);
                if (post is null) return NotFound();
                _unitOfWork.PostCategory.Remove(post);
            }
            var result = await _unitOfWork.CompleteAsync();
            return result > 0 ? Ok() : BadRequest();
        }

        [HttpGet]
        [Route("{id}")]
        [Authorize(Permissions.PostCategories.View)]
        public async Task<ActionResult<PostCategoryDto>> GetPostCategoryById(Guid id)
        {
            var post = await _unitOfWork.PostCategory.GetByIdAsync(id);
            if (post is null) return NotFound();
            var postCategoryDto = _mapper.Map<PostCategoryDto>(post);
            return Ok(postCategoryDto);
        }

        [HttpGet]
        [Route("paging")]
        [Authorize(Permissions.PostCategories.View)]
        public async Task<ActionResult<PagedResult<PostCategoryDto>>> GetPostCategoriesPaging(string? keyword, int pageIndex, int pageSize = 10)
        {
            var result = await _unitOfWork.PostCategory.GetAllPaging(keyword, pageIndex, pageSize);
            return Ok(result);
        }

        [HttpGet]
        [Authorize(Permissions.PostCategories.View)]
        public async Task<ActionResult<List<PostCategoryDto>>> GetAllPostCategory()
        {
            var query = await _unitOfWork.PostCategory.GetAllAsync();
            var model = _mapper.Map<List<PostCategoryDto>>(query);
            return Ok(model);
        }
    }
}
