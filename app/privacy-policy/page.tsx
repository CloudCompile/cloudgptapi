import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | CloudGPT',
  description: 'Learn how CloudGPT collects, uses, and protects your data when using our unified AI API platform.',
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
    <div className="container mx-auto max-w-4xl px-4 py-16">
      <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
      <p className="text-slate-600 dark:text-slate-400 mb-10">Last updated: January 7, 2026</p>

      <div className="space-y-8">
        {sections.map((section) => (
          <section key={section.title} className="space-y-3">
            <h2 className="text-2xl font-semibold">{section.title}</h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{section.content}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
