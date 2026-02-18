import PageTransition from '../components/PageTransition';

export default function Contact() {
  return (
    <PageTransition>
      <div style={{ minHeight: '100vh', paddingTop: '6rem' }}>
        <div className="container" style={{ textAlign: 'center', paddingTop: '4rem' }}>
          <h1 className="section-title">
            <span className="gradient-text">Contact</span>
          </h1>
          <p className="section-subtitle" style={{ margin: '1rem auto' }}>
            The Contact page will be built in Phase 4.
          </p>
        </div>
      </div>
    </PageTransition>
  );
}
