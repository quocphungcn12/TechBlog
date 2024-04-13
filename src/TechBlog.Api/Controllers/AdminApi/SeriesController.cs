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
    public class SeriesController(IUnitOfWork unitOfWork, IMapper mapper) : ControllerBase
    {
        #region Fields
        private readonly IUnitOfWork _unitOfWork = unitOfWork;
        private readonly IMapper _mapper = mapper;
        #endregion

        [HttpPost]
        [Authorize(Permissions.Series.Create)]
        public async Task<IActionResult> CreateSeries([FromBody] CreateUpdateSeriesRequest request)
        {
            var post = _mapper.Map<CreateUpdateSeriesRequest, Series>(request);
            _unitOfWork.Series.Add(post);
            return await _unitOfWork.CompleteAsync() > 0 ? Ok() : BadRequest();
        }

        [HttpPut]
        [Authorize(Permissions.Series.Edit)]
        public async Task<IActionResult> UpdateSeries(Guid id, [FromBody] CreateUpdateSeriesRequest request)
        {
            var series = await _unitOfWork.Series.GetByIdAsync(id);
            if (series is null) return NotFound();
            _mapper.Map(request, series);
            return await _unitOfWork.CompleteAsync() > 0 ? Ok() : BadRequest();
        }

        [HttpPut("post-series")]
        [Authorize(Permissions.Series.Edit)]
        public async Task<IActionResult> AddPostSeries([FromBody] AddPostSeriesRequest request)
        {
            var isExisted = await _unitOfWork.Series.IsPostInSeries(request.SeriesId, request.PostId);
            if (isExisted) return BadRequest("Bài viết này đã nằm trong loạt bài");
            await _unitOfWork.Series.AddPostToSeries(request.SeriesId, request.PostId, request.SortOrder);
            return await _unitOfWork.CompleteAsync() > 0 ? Ok() : BadRequest();
        }

        [Route("post-series")]
        [HttpDelete]
        [Authorize(Permissions.Series.Edit)]
        public async Task<IActionResult> DeletePostSeries([FromBody] AddPostSeriesRequest request)
        {
            var isExisted = await _unitOfWork.Series.IsPostInSeries(request.SeriesId, request.PostId);
            if (!isExisted) return NotFound();
            await _unitOfWork.Series.RemovePostToSeries(request.SeriesId, request.PostId);
            return await _unitOfWork.CompleteAsync() > 0 ? Ok() : BadRequest();
        }

        [Route("post-series/{seriesId}")]
        [HttpGet]
        [Authorize(Permissions.Series.Edit)]
        public async Task<ActionResult<List<PostInListDto>>> GetPostsInSeries(Guid seriesId)
        {
            var post = await _unitOfWork.Series.GetAllPostsInSeries(seriesId);
            return Ok(post);
        }

        [HttpDelete]
        [Authorize(Permissions.Series.Delete)]
        public async Task<IActionResult> DeleteSeries([FromQuery] Guid[] ids)
        {
            foreach (var id in ids)
            {
                var series = await _unitOfWork.Series.GetByIdAsync(id);
                if (series is null) return NotFound();
                _unitOfWork.Series.Remove(series);
            }
            return await _unitOfWork.CompleteAsync() > 0 ? Ok() : BadRequest();
        }

        [HttpGet("{id}")]
        [Authorize(Permissions.Series.View)]
        public async Task<ActionResult<SeriesDto>> GetSeriesById(Guid id)
        {
            var series = await _unitOfWork.Series.GetByIdAsync(id);
            if (series is null) return NotFound();
            return Ok(series);
        }

        [HttpGet("paging")]
        [Authorize(Permissions.Series.View)]
        public async Task<ActionResult<PagedResult<SeriesInListDto>>> GetSeriesPaging(string? keyword, int pageIndex, int pageSize = 10)
        {
            var result = await _unitOfWork.Series.GetAllPaging(keyword, pageIndex, pageSize);
            return Ok(result);
        }

        [HttpGet]
        [Authorize(Permissions.Series.View)]
        public async Task<ActionResult<List<SeriesInListDto>>> GetAllSeries()
        {
            var result = await _unitOfWork.Series.GetAllAsync();
            var series = _mapper.Map<List<SeriesInListDto>>(result);
            return Ok(series);
        }
    }
}
