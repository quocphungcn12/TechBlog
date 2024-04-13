using AutoMapper;
using TechBlog.Core.Domain.Identity;

namespace TechBlog.Core.Models.System
{
    public class RoleDto
    {
        public Guid Id { get; set; }
        public string? Name { get; set; }
        public required string DisplayName { get; set; }
        public class AutoMapperProfiles : Profile
        {
            public AutoMapperProfiles()
            {
                CreateMap<AppRole, RoleDto>();
            }
        }
    }
}
