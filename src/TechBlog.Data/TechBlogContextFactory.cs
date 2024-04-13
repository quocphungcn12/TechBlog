using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;
using TechBlog.Utilities.Constants;

namespace TechBlog.Data
{
    public class TechBlogContextFactory : IDesignTimeDbContextFactory<TechBlogContext>
    {
        public TechBlogContext CreateDbContext(string[] args)
        {
            IConfigurationRoot configuration = new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("appsettings.json")
                .Build();
            var optionBuilder = new DbContextOptionsBuilder<TechBlogContext>();
            optionBuilder.UseSqlServer(configuration.GetConnectionString(SystemConstants.ConnectionString.TechBlogDB));
            return new TechBlogContext(optionBuilder.Options);
        }
    }
}
