import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FaArrowLeft, FaCalendarAlt, FaClock } from 'react-icons/fa';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SectionWrapper from '../components/SectionWrapper';
import PageTransition from '../components/PageTransition';
import PageHeader from '../components/PageHeader';
import { publicApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import './BlogDetail.css';

export default function BlogDetail() {
  const { slug } = useParams();
  const { user } = useAuth();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const fetchArticle = async () => {
      setLoading(true);
      setHasError(false);
      try {
        const username = user?.profile?.username_slug || user?.username_slug || 'demo';
        try {
          const response = await publicApi.getBlogBySlug(username, slug);
          setArticle(response.data);
        } catch {
          // Fallback for older links that used numeric IDs.
          const listResponse = await publicApi.getBlogs(username);
          const blogList = listResponse.data?.results || listResponse.data || [];
          const matched = blogList.find(
            (item) => item.slug === slug || String(item.id) === String(slug)
          );
          if (!matched) {
            throw new Error('Article not found');
          }
          setArticle(matched);
        }
      } catch (error) {
        console.error('Failed to load blog article:', error);
        setHasError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [slug, user]);

  return (
    <PageTransition>
      <Helmet>
        <title>{article?.title ? `${article.title} | Blog` : 'Blog Article'}</title>
      </Helmet>

      <Navbar />

      <SectionWrapper className="blog-detail">
        <Link to="/blog" className="blog-detail__back">
          <FaArrowLeft /> Back to blog
        </Link>

        {loading ? (
          <div className="blog-detail__state glass">Loading article...</div>
        ) : hasError || !article ? (
          <div className="blog-detail__state glass">
            <h3>Article not found</h3>
            <p>This post may be unpublished or no longer available.</p>
          </div>
        ) : (
          <article className="blog-detail__article glass">
            <PageHeader
              align="left"
              badge="Article"
              title={article.title}
              subtitle={article.excerpt}
              className="blog-detail__header"
            />

            <div className="blog-detail__meta">
              <span>
                <FaCalendarAlt />{' '}
                {new Date(article.published_at || article.created_at).toLocaleDateString()}
              </span>
              <span>
                <FaClock /> {article.read_time || '5 min read'}
              </span>
            </div>

            {article.thumbnail && (
              <div className="blog-detail__image">
                <img src={article.thumbnail} alt={article.title} />
              </div>
            )}

            <div className="blog-detail__content">
              {(article.content || '').split('\n').filter(Boolean).map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>

            {Array.isArray(article.tags) && article.tags.length > 0 && (
              <div className="blog-detail__tags">
                {article.tags.map((tag) => (
                  <span key={tag} className="chip">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </article>
        )}
      </SectionWrapper>

      <Footer />
    </PageTransition>
  );
}
