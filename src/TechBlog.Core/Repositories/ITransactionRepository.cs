using TechBlog.Core.Domain.Royalty;
using TechBlog.Core.Models.Royalty;
using TechBlog.Core.Models;
using TechBlog.Core.SeedWorks;

namespace TechBlog.Core.Repositories
{
    public interface ITransactionRepository: IRepository<Transaction, Guid>
    {
        Task<PagedResult<TransactionDto>> GetAllPaging(string? userName,
        int fromMonth, int fromYear, int toMonth, int toYear, int pageIndex = 1, int pageSize = 10);
    }
}
