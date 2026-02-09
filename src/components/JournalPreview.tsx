import { client, urlFor, Post } from "@/lib/sanity";
import Link from "next/link";
import Image from "next/image";
import styles from "./JournalPreview.module.css";

export default async function JournalPreview() {
  const posts = await client.fetch<Post[]>(`*[_type == "post"][0...3] | order(publishedAt desc)`);

  if (!posts || posts.length === 0) return null;

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <h2 className={styles.title}>Latest from Journal</h2>
        <div className={styles.grid}>
          {posts.map((post: Post) => (
            <Link href={`/journal/${post.slug.current}`} key={post._id} className={styles.card}>
              {post.mainImage && (
                <div className={styles.imageWrapper}>
                  <Image
                    src={urlFor(post.mainImage).url()}
                    alt={post.title}
                    fill
                    className={styles.image}
                  />
                </div>
              )}
              <div className={styles.content}>
                <h3 className={styles.cardTitle}>
                  {post.title}
                </h3>
                <p className={styles.date}>
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
        <div className={styles.footer}>
          <Link href="/journal" className={styles.button}>
            View All Articles
          </Link>
        </div>
      </div>
    </section>
  );
}
