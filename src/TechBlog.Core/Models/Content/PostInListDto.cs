using AutoMapper;
using TechBlog.Core.Domain.Content;

namespace TechBlog.Core.Models.Content
{
    public class PostInListDto
    {
        public Guid Id { get; set; }
        public required string Name { get; set; }
        public required string Slug { get; set; }
        public string? Description { get; set; }
        public string? Thumbnail { get; set; }
        public int ViewCount { get; set; }
        public DateTime DateCreated { get; set; }
        public bool IsPaid { get; set; }
        public double RoyaltyAmount { get; set; }
        public DateTime? PaidDate { get; set; }
        public class AutoMapperPostInListDtoProfiles : Profile
        {
            public AutoMapperPostInListDtoProfiles()
            {
                CreateMap<Post, PostInListDto>();
            }
        }
    }
}
