import { Post } from "../../pages/Blog";

import cleanCodePost from "./the-art-of-clean-code.json";
import scalableWebPost from "./building-scalable-web-applications.json";

interface PostJsonData {
  id: string;
  slug: string;
  title: string;
  content: string;
  timestamp: string;
  status: "draft" | "published" | "archived";
  tags: string[];
  author?: string;
  excerpt?: string;
}

const convertJsonToPost = (jsonData: PostJsonData): Post => ({
  ...jsonData,
  timestamp: new Date(jsonData.timestamp),
});

export const loadBlogPosts = (): Post[] => {
  const posts = [
    convertJsonToPost(cleanCodePost as PostJsonData),
    convertJsonToPost(scalableWebPost as PostJsonData),
  ];

  return posts;
};

export const getPostBySlug = (slug: string): Post | undefined => {
  const posts = loadBlogPosts();
  return posts.find((post) => post.slug === slug);
};
