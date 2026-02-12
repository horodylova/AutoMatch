import { client, urlFor, Post } from "@/lib/sanity";
import { PortableText } from "@portabletext/react";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import ShareButtons from "@/components/ShareButtons";
import styles from "./article.module.css";


export const revalidate = 60;

const buildFileUrl = (ref: string) => {
  const parts = ref.split('-');
  if (parts.length < 3) return undefined;
  const fileId = parts[1];
  const extension = parts[parts.length - 1];
  const projectId = client.config().projectId;
  const dataset = client.config().dataset;
  return `https://cdn.sanity.io/files/${projectId}/${dataset}/${fileId}.${extension}`;
};

interface PortableTextImage {
  asset: {
    _ref: string;
    _type: "reference";
  };
  alt?: string;
  position?: 'left' | 'right' | 'center';
  link?: string;
}

interface PortableTextVideo {
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

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  const ogImage = post.mainImage ? urlFor(post.mainImage).width(1200).height(630).url() : undefined;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://carcupid.fit';

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      url: `${baseUrl}/journal/${slug}`,
      publishedTime: post.publishedAt || post._createdAt,
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

async function getPost(slug: string): Promise<Post> {
  return client.fetch(
    `*[_type == "post" && slug.current == $slug][0]{
      title,
      mainImage,
      publishedAt,
      _createdAt,
      excerpt,
      body,
      "categories": categories[]->{title},
      tags
    }`,
    { slug }
  );
}

async function getRelatedPosts(slug: string): Promise<Post[]> {
  return client.fetch(
    `*[_type == "post" && slug.current != $slug] | order(publishedAt desc)[0...3] {
      _id,
      title,
      slug,
      mainImage,
      publishedAt
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
      let width = 1000;
      
      if (position === 'left') {
        wrapperClass = styles.imageLeft;
        width = 600;
      } else if (position === 'right') {
        wrapperClass = styles.imageRight;
        width = 600;
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
          sizes={position === 'center' ? "(max-width: 800px) 100vw, 800px" : "(max-width: 768px) 100vw, 500px"}
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
    videoBanner: ({ value }: { value: PortableTextVideo }) => {
      if (!value?.asset?._ref) {
        return null;
      }
      
      const videoUrl = buildFileUrl(value.asset._ref);
      if (!videoUrl) return null;

      const position = value.position || 'center';
      let wrapperClass = styles.imageCenter;
      
      if (position === 'left') {
        wrapperClass = styles.imageLeft;
      } else if (position === 'right') {
        wrapperClass = styles.imageRight;
      }

      const videoElement = (
        <video
          src={videoUrl}
          autoPlay
          loop
          muted
          playsInline
          className={styles.image}
          style={{
            width: '100%',
            height: 'auto',
            display: 'block'
          }}
          aria-label={value.alt || 'Video banner'}
        />
      );

      return (
        <div className={wrapperClass}>
          {value.link ? (
            <Link href={value.link} target={value.link.startsWith('http') ? '_blank' : undefined} rel={value.link.startsWith('http') ? 'noopener noreferrer' : undefined}>
              {videoElement}
            </Link>
          ) : (
            videoElement
          )}
        </div>
      );
    },
  },
};

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  const relatedPosts = await getRelatedPosts(slug);

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

      <ShareButtons 
        url={`${process.env.NEXT_PUBLIC_BASE_URL || 'https://carcupid.fit'}/journal/${slug}`} 
        title={post.title} 
      />

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

      {relatedPosts.length > 0 && (
        <div className={styles.readAlso}>
          <h3 className={styles.readAlsoTitle}>Read Also</h3>
          <div className={styles.readAlsoGrid}>
            {relatedPosts.map((relatedPost) => (
              <Link href={`/journal/${relatedPost.slug.current}`} key={relatedPost._id} className={styles.readAlsoCard}>
                <div className={styles.readAlsoImageWrapper}>
                  {relatedPost.mainImage && (
                    <Image
                      src={urlFor(relatedPost.mainImage).width(400).height(225).url()}
                      alt={relatedPost.title}
                      fill
                      className={styles.readAlsoImage}
                    />
                  )}
                </div>
                <div className={styles.readAlsoContent}>
                  <h4 className={styles.readAlsoCardTitle}>{relatedPost.title}</h4>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
