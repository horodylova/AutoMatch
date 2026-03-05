import { client, urlFor, Post } from "@/lib/sanity";
import Link from "next/link";
import Image from "next/image";
import styles from "./journal.module.css";
import { groq } from "next-sanity";
import JournalViewTracker from "@/components/JournalViewTracker";

export const revalidate = 60;

async function getJournalPosts() {
  return client.fetch(groq`
    *[_type == "post"] | order(isFeatured desc, _updatedAt desc, coalesce(publishedAt, _createdAt) desc) {
      _id,
      title,
      slug,
      mainImage,
      publishedAt,
      excerpt,
      isFeatured,
      "categories": categories[]->{title}
    }
  `);
}

export default async function JournalPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const posts: Post[] = await getJournalPosts();
  
  // Find the first featured post, or default to the first post if none are featured
  const featuredArticle = posts.find(a => a.isFeatured) || posts[0];
  
  // Filter out the featured article from the regular list
  const allRegularArticles = posts.filter(a => a._id !== featuredArticle?._id);

  // Pagination Logic
  const pageParam = params?.page;
  const currentPage = typeof pageParam === 'string' ? parseInt(pageParam, 10) : 1;
  const page = isNaN(currentPage) || currentPage < 1 ? 1 : currentPage;
  const ITEMS_PER_PAGE = 6;
  
  const totalPages = Math.ceil(allRegularArticles.length / ITEMS_PER_PAGE);
  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentRegularArticles = allRegularArticles.slice(startIndex, endIndex);

  return (
    <div className={styles.page}>
      <JournalViewTracker />
      <div className={styles.content}>
        
        <div className={styles.grid}>
          {/* Featured Article - Only show on first page */}
          {page === 1 && featuredArticle && (
            <Link href={`/journal/${featuredArticle.slug.current}`} className={styles.featured}>
              <div className={styles.featuredImageWrapper}>
                {featuredArticle.mainImage && (
                  <Image
                    src={urlFor(featuredArticle.mainImage).width(1200).height(800).url()}
                    alt={featuredArticle.title}
                    fill
                    className={styles.featuredImage}
                    priority
                  />
                )}
              </div>
              <div className={styles.featuredContent}>
                <span className={styles.featuredLabel}>Featured Story</span>
                <h2 className={styles.featuredTitle}>{featuredArticle.title}</h2>
                <p className={styles.featuredExcerpt}>{featuredArticle.excerpt}</p>
                <div className={styles.readMore}>
                  Read Full Story
                  <svg className={styles.arrow} width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 5L19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </Link>
          )}

          {/* Regular Articles */}
          {currentRegularArticles.map((article) => (
            <Link key={article._id} href={`/journal/${article.slug.current}`} className={styles.card}>
              <div className={styles.imageWrapper}>
                {article.mainImage && (
                  <Image
                    src={urlFor(article.mainImage).width(600).height(400).url()}
                    alt={article.title}
                    fill
                    className={styles.image}
                  />
                )}
              </div>
              <div className={styles.cardBody}>
                <span className={styles.category}>
                  {article.categories && article.categories.length > 0 ? article.categories[0].title : "Journal"}
                </span>
                <h3 className={styles.cardTitle}>{article.title}</h3>
                <p className={styles.cardExcerpt}>{article.excerpt}</p>
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

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className={styles.pagination}>
            {page > 1 && (
              <Link href={`/journal?page=${page - 1}`} className={styles.navButton}>
                Previous
              </Link>
            )}
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <Link 
                key={pageNum} 
                href={`/journal?page=${pageNum}`}
                className={`${styles.pageButton} ${pageNum === page ? styles.activePage : ''}`}
              >
                {pageNum}
              </Link>
            ))}

            {page < totalPages && (
              <Link href={`/journal?page=${page + 1}`} className={styles.navButton}>
                Next
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
