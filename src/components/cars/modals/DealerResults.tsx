"use client";

import { useState } from "react";
import styles from "./DealerResults.module.css";

export interface DealerResult {
  title: string;
  link: string;
  snippet: string;
  displayLink?: string;
  pagemap?: {
    cse_image?: { src: string }[];
    cse_thumbnail?: { src: string }[];
  };
  source?: string;
}

interface Props {
  results: DealerResult[];
  location: string;
  onBack: () => void;
}

export default function DealerResults({ results, location, onBack }: Props) {
  const [currentPage, setCurrentPage] = useState(1);
  const RESULTS_PER_PAGE = 5;
  
  const totalPages = Math.ceil(results.length / RESULTS_PER_PAGE);
  const startIndex = (currentPage - 1) * RESULTS_PER_PAGE;
  const currentResults = results.slice(startIndex, startIndex + RESULTS_PER_PAGE);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    const container = document.querySelector(`.${styles.resultsList}`);
    if (container) container.scrollTop = 0;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.title}>
          {results.length} Dealers near {location}
        </div>
        <button onClick={onBack} className={styles.backBtn}>
          Change Location
        </button>
      </div>

      <div className={styles.resultsList}>
        {currentResults.map((result, idx) => {
          const imageSrc = 
            result.pagemap?.cse_image?.[0]?.src || 
            result.pagemap?.cse_thumbnail?.[0]?.src;

          return (
            <a 
              key={idx} 
              href={result.link} 
              target="_blank" 
              rel="noopener noreferrer" 
              className={styles.resultItem}
            >
              {imageSrc && (
                <img 
                  src={imageSrc} 
                  alt={result.title} 
                  className={styles.resultImage}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              )}
              <div className={styles.resultContent}>
                <div className={styles.resultTitle}>{result.title}</div>
                <div className={styles.resultLink}>{result.displayLink || result.link}</div>
                <div className={styles.resultSnippet}>{result.snippet}</div>
              </div>
            </a>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button 
            className={styles.pageBtn}
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            Prev
          </button>
          <span className={styles.pageInfo}>
            Page {currentPage} of {totalPages}
          </span>
          <button 
            className={styles.pageBtn}
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
