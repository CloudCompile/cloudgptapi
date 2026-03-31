import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Vetra',
  description: 'Learn how Vetra collects, uses, and protects your data when using our unified AI API platform.',
};

const sections = [
  {
    title: 'Information We Collect',
    content:
      'We may collect account details such as your name, email address, and company information when you sign up. We also collect usage logs including API request data, response times, and model selection. Technical data collected includes browser type, device information, IP address, and cookies. When you integrate third-party API keys, we process the necessary credentials to facilitate requests on your behalf.',
  },
  {
    title: 'How We Use Information',
    content:
      'Data is used to provide and secure the service, process API requests, troubleshoot issues, and improve reliability and performance. Your email may be used to send account-related notifications, billing updates, and product announcements. Aggregated and anonymized usage insights may be used for analytics and product improvement. We never use your API requests or prompts to train external AI models.',
  },
  {
    title: 'Data Sharing',
    content:
      'We do not sell personal data. We may share information with trusted infrastructure providers (cloud hosting, database services, payment processors) required to deliver the service. Subprocessors are bound by data protection agreements. We may disclose information when required by law, to enforce our terms, or protect rights, safety, or property. Any AI provider API keys you add are processed solely for request routing and are never shared with third parties.',
  },
  {
    title: 'Security',
    content:
      'We implement industry-standard technical and organizational safeguards including encryption in transit and at rest, regular security audits, access controls, and monitoring. API keys are stored encrypted. However, no system is perfectly secure; we recommend maintaining strong credentials, rotating keys periodically, and not sharing keys publicly. Report security vulnerabilities through our Discord community.',
  },
  {
    title: 'Data Retention',
    content:
      'Information is retained for as long as necessary to operate the service and comply with legal obligations. Account data is deleted upon account termination. API request logs are retained for 30 days for debugging purposes. You may request deletion of your personal data at any time through our Discord community, subject to legal retention requirements.',
  },
  {
    title: 'Your Choices',
    content:
      'You can update account information through your dashboard settings. You may revoke access tokens and disconnect integrations at any time. For Pro and Ultra subscribers, you can manage or cancel your subscription through the dashboard or Stripe portal. For questions or requests about data (access, correction, deletion), join our Discord community.',
  },
  {
    title: 'Cookies',
    content:
      'We use essential cookies for authentication and session management. Analytics cookies help us understand usage patterns. You can control cookies through browser settings, though disabling essential cookies may affect service functionality. Our Stripe payment processor sets its own cookies for payment processing.',
  },
  {
    title: 'Children\'s Privacy',
    content:
      'Our service is not intended for children under 16. We do not knowingly collect data from children. If you believe a child has provided personal data, contact us immediately to remove it.',
  },
  {
    title: 'International Data Transfer',
    content:
      'Your data may be processed on servers in various countries. We ensure appropriate safeguards (Standard Contractual Clauses, adequacy decisions) for international transfers in compliance with GDPR and other regulations.',
  },
  {
    title: 'Changes to This Policy',
    content:
      'We may update this Privacy Policy periodically. Material changes will be notified via email or dashboard notice. Continued use of the platform after changes constitutes acceptance of the updated policy. This policy was last updated: March 31, 2026.',
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
          <p className="text-slate-600 dark:text-slate-400 font-medium">Last updated: March 31, 2026</p>
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
            Questions about our privacy practices? Join our{' '}
            <a href="https://discord.gg/f7xR8qga" target="_blank" rel="noopener noreferrer" className="text-primary font-bold hover:underline">
              Discord community
            </a>
            {' '}&bull;{' '}
            <a href="/terms-of-service" className="text-primary font-bold hover:underline">
              Terms of Service
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
