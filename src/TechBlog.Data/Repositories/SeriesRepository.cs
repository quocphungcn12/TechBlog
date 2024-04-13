using AutoMapper;
using Microsoft.EntityFrameworkCore;
using TechBlog.Core.Domain.Content;
using TechBlog.Core.Models;
using TechBlog.Core.Models.Content;
using TechBlog.Core.Repositories;
using TechBlog.Data.SeedWorks;

namespace TechBlog.Data.Repositories
{
    public class SeriesRepository(TechBlogContext context, IMapper mapper) : RepositoryBase<Series, Guid>(context), ISeriesRepository
    {
        private readonly IMapper _mapper = mapper;

        public async Task AddPostToSeries(Guid seriesId, Guid postId, int sortOrder)
        {
            var postInSeries = await _context.PostInSeries.FirstOrDefaultAsync(x=>x.PostId == postId && x.SeriesId == seriesId);
            if(postInSeries is null)
            {
                await _context.PostInSeries.AddAsync(new PostInSeries
                {
                    DisplayOrder = sortOrder,
                    PostId = postId,
                    SeriesId = seriesId
                });
            }
        }

        public async Task<PagedResult<SeriesInListDto>> GetAllPaging(string? keyword, int pageIndex = 1, int pageSize = 10)
        {
            var query = _context.Series.AsQueryable();
            if(!string.IsNullOrEmpty(keyword))
            {
                query = query.Where(x => x.Name.Contains(keyword));
            }
            var totalRow = await query.CountAsync();

            query = query.OrderByDescending(x => x.DateCreated)
                   .Skip((pageIndex - 1) * pageSize)
                   .Take(pageSize);

            return new PagedResult<SeriesInListDto>
            {
                Result = await _mapper.ProjectTo<SeriesInListDto>(query).ToListAsync(),
                CurrentPage = pageIndex,
                RowCount = totalRow,
                PageSize = pageSize
            };

        }

        public async Task<List<PostInListDto>> GetAllPostsInSeries(Guid seriesId)
        {
            var query = from pis in _context.PostInSeries
                        join p in _context.Posts
                        on pis.PostId equals p.Id
                        where pis.SeriesId == seriesId
                        select p;
            return await _mapper.ProjectTo<PostInListDto>(query).ToListAsync();
        }

        public async Task<bool> IsPostInSeries(Guid seriesId, Guid postId)
        {
            return await _context.PostInSeries.AnyAsync(x=>x.PostId == postId && x.SeriesId == seriesId);
        }

        public async Task RemovePostToSeries(Guid seriesId, Guid postId)
        {
            var postInSeries = await _context.PostInSeries
                .FirstOrDefaultAsync(x=>x.PostId == postId && x.SeriesId==seriesId);
            if (postInSeries is not null)
            {
                _context.PostInSeries.Remove(postInSeries);
            }
        }
    }
}
