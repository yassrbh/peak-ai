import { useEffect, useState } from "react";
import { supabase } from "./supabase";

const WHOOP_CLIENT_ID = "2363c69c-50ed-4a39-8073-19d84481c458";
const WHOOP_CLIENT_SECRET = "fd609a6a3cf64f75800cbba511a52eb6219c11bc0db616916c59f4ab38b8c655";
const REDIRECT_URI = "https://peak-ai.vercel.app/whoop/callback";

export default function WhoopCallback() {
  const [status, setStatus] = useState("Connecting your Whoop...");
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    handleCallback();
  }, []);

  const handleCallback = async () => {
    try {
      // Get auth code from URL
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      if (!code) throw new Error("No authorization code received from Whoop");

      setStatus("Exchanging authorization code...");

      // Exchange code for tokens via our proxy
      const tokenRes = await fetch("https://api.prod.whoop.com/oauth/oauth2/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code,
          client_id: WHOOP_CLIENT_ID,
          client_secret: WHOOP_CLIENT_SECRET,
          redirect_uri: REDIRECT_URI,
        }),
      });

      if (!tokenRes.ok) throw new Error("Failed to exchange code for token");
      const tokenData = await tokenRes.json();

      setStatus("Fetching your Whoop profile...");

      // Get Whoop user profile
      const profileRes = await fetch("https://api.prod.whoop.com/developer/v1/user/profile/basic", {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
      const profileData = profileRes.ok ? await profileRes.json() : {};

      setStatus("Saving your connection...");

      // Get current Supabase user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not logged in to PEAK");

      // Save tokens to Supabase
      const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000).toISOString();
      const { error: dbError } = await supabase.from("whoop_tokens").upsert({
        user_id: user.id,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: expiresAt,
        whoop_user_id: profileData.user_id?.toString() || null,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });

      if (dbError) throw new Error("Failed to save Whoop connection");

      setStatus("Whoop connected successfully!");
      setDone(true);

      // Redirect back to app after 2 seconds
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#000",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'DM Sans', sans-serif", color: "#fff", flexDirection: "column", gap: 20, padding: 24,
    }}>
      <div style={{ fontSize: 42, fontFamily: "'Georgia', serif", letterSpacing: -2 }}>PEAK</div>

      {error ? (
        <>
          <div style={{ fontSize: 24, color: "#e84040" }}>⚠️ Connection Failed</div>
          <div style={{ fontSize: 14, color: "#888", textAlign: "center", maxWidth: 320 }}>{error}</div>
          <button onClick={() => window.location.href = "/"} style={{
            background: "#fff", color: "#000", border: "none", borderRadius: 12,
            padding: "14px 32px", fontSize: 13, fontWeight: 700, cursor: "pointer",
            letterSpacing: 1, textTransform: "uppercase",
          }}>Back to PEAK</button>
        </>
      ) : done ? (
        <>
          <div style={{ fontSize: 48 }}>✅</div>
          <div style={{ fontSize: 20, fontWeight: 800 }}>Whoop Connected!</div>
          <div style={{ fontSize: 14, color: "#888" }}>Redirecting you back to PEAK...</div>
        </>
      ) : (
        <>
          <div style={{ width: 40, height: 40, border: "3px solid #333", borderTop: "3px solid #40c080", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
          <div style={{ fontSize: 15, color: "#888" }}>{status}</div>
        </>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
