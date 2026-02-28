import { useEffect, useMemo, useState } from 'react';
import { DEFAULT_ARTICLE_CONTENT } from '../constants';
import { isGoogleNewsUrl } from '../utils';

export const useArticleContent = ({
  prefilledSummary,
  prefilledUrl,
  useFullArticle,
  articleUrlOverride,
}: {
  prefilledSummary: string | null;
  prefilledUrl: string | null;
  useFullArticle: 'yes' | 'no';
  articleUrlOverride: string;
}) => {
  const [articleContent, setArticleContent] = useState(
    prefilledSummary ?? DEFAULT_ARTICLE_CONTENT
  );
  const [baseArticleContent, setBaseArticleContent] = useState(
    prefilledSummary ?? DEFAULT_ARTICLE_CONTENT
  );
  const [isFetchingArticle, setIsFetchingArticle] = useState(false);

  useEffect(() => {
    if (prefilledSummary && prefilledSummary.trim().length > 0) {
      setArticleContent(prefilledSummary);
      setBaseArticleContent(prefilledSummary);
    } else {
      setArticleContent(DEFAULT_ARTICLE_CONTENT);
      setBaseArticleContent(DEFAULT_ARTICLE_CONTENT);
    }
  }, [prefilledSummary]);

  const resolvedArticleUrl = useMemo(
    () => articleUrlOverride.trim() || prefilledUrl || '',
    [articleUrlOverride, prefilledUrl]
  );

  useEffect(() => {
    if (useFullArticle === 'yes' && resolvedArticleUrl) {
      if (!articleUrlOverride.trim() && isGoogleNewsUrl(resolvedArticleUrl)) {
        console.warn(
          'Full article fetch skipped: Google News URL needs an original article link.'
        );
        setIsFetchingArticle(false);
        return;
      }

      let cancelled = false;
      setIsFetchingArticle(true);
      fetch(`/api/fetch-article?url=${encodeURIComponent(resolvedArticleUrl)}`)
        .then(async response => {
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || `Request failed (${response.status}).`);
          }
          return response.json();
        })
        .then(data => {
          const fullContent = typeof data?.content === 'string' ? data.content : '';
          if (process.env.NODE_ENV !== 'production') {
            console.info('fetch-article result', {
              resolvedUrl: data?.resolvedUrl,
              contentLength: fullContent.length,
            });
          }
          if (!cancelled && fullContent.trim().length >= 600) {
            setArticleContent(fullContent);
          }
        })
        .catch(error => {
          if (!cancelled) {
            console.error('Failed to fetch full article content:', error);
          }
        })
        .finally(() => {
          if (!cancelled) {
            setIsFetchingArticle(false);
          }
        });

      return () => {
        cancelled = true;
      };
    }

    if (useFullArticle === 'no') {
      setArticleContent(baseArticleContent);
    }
  }, [
    useFullArticle,
    resolvedArticleUrl,
    baseArticleContent,
    articleUrlOverride,
  ]);

  return {
    articleContent,
    isFetchingArticle,
    resolvedArticleUrl,
  };
};
