import { Helmet } from 'react-helmet-async';
import { motion as Motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SectionWrapper from '../components/SectionWrapper';
import PageTransition from '../components/PageTransition';
import PageHeader from '../components/PageHeader';
import TestimonialsComponent from '../components/Testimonials';
import './Testimonials.css';

export default function Testimonials() {
  return (
    <PageTransition>
      <Helmet>
        <title>Testimonials | Client Reviews & Feedback</title>
        <meta name="description" content="Read what clients and colleagues say about working with me. Testimonials and reviews from successful projects." />
      </Helmet>

      <Navbar />

      <main id="main-content">
        <SectionWrapper className="testimonials-hero">
          <Motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <PageHeader
              badge="Social Proof"
              title="Client"
              highlight="Testimonials"
              subtitle="Hear from the clients and colleagues I've had the privilege to work with."
            />
          </Motion.div>
        </SectionWrapper>

        <TestimonialsComponent />
      </main>
      <Footer />
    </PageTransition>
  );
}
