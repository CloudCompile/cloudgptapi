import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | CloudGPT',
  description: 'Read the Terms of Service for CloudGPT and learn how you can use our unified AI API platform.',
};

const sections = [
  {
    title: 'Acceptance of Terms',
    content:
      'By accessing or using CloudGPT, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree, do not use the platform.',
  },
  {
    title: 'Use of the Service',
    content:
      'You may only use the APIs in compliance with all applicable laws and for lawful purposes. You are responsible for any content generated through your usage and must not abuse, misuse, or attempt to circumvent platform safeguards.',
  },
  {
    title: 'Accounts and Security',
    content:
      'You are responsible for maintaining the confidentiality of your credentials and for all activities that occur under your account. Notify us immediately of any unauthorized access or security concerns.',
  },
  {
    title: 'Data and Availability',
    content:
      'We strive to provide reliable access to our services, but uptime is not guaranteed. We may modify, suspend, or discontinue features with or without notice.',
  },
  {
    title: 'Limitation of Liability',
    content:
      'CloudGPT is provided “as is” without warranties of any kind. To the maximum extent permitted by law, CloudCompile is not liable for any indirect, incidental, or consequential damages arising from your use of the service.',
  },
  {
    title: 'Changes to These Terms',
    content:
      'We may update these Terms of Service from time to time. Continued use of the platform after updates constitutes acceptance of the revised terms.',
  },
  {
    title: 'Contact',
    content:
      'If you have questions about these terms, reach out at support@cloudgptapi.com.',
  },
];

export default function TermsOfServicePage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-16">
      <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
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
