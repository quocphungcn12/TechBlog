using AutoMapper;
using Microsoft.AspNetCore.Identity;
using TechBlog.Core.Domain.Identity;
using TechBlog.Core.Repositories;
using TechBlog.Core.SeedWorks;
using TechBlog.Data.Repositories;

namespace TechBlog.Data.SeedWorks
{
    public class UnitOfWork(TechBlogContext context, IMapper mapper, UserManager<AppUser> userManager) : IUnitOfWork
    {
        private readonly TechBlogContext _context = context;
        public IPostRepository Posts { get; private set; } = new PostRepository(context, mapper, userManager);

        public IPostCategoryRepository PostCategory { get; private set; } = new PostCategoryRepository(context, mapper);

        public ISeriesRepository Series { get; private set; } = new SeriesRepository(context, mapper);

        public ITransactionRepository Transactions { get; private set; } = new TransactionRepository(context, mapper);

        public async Task<int> CompleteAsync()
        {
            return await _context.SaveChangesAsync();
        }
        public void Disposes() => _context.Dispose();
    }
}
