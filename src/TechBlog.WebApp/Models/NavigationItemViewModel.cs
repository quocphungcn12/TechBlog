namespace TechBlog.WebApp.Models
{
    public class NavigationItemViewModel
    {
        public required string Slug { get; set; }
        public required string Name { get; set; }

        public List<NavigationItemViewModel> Children { get; set; } = [];

        public bool HasChildren
        {
            get
            {
                return Children.Count > 0;
            }
        }

    }
}
