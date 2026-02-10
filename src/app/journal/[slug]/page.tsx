import { client, urlFor, Post } from "@/lib/sanity";
import { PortableText } from "@portabletext/react";
import Image from "next/image";
import Link from "next/link";
import styles from "./article.module.css";


export const revalidate = 60;

interface PortableTextImage {
  asset: {
    _ref: string;
    _type: "reference";
  };
  alt?: string;
  position?: 'left' | 'right' | 'center';
  link?: string;
}

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
      _createdAt,
      body,
      "categories": categories[]->{title},
      tags
    }`,
    { slug }
  );
}

const components = {
  types: {
    image: ({ value }: { value: PortableTextImage }) => {
      if (!value?.asset) {
        return null;
      }
      
      const position = value.position || 'center';
      let wrapperClass = styles.imageCenter;
      let width = 800;
      
      if (position === 'left') {
        wrapperClass = styles.imageLeft;
        width = 400;
      } else if (position === 'right') {
        wrapperClass = styles.imageRight;
        width = 400;
      } else {
        wrapperClass = styles.imageWrapper;
      }

      const imageElement = (
        <Image
          src={urlFor(value).width(width).url()}
          alt={value.alt || 'Article image'}
          width={width}
          height={Math.round(width * 0.75)} // Default aspect ratio fallback
          className={styles.image}
          style={{
            width: '100%',
            height: 'auto',
          }}
          sizes={position === 'center' ? "(max-width: 800px) 100vw, 800px" : "(max-width: 768px) 100vw, 400px"}
        />
      );

      return (
        <div className={wrapperClass}>
          {value.link ? (
            <Link href={value.link} target={value.link.startsWith('http') ? '_blank' : undefined} rel={value.link.startsWith('http') ? 'noopener noreferrer' : undefined}>
              {imageElement}
            </Link>
          ) : (
            imageElement
          )}
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
          <time dateTime={post.publishedAt || post._createdAt}>
            {new Date(post.publishedAt || post._createdAt).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })}
          </time>
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

      {post.tags && post.tags.length > 0 && (
        <div className={styles.tags}>
          {post.tags.map((tag) => (
            <span key={tag} className={styles.tag}>
              #{tag}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}
