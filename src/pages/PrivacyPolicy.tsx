import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Privacy Policy | Khubo';
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 z-50 bg-white border-b border-neutral-100">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={() => navigate(-1)} className="p-1">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold">Privacy Policy</h1>
        </div>
      </div>

      <div className="px-4 py-6 max-w-2xl mx-auto">
        <p className="text-sm text-neutral-500 mb-6">Last updated: June 22, 2026</p>

        <section className="mb-6">
          <h2 className="text-base font-bold mb-2">1. Information We Collect</h2>
          <p className="text-sm text-neutral-700 leading-relaxed">
            We collect information you provide directly, including your name, email, profile details, and listing information. We also collect device data, IP address, and usage patterns.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-base font-bold mb-2">2. How We Use Your Information</h2>
          <p className="text-sm text-neutral-700 leading-relaxed">
            We use your information to provide and improve the App, communicate with you, process transactions, and ensure platform safety. We do not sell your personal data to third parties.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-base font-bold mb-2">3. Information Sharing</h2>
          <p className="text-sm text-neutral-700 leading-relaxed">
            We may share your information with other users as necessary for the App's functionality (e.g., when you contact a landlord). We may also share data with service providers who assist in operating the App.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-base font-bold mb-2">4. Data Security</h2>
          <p className="text-sm text-neutral-700 leading-relaxed">
            We implement reasonable security measures to protect your data. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-base font-bold mb-2">5. Your Rights</h2>
          <p className="text-sm text-neutral-700 leading-relaxed">
            You may access, update, or delete your personal information through your account settings. You may also contact us to request a copy of your data or to opt out of certain communications.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-base font-bold mb-2">6. Cookies and Tracking</h2>
          <p className="text-sm text-neutral-700 leading-relaxed">
            We use cookies to maintain your session and improve your experience. You may disable cookies in your browser settings, though this may affect App functionality.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-base font-bold mb-2">7. Children's Privacy</h2>
          <p className="text-sm text-neutral-700 leading-relaxed">
            The App is not intended for users under 18. We do not knowingly collect information from children. If we learn that we have collected a child's data, we will delete it promptly.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-base font-bold mb-2">8. Changes to This Policy</h2>
          <p className="text-sm text-neutral-700 leading-relaxed">
            We may update this Privacy Policy from time to time. We will notify you of significant changes through the App or by email.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-base font-bold mb-2">9. Contact Us</h2>
          <p className="text-sm text-neutral-700 leading-relaxed">
            If you have questions about this Privacy Policy, please contact us at privacy@khubo.com.
          </p>
        </section>
      </div>
    </div>
  );
}