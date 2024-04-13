using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Swashbuckle.AspNetCore.SwaggerGen;
using System.Reflection;
using System.Text;
using TechBlog.Api;
using TechBlog.Api.Authorization;
using TechBlog.Api.Fillters;
using TechBlog.Api.Services;
using TechBlog.Core.ConfigOptions;
using TechBlog.Core.Domain.Identity;
using TechBlog.Core.Models.Content;
using TechBlog.Core.SeedWorks;
using TechBlog.Core.Services;
using TechBlog.Data;
using TechBlog.Data.Repositories;
using TechBlog.Data.SeedWorks;
using TechBlog.Data.Services;
using TechBlog.Utilities.Constants;

var builder = WebApplication.CreateBuilder(args);
var TechBlogCorsPolicy = "TechBlogCorsPolicy";

builder.Services.AddSingleton<IAuthorizationPolicyProvider, PermissionPolicyProvider>();
builder.Services.AddScoped<IAuthorizationHandler, PermissionAuthorizationHandler>();
// add cors
builder.Services.AddCors(x => x.AddPolicy(TechBlogCorsPolicy, build =>
{
    build.AllowAnyMethod()
    .AllowAnyHeader()
    .WithOrigins(builder.Configuration[SystemConstants.AppSetting.AllowedOrigins] ?? "")
    .AllowCredentials();
}));

//Config DB Context and ASP.NET Core Identity
builder.Services.AddDbContext<TechBlogContext>(option => option.UseSqlServer(builder.Configuration.GetConnectionString(SystemConstants.ConnectionString.TechBlogDB)));

builder.Services.AddIdentity<AppUser, AppRole>(options => options.SignIn.RequireConfirmedAccount = false)
    .AddEntityFrameworkStores<TechBlogContext>();

builder.Services.Configure<IdentityOptions>(options =>
{
    // password setting
    options.Password.RequireDigit = true;
    options.Password.RequireLowercase = true;
    options.Password.RequireNonAlphanumeric = true;
    options.Password.RequireUppercase = true;
    options.Password.RequiredLength = 6;
    options.Password.RequiredUniqueChars = 1;

    // Lockout settings.
    options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(5);
    options.Lockout.MaxFailedAccessAttempts = 5;
    options.Lockout.AllowedForNewUsers = true;

    // User setting
    options.User.AllowedUserNameCharacters =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._@+";
    options.User.RequireUniqueEmail = false;
});

// Add services to the container.
builder.Services.AddScoped(typeof(IRepository<,>), typeof(RepositoryBase<,>));
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();

// Business services and repositories
#pragma warning disable S6605 // Collection-specific "Exists" method should be used instead of the "Any" extension
var services = typeof(PostRepository).Assembly.GetTypes()
      .Where(x => x.GetInterfaces().Any(i => i.Name == typeof(IRepository<,>).Name)
    && !x.IsAbstract && x.IsClass && !x.IsGenericType);
#pragma warning restore S6605 // Collection-specific "Exists" method should be used instead of the "Any" extension

foreach (Type service in services)
{
    var allInterface = service.GetInterfaces();
    var directInterface = allInterface.Except(allInterface.SelectMany(x => x.GetInterfaces())).FirstOrDefault();
    if( directInterface != null)
    {
        builder.Services.Add(new ServiceDescriptor(directInterface, service, ServiceLifetime.Scoped));
    }
}
// auto mapper
builder.Services.AddAutoMapper(typeof(PostInListDto));

// author
builder.Services.Configure<JwtTokenSettings>(builder.Configuration.GetSection(SystemConstants.JwtToken.JwtTokenSettings));
builder.Services.Configure<MediaSettings>(builder.Configuration.GetSection(SystemConstants.Media.MediaSetting));

builder.Services.AddScoped<SignInManager<AppUser>, SignInManager<AppUser>>();
builder.Services.AddScoped<UserManager<AppUser>, UserManager<AppUser>>();
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<RoleManager<AppRole>, RoleManager<AppRole>>();
builder.Services.AddScoped<IRoyaltyService, RoyaltyService>();

//Default config for ASP.NET Core
builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.CustomOperationIds(apiDesc =>
    {
        return apiDesc.TryGetMethodInfo(out MethodInfo methodInfo) ? methodInfo.Name : null;
    });
    c.SwaggerDoc("AdminAPI", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Version = "v1",
        Title = "API for Administrators",
        Description = "API for CMS core domain. This domain keeps track of campaigns, campaign rules, and campaign execution."
    });
    c.ParameterFilter<SwaggerNullableParameterFilter>();
});

builder.Services.AddAuthentication(x =>
{
    x.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    x.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer(cfg =>
{
    cfg.RequireHttpsMetadata = false;
    cfg.SaveToken = true;
    cfg.TokenValidationParameters = new TokenValidationParameters
    {
        ValidIssuer = builder.Configuration[SystemConstants.JwtToken.JwtTokenSettings_Issuer],
        ValidAudience = builder.Configuration[SystemConstants.JwtToken.JwtTokenSettings_Issuer],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration[SystemConstants.JwtToken.JwtTokenSettings_Key]!))
    };
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment() || app.Environment.IsProduction())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("AdminAPI/swagger.json", "Admin API");
        c.DisplayOperationId();
        c.DisplayRequestDuration();
    });
}

app.UseStaticFiles();

app.UseCors(TechBlogCorsPolicy);

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
// seed data
app.MigrateDatabase();

app.Run();
