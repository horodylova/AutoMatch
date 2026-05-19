import Link from "next/link";
import Image from "next/image";
import styles from "./JournalPreview.module.css";
import { client, urlFor, Post } from "@/lib/sanity";
export default async function JournalPreview() {
  const posts = await client.fetch<Post[]>(
    `*[
      _type == "post" &&
      defined(slug.current) &&
      !(_id in path("drafts.**")) &&
      (!defined(publishedAt) || publishedAt <= now())
    ] | order(coalesce(publishedAt, _createdAt) desc)[0...3] {
      _id,
      title,
      slug,
      mainImage,
      publishedAt,
      excerpt,
      categories[]->{title}
    }`
  );

  if (!posts || posts.length === 0) return null;

  return (
    <section className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <div className={styles.titleGroup}>
            <span className={styles.label}>CarCupid Journal</span>
            <h2 className={styles.title}>Stories & Insights for Smart Drivers</h2>
          </div>
          <Link href="/journal" className={styles.viewAll}>
            View All Articles
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 5L19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </div>

        <div className={styles.grid}>
          {posts.map((post) => (
            <Link key={post._id} href={`/journal/${post.slug.current}`} className={styles.card}>
              <div className={styles.imageWrapper}>
                {post.mainImage && (
                  <Image
                    src={urlFor(post.mainImage).width(600).height(400).url()}
                    alt={post.title}
                    fill
                    className={styles.image}
                    unoptimized
                  />
                )}
              </div>
              <div className={styles.cardBody}>
                <span className={styles.category}>
                  {post.categories && post.categories.length > 0 ? post.categories[0].title : "Journal"}
                </span>
                <h3 className={styles.cardTitle}>{post.title}</h3>
                <p className={styles.cardExcerpt}>{post.excerpt}</p>
                <div className={styles.readMore}>
                  Read Article
                  <svg className={styles.arrow} width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 5L19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
