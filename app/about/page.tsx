export default function AboutPage() {
  return (
    <div className="min-h-screen py-16 sm:py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto space-y-8 sm:space-y-10">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter mb-4 sm:mb-6">
              About <span className="premium-text">Vetra</span>
            </h1>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
              A unified AI API gateway built for developers.
            </p>
          </div>

          <div className="glass border border-border/50 rounded-3xl p-8 sm:p-12 space-y-6">
            <p className="text-base sm:text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
              Vetra unifies Pollinations, OpenRouter, Groq, Cerebras, Google AI Studio, ElevenLabs, and more behind a single OpenAI-compatible API. Switch models by changing one parameter — no SDK changes, no re-integration.
            </p>
            <p className="text-base sm:text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
              The platform handles authentication, rate limiting, usage tracking, and multi-key load balancing so you can focus on building rather than managing infrastructure.
            </p>
            <p className="text-base sm:text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
              Built by CloudCompile — focused on making multi-provider AI integration reliable, fast, and simple for everyone from solo developers to production teams.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
