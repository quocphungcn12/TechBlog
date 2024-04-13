using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using System.Net.Http.Headers;
using TechBlog.Core.ConfigOptions;

namespace TechBlog.Api.Controllers.AdminApi
{
    [Route("api/admin/[controller]")]
    [ApiController]
    public class MediaController(IWebHostEnvironment webHostEnvironment, IOptions<MediaSettings> mediaSettings) : ControllerBase
    {
        private readonly IWebHostEnvironment _webHostEnvironment = webHostEnvironment;
        private readonly MediaSettings _mediaSettings = mediaSettings.Value;

        [HttpPost]
        [AllowAnonymous]
        public IActionResult? UploadImage(string type)
        {
            var allowImageTypes = _mediaSettings.AllowImageFileTypes?.Split(",");
            var now = DateTime.Now;
            var files = Request.Form.Files;
            if (files.Count == 0)
            {
                return null;
            }
            var file = files[0];
            var fileName = ContentDispositionHeaderValue.Parse(file.ContentDisposition)?.FileName?.Trim('"');
#pragma warning disable S6605 // Collection-specific "Exists" method should be used instead of the "Any" extension
            if (allowImageTypes?.Any(x => fileName?.EndsWith(x, StringComparison.OrdinalIgnoreCase) == true) == false)
            {
                throw new ArgumentException("Không cho phép tải lên file không phải hình ảnh");
            }
#pragma warning restore S6605 // Collection-specific "Exists" method should be used instead of the "Any" extension

            var imageFolder = $@"\{_mediaSettings.ImageFolder}\images\{type}\{now:MMyyyy}";

            var folder = _webHostEnvironment.WebRootPath + imageFolder;
            if (!Directory.Exists(folder))
            {
                Directory.CreateDirectory(folder);
            }
            var filePath = Path.Combine(folder, fileName!);
            using (var fs = global::System.IO.File.Create(filePath))
            {
                file.CopyTo(fs);
                fs.Flush();
            }
            var path = Path.Combine(imageFolder, fileName!).Replace(@"\", @"/");
            return Ok(new { path });

        }
    }
}
