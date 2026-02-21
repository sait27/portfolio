import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { FaCalendarAlt, FaClock, FaArrowRight, FaTag } from 'react-icons/fa';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SectionWrapper from '../components/SectionWrapper';
import PageTransition from '../components/PageTransition';
import PageHeader from '../components/PageHeader';
import { publicApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import './Blog.css';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};

export default function Blog() {
  const { user } = useAuth();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState('all');

  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true);
      try {
        const username = user?.profile?.username_slug || 'demo';
        const response = await publicApi.getBlogs(username);
        const blogsData = response.data?.results || response.data || [];
        setArticles(Array.isArray(blogsData) ? blogsData : []);
      } catch (error) {
        console.error('Failed to fetch blogs:', error);
        setArticles([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBlogs();
  }, [user]);

  const allTags = ['all', ...new Set(articles.flatMap(article => article.tags || []))];
  const filteredArticles = selectedTag === 'all' 
    ? articles 
    : articles.filter(article => article.tags && article.tags.includes(selectedTag));

  return (
    <PageTransition>
      <Helmet>
        <title>Blog | Technical Articles & Insights</title>
        <meta name="description" content="Technical articles, tutorials, and insights on web development, programming, and technology." />
      </Helmet>

      <Navbar />

      <SectionWrapper className="blog-hero">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <PageHeader
            badge="Writing"
            title="Technical"
            highlight="Blog"
            subtitle="Sharing insights, tutorials, and lessons learned from my development journey."
          />
        </motion.div>
      </SectionWrapper>

      <SectionWrapper>
        {/* Tag Filter */}
        <motion.div 
          className="blog-filters"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {allTags.map(tag => (
            <button
              key={tag}
              className={`blog-filter ${selectedTag === tag ? 'active' : ''}`}
              onClick={() => setSelectedTag(tag)}
            >
              <FaTag /> {tag === 'all' ? 'All Articles' : tag}
            </button>
          ))}
        </motion.div>

        {/* Articles Grid */}
        <div className="blog-grid">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="blog-card glass">
                <div className="blog-card__skeleton">
                  <div className="skeleton-img"></div>
                  <div className="skeleton-content">
                    <div className="skeleton-line"></div>
                    <div className="skeleton-line short"></div>
                    <div className="skeleton-line"></div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            filteredArticles.map((article, i) => (
              <motion.article
                key={article.id}
                className="blog-card glass"
                initial="hidden"
                whileInView="visible"
                variants={fadeUp}
                custom={i}
                viewport={{ once: true }}
                whileHover={{ y: -8 }}
              >
                <div className="blog-card__image">
                  <img src={article.thumbnail || `https://via.placeholder.com/600x300/16161f/7c3aed?text=${encodeURIComponent(article.title)}`} alt={article.title} />
                  <div className="blog-card__overlay">
                    <Link to={`/blog/${article.slug || article.id}`} className="btn btn-primary btn-sm">
                      Read Article <FaArrowRight />
                    </Link>
                  </div>
                </div>
                
                <div className="blog-card__content">
                  <div className="blog-card__meta">
                    <span className="blog-card__date">
                      <FaCalendarAlt /> {new Date(article.published_at || article.created_at).toLocaleDateString()}
                    </span>
                    <span className="blog-card__read-time">
                      <FaClock /> {article.read_time || '5 min read'}
                    </span>
                  </div>
                  
                  <h2 className="blog-card__title">
                    <Link to={`/blog/${article.slug || article.id}`}>{article.title}</Link>
                  </h2>
                  
                  <p className="blog-card__excerpt">{article.excerpt}</p>
                  
                  <div className="blog-card__tags">
                    {article.tags && article.tags.map(tag => (
                      <span key={tag} className="chip">{tag}</span>
                    ))}
                  </div>
                </div>
              </motion.article>
            ))
          )}
        </div>

        {filteredArticles.length === 0 && !loading && (
          <div className="blog-empty glass">
            <h3>No articles found</h3>
            <p>No articles match the selected filter. Try selecting a different tag.</p>
          </div>
        )}
      </SectionWrapper>

      <Footer />
    </PageTransition>
  );
}
