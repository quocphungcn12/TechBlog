using AutoMapper;
using Microsoft.EntityFrameworkCore;
using TechBlog.Core.Domain.Royalty;
using TechBlog.Core.Models;
using TechBlog.Core.Models.Royalty;
using TechBlog.Core.Repositories;
using TechBlog.Data.SeedWorks;

namespace TechBlog.Data.Repositories
{
    public class TransactionRepository(TechBlogContext context, IMapper mapper) : RepositoryBase<Transaction, Guid>(context), ITransactionRepository
    {
        private readonly IMapper _mapper = mapper;

        public async Task<PagedResult<TransactionDto>> GetAllPaging(string? userName, int fromMonth, int fromYear, int toMonth, int toYear, int pageIndex = 1, int pageSize = 10)
        {
            var query = _context.Transactions.AsQueryable();
            if(!string.IsNullOrWhiteSpace(userName))
            {
                query = query.Where(x=>x.ToUserName.Contains(userName));
            }
            if(fromMonth > 0 && fromYear > 0)
            {
                query = query.Where(x => x.DateCreated.Date.Month >= fromMonth && x.DateCreated.Year >= fromYear);
            }
            if(toMonth > 0 && toYear > 0)
            {
                query = query.Where(x=>x.DateCreated.Date.Month <= toMonth && x.DateCreated.Year <= toYear);
            }
            var totalRow = await query.CountAsync();
            query = query.OrderByDescending(x => x.DateCreated)
                .Skip((pageIndex - 1) * pageSize)
                .Take(pageSize);
            return new PagedResult<TransactionDto>
            {
                Result = await _mapper.ProjectTo<TransactionDto>(query).ToListAsync(),
                CurrentPage = pageIndex,
                RowCount = totalRow,
                PageSize = pageSize
            };
        }
    }
}
