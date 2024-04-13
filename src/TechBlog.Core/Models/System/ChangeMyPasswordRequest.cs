namespace TechBlog.Core.Models.System
{
    public class ChangeMyPasswordRequest
    {
        public required string OldPassword { get; set; }

        public required string NewPassword { get; set; }
    }
}
