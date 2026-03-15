import { useState, useEffect, useRef } from "react";

const USER_PROFILE = {
  name: "Athlete",
  age: 30,
  height: 171,
  weight: 72.4,
  bodyFat: 16.5,
  skeletalMuscleMass: 34.6,
  legLeanMass: 17.2,
  ecwRatio: 0.366,
  targetBodyFat: 12,
  goal: "Body Recomposition",
  targetSummer: true,
};

const SCHEDULE = {
  0: { type: "rest", label: "Rest Day", icon: "🌙", color: "#4a4a6a" },
  1: { type: "football", label: "Football", icon: "⚽", color: "#e8a020" },
  2: { type: "rest", label: "Rest + Massage", icon: "💆", color: "#4a4a6a" },
  3: { type: "push", label: "Push Day", icon: "💪", color: "#e84040" },
  4: { type: "pull", label: "Pull Day", icon: "🔗", color: "#4080e8" },
  5: { type: "legs", label: "Legs Day", icon: "🦵", color: "#40c080" },
  6: { type: "football", label: "Football", icon: "⚽", color: "#e8a020" },
};

// We'll add full body on Sunday (0) instead — let's override
const SCHEDULE_FIXED = {
  0: { type: "fullbody", label: "Full Body", icon: "🏋️", color: "#cccccc" },
  1: { type: "football", label: "Football", icon: "⚽", color: "#e8a020" },
  2: { type: "rest", label: "Rest + Massage", icon: "💆", color: "#4a4a6a" },
  3: { type: "push", label: "Push Day", icon: "💪", color: "#e84040" },
  4: { type: "pull", label: "Pull Day", icon: "🔗", color: "#4080e8" },
  5: { type: "legs", label: "Legs Day", icon: "🦵", color: "#40c080" },
  6: { type: "football", label: "Football", icon: "⚽", color: "#e8a020" },
};

const DAY_NUTRITION = {
  football: { calories: 2800, protein: 165, carbs: 320, fat: 75, note: "High carbs for fuel & recovery" },
  push: { calories: 2600, protein: 160, carbs: 280, fat: 72, note: "Pre-workout carbs, post protein focus" },
  pull: { calories: 2600, protein: 160, carbs: 280, fat: 72, note: "Back & biceps need protein priority" },
  legs: { calories: 2500, protein: 158, carbs: 260, fat: 70, note: "Moderate — football tomorrow" },
  fullbody: { calories: 2500, protein: 155, carbs: 250, fat: 68, note: "Lighter session — stimulus not destruction" },
  rest: { calories: 2200, protein: 150, carbs: 180, fat: 75, note: "Lower carbs, higher fat on rest days" },
};

const WORKOUTS = {
  push: {
    exercises: [
      { name: "Bench Press", sets: "4", reps: "6-8", note: "Primary chest compound" },
      { name: "Overhead Press", sets: "3", reps: "8-10", note: "Shoulder strength" },
      { name: "Incline Dumbbell Press", sets: "3", reps: "10-12", note: "Upper chest focus" },
      { name: "Cable Lateral Raises", sets: "3", reps: "12-15", note: "Side delt isolation" },
      { name: "Tricep Dips / Pushdowns", sets: "3", reps: "10-12", note: "Tricep finisher" },
    ],
  },
  pull: {
    exercises: [
      { name: "Weighted Pull-Ups", sets: "4", reps: "6-8", note: "Primary back compound" },
      { name: "Barbell Row", sets: "4", reps: "8-10", note: "Mid-back thickness" },
      { name: "Cable Row", sets: "3", reps: "10-12", note: "Scapular retraction focus" },
      { name: "Face Pulls", sets: "3", reps: "15-20", note: "Rear delt & rotator cuff health" },
      { name: "Barbell / Dumbbell Curl", sets: "3", reps: "10-12", note: "Bicep peak" },
    ],
  },
  legs: {
    exercises: [
      { name: "Romanian Deadlift", sets: "4", reps: "8-10", note: "Hamstring priority — football tomorrow" },
      { name: "Hip Thrust", sets: "4", reps: "10-12", note: "Glute strength & size" },
      { name: "Leg Curl", sets: "3", reps: "12-15", note: "Hamstring isolation" },
      { name: "Leg Press", sets: "3", reps: "10-12", note: "Moderate weight — save legs" },
      { name: "Calf Raises", sets: "4", reps: "15-20", note: "Often neglected, important for football" },
    ],
  },
  fullbody: {
    exercises: [
      { name: "Squat", sets: "3", reps: "8-10", note: "Moderate weight — second stimulus" },
      { name: "Dumbbell Row", sets: "3", reps: "10-12", note: "Back second hit" },
      { name: "Dumbbell Press", sets: "3", reps: "10-12", note: "Chest second hit" },
      { name: "Romanian Deadlift", sets: "3", reps: "10-12", note: "Posterior chain" },
      { name: "Curl + Tricep Superset", sets: "3", reps: "12 each", note: "Arms finisher" },
    ],
  },
  football: {
    exercises: [
      { name: "Dynamic Warm-Up", sets: "1", reps: "10 mins", note: "Leg swings, hip circles, high knees" },
      { name: "Competitive Match", sets: "1", reps: "90 mins", note: "Full intensity — leave it all on the pitch" },
      { name: "Cool Down Stretch", sets: "1", reps: "10 mins", note: "Focus on quads, hamstrings, calves" },
    ],
  },
  rest: {
    exercises: [
      { name: "Light Walk", sets: "1", reps: "20-30 mins", note: "Active recovery only" },
      { name: "Mobility / Stretching", sets: "1", reps: "15 mins", note: "Hip flexors, thoracic spine" },
      { name: "Massage (Tuesday)", sets: "1", reps: "As booked", note: "Deep tissue for football recovery" },
    ],
  },
};

const SYSTEM_PROMPT = `You are an elite personal fitness coach. You have complete knowledge of this athlete's profile:

ATHLETE PROFILE:
- Age: 30, Height: 171cm, Weight: 72.4kg
- Body Fat: 16.5%, Skeletal Muscle Mass: 34.6kg, Leg Lean Mass: 17.2kg
- ECW Ratio: 0.366 (normal hydration)
- Goal: Body Recomposition — build muscle while losing fat, target 10-13% body fat by summer
- Training: Push/Pull/Legs + Full Body split, 4 gym sessions/week
- Football: Competitive matches Monday & Saturday afternoons

WEEKLY SCHEDULE:
- Monday: Football (competitive)
- Tuesday: Rest + Massage (recovery from football)
- Wednesday: Push Day (heavy — prime training day)
- Thursday: Pull Day (heavy)
- Friday: Legs Day (moderate — football next day)
- Saturday: Football (competitive)
- Sunday: Full Body (moderate — second muscle stimulus)

NUTRITION TARGETS:
- Football days: 2800 cal, 165g protein, 320g carbs, 75g fat
- Gym days: 2500-2600 cal, 155-160g protein, 250-280g carbs, 68-72g fat
- Rest days: 2200 cal, 150g protein, 180g carbs, 75g fat

COACHING STYLE:
- Be direct, motivating and precise
- Give specific, actionable advice
- Reference their actual stats and schedule
- Keep responses concise but impactful
- Today's day of week should inform your advice
- Be like a knowledgeable mate who's also an expert coach`;

export default function CoachApp() {
  const today = new Date().getDay();
  const todaySchedule = SCHEDULE_FIXED[today];
  const todayNutrition = DAY_NUTRITION[todaySchedule.type];
  const todayWorkout = WORKOUTS[todaySchedule.type];

  const [activeTab, setActiveTab] = useState("dashboard");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `Let's go! 🔥 I've got your full profile loaded — 72.4kg, 16.5% body fat, 34.6kg muscle mass. Today is ${["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][today]} — ${todaySchedule.label} ${todaySchedule.icon}. ${todaySchedule.type === "football" ? "Game day. Eat big, perform bigger. Get those carbs in early." : todaySchedule.type === "rest" ? "Rest day. Don't underestimate recovery — this is where you actually grow." : `${todaySchedule.label} — let's get after it. What do you want to know?`}`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    setTimeout(() => setAnimateIn(true), 100);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fatToLose = ((USER_PROFILE.bodyFat - USER_PROFILE.targetBodyFat) / 100) * USER_PROFILE.weight;
  const progressPct = Math.round(((USER_PROFILE.bodyFat - USER_PROFILE.targetBodyFat) / (USER_PROFILE.bodyFat - USER_PROFILE.targetBodyFat)) * 0);
  const bfProgress = Math.round(((20 - USER_PROFILE.bodyFat) / (20 - USER_PROFILE.targetBodyFat)) * 100);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    const dayName = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][today];

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT + `\n\nToday is ${dayName}. Today's session: ${todaySchedule.label}.`,
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await response.json();
      const reply = data.content?.[0]?.text || "Something went wrong — try again.";
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Connection error. Try again." }]);
    }
    setLoading(false);
  };

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a0a",
      fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
      color: "#f0f0f0",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Background texture */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0,
        background: "radial-gradient(ellipse at 20% 20%, #1a1a1a 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, #111111 0%, transparent 50%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "fixed", inset: 0, zIndex: 0, opacity: 0.04,
        backgroundImage: "repeating-linear-gradient(0deg, #fff 0px, #fff 1px, transparent 1px, transparent 40px), repeating-linear-gradient(90deg, #fff 0px, #fff 1px, transparent 1px, transparent 40px)",
        pointerEvents: "none",
      }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 480, margin: "0 auto", padding: "0 0 80px 0" }}>

        {/* Header */}
        <div style={{
          padding: "28px 24px 20px",
          opacity: animateIn ? 1 : 0,
          transform: animateIn ? "translateY(0)" : "translateY(-20px)",
          transition: "all 0.6s ease",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: 11, letterSpacing: 4, color: "#888888", textTransform: "uppercase", marginBottom: 4 }}>Peak.AI — Performance Coach</div>
              <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: -1, lineHeight: 1 }}>
                Good {new Date().getHours() < 12 ? "Morning" : new Date().getHours() < 17 ? "Afternoon" : "Evening"} 👋
              </div>
            </div>
            <div style={{
              background: todaySchedule.color + "22",
              border: `1px solid ${todaySchedule.color}44`,
              borderRadius: 12, padding: "8px 14px", textAlign: "center",
            }}>
              <div style={{ fontSize: 20 }}>{todaySchedule.icon}</div>
              <div style={{ fontSize: 10, color: todaySchedule.color, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>
                {todaySchedule.label.split(" ")[0]}
              </div>
            </div>
          </div>
        </div>

        {/* Tab Nav */}
        <div style={{
          display: "flex", gap: 8, padding: "0 24px 20px",
          opacity: animateIn ? 1 : 0, transition: "all 0.6s ease 0.1s",
        }}>
          {["dashboard", "workout", "nutrition", "coach"].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              flex: 1, padding: "10px 4px", borderRadius: 10, border: "none", cursor: "pointer",
              background: activeTab === tab ? "#ffffff" : "#1a1a1a",
              color: activeTab === tab ? "#0a0a0a" : "#666666",
              fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase",
              transition: "all 0.2s ease",
            }}>
              {tab === "dashboard" ? "Stats" : tab === "coach" ? "Coach" : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* DASHBOARD TAB */}
        {activeTab === "dashboard" && (
          <div style={{ padding: "0 24px", display: "flex", flexDirection: "column", gap: 16,
            opacity: animateIn ? 1 : 0, transition: "all 0.5s ease 0.2s" }}>

            {/* Body Comp Card */}
            <div style={{ background: "#141414", borderRadius: 20, padding: 24, border: "1px solid #2a2a2a" }}>
              <div style={{ fontSize: 11, letterSpacing: 3, color: "#888888", textTransform: "uppercase", marginBottom: 20 }}>Body Composition</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {[
                  { label: "Weight", value: "72.4", unit: "kg", color: "#f0f0f8" },
                  { label: "Body Fat", value: "16.5", unit: "%", color: "#e8a020" },
                  { label: "Muscle Mass", value: "34.6", unit: "kg", color: "#40c080" },
                  { label: "Leg Lean Mass", value: "17.2", unit: "kg", color: "#4080e8" },
                ].map(stat => (
                  <div key={stat.label} style={{ background: "#1e1e1e", borderRadius: 14, padding: 16 }}>
                    <div style={{ fontSize: 10, color: "#888888", letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>{stat.label}</div>
                    <div style={{ fontSize: 26, fontWeight: 800, color: stat.color, letterSpacing: -1 }}>
                      {stat.value}<span style={{ fontSize: 13, fontWeight: 400, color: stat.color + "aa", marginLeft: 2 }}>{stat.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summer Goal Progress */}
            <div style={{ background: "#141414", borderRadius: 20, padding: 24, border: "1px solid #2a2a2a" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <div style={{ fontSize: 11, letterSpacing: 3, color: "#888888", textTransform: "uppercase" }}>Summer Goal</div>
                <div style={{ fontSize: 11, color: "#40c080", fontWeight: 700 }}>~3-4 months</div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 13, color: "#aaaaaa" }}>Body Fat</span>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>16.5% → <span style={{ color: "#40c080" }}>12%</span></span>
                </div>
                <div style={{ height: 8, background: "#2a2a2a", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ width: "15%", height: "100%", background: "linear-gradient(90deg, #e84040, #e8a020)", borderRadius: 4, transition: "width 1s ease" }} />
                </div>
                <div style={{ fontSize: 11, color: "#888888", marginTop: 6 }}>~{fatToLose.toFixed(1)}kg fat to lose</div>
              </div>
              <div style={{ background: "#40c08015", border: "1px solid #40c08030", borderRadius: 12, padding: 12 }}>
                <div style={{ fontSize: 12, color: "#40c080", fontWeight: 600 }}>✓ Recomposition approach confirmed</div>
                <div style={{ fontSize: 11, color: "#40c08088", marginTop: 2 }}>Build muscle while losing fat simultaneously</div>
              </div>
            </div>

            {/* Weekly Schedule */}
            <div style={{ background: "#141414", borderRadius: 20, padding: 24, border: "1px solid #2a2a2a" }}>
              <div style={{ fontSize: 11, letterSpacing: 3, color: "#888888", textTransform: "uppercase", marginBottom: 16 }}>This Week</div>
              <div style={{ display: "flex", gap: 6 }}>
                {days.map((day, i) => {
                  const s = SCHEDULE_FIXED[i];
                  const isToday = i === today;
                  return (
                    <div key={day} style={{ flex: 1, textAlign: "center" }}>
                      <div style={{ fontSize: 10, color: isToday ? "#fff" : "#666666", marginBottom: 6, fontWeight: isToday ? 700 : 400 }}>{day}</div>
                      <div style={{
                        aspectRatio: "1", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 14, background: isToday ? s.color + "33" : "#141414",
                        border: isToday ? `2px solid ${s.color}` : "1px solid #2a2a2a",
                        transition: "all 0.3s ease",
                      }}>
                        {s.icon}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Key Stats Row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              {[
                { label: "Height", value: "171cm" },
                { label: "Age", value: "30 yrs" },
                { label: "ECW", value: "0.366" },
              ].map(s => (
                <div key={s.label} style={{ background: "#141414", borderRadius: 14, padding: "14px 12px", textAlign: "center", border: "1px solid #2a2a2a" }}>
                  <div style={{ fontSize: 10, color: "#888888", letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>{s.label}</div>
                  <div style={{ fontSize: 18, fontWeight: 800 }}>{s.value}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* WORKOUT TAB */}
        {activeTab === "workout" && (
          <div style={{ padding: "0 24px", display: "flex", flexDirection: "column", gap: 16,
            opacity: animateIn ? 1 : 0, transition: "all 0.5s ease 0.2s" }}>
            <div style={{ background: "#141414", borderRadius: 20, padding: 24, border: `1px solid ${todaySchedule.color}33` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                <div style={{ fontSize: 32 }}>{todaySchedule.icon}</div>
                <div>
                  <div style={{ fontSize: 11, letterSpacing: 3, color: todaySchedule.color, textTransform: "uppercase" }}>Today</div>
                  <div style={{ fontSize: 22, fontWeight: 800 }}>{todaySchedule.label}</div>
                </div>
              </div>
              {todayWorkout.exercises.map((ex, i) => (
                <div key={i} style={{
                  background: "#1e1e1e", borderRadius: 14, padding: 16, marginBottom: 10,
                  borderLeft: `3px solid ${todaySchedule.color}`,
                  opacity: animateIn ? 1 : 0,
                  transform: animateIn ? "translateX(0)" : "translateX(-20px)",
                  transition: `all 0.4s ease ${0.1 + i * 0.08}s`,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{ex.name}</div>
                    <div style={{ background: todaySchedule.color + "22", borderRadius: 8, padding: "4px 10px", fontSize: 12, color: todaySchedule.color, fontWeight: 700, whiteSpace: "nowrap" }}>
                      {ex.sets} × {ex.reps}
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: "#888888", marginTop: 4 }}>{ex.note}</div>
                </div>
              ))}
            </div>

            {/* Other days preview */}
            <div style={{ background: "#141414", borderRadius: 20, padding: 24, border: "1px solid #2a2a2a" }}>
              <div style={{ fontSize: 11, letterSpacing: 3, color: "#888888", textTransform: "uppercase", marginBottom: 16 }}>Week Overview</div>
              {Object.entries(SCHEDULE_FIXED).map(([dayIdx, s]) => {
                const isToday = parseInt(dayIdx) === today;
                return (
                  <div key={dayIdx} style={{
                    display: "flex", alignItems: "center", gap: 12, padding: "10px 0",
                    borderBottom: "1px solid #141414",
                    opacity: isToday ? 1 : 0.5,
                  }}>
                    <div style={{ width: 36, fontSize: 11, color: isToday ? "#fff" : "#888888", fontWeight: isToday ? 700 : 400 }}>{days[dayIdx]}</div>
                    <div style={{ fontSize: 18 }}>{s.icon}</div>
                    <div style={{ flex: 1, fontSize: 13, fontWeight: isToday ? 700 : 400 }}>{s.label}</div>
                    {isToday && <div style={{ fontSize: 10, color: s.color, fontWeight: 700, letterSpacing: 1 }}>TODAY</div>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* NUTRITION TAB */}
        {activeTab === "nutrition" && (
          <div style={{ padding: "0 24px", display: "flex", flexDirection: "column", gap: 16,
            opacity: animateIn ? 1 : 0, transition: "all 0.5s ease 0.2s" }}>

            <div style={{ background: "#141414", borderRadius: 20, padding: 24, border: `1px solid ${todaySchedule.color}33` }}>
              <div style={{ fontSize: 11, letterSpacing: 3, color: todaySchedule.color, textTransform: "uppercase", marginBottom: 4 }}>Today — {todaySchedule.label}</div>
              <div style={{ fontSize: 13, color: "#888888", marginBottom: 20 }}>{todayNutrition.note}</div>

              <div style={{ textAlign: "center", marginBottom: 24 }}>
                <div style={{ fontSize: 11, color: "#888888", letterSpacing: 3, textTransform: "uppercase", marginBottom: 4 }}>Daily Calories</div>
                <div style={{ fontSize: 52, fontWeight: 900, letterSpacing: -2, color: todaySchedule.color }}>
                  {todayNutrition.calories}
                  <span style={{ fontSize: 16, fontWeight: 400, color: todaySchedule.color + "88" }}> kcal</span>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                {[
                  { label: "Protein", value: todayNutrition.protein, unit: "g", color: "#e84040" },
                  { label: "Carbs", value: todayNutrition.carbs, unit: "g", color: "#e8a020" },
                  { label: "Fat", value: todayNutrition.fat, unit: "g", color: "#4080e8" },
                ].map(macro => (
                  <div key={macro.label} style={{ background: macro.color + "15", borderRadius: 14, padding: 16, textAlign: "center", border: `1px solid ${macro.color}30` }}>
                    <div style={{ fontSize: 10, color: macro.color, letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>{macro.label}</div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: macro.color }}>{macro.value}<span style={{ fontSize: 11 }}>{macro.unit}</span></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Nutrition by day type */}
            <div style={{ background: "#141414", borderRadius: 20, padding: 24, border: "1px solid #2a2a2a" }}>
              <div style={{ fontSize: 11, letterSpacing: 3, color: "#888888", textTransform: "uppercase", marginBottom: 16 }}>Nutrition Strategy</div>
              {[
                { type: "Football Days", cal: 2800, protein: 165, color: "#e8a020", note: "Mon & Sat" },
                { type: "Gym Days", cal: 2550, protein: 158, color: "#4080e8", note: "Wed, Thu, Fri, Sun" },
                { type: "Rest Days", cal: 2200, protein: 150, color: "#4a4a6a", note: "Tue" },
              ].map(row => (
                <div key={row.type} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: "1px solid #141414" }}>
                  <div style={{ width: 6, height: 40, borderRadius: 3, background: row.color, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{row.type} <span style={{ color: "#888888", fontWeight: 400, fontSize: 11 }}>({row.note})</span></div>
                    <div style={{ fontSize: 12, color: "#888888", marginTop: 2 }}>{row.protein}g protein</div>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: 18, color: row.color }}>{row.cal}<span style={{ fontSize: 11, fontWeight: 400 }}>cal</span></div>
                </div>
              ))}
            </div>

            <div style={{ background: "#40c08015", borderRadius: 20, padding: 20, border: "1px solid #40c08030" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#40c080", marginBottom: 8 }}>🎯 Key Rule</div>
              <div style={{ fontSize: 13, color: "#a0c0a0", lineHeight: 1.6 }}>
                Protein is non-negotiable every day. Carbs flex up on high-output days (football), flex down on rest days. Fat stays relatively stable. This creates the calorie cycling needed for recomposition.
              </div>
            </div>
          </div>
        )}

        {/* COACH TAB */}
        {activeTab === "coach" && (
          <div style={{ padding: "0 24px", display: "flex", flexDirection: "column", gap: 12,
            opacity: animateIn ? 1 : 0, transition: "all 0.5s ease 0.2s" }}>

            <div style={{ background: "#141414", borderRadius: 20, padding: 20, border: "1px solid #2a2a2a", minHeight: 380, maxHeight: 420, overflowY: "auto" }}>
              {messages.map((msg, i) => (
                <div key={i} style={{
                  display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                  marginBottom: 14,
                  opacity: 1,
                  animation: "fadeIn 0.3s ease",
                }}>
                  {msg.role === "assistant" && (
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg, #444444, #222222)", marginRight: 8, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>💪</div>
                  )}
                  <div style={{
                    maxWidth: "78%", padding: "12px 16px", borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                    background: msg.role === "user" ? "#ffffff" : "#1e1e1e",
                    color: msg.role === "user" ? "#0a0a0a" : "#f0f0f0",
                  }}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg, #444444, #222222)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>💪</div>
                  <div style={{ background: "#222222", borderRadius: "18px 18px 18px 4px", padding: "12px 16px" }}>
                    <div style={{ display: "flex", gap: 4 }}>
                      {[0,1,2].map(i => (
                        <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "#888888", animation: `bounce 1s ease ${i * 0.2}s infinite` }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && sendMessage()}
                placeholder="Ask your coach anything..."
                style={{
                  flex: 1, background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 14,
                  padding: "14px 18px", color: "#f0f0f8", fontSize: 14, outline: "none",
                  fontFamily: "inherit",
                }}
              />
              <button onClick={sendMessage} disabled={loading} style={{
                background: loading ? "#1a1a1a" : "#ffffff",
                color: loading ? "#666" : "#0a0a0a",
                border: "none", borderRadius: 14, padding: "14px 20px", cursor: loading ? "not-allowed" : "pointer",
                fontSize: 18, transition: "all 0.2s ease",
              }}>
                {loading ? "⏳" : "→"}
              </button>
            </div>

            {/* Quick prompts */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {["What should I eat today?", "How hard should I train?", "Am I on track for summer?", "Tips for today's session"].map(prompt => (
                <button key={prompt} onClick={() => { setInput(prompt); }} style={{
                  background: "#141414", border: "1px solid #2a2a2a", borderRadius: 20,
                  padding: "8px 14px", color: "#888888", fontSize: 11, cursor: "pointer",
                  fontFamily: "inherit", transition: "all 0.2s ease",
                }}>
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <div style={{
        position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
        width: "100%", maxWidth: 480,
        background: "#0a0a0a", borderTop: "1px solid #2a2a2a",
        display: "flex", padding: "12px 24px 20px", gap: 8, zIndex: 100,
      }}>
        {[
          { id: "dashboard", icon: "📊", label: "Stats" },
          { id: "workout", icon: "💪", label: "Workout" },
          { id: "nutrition", icon: "🥗", label: "Nutrition" },
          { id: "coach", icon: "🎯", label: "Coach" },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            flex: 1, background: "none", border: "none", cursor: "pointer",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
            padding: "8px 4px", borderRadius: 12,
            background: activeTab === tab.id ? "#1a1a1a" : "none",
            transition: "all 0.2s ease",
          }}>
            <div style={{ fontSize: 20 }}>{tab.icon}</div>
            <div style={{ fontSize: 10, color: activeTab === tab.id ? "#fff" : "#666666", fontWeight: activeTab === tab.id ? 700 : 400, letterSpacing: 1, textTransform: "uppercase" }}>
              {tab.label}
            </div>
          </button>
        ))}
      </div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); opacity: 0.3; }
          40% { transform: scale(1); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 2px; }
        input::placeholder { color: #404060; }
      `}</style>
    </div>
  );
}
