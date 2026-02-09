import { client, urlFor, Post } from "@/lib/sanity";
import { PortableText } from "@portabletext/react";
import Image from "next/image";
import Link from "next/link";
import styles from "./article.module.css";
import { SanityImageSource } from "@sanity/image-url/lib/types/types";


export const revalidate = 60;

export async function generateStaticParams() {
  const posts = await client.fetch<Post[]>(`*[_type == "post"]{ slug }`);
  return posts.map((post: Post) => ({ slug: post.slug.current }));
}

async function getPost(slug: string): Promise<Post> {
  return client.fetch(
    `*[_type == "post" && slug.current == $slug][0]{
      title,
      mainImage,
      publishedAt,
      body,
      "categories": categories[]->{title}
    }`,
    { slug }
  );
}

const components = {
  types: {
    image: ({ value }: { value: SanityImageSource & { alt?: string } }) => {
      return (
        <div className={styles.imageWrapper}>
          <Image
            src={urlFor(value).width(800).height(450).url()}
            alt={value.alt || 'Article image'}
            fill
            className={styles.image}
            sizes="(max-width: 800px) 100vw, 800px"
          />
        </div>
      );
    },
  },
};

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return (
      <div className={styles.container}>
        <Link href="/journal" className={styles.backLink}>← Back to Journal</Link>
        <h1>Post not found</h1>
      </div>
    );
  }

  return (
    <article className={styles.container}>
      <Link href="/journal" className={styles.backLink}>
        ← Back to Journal
      </Link>
      
      <header className={styles.header}>
        <h1 className={styles.title}>{post.title}</h1>
        <div className={styles.meta}>
          {post.publishedAt && (
            <time dateTime={post.publishedAt}>
              {new Date(post.publishedAt).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}
            </time>
          )}
          {post.categories && post.categories.length > 0 && (
            <span>• {post.categories.map(c => c.title).join(', ')}</span>
          )}
        </div>
      </header>

      {post.mainImage && (
        <div className={styles.imageWrapper}>
          <Image
            src={urlFor(post.mainImage).width(1200).height(675).url()}
            alt={post.title}
            fill
            className={styles.image}
            priority
          />
        </div>
      )}

      <div className={styles.body}>
        {post.body && <PortableText value={post.body} components={components} />}
      </div>
    </article>
  );
}
