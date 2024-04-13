﻿using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TechBlog.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddPostFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AuthorName",
                table: "Posts",
                type: "nvarchar(250)",
                maxLength: 250,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AuthorUserName",
                table: "Posts",
                type: "nvarchar(250)",
                maxLength: 250,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CategoryName",
                table: "Posts",
                type: "nvarchar(250)",
                maxLength: 250,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "CategorySlug",
                table: "Posts",
                type: "varchar(250)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "UserName",
                table: "PostActivityLogs",
                type: "nvarchar(250)",
                maxLength: 250,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AuthorName",
                table: "Posts");

            migrationBuilder.DropColumn(
                name: "AuthorUserName",
                table: "Posts");

            migrationBuilder.DropColumn(
                name: "CategoryName",
                table: "Posts");

            migrationBuilder.DropColumn(
                name: "CategorySlug",
                table: "Posts");

            migrationBuilder.DropColumn(
                name: "UserName",
                table: "PostActivityLogs");
        }
    }
}
