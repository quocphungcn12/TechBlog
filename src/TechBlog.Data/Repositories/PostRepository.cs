﻿using AutoMapper;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using TechBlog.Core.Domain.Content;
using TechBlog.Core.Domain.Identity;
using TechBlog.Core.Models;
using TechBlog.Core.Models.Content;
using TechBlog.Core.Repositories;
using TechBlog.Core.SeedWorks.Constants;
using TechBlog.Data.SeedWorks;

namespace TechBlog.Data.Repositories
{
    public class PostRepository(TechBlogContext context, IMapper mapper, UserManager<AppUser> userManager) : RepositoryBase<Post, Guid>(context), IPostRepository
    {
        private readonly IMapper _mapper = mapper;
        private readonly UserManager<AppUser> _userManager = userManager;

        public async Task Approve(Guid id, Guid currentUserId)
        {
            var post = await _context.Posts.FindAsync(id) ?? throw new ArgumentException("Bài viết không tồn tại");
            var user = await _context.Users.FindAsync(currentUserId);
            await _context.PostActivityLogs.AddAsync(new PostActivityLog
            {
                Id = Guid.NewGuid(),
                FromStatus = post.Status,
                ToStatus = PostStatus.Published,
                UserId = currentUserId,
                UserName = user!.UserName,
                PostId = id,
                Note = $"{user.UserName} duyệt bài"
            });
            post.Status = PostStatus.Published;
            _context.Posts.Update(post);
        }

        public async Task<List<PostActivityLogDto>> GetActivityLogs(Guid id)
        {
            var query = _context.PostActivityLogs.Where(x => x.PostId == id)
                .OrderByDescending(x => x.DateCreated);
            return await _mapper.ProjectTo<PostActivityLogDto>(query).ToListAsync();
        }

        public async Task<PagedResult<PostInListDto>> GetAllPaging(string? keyword, Guid currentUserId, Guid? categoryId, int pageIndex = 1, int pageSize = 10)
        {
            var user = await _userManager.FindByIdAsync(currentUserId.ToString()) ?? throw new ArgumentException("User không tồn tại");
            var roles = await _userManager.GetRolesAsync(user);
            var canApprove = false;
            if (roles.Contains(Roles.Admin))
            {
                canApprove = true;
            }
            else
            {
                canApprove = await _context.RoleClaims.AnyAsync(x => roles.Contains(x.RoleId.ToString()) && x.ClaimValue == Permissions.Posts.Approve);
            }
            var query = _context.Posts.AsQueryable();
            if (!string.IsNullOrEmpty(keyword))
            {
                query = query.Where(x => x.Name.Contains(keyword));
            }
            if (categoryId.HasValue)
            {
                query = query.Where(x => x.CategoryId == categoryId.Value);
            }
            if (!canApprove)
            {
                query = query.Where(x => x.AuthorUserId == currentUserId);
            }
            var totalRows = await query.CountAsync();

            query = query.OrderByDescending(x => x.DateCreated)
                         .Skip((pageIndex - 1) * pageSize)
                         .Take(pageSize);
            return new PagedResult<PostInListDto>()
            {
                Result = await _mapper.ProjectTo<PostInListDto>(query).ToListAsync(),
                CurrentPage = pageIndex,
                RowCount = totalRows,
                PageSize = pageSize
            };
        }

        public async Task<List<SeriesInListDto>> GetAllSeries(Guid postId)
        {
            var query = from pis in _context.PostInSeries
                        join s in _context.Series
                        on pis.SeriesId equals s.Id
                        where pis.PostId == postId
                        select s;
            return await _mapper.ProjectTo<SeriesInListDto>(query).ToListAsync();
        }

        public async Task<string> GetReturnReason(Guid id)
        {
            var activity = await _context.PostActivityLogs
                .Where(x => x.PostId == id && x.ToStatus == PostStatus.Rejected)
                .FirstOrDefaultAsync();
            return activity?.Note ?? "";
        }

        public async Task<bool> HasPublishInLast(Guid id)
        {
            var hasPublished = await _context.PostActivityLogs.CountAsync(x => x.PostId == id && x.ToStatus == PostStatus.Published);
            return hasPublished > 0;
        }

        public Task<bool> IsSlugAlreadyExisted(string slug, Guid? currentId = null)
        {
            if (currentId.HasValue)
            {
                return _context.Posts.AnyAsync(x => x.Slug == slug && x.Id != currentId.Value);
            }
            return _context.Posts.AnyAsync(x => x.Slug == slug);
        }

        public async Task ReturnBack(Guid id, Guid currentUserId, string note)
        {
            var post = await _context.Posts.FindAsync(id) ?? throw new ArgumentException("Bài viết không tồn tại");
            var user = await _userManager.FindByIdAsync(currentUserId.ToString());
            await _context.PostActivityLogs.AddAsync(new PostActivityLog
            {
                FromStatus = post.Status,
                ToStatus = PostStatus.Rejected,
                UserId = currentUserId,
                UserName = user?.UserName,
                PostId = post.Id,
                Note = note
            });

            post.Status = PostStatus.Rejected;
            _context.Posts.Update(post);
        }

        public async Task SendToApprove(Guid id, Guid currentUserId)
        {
            var post = await _context.Posts.FindAsync(id) ?? throw new ArgumentException("Bài viết không tồn tại");
            var user = await _userManager.FindByIdAsync(currentUserId.ToString()) ?? throw new ArgumentException("User không tồn tại");
            await _context.PostActivityLogs.AddAsync(new PostActivityLog
            {
                FromStatus = post.Status,
                ToStatus = PostStatus.WaitingForApproval,
                UserId = currentUserId,
                PostId = post.Id,
                UserName = user!.UserName,
                Note = $"{user!.UserName} gửi bài chờ duyệt"
            });
            post.Status = PostStatus.WaitingForApproval;
            _context.Posts.Update(post);
        }

        public async Task<List<Post>> GetListUnpaidPublishPosts(Guid userId)
        {
            return await _context.Posts
                .Where(x => x.AuthorUserId == userId && !x.IsPaid && x.Status == PostStatus.Published).ToListAsync();
        }

        public async Task<List<PostInListDto>> GetLatestPublishPost(int top)
        {
            var query = _context.Posts.Where(x => x.Status == PostStatus.Published)
                .Take(top)
                .OrderByDescending(x => x.DateCreated);

            return await _mapper.ProjectTo<PostInListDto>(query).ToListAsync();
        }

        public async Task<PagedResult<PostInListDto>> GetPostByCategoryPaging(string categorySlug, int pageIndex = 1, int pageSize = 10)
        {
            var query = _context.Posts.AsQueryable();
            if (!string.IsNullOrEmpty(categorySlug))
            {
                query = query.Where(x => x.CategorySlug == categorySlug);
            }
            var totalRow = await query.CountAsync();

            query = query.OrderByDescending(x => x.DateCreated)
                        .Skip((pageIndex - 1) * pageSize)
                        .Take(pageSize);
            return new PagedResult<PostInListDto>
            {
                Result = await _mapper.ProjectTo<PostInListDto>(query).ToListAsync(),
                CurrentPage = pageIndex,
                PageSize = pageSize,
                RowCount = totalRow
            };
        }

        public async Task<PostDto> GetBySlug(string slug)
        {
            var post = await _context.Posts.FirstOrDefaultAsync(x => x.Slug == slug) ?? throw new ArgumentException($"Cannot find post with slug: {slug}");
            return _mapper.Map<PostDto>(post);
        }

        public async Task<List<string>> GetAllTags()
        {
            var query = _context.Tags.Select(x => x.Name);
            return await query.ToListAsync();
        }

        public async Task AddTagToPost(Guid postId, Guid tagId)
        {
            await _context.PostTags.AddAsync(new PostTag
            {
                PostId = postId,
                TagId = tagId
            });
        }

        public async Task<List<string>> GetTagsByPostId(Guid postId)
        {
            var query = from post in _context.Posts
                        join pt in _context.PostTags on post.Id equals pt.PostId
                        join t in _context.Tags on pt.TagId equals t.Id
                        where post.Id == postId
                        select t.Name;
            return await query.ToListAsync();
        }

        public async Task<List<TagDto>> GetTagObjectsByPostId(Guid postId)
        {
            var query = from p in _context.Posts
                        join pt in _context.PostTags on p.Id equals pt.PostId
                        join t in _context.Tags on pt.TagId equals t.Id
                        where pt.PostId == postId
                        select t;

            var totalRow = await query.CountAsync();

            return await _mapper.ProjectTo<TagDto>(query).ToListAsync();
        }

        public async Task<PagedResult<PostInListDto>> GetPostByTagPaging(string tagSlug, int pageIndex = 1, int pageSize = 10)
        {
            var query = from p in _context.Posts
                        join pt in _context.PostTags on p.Id equals pt.PostId
                        join t in _context.Tags on pt.TagId equals t.Id
                        where t.Slug == tagSlug
                        select p;

            var totalRow = await query.CountAsync();

            query = query.OrderByDescending(x => x.DateCreated)
               .Skip((pageIndex - 1) * pageSize)
               .Take(pageSize);

            return new PagedResult<PostInListDto>
            {
                Result = await _mapper.ProjectTo<PostInListDto>(query).ToListAsync(),
                CurrentPage = pageIndex,
                RowCount = totalRow,
                PageSize = pageSize
            };
        }
    }
}
