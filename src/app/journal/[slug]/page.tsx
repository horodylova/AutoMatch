import { client, urlFor, Post } from "@/lib/sanity";
import { PortableText } from "@portabletext/react";
import Image from "next/image";
import styles from "../article.module.css";
import { notFound } from "next/navigation";

export const revalidate = 60;

export async function generateStaticParams() {
  const posts = await client.fetch<Post[]>(`*[_type == "post"]{ slug }`);
  return posts.map((post: Post) => ({ slug: post.slug.current }));
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await client.fetch<Post>(
    `*[_type == "post" && slug.current == $slug][0]`,
    { slug }
  );

  if (!post) {
    notFound();
  }

  return (
    <article className={styles.articleContainer}>
      <header className={styles.articleHeader}>
        <h1 className={styles.articleTitle}>{post.title}</h1>
        <p className={styles.articleDate}>
          {new Date(post.publishedAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </header>

      {post.mainImage && (
        <div className={styles.mainImageWrapper}>
           <Image
            src={urlFor(post.mainImage).url()}
            alt={post.title}
            fill
            className={styles.mainImage}
            priority
          />
        </div>
      )}

      <div className={styles.content}>
        <PortableText value={post.body} />
      </div>
    </article>
  );
}
