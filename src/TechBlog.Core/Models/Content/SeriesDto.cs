using AutoMapper;
using System.ComponentModel.DataAnnotations;
using TechBlog.Core.Domain.Content;

namespace TechBlog.Core.Models.Content
{
    public class SeriesDto : SeriesInListDto
    {
        [MaxLength(250)]
        public string? SeoDescription { get; set; }

        [MaxLength(250)]
        public string? Thumbnail { set; get; }

        public string? Content { get; set; }

        public class AutoMapperSeriesProfiles : Profile
        {
            public AutoMapperSeriesProfiles()
            {
                CreateMap<Series, SeriesDto>();
            }
        }
    }
}
