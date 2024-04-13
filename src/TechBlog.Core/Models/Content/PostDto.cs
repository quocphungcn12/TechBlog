using AutoMapper;
using TechBlog.Core.Domain.Content;

namespace TechBlog.Core.Models.Content
{
    public class PostDto : PostInListDto
    {
        public Guid CategoryId { get; set; }
        public string? Content { get; set; }
        public Guid AuthorUserId { get; set; }
        public string? Source { get; set; }
        public string? Tags { get; set; }
        public string? SeoDescription { get; set; }
        public DateTime? DateModified { get; set; }
        public PostStatus Status { get; set; }
        public class AutoMapperPostDtoProfiles : Profile
        {
            public AutoMapperPostDtoProfiles()
            {
                CreateMap<Post, PostDto>();
            }
        }
    }
}
