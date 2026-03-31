import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | Vetra',
  description: 'Read the Terms of Service for Vetra and learn how you can use our unified AI API platform.',
};

const sections = [
  {
    title: 'Acceptance of Terms',
    content:
      'By accessing or using Vetra ("the Service"), you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree to these terms, do not access or use the Service.',
  },
  {
    title: 'Description of Service',
    content:
      'Vetra provides a unified API gateway that aggregates multiple AI providers, allowing users to access various language models, image generation, and other AI capabilities through a single interface. The Service is provided for both personal and commercial use, subject to these terms.',
  },
  {
    title: 'Use of the Service',
    content:
      'You agree to use the Service only for lawful purposes and in compliance with all applicable laws. You may not: (a) attempt to reverse engineer, decompile, or disassemble any part of the Service; (b) use the Service to generate harmful, illegal, or prohibited content; (c) attempt to circumvent rate limits or access controls; (d) resell or redistribute the Service without authorization; or (e) use the Service in any manner that could damage, disable, or impair the Service.',
  },
  {
    title: 'User Accounts',
    content:
      'You are responsible for maintaining the confidentiality of your account credentials and API keys. All activities that occur under your account are your responsibility. You must immediately notify us of any unauthorized access or security breaches. We reserve the right to suspend or terminate accounts that violate these terms.',
  },
  {
    title: 'API Usage and Rate Limits',
    content:
      'Your subscription tier determines your daily request limits (RPD - Requests Per Day) and rate limits. Usage that exceeds these limits may result in throttling or temporary suspension. We reserve the right to modify rate limits with notice.',
  },
  {
    title: 'Payment and Subscriptions',
    content:
      'Subscription fees are billed monthly in EUR. Your subscription automatically renews unless cancelled. You can cancel your subscription at any time through your account settings or Stripe portal. We do not offer refunds for any subscription fees paid.',
  },
  {
    title: 'Intellectual Property',
    content:
      'The Service, including its design, code, and documentation, is the intellectual property of Vetra. You retain ownership of content you generate using the Service. However, you grant Vetra a license to use such content for providing and improving the Service.',
  },
  {
    title: 'Third-Party Services',
    content:
      'The Service integrates with third-party AI providers. We are not responsible for the availability, accuracy, or output of these third-party services. Your use of third-party services is subject to their respective terms and policies.',
  },
  {
    title: 'Data and Privacy',
    content:
      'We collect and process data as described in our Privacy Policy. By using the Service, you consent to such processing. You are responsible for ensuring you have the right to share any data you input into the Service.',
  },
  {
    title: 'Disclaimers',
    content:
      'The Service is provided "as is" without warranties of any kind, whether express or implied. We do not guarantee the accuracy, reliability, or completeness of any AI outputs. You should verify important information independently.',
  },
  {
    title: 'Limitation of Liability',
    content:
      'To the maximum extent permitted by law, Vetra shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Service. Our total liability shall not exceed the amount you paid for the Service in the past twelve months.',
  },
  {
    title: 'Indemnification',
    content:
      'You agree to indemnify and hold harmless Vetra from any claims, damages, losses, or expenses arising from your use of the Service, your violation of these terms, or your generation of prohibited content.',
  },
  {
    title: 'Termination',
    content:
      'We may terminate or suspend your access to the Service at any time for any reason, including violation of these terms. Upon termination, your right to use the Service immediately ceases.',
  },
  {
    title: 'Changes to These Terms',
    content:
      'We may update these Terms of Service from time to time. We will notify users of material changes through the Service or email. Continued use of the Service after changes constitutes acceptance of the revised terms.',
  },
  {
    title: 'Governing Law',
    content:
      'These Terms of Service shall be governed by and construed in accordance with applicable laws. Any disputes shall be resolved in the appropriate jurisdiction.',
  },
  {
    title: 'Contact',
    content:
      'If you have questions about these terms, join our Discord community for support: https://discord.gg/f7xR8qga',
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
            Questions about these terms? Join our{' '}
            <a href="https://discord.gg/f7xR8qga" target="_blank" rel="noopener noreferrer" className="text-primary font-bold hover:underline">
              Discord community
            </a>
            {' '}for support.
          </p>
        </footer>
      </div>
    </div>
  );
}
