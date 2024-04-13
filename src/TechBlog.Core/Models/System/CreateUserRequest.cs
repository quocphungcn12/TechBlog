﻿using AutoMapper;
using TechBlog.Core.Domain.Identity;

namespace TechBlog.Core.Models.System
{
    public class CreateUserRequest
    {
        public required string FirstName { get; set; }
        public required string LastName { get; set; }
        public required string UserName { get; set; }
        public required string Email { get; set; }
        public required string PhoneNumber { get; set; }
        public required string Password { get; set; }
        public DateTime? Dob { get; set; }
        public string? Avatar { get; set; }
        public bool IsActive { get; set; }
        public double RoyaltyAmountPerPost { get; set; }
        public class AutoMapperProfiles : Profile
        {
            public AutoMapperProfiles()
            {
                CreateMap<CreateUserRequest, AppUser>();
            }
        }
    }
}
