import { client, urlFor, Post } from "@/lib/sanity";
import Link from "next/link";
import Image from "next/image";
import styles from "./article.module.css";

export const revalidate = 60;

export default async function JournalPage() {
  const posts = await client.fetch<Post[]>(`*[_type == "post"] | order(publishedAt desc)`);

  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>Journal</h1>
      <div className={styles.journalGrid}>
        {posts.map((post: Post) => (
          <Link href={`/journal/${post.slug.current}`} key={post._id} className={styles.card}>
            {post.mainImage && (
              <div className={styles.imageWrapper}>
                 <Image
                  src={urlFor(post.mainImage).url()}
                  alt={post.title}
                  fill
                  className={styles.cardImage}
                />
              </div>
            )}
            <div className={styles.cardContent}>
              <h2 className={styles.cardTitle}>{post.title}</h2>
              <p className={styles.cardDate}>
                {new Date(post.publishedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
