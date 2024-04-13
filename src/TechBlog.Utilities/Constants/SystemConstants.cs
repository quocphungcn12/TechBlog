namespace TechBlog.Utilities.Constants
{
    public static class SystemConstants
    {
        public static class ConnectionString
        {
            public const string TechBlogDB = "TechBlogDB";
        }
        public static class JwtToken
        {
            public const string JwtTokenSettings = "JwtTokenSettings";
            public const string JwtTokenSettings_Issuer = "JwtTokenSettings:Issuer";
            public const string JwtTokenSettings_Key = "JwtTokenSettings:Key";
        }

        public static class Media
        {
            public const string MediaSetting = "MediaSetting";
        }

        public static class AppSetting
        {
            public const string AllowedOrigins = "AllowedOrigins";
        }
        public readonly static string DateCreatedField = "DateCreated";
    }
}
