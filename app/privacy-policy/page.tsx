import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Vetra',
  description: 'Learn how Vetra collects, uses, and protects your data when using our unified AI API platform.',
};

const sections = [
  {
    title: 'Information We Collect',
    content:
      'We may collect account details, contact information, usage logs, and technical data necessary to operate and improve the platform. Sensitive credentials such as API keys should be managed securely by you.',
  },
  {
    title: 'How We Use Information',
    content:
      'Data is used to provide and secure the service, process requests, troubleshoot issues, and improve reliability and performance. Aggregated and anonymized insights may be used for analytics.',
  },
  {
    title: 'Data Sharing',
    content:
      'We do not sell personal data. We may share information with infrastructure providers and subprocessors required to deliver the service, or when required by law.',
  },
  {
    title: 'Security',
    content:
      'We implement technical and organizational safeguards to protect data. However, no system is perfectly secure; maintain strong credentials and rotate keys when necessary.',
  },
  {
    title: 'Data Retention',
    content:
      'Information is retained for as long as necessary to operate the service and comply with legal obligations. You may contact us to request deletion where applicable.',
  },
  {
    title: 'Your Choices',
    content:
      'You can update account information and revoke access tokens at any time. For questions or requests about data, email privacy@cloudgptapi.com.',
  },
  {
    title: 'Changes to This Policy',
    content:
      'We may update this Privacy Policy periodically. Continued use of the platform after changes constitutes acceptance of the updated policy.',
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 sm:pt-32 pb-16 sm:pb-24 px-4 sm:px-6 relative overflow-hidden">
      {/* Background Elements */}
      <div className="fixed inset-0 mesh-gradient opacity-60 dark:opacity-40" />
      <div className="fixed inset-0 dot-grid opacity-30" />

      <div className="max-w-4xl mx-auto relative z-10">
        <header className="mb-12 sm:mb-16 text-center sm:text-left">
          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-slate-600 dark:text-slate-400 font-medium">Last updated: January 7, 2026</p>
        </header>

        <div className="space-y-6 sm:space-y-8">
          {sections.map((section) => (
            <section 
              key={section.title} 
              className="p-6 sm:p-10 rounded-2xl sm:rounded-[2.5rem] bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/20 dark:border-slate-800/50 shadow-2xl shadow-slate-200/50 dark:shadow-none group hover:border-primary/30 transition-all duration-500"
            >
              <h2 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight group-hover:text-primary transition-colors">
                {section.title}
              </h2>
              <p className="text-sm sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                {section.content}
              </p>
            </section>
          ))}
        </div>

        <footer className="mt-16 sm:mt-24 pt-8 border-t border-slate-200 dark:border-slate-800 text-center">
          <p className="text-slate-500 text-sm">
            Questions about our privacy practices? Contact us at{' '}
            <a href="mailto:privacy@cloudgptapi.com" className="text-primary font-bold hover:underline">
              privacy@cloudgptapi.com
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
