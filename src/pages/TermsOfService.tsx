import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function TermsOfService() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Terms of Service | Khubo';
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 z-50 bg-white border-b border-neutral-100">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={() => navigate(-1)} className="p-1">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold">Terms of Service</h1>
        </div>
      </div>

      <div className="px-4 py-6 max-w-2xl mx-auto">
        <p className="text-sm text-neutral-500 mb-6">Last updated: June 22, 2026</p>

        <section className="mb-6">
          <h2 className="text-base font-bold mb-2">1. Acceptance of Terms</h2>
          <p className="text-sm text-neutral-700 leading-relaxed">
            By accessing or using Khubo ("the App"), you agree to be bound by these Terms of Service. If you do not agree, please do not use the App.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-base font-bold mb-2">2. Description of Service</h2>
          <p className="text-sm text-neutral-700 leading-relaxed">
            Khubo is a platform that connects tenants with landlords for room and apartment rentals. The App provides search, listing, messaging, and booking features.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-base font-bold mb-2">3. User Accounts</h2>
          <p className="text-sm text-neutral-700 leading-relaxed">
            You must provide accurate information when creating an account. You are responsible for maintaining the confidentiality of your credentials and for all activities under your account.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-base font-bold mb-2">4. User Responsibilities</h2>
          <p className="text-sm text-neutral-700 leading-relaxed">
            You agree not to: post false or misleading listings, harass other users, use the App for illegal purposes, or attempt to gain unauthorized access to other accounts or systems.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-base font-bold mb-2">5. Listings and Transactions</h2>
          <p className="text-sm text-neutral-700 leading-relaxed">
            Khubo is not a party to any rental agreement between tenants and landlords. We do not guarantee the accuracy of listings or the conduct of users. All transactions are between users.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-base font-bold mb-2">6. Intellectual Property</h2>
          <p className="text-sm text-neutral-700 leading-relaxed">
            All content, trademarks, and materials in the App are owned by Khubo or its licensors. You may not copy, modify, or distribute any content without prior written consent.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-base font-bold mb-2">7. Limitation of Liability</h2>
          <p className="text-sm text-neutral-700 leading-relaxed">
            Khubo is provided "as is" without warranties. We are not liable for any damages arising from your use of the App, including but not limited to loss of data or property.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-base font-bold mb-2">8. Termination</h2>
          <p className="text-sm text-neutral-700 leading-relaxed">
            We may suspend or terminate your account at any time for violations of these Terms or for any other reason at our discretion.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-base font-bold mb-2">9. Changes to Terms</h2>
          <p className="text-sm text-neutral-700 leading-relaxed">
            We reserve the right to update these Terms at any time. Continued use of the App after changes constitutes acceptance of the new Terms.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-base font-bold mb-2">10. Contact Us</h2>
          <p className="text-sm text-neutral-700 leading-relaxed">
            For questions about these Terms, please contact us at support@khubo.com.
          </p>
        </section>
      </div>
    </div>
  );
}