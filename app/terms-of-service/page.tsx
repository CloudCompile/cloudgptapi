import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | Vetra',
  description: 'Read the Terms of Service for Vetra and learn how you can use our unified AI API platform.',
};

const sections = [
  {
    title: 'Acceptance of Terms',
    content:
      'By accessing or using Vetra, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree, do not use the platform.',
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
      'Vetra is provided “as is” without warranties of any kind. To the maximum extent permitted by law, Vetra is not liable for any indirect, incidental, or consequential damages arising from your use of the service.',
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 sm:pt-32 pb-16 sm:pb-24 px-4 sm:px-6 relative overflow-hidden">
      {/* Background Elements */}
      <div className="fixed inset-0 mesh-gradient opacity-60 dark:opacity-40" />
      <div className="fixed inset-0 dot-grid opacity-30" />

      <div className="max-w-4xl mx-auto relative z-10">
        <header className="mb-12 sm:mb-16 text-center sm:text-left">
          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
            Terms of Service
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
            Questions about these terms? Contact us at{' '}
            <a href="mailto:support@cloudgptapi.com" className="text-primary font-bold hover:underline">
              support@cloudgptapi.com
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
