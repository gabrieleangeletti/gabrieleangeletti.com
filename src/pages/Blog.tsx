// Post type definition
export type Post = {
  id: string;
  slug: string;
  title: string;
  content: string;
  timestamp: Date;
  status: "draft" | "published" | "archived";
  tags: string[];
  author?: string;
  excerpt?: string;
};

// Utility function to generate consistent colors for tags
const getTagColor = (tag: string): string => {
  const colors = [
    "badge-primary",
    "badge-secondary",
    "badge-accent",
    "badge-info",
    "badge-success",
    "badge-warning",
    "badge-error",
  ];

  // Simple hash function to consistently map tags to colors
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = ((hash << 5) - hash + tag.charCodeAt(i)) & 0xffffffff;
  }
  return colors[Math.abs(hash) % colors.length];
};

// Import blog data loading functions
import { loadBlogPosts, getPostBySlug } from "../data/blog";

// BlogPost component for displaying a single post
interface BlogPostProps {
  postSlug: string;
  posts?: Post[];
}

export const BlogPost = ({ postSlug, posts }: BlogPostProps) => {
  let post: Post | undefined;

  if (posts) {
    post = posts.find((p) => p.slug === postSlug);
  } else {
    post = postSlug ? getPostBySlug(postSlug) : undefined;
  }

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (!post) {
    return (
      <div id="blog-post" className="p-12">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-base-content mb-4">Post Not Found</h1>
          <p className="text-base-content/60 mb-8">
            The post you&apos;re looking for doesn&apos;t exist.
          </p>
          <a href="#blog" className="btn btn-primary">
            Back to Blog
          </a>
        </div>
      </div>
    );
  }

  return (
    <div id="blog-post" className="p-12">
      <div className="max-w-4xl mx-auto">
        {/* Back button */}
        <div className="mb-8">
          <a href="#blog" className="btn btn-ghost btn-sm">
            ← Back to Blog
          </a>
        </div>

        {/* Post header */}
        <header className="mb-8">
          <div className="flex flex-wrap gap-2 mb-6">
            {post.tags.map((tag) => (
              <a
                key={tag}
                href={`#!blog-tag-${tag}`}
                className={`badge ${getTagColor(tag)} hover:scale-105 transition-transform cursor-pointer`}
              >
                {tag}
              </a>
            ))}
          </div>

          <h1 className="text-5xl font-bold text-base-content mb-6 leading-tight">{post.title}</h1>

          <div className="flex items-center gap-4 text-base-content/60 mb-8">
            {post.author && (
              <>
                <span className="font-medium">By {post.author}</span>
                <span>•</span>
              </>
            )}
            <span>{formatDate(post.timestamp)}</span>
          </div>
        </header>

        {/* Post content */}
        <article className="prose prose-lg max-w-none">
          <div className="text-base-content/80 leading-relaxed text-lg space-y-6">
            {post.content.split("\n\n").map((paragraph, index) => (
              <p key={index} className="mb-6">
                {paragraph}
              </p>
            ))}
          </div>
        </article>

        {/* Post footer */}
        <footer className="mt-12 pt-8 border-t border-base-300">
          <div className="flex justify-between items-center">
            <div className="flex flex-wrap gap-2">
              <span className="text-base-content/60 text-sm">Tags:</span>
              {post.tags.map((tag) => (
                <a
                  key={tag}
                  href={`#!blog-tag-${tag}`}
                  className={`badge ${getTagColor(tag)} badge-sm hover:scale-105 transition-transform cursor-pointer`}
                >
                  {tag}
                </a>
              ))}
            </div>
            <a href="#blog" className="btn btn-primary btn-sm">
              More Posts
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
};

interface BlogProps {
  posts?: Post[];
  filterTag?: string;
}

const Blog = ({ posts, filterTag }: BlogProps) => {
  // Load posts from JSON files if not provided
  const allPosts = posts || loadBlogPosts();
  // Filter only published posts and sort by timestamp (newest first)
  let publishedPosts = allPosts
    .filter((post) => post.status === "published")
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  // Further filter by tag if specified
  if (filterTag) {
    publishedPosts = publishedPosts.filter((post) => post.tags.includes(filterTag));
  }

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getPageTitle = () => {
    if (filterTag) {
      return `Posts tagged "${filterTag}"`;
    }
    return "Blog";
  };

  const getPageSubtitle = () => {
    if (filterTag) {
      const postCount = publishedPosts.length;
      return `${postCount} post${postCount !== 1 ? "s" : ""} found with this tag.`;
    }
    return "Thoughts on software engineering, technology, and building great products.";
  };

  return (
    <div id="blog" className="p-12">
      <div className="max-w-4xl mx-auto">
        {filterTag && (
          <div className="mb-6">
            <a href="#blog" className="btn btn-ghost btn-sm">
              ← All Posts
            </a>
          </div>
        )}

        <h1 className="text-4xl font-bold text-base-content mb-2">{getPageTitle()}</h1>
        <p className="text-base-content/60 mb-12">{getPageSubtitle()}</p>

        <div className="space-y-8">
          {publishedPosts.map((post) => (
            <div
              key={post.id}
              className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className="card-body">
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.map((tag) => (
                    <a
                      key={tag}
                      href={`#!blog-tag-${tag}`}
                      className={`badge ${getTagColor(tag)} badge-sm hover:scale-105 transition-transform cursor-pointer`}
                    >
                      {tag}
                    </a>
                  ))}
                </div>

                <a
                  href={`#!blog-post-${post.slug}`}
                  className="hover:text-primary transition-colors"
                >
                  <h2 className="card-title text-2xl font-bold text-base-content mb-3">
                    {post.title}
                  </h2>
                </a>

                <div className="flex items-center gap-2 text-sm text-base-content/60 mb-4">
                  {post.author && (
                    <>
                      <span>By {post.author}</span>
                      <span>•</span>
                    </>
                  )}
                  <span>{formatDate(post.timestamp)}</span>
                </div>

                <p className="text-base-content/80 leading-relaxed mb-4">
                  {post.excerpt || post.content.substring(0, 200) + "..."}
                </p>

                <div className="card-actions justify-end">
                  <a href={`#!blog-post-${post.slug}`} className="btn btn-primary btn-sm">
                    Read More
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {publishedPosts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-base-content/60 text-lg">No published posts yet. Check back soon!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Blog;
