import React from 'react';
import { useRouter } from 'next/router';
import { Manrope, Playfair_Display } from 'next/font/google';
import { FirebaseProvider } from '../contexts/FirebaseContext';
import { AdminProvider } from '../contexts/AdminContext';
import ErrorBoundary from '../components/ErrorBoundary';
import '../styles/globals.css';

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-manrope',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-playfair',
});

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const isAdminRoute = router.pathname.startsWith('/admin-dashboard');

  // Wrap admin routes with AdminProvider
  const content = isAdminRoute ? (
    <AdminProvider>
      <Component {...pageProps} />
    </AdminProvider>
  ) : (
    <Component {...pageProps} />
  );

  return (
    <ErrorBoundary>
      <FirebaseProvider>
        <div className={`${manrope.variable} ${playfair.variable} ${manrope.className}`}>
          {content}
        </div>
        <style jsx global>{`
          .remmic-tag {
            position: relative;
            display: inline-block;
            transition: color 0.2s ease;
          }

          .remmic-tag::after {
            content: '';
            position: absolute;
            left: 0;
            bottom: -2px;
            width: 100%;
            height: 2px;
            background: #c9a227;
            transform: scaleX(0);
            transform-origin: left;
            transition: transform 0.2s ease;
          }

          .remmic-tag:hover {
            color: #c9a227;
          }

          .remmic-tag:hover::after {
            transform: scaleX(1);
          }

          .cover-image,
          .utility-page-content,
          .style-guide-content-wrapper,
          .style-guide-menu,
          .change-log-content,
          ._404-component,
          .login-form-block,
          .sign-up-form-block,
          .forgot-password-component,
          .confirm-email-component,
          .trust-image-wrapper,
          .process-card,
          .cta-component,
          .feature-card,
          .price-card.first,
          .blog-card,
          .footer-component,
          .about-image,
          .team-card,
          .contact-form-block,
          .office-info-card,
          .terms-and-conditions-component,
          .privacy-policy-component,
          .team-details-component,
          .blog-details-image,
          .blog-details-first-image,
          .price-table-list-wrapper {
            border-color: #c9a227 !important;
            border-width: 4px !important;
          }

          .footer-social-link-circle,
          .team-social-link-circle {
            position: relative;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
          }

          .footer-social-link-circle img,
          .team-social-link-circle img {
            transition: opacity 0.2s ease;
            display: block;
          }

          .footer-social-link-circle .hover-social-link,
          .team-social-link-circle .hover-social-link {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            opacity: 0;
            pointer-events: none;
          }

          .footer-social-link-circle:hover .social-link,
          .team-social-link-circle:hover .social-link {
            opacity: 0;
          }

          .footer-social-link-circle:hover .hover-social-link,
          .team-social-link-circle:hover .hover-social-link {
            opacity: 1;
          }

          .team-arrow-wrapper {
            transition: background 0.2s ease, border-color 0.2s ease;
            border-color: #c9a227;
          }

          .team-arrow-wrapper img {
            transition: filter 0.2s ease;
          }

          .team-arrow-wrapper:hover {
            background: rgba(255, 94, 1, 0.12);
            border-color: #c9a227;
          }

          .team-arrow-wrapper:hover img {
            filter: invert(34%) sepia(87%) saturate(2407%) hue-rotate(4deg) brightness(100%) contrast(101%);
          }
        `}</style>
      </FirebaseProvider>
    </ErrorBoundary>
  );
}
