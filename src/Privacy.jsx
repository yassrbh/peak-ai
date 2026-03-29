export default function Privacy() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#000",
      color: "#f0f0f0",
      fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
      padding: "60px 24px",
    }}>
      <div style={{ maxWidth: 680, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ fontSize: 11, letterSpacing: 4, color: "#555", textTransform: "uppercase", marginBottom: 12 }}>Legal</div>
          <div style={{ fontSize: 42, fontFamily: "'Georgia', serif", fontWeight: 400, letterSpacing: -2, marginBottom: 8 }}>PEAK.AI</div>
          <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: -1, marginBottom: 16 }}>Privacy Policy</div>
          <div style={{ fontSize: 13, color: "#555" }}>Last updated: March 2026</div>
          <div style={{ height: 1, background: "#2a2a2a", marginTop: 24 }} />
        </div>

        {/* Intro */}
        <p style={{ fontSize: 15, lineHeight: 1.8, color: "#aaa", marginBottom: 40 }}>
          PEAK ("we", "our", or "us") is committed to protecting your personal information. This Privacy Policy explains how we collect, use, store and protect your data when you use the PEAK application and services.
        </p>

        {[
          {
            title: "1. Information We Collect",
            content: [
              "Account information: name, email address and password when you register",
              "Body composition data: weight, body fat percentage, muscle mass and other metrics you choose to log",
              "Workout data: exercise logs, sets, reps, weights and session history",
              "Nutrition data: meals, calories and macronutrient information you log",
              "Sleep and recovery data: sleep duration, quality scores and recovery metrics",
              "Wearable data: if you connect a Whoop device, we access recovery scores, HRV, sleep performance and strain data with your explicit consent",
              "Usage data: how you interact with the app to improve our service",
            ]
          },
          {
            title: "2. How We Use Your Information",
            content: [
              "To provide personalised AI coaching recommendations tailored to your goals",
              "To track your progress toward your fitness and body composition goals",
              "To sync data from connected wearable devices (Whoop) with your consent",
              "To improve and develop our services",
              "To communicate with you about your account and our services",
              "To process payments for premium subscriptions",
            ]
          },
          {
            title: "3. Data Storage & Security",
            content: [
              "Your data is stored securely using Supabase, a trusted cloud database provider",
              "All data is encrypted in transit using TLS/SSL",
              "Passwords are hashed and never stored in plain text",
              "We do not sell your personal data to third parties",
              "Access to your data is restricted to you and authorised PEAK systems only",
            ]
          },
          {
            title: "4. Third-Party Integrations",
            content: [
              "Whoop: If you connect your Whoop device, we access your recovery, sleep and strain data via Whoop's official API. You can revoke this access at any time from your Settings",
              "Anthropic (Claude AI): Your coaching conversations are processed by Anthropic's Claude AI. Conversations may be used to improve AI models per Anthropic's terms",
              "Stripe: Payment information is processed securely by Stripe. We never store your card details",
              "Supabase: Your account and health data is stored on Supabase's secure infrastructure",
            ]
          },
          {
            title: "5. Your Rights",
            content: [
              "Access: You can view all data we hold about you in your Settings",
              "Deletion: You can delete your account and all associated data at any time from Settings",
              "Portability: You can export your data at any time",
              "Correction: You can update your personal information at any time",
              "Withdrawal: You can disconnect any third-party integration (e.g. Whoop) at any time",
            ]
          },
          {
            title: "6. Data Retention",
            content: [
              "We retain your data for as long as your account is active",
              "If you delete your account, all personal data is permanently deleted within 30 days",
              "Anonymised, aggregated data may be retained for service improvement purposes",
            ]
          },
          {
            title: "7. Children's Privacy",
            content: [
              "PEAK is not intended for users under the age of 16",
              "We do not knowingly collect data from children under 16",
              "If you believe a child has provided us with personal data, please contact us immediately",
            ]
          },
          {
            title: "8. Changes to This Policy",
            content: [
              "We may update this Privacy Policy from time to time",
              "We will notify you of significant changes via email or in-app notification",
              "Continued use of PEAK after changes constitutes acceptance of the updated policy",
            ]
          },
          {
            title: "9. Contact Us",
            content: [
              "If you have any questions about this Privacy Policy or how we handle your data, please contact us at: privacy@peak-ai.vercel.app",
            ]
          },
        ].map((section, i) => (
          <div key={i} style={{ marginBottom: 40 }}>
            <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 16, color: "#fff" }}>{section.title}</div>
            <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
              {section.content.map((item, j) => (
                <li key={j} style={{ display: "flex", gap: 12, marginBottom: 10, fontSize: 14, lineHeight: 1.7, color: "#aaa" }}>
                  <span style={{ color: "#40c080", flexShrink: 0, marginTop: 2 }}>→</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            {i < 8 && <div style={{ height: 1, background: "#1a1a1a", marginTop: 32 }} />}
          </div>
        ))}

        {/* Footer */}
        <div style={{ borderTop: "1px solid #2a2a2a", paddingTop: 32, marginTop: 20, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div style={{ fontSize: 12, color: "#444", letterSpacing: 2 }}>PEAK.AI · AI-POWERED PERFORMANCE COACHING</div>
          <a href="/" style={{ fontSize: 12, color: "#555", textDecoration: "none" }}>← Back to app</a>
        </div>
      </div>
    </div>
  );
}
