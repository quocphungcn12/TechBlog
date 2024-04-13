using AutoMapper;
using Microsoft.EntityFrameworkCore;
using TechBlog.Core.Domain.Content;
using TechBlog.Core.Models;
using TechBlog.Core.Models.Content;
using TechBlog.Core.Repositories;
using TechBlog.Data.SeedWorks;

namespace TechBlog.Data.Repositories
{
    public class PostCategoryRepository(TechBlogContext context, IMapper mapper) : RepositoryBase<PostCategory, Guid>(context), IPostCategoryRepository
    {
        private readonly IMapper _mapper = mapper;

        public async Task<PagedResult<PostCategoryDto>> GetAllPaging(string? keyword, int pageIndex = 1, int pageSize = 10)
        {
            var query = _context.PostCategories.AsQueryable();
            if (!string.IsNullOrEmpty(keyword))
            {
                query = query.Where(x => x.Name.Contains(keyword));
            }
            var totalRow = await query.CountAsync();

            query = query.OrderByDescending(x=>x.DateCreated)
                         .Skip((pageIndex - 1) * pageSize)
                         .Take(pageSize);
            return new PagedResult<PostCategoryDto>
            {
                Result = await _mapper.ProjectTo<PostCategoryDto>(query).ToListAsync(),
                RowCount = totalRow,
                CurrentPage = pageIndex,
                PageSize = pageSize
            };
        }
    }
}
