import { Link } from 'react-router-dom';
import PageTransition from '../components/PageTransition';
import './NotFound.css';

export default function NotFound() {
  return (
    <PageTransition>
      <div className="notfound">
        <div className="notfound__content">
          <h1 className="notfound__code">
            <span className="gradient-text">404</span>
          </h1>
          <h2 className="notfound__title">Page not found</h2>
          <p className="notfound__text">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <Link to="/" className="btn btn-primary">
            Back to Home
          </Link>
        </div>
      </div>
    </PageTransition>
  );
}
