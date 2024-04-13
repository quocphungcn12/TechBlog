namespace TechBlog.Core.Models
{
    public class PagedResult<T>: PagedResultBase where T : class
    {
        public List<T> Result { get; set; }
        public PagedResult() => Result = new List<T>();
    }
}
