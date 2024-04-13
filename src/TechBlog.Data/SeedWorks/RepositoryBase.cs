using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;
using TechBlog.Core.SeedWorks;

namespace TechBlog.Data.SeedWorks
{
    public class RepositoryBase<T, Key>(TechBlogContext context) : IRepository<T, Key> where T : class
    {
        private readonly DbSet<T> _dbSet = context.Set<T>();
        protected readonly TechBlogContext _context = context;

        public void Add(T entity)
        {
            #pragma warning disable CA2012 // Use ValueTasks correctly
            _dbSet.AddAsync(entity);
            #pragma warning restore CA2012 // Use ValueTasks correctly
        }

        public void AddRange(IEnumerable<T> entities)
        {
            _dbSet.AddRangeAsync(entities);
        }

        public IEnumerable<T> Find(Expression<Func<T, bool>> expression) => _dbSet.Where(expression);

        public async Task<IEnumerable<T>> GetAllAsync() => await _dbSet.ToListAsync();

        public async Task<T> GetByIdAsync(Key id) => await _dbSet.FindAsync(id) ?? throw new ArgumentException($"Cannot find item with key: {id}");

        public void Remove(T entity)
        {
            _dbSet.Remove(entity);
        }

        public void RemoveRange(IEnumerable<T> entities)
        {
            _dbSet.RemoveRange(entities);
        }
    }
}
