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

const SCHEDULE_FIXED = {
  0: { type: "fullbody", label: "Full Body", icon: "🏋️", color: "#cccccc" },
  1: { type: "football", label: "Football", icon: "⚽", color: "#e8a020" },
  2: { type: "rest", label: "Rest + Massage", icon: "💆", color: "#888888" },
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

const SYSTEM_PROMPT = `You are an elite personal fitness coach for Peak.AI. You have complete knowledge of this athlete's profile:

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

// ─── LANDING PAGE ───────────────────────────────────────────────────────────

function LandingPage({ onEnter }) {
  const [loaded, setLoaded] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      width: "100%",
      background: "#000",
      fontFamily: "'Georgia', 'Times New Roman', serif",
      overflow: "hidden",
      position: "relative",
    }}>
      {/* Hero Image */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 0,
        backgroundImage: `url(https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1600&auto=format&fit=crop&q=80)`,
        backgroundSize: "cover",
        backgroundPosition: "center 40%",
        filter: "brightness(0.25) contrast(1.2)",
        transform: loaded ? "scale(1.03)" : "scale(1.1)",
        transition: "transform 10s ease",
      }} />

      {/* Gradient overlays */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 1,
        background: "linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.0) 35%, rgba(0,0,0,0.0) 55%, rgba(0,0,0,0.9) 100%)",
      }} />
      <div style={{
        position: "absolute", inset: 0, zIndex: 1,
        background: "radial-gradient(ellipse at center, transparent 25%, rgba(0,0,0,0.45) 100%)",
      }} />

      {/* Grain */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 2, opacity: 0.05,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundRepeat: "repeat", backgroundSize: "128px",
        pointerEvents: "none",
      }} />

      {/* Content */}
      <div style={{
        position: "relative", zIndex: 3,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "clamp(24px, 5vw, 48px)",
      }}>

        {/* Top bar */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          opacity: loaded ? 1 : 0,
          transform: loaded ? "translateY(0)" : "translateY(-16px)",
          transition: "all 1s ease 0.3s",
        }}>
          <div style={{
            fontSize: 10, letterSpacing: 4, color: "rgba(255,255,255,0.25)",
            textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif",
          }}>AI Driven</div>
          <div style={{
            fontSize: 10, letterSpacing: 4, color: "rgba(255,255,255,0.25)",
            textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif",
          }}>Personal Performance Coach</div>
        </div>

        {/* Centre */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
          <div style={{
            width: loaded ? 50 : 0, height: 1,
            background: "rgba(255,255,255,0.25)", marginBottom: 28,
            transition: "width 1.4s ease 0.9s",
          }} />
          <div style={{
            fontSize: "clamp(80px, 16vw, 160px)",
            fontWeight: 400,
            letterSpacing: "-3px",
            lineHeight: 0.88,
            color: "#ffffff",
            fontFamily: "'Georgia', serif",
            opacity: loaded ? 1 : 0,
            transform: loaded ? "translateY(0)" : "translateY(40px)",
            transition: "all 1.4s ease 0.5s",
            textShadow: "0 8px 80px rgba(0,0,0,0.6)",
          }}>PEAK</div>
          <div style={{
            fontSize: "clamp(10px, 1.4vw, 13px)",
            letterSpacing: 7,
            color: "rgba(255,255,255,0.4)",
            textTransform: "uppercase",
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 300,
            marginTop: 22,
            opacity: loaded ? 1 : 0,
            transition: "all 1s ease 1s",
          }}>Reach your summit</div>
          <div style={{
            width: loaded ? 50 : 0, height: 1,
            background: "rgba(255,255,255,0.25)", marginTop: 28,
            transition: "width 1.4s ease 1.1s",
          }} />
        </div>

        {/* Bottom */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "flex-end",
          opacity: loaded ? 1 : 0,
          transform: loaded ? "translateY(0)" : "translateY(20px)",
          transition: "all 1s ease 1.3s",
          flexWrap: "wrap", gap: 20,
        }}>
          {/* Stats */}
          <div style={{ display: "flex", gap: "clamp(20px, 4vw, 48px)" }}>
            {[
              { value: "72.4kg", label: "Weight" },
              { value: "16.5%", label: "Body Fat" },
              { value: "34.6kg", label: "Muscle Mass" },
            ].map(stat => (
              <div key={stat.label}>
                <div style={{ fontSize: "clamp(16px, 2.5vw, 22px)", fontWeight: 400, color: "#fff", fontFamily: "'Georgia', serif", letterSpacing: 1 }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: 9, letterSpacing: 3, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif", marginTop: 5 }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Enter CTA */}
          <button
            onClick={onEnter}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
              background: hovered ? "#ffffff" : "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.28)",
              borderRadius: 0,
              padding: "15px 42px",
              color: hovered ? "#000" : "#fff",
              fontSize: 10,
              letterSpacing: 5,
              textTransform: "uppercase",
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.35s ease",
              backdropFilter: "blur(12px)",
            }}
          >Enter</button>
        </div>
      </div>

      {/* Bottom accent line */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: 1, zIndex: 4,
        background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)",
      }} />
    </div>
  );
}

// ─── COACH DASHBOARD ─────────────────────────────────────────────────────────

// ─── HISTORY CARD ─────────────────────────────────────────────────────────────

function HistoryCard({ workout, color }) {
  const [expanded, setExpanded] = useState(false);
  const c = color || "#888";
  return (
    <div style={{ background: "rgba(10,10,10,0.85)", borderRadius: 18, padding: 18, border: `1px solid ${c}33`, transition: "all 0.3s ease" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }} onClick={() => setExpanded(e => !e)}>
        <div style={{ fontSize: 28 }}>{workout.icon}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 15 }}>{workout.label}</div>
          <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>{workout.date}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: c }}>{workout.duration}</div>
          <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>{workout.sets} sets</div>
        </div>
        <div style={{ color: "#555", fontSize: 12, marginLeft: 4 }}>{expanded ? "▲" : "▼"}</div>
      </div>
      {expanded && workout.exercises && (
        <div style={{ marginTop: 14, borderTop: "1px solid #2a2a2a", paddingTop: 14 }}>
          {workout.exercises.map((ex, i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#ccc", marginBottom: 6 }}>{ex.name}</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {ex.sets.map((s, j) => (
                  <div key={j} style={{ background: c + "18", border: `1px solid ${c}33`, borderRadius: 8, padding: "4px 10px", fontSize: 11, color: c }}>
                    Set {j+1} · {s.weight > 0 ? `${s.weight}kg × ${s.reps}` : `${s.reps} reps`}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── WORKOUT TRACKER ─────────────────────────────────────────────────────────

function WorkoutTracker({ todaySchedule, todayWorkout, days, today, animateIn, onWorkoutComplete }) {
  const [workoutStarted, setWorkoutStarted] = useState(false);
  const [workoutDone, setWorkoutDone] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [restTimer, setRestTimer] = useState(null);
  const [restSeconds, setRestSeconds] = useState(0);
  const [loggedSets, setLoggedSets] = useState(() =>
    todayWorkout.exercises.map(ex => ({
      name: ex.name,
      note: ex.note,
      targetSets: parseInt(ex.sets) || 3,
      targetReps: ex.reps,
      sets: [],
    }))
  );
  const [activeExercise, setActiveExercise] = useState(null);
  const [inputWeight, setInputWeight] = useState("");
  const [inputReps, setInputReps] = useState("");
  const timerRef = useRef(null);
  const restRef = useRef(null);

  // Workout elapsed timer
  useEffect(() => {
    if (workoutStarted && !workoutDone) {
      timerRef.current = setInterval(() => setElapsedTime(t => t + 1), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [workoutStarted, workoutDone]);

  // Rest timer countdown
  useEffect(() => {
    if (restSeconds > 0) {
      restRef.current = setTimeout(() => setRestSeconds(s => s - 1), 1000);
    } else {
      setRestTimer(null);
    }
    return () => clearTimeout(restRef.current);
  }, [restSeconds]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const logSet = (exIndex) => {
    const weight = parseFloat(inputWeight) || 0;
    const reps = parseInt(inputReps) || 0;
    if (reps === 0) return;
    setLoggedSets(prev => {
      const updated = [...prev];
      updated[exIndex] = {
        ...updated[exIndex],
        sets: [...updated[exIndex].sets, { weight, reps, done: true }],
      };
      return updated;
    });
    setInputWeight("");
    setInputReps("");
    setRestSeconds(90);
    setRestTimer(true);
  };

  const removeSet = (exIndex, setIndex) => {
    setLoggedSets(prev => {
      const updated = [...prev];
      updated[exIndex].sets = updated[exIndex].sets.filter((_, i) => i !== setIndex);
      return updated;
    });
  };

  const totalSetsLogged = loggedSets.reduce((acc, ex) => acc + ex.sets.length, 0);
  const totalSetsTarget = loggedSets.reduce((acc, ex) => acc + ex.targetSets, 0);

  const color = todaySchedule.color;

  // PRE-WORKOUT VIEW
  if (!workoutStarted) {
    return (
      <div style={{ padding: "0 24px", display: "flex", flexDirection: "column", gap: 16, opacity: animateIn ? 1 : 0, transition: "all 0.5s ease 0.2s" }}>
        <div style={{ background: "rgba(10,10,10,0.85)", borderRadius: 20, padding: 24, border: `1px solid ${color}33` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <div style={{ fontSize: 36 }}>{todaySchedule.icon}</div>
            <div>
              <div style={{ fontSize: 11, letterSpacing: 3, color, textTransform: "uppercase" }}>Today's Session</div>
              <div style={{ fontSize: 24, fontWeight: 800 }}>{todaySchedule.label}</div>
            </div>
          </div>
          {todayWorkout.exercises.map((ex, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 14, padding: "14px 16px", marginBottom: 10, borderLeft: `3px solid ${color}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{ex.name}</div>
                <div style={{ background: color + "22", borderRadius: 8, padding: "4px 10px", fontSize: 12, color, fontWeight: 700 }}>{ex.sets} × {ex.reps}</div>
              </div>
              <div style={{ fontSize: 11, color: "#888", marginTop: 4 }}>{ex.note}</div>
            </div>
          ))}
          <button onClick={() => setWorkoutStarted(true)} style={{
            width: "100%", marginTop: 8, padding: "16px", borderRadius: 14, border: "none",
            background: "#ffffff", color: "#0a0a0a", fontSize: 14, fontWeight: 800,
            letterSpacing: 2, textTransform: "uppercase", cursor: "pointer",
            transition: "all 0.2s ease",
          }}>
            ▶ Start Workout
          </button>
        </div>
      </div>
    );
  }

  // WORKOUT COMPLETE VIEW
  if (workoutDone) {
    return (
      <div style={{ padding: "0 24px", display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ background: "rgba(10,10,10,0.85)", borderRadius: 20, padding: 32, border: "1px solid #40c08044", textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🏆</div>
          <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Workout Complete!</div>
          <div style={{ fontSize: 13, color: "#888", marginBottom: 24 }}>{todaySchedule.label} · {formatTime(elapsedTime)}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 24 }}>
            {[
              { label: "Duration", value: formatTime(elapsedTime) },
              { label: "Sets Done", value: `${totalSetsLogged}` },
              { label: "Exercises", value: `${loggedSets.length}` },
            ].map(s => (
              <div key={s.label} style={{ background: "rgba(255,255,255,0.05)", borderRadius: 12, padding: 14 }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: "#40c080" }}>{s.value}</div>
                <div style={{ fontSize: 10, color: "#888", letterSpacing: 2, textTransform: "uppercase", marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
          {loggedSets.map((ex, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: 14, marginBottom: 8, textAlign: "left" }}>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>{ex.name}</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {ex.sets.map((s, j) => (
                  <div key={j} style={{ background: color + "22", borderRadius: 8, padding: "4px 10px", fontSize: 12, color }}>
                    {s.weight > 0 ? `${s.weight}kg × ${s.reps}` : `${s.reps} reps`}
                  </div>
                ))}
                {ex.sets.length === 0 && <div style={{ fontSize: 12, color: "#555" }}>Not logged</div>}
              </div>
            </div>
          ))}
          <button onClick={() => { setWorkoutStarted(false); setWorkoutDone(false); setElapsedTime(0); setLoggedSets(todayWorkout.exercises.map(ex => ({ name: ex.name, note: ex.note, targetSets: parseInt(ex.sets) || 3, targetReps: ex.reps, sets: [] }))); }} style={{ width: "100%", padding: 14, borderRadius: 14, border: "1px solid #2a2a2a", background: "transparent", color: "#888", fontSize: 12, letterSpacing: 2, textTransform: "uppercase", cursor: "pointer" }}>
            Back to Overview
          </button>
        </div>
      </div>
    );
  }

  // ACTIVE WORKOUT VIEW
  return (
    <div style={{ padding: "0 24px", display: "flex", flexDirection: "column", gap: 12 }}>

      {/* Header bar */}
      <div style={{ background: "rgba(10,10,10,0.9)", borderRadius: 16, padding: "14px 20px", border: `1px solid ${color}44`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: 3, color, textTransform: "uppercase" }}>In Progress</div>
          <div style={{ fontSize: 18, fontWeight: 800 }}>{todaySchedule.label}</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 22, fontWeight: 800, color, fontVariantNumeric: "tabular-nums" }}>{formatTime(elapsedTime)}</div>
          <div style={{ fontSize: 10, color: "#888", letterSpacing: 2 }}>ELAPSED</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 18, fontWeight: 800 }}>{totalSetsLogged}<span style={{ color: "#555", fontWeight: 400 }}>/{totalSetsTarget}</span></div>
          <div style={{ fontSize: 10, color: "#888", letterSpacing: 2 }}>SETS</div>
        </div>
      </div>

      {/* Rest Timer */}
      {restTimer && restSeconds > 0 && (
        <div style={{ background: "rgba(232,160,32,0.1)", borderRadius: 14, padding: "12px 20px", border: "1px solid rgba(232,160,32,0.3)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 13, color: "#e8a020", fontWeight: 600 }}>⏱ Rest Timer</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#e8a020" }}>{formatTime(restSeconds)}</div>
          <button onClick={() => setRestSeconds(0)} style={{ background: "transparent", border: "1px solid rgba(232,160,32,0.4)", borderRadius: 8, padding: "4px 12px", color: "#e8a020", fontSize: 11, cursor: "pointer" }}>Skip</button>
        </div>
      )}

      {/* Exercises */}
      {loggedSets.map((ex, exIndex) => {
        const isActive = activeExercise === exIndex;
        const allSetsLogged = ex.sets.length >= ex.targetSets;
        return (
          <div key={exIndex} style={{ background: "rgba(10,10,10,0.85)", borderRadius: 18, padding: 18, border: `1px solid ${allSetsLogged ? "#40c08044" : isActive ? color + "55" : "#2a2a2a"}`, transition: "all 0.3s ease" }}>
            {/* Exercise header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }} onClick={() => setActiveExercise(isActive ? null : exIndex)}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {allSetsLogged && <span style={{ fontSize: 14 }}>✅</span>}
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{ex.name}</div>
                </div>
                <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>{ex.note}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ background: allSetsLogged ? "#40c08022" : color + "22", borderRadius: 8, padding: "4px 10px", fontSize: 12, color: allSetsLogged ? "#40c080" : color, fontWeight: 700 }}>
                  {ex.sets.length}/{ex.targetSets} sets
                </div>
                <div style={{ color: "#555", fontSize: 14 }}>{isActive ? "▲" : "▼"}</div>
              </div>
            </div>

            {/* Logged sets */}
            {ex.sets.length > 0 && (
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
                {ex.sets.map((s, si) => (
                  <div key={si} style={{ background: color + "18", border: `1px solid ${color}33`, borderRadius: 8, padding: "5px 10px", fontSize: 12, color, display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontWeight: 700 }}>Set {si + 1}</span>
                    <span>{s.weight > 0 ? `${s.weight}kg × ${s.reps}` : `${s.reps} reps`}</span>
                    <span onClick={() => removeSet(exIndex, si)} style={{ color: "#555", cursor: "pointer", fontSize: 14, lineHeight: 1 }}>×</span>
                  </div>
                ))}
              </div>
            )}

            {/* Log set input */}
            {isActive && (
              <div style={{ borderTop: "1px solid #2a2a2a", paddingTop: 14, marginTop: 4 }}>
                <div style={{ fontSize: 11, color: "#888", letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>
                  Log Set {ex.sets.length + 1} · Target: {ex.targetReps} reps
                </div>
                <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 10, color: "#888", letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>Weight (kg)</div>
                    <input
                      type="number"
                      value={inputWeight}
                      onChange={e => setInputWeight(e.target.value)}
                      placeholder="0"
                      style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid #3a3a3a", borderRadius: 10, padding: "12px 14px", color: "#fff", fontSize: 16, fontWeight: 700, outline: "none", textAlign: "center", boxSizing: "border-box" }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 10, color: "#888", letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>Reps</div>
                    <input
                      type="number"
                      value={inputReps}
                      onChange={e => setInputReps(e.target.value)}
                      placeholder="0"
                      style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid #3a3a3a", borderRadius: 10, padding: "12px 14px", color: "#fff", fontSize: 16, fontWeight: 700, outline: "none", textAlign: "center", boxSizing: "border-box" }}
                    />
                  </div>
                </div>
                <button onClick={() => logSet(exIndex)} style={{ width: "100%", padding: "13px", borderRadius: 12, border: "none", background: color, color: "#000", fontSize: 13, fontWeight: 800, letterSpacing: 1, textTransform: "uppercase", cursor: "pointer" }}>
                  + Log Set
                </button>
              </div>
            )}
          </div>
        );
      })}

      {/* Finish button */}
      <button onClick={() => {
        clearInterval(timerRef.current);
        const completed = {
          date: new Date().toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }),
          label: todaySchedule.label,
          icon: todaySchedule.icon,
          duration: formatTime(elapsedTime),
          sets: totalSetsLogged,
          exercises: loggedSets.map(ex => ({ name: ex.name, sets: ex.sets })),
        };
        onWorkoutComplete(completed);
        setWorkoutDone(true);
      }} style={{ width: "100%", padding: 16, borderRadius: 14, border: "none", background: "#40c080", color: "#000", fontSize: 14, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase", cursor: "pointer", marginTop: 4 }}>
        ✓ Finish Workout
      </button>

      {/* Cancel */}
      <button onClick={() => { clearInterval(timerRef.current); setWorkoutStarted(false); setElapsedTime(0); }} style={{ width: "100%", padding: 12, borderRadius: 14, border: "1px solid #2a2a2a", background: "transparent", color: "#555", fontSize: 12, letterSpacing: 2, textTransform: "uppercase", cursor: "pointer" }}>
        Cancel Workout
      </button>
    </div>
  );
}

// ─── COACH DASHBOARD ─────────────────────────────────────────────────────────
function CoachDashboard() {
  const today = new Date().getDay();
  const todaySchedule = SCHEDULE_FIXED[today];
  const todayNutrition = DAY_NUTRITION[todaySchedule.type];
  const todayWorkout = WORKOUTS[todaySchedule.type];

  const [activeTab, setActiveTab] = useState("dashboard");
  const [workoutHistory, setWorkoutHistory] = useState([
    { date: "Mon 17 Mar", label: "Push Day", icon: "💪", duration: "52:14", sets: 17, exercises: [{ name: "Bench Press", sets: [{ weight: 80, reps: 7 }, { weight: 80, reps: 6 }, { weight: 75, reps: 8 }, { weight: 75, reps: 8 }] }, { name: "Overhead Press", sets: [{ weight: 50, reps: 9 }, { weight: 50, reps: 8 }, { weight: 47.5, reps: 10 }] }, { name: "Incline Dumbbell Press", sets: [{ weight: 28, reps: 11 }, { weight: 28, reps: 10 }, { weight: 26, reps: 12 }] }] },
    { date: "Thu 13 Mar", label: "Pull Day", icon: "🔗", duration: "48:30", sets: 16, exercises: [{ name: "Weighted Pull-Ups", sets: [{ weight: 10, reps: 7 }, { weight: 10, reps: 6 }, { weight: 7.5, reps: 8 }, { weight: 7.5, reps: 7 }] }, { name: "Barbell Row", sets: [{ weight: 70, reps: 9 }, { weight: 70, reps: 8 }, { weight: 65, reps: 10 }] }] },
    { date: "Wed 12 Mar", label: "Push Day", icon: "💪", duration: "55:02", sets: 16, exercises: [{ name: "Bench Press", sets: [{ weight: 80, reps: 6 }, { weight: 77.5, reps: 7 }, { weight: 77.5, reps: 7 }, { weight: 75, reps: 8 }] }] },
  ]);
  const [messages, setMessages] = useState([{
    role: "assistant",
    content: `Let's go! 🔥 I've got your full profile loaded — 72.4kg, 16.5% body fat, 34.6kg muscle mass. Today is ${["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][today]} — ${todaySchedule.label} ${todaySchedule.icon}. ${todaySchedule.type === "football" ? "Game day. Eat big, perform bigger. Get those carbs in early." : todaySchedule.type === "rest" ? "Rest day. Don't underestimate recovery — this is where you actually grow." : `${todaySchedule.label} — let's get after it. What do you want to know?`}`,
  }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => { setTimeout(() => setAnimateIn(true), 100); }, []);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const fatToLose = ((USER_PROFILE.bodyFat - USER_PROFILE.targetBodyFat) / 100) * USER_PROFILE.weight;
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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
      setMessages(prev => [...prev, { role: "assistant", content: data.content?.[0]?.text || "Something went wrong." }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Connection error. Try again." }]);
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif", color: "#f0f0f0", position: "relative", overflow: "hidden" }}>
      {/* Same mountain background as landing */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0,
        backgroundImage: `url(https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1600&auto=format&fit=crop&q=80)`,
        backgroundSize: "cover",
        backgroundPosition: "center 40%",
        filter: "brightness(0.15) contrast(1.2)",
      }} />
      {/* Dark overlay for readability */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0,
        background: "linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.2) 40%, rgba(0,0,0,0.7) 100%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "fixed", inset: 0, zIndex: 0, opacity: 0.04,
        backgroundImage: "repeating-linear-gradient(0deg, #fff 0px, #fff 1px, transparent 1px, transparent 40px), repeating-linear-gradient(90deg, #fff 0px, #fff 1px, transparent 1px, transparent 40px)",
        pointerEvents: "none",
      }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 480, margin: "0 auto", padding: "0 0 80px 0" }}>

        {/* Header */}
        <div style={{ padding: "28px 24px 20px", opacity: animateIn ? 1 : 0, transform: animateIn ? "translateY(0)" : "translateY(-20px)", transition: "all 0.6s ease" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: 11, letterSpacing: 4, color: "#888888", textTransform: "uppercase", marginBottom: 4 }}>Peak — Reach your summit.</div>
              <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: -1, lineHeight: 1 }}>
                Good {new Date().getHours() < 12 ? "Morning" : new Date().getHours() < 17 ? "Afternoon" : "Evening"} 👋
              </div>
            </div>
            <div style={{ background: todaySchedule.color + "22", border: `1px solid ${todaySchedule.color}44`, borderRadius: 12, padding: "8px 14px", textAlign: "center" }}>
              <div style={{ fontSize: 20 }}>{todaySchedule.icon}</div>
              <div style={{ fontSize: 10, color: todaySchedule.color, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>{todaySchedule.label.split(" ")[0]}</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, padding: "0 24px 20px", opacity: animateIn ? 1 : 0, transition: "all 0.6s ease 0.1s" }}>
          {["dashboard", "workout", "nutrition", "coach"].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              flex: 1, padding: "10px 4px", borderRadius: 10, border: "none", cursor: "pointer",
              background: activeTab === tab ? "#ffffff" : "#1a1a1a",
              color: activeTab === tab ? "#0a0a0a" : "#666666",
              fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", transition: "all 0.2s ease",
            }}>
              {tab === "dashboard" ? "Main" : tab === "coach" ? "Coach" : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* DASHBOARD */}
        {activeTab === "dashboard" && (
          <div style={{ padding: "0 24px", display: "flex", flexDirection: "column", gap: 16, opacity: animateIn ? 1 : 0, transition: "all 0.5s ease 0.2s" }}>

            {/* This Week — moved to top */}
            <div style={{ background: "rgba(10,10,10,0.75)", borderRadius: 20, padding: 24, border: "1px solid #2a2a2a" }}>
              <div style={{ fontSize: 11, letterSpacing: 3, color: "#888888", textTransform: "uppercase", marginBottom: 16 }}>This Week</div>
              <div style={{ display: "flex", gap: 6 }}>
                {days.map((day, i) => {
                  const s = SCHEDULE_FIXED[i];
                  const isToday = i === today;
                  return (
                    <div key={day} style={{ flex: 1, textAlign: "center" }}>
                      <div style={{ fontSize: 10, color: isToday ? "#fff" : "#555", marginBottom: 6, fontWeight: isToday ? 700 : 400 }}>{day}</div>
                      <div style={{ aspectRatio: "1", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, background: isToday ? s.color + "33" : "#1a1a1a", border: isToday ? `2px solid ${s.color}` : "1px solid #2a2a2a" }}>
                        {s.icon}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Body Composition */}
            <div style={{ background: "rgba(10,10,10,0.75)", borderRadius: 20, padding: 24, border: "1px solid #2a2a2a" }}>
              <div style={{ fontSize: 11, letterSpacing: 3, color: "#888888", textTransform: "uppercase", marginBottom: 20 }}>Body Composition</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {[
                  { label: "Weight", value: "72.4", unit: "kg", color: "#f0f0f0" },
                  { label: "Body Fat", value: "16.5", unit: "%", color: "#e8a020" },
                  { label: "Muscle Mass", value: "34.6", unit: "kg", color: "#40c080" },
                  { label: "Leg Lean Mass", value: "17.2", unit: "kg", color: "#4080e8" },
                ].map(stat => (
                  <div key={stat.label} style={{ background: "rgba(20,20,20,0.75)", borderRadius: 14, padding: 16 }}>
                    <div style={{ fontSize: 10, color: "#888888", letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>{stat.label}</div>
                    <div style={{ fontSize: 26, fontWeight: 800, color: stat.color, letterSpacing: -1 }}>{stat.value}<span style={{ fontSize: 13, fontWeight: 400, color: stat.color + "aa", marginLeft: 2 }}>{stat.unit}</span></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summer Goal */}
            <div style={{ background: "rgba(10,10,10,0.75)", borderRadius: 20, padding: 24, border: "1px solid #2a2a2a" }}>
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
                  <div style={{ width: "15%", height: "100%", background: "linear-gradient(90deg, #e84040, #e8a020)", borderRadius: 4 }} />
                </div>
                <div style={{ fontSize: 11, color: "#888888", marginTop: 6 }}>~{fatToLose.toFixed(1)}kg fat to lose</div>
              </div>
              <div style={{ background: "#40c08015", border: "1px solid #40c08030", borderRadius: 12, padding: 12 }}>
                <div style={{ fontSize: 12, color: "#40c080", fontWeight: 600 }}>✓ Recomposition approach confirmed</div>
                <div style={{ fontSize: 11, color: "#40c08088", marginTop: 2 }}>Build muscle while losing fat simultaneously</div>
              </div>
            </div>

            {/* Key Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              {[{ label: "Height", value: "171cm" }, { label: "Age", value: "30 yrs" }, { label: "ECW", value: "0.366" }].map(s => (
                <div key={s.label} style={{ background: "rgba(10,10,10,0.75)", borderRadius: 14, padding: "14px 12px", textAlign: "center", border: "1px solid #2a2a2a" }}>
                  <div style={{ fontSize: 10, color: "#888888", letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>{s.label}</div>
                  <div style={{ fontSize: 18, fontWeight: 800 }}>{s.value}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* WORKOUT */}
        {activeTab === "workout" && (
          <WorkoutTracker
            todaySchedule={todaySchedule}
            todayWorkout={todayWorkout}
            days={days}
            today={today}
            animateIn={animateIn}
            onWorkoutComplete={(workout) => setWorkoutHistory(prev => [workout, ...prev])}
          />
        )}

        {/* NUTRITION */}
        {activeTab === "nutrition" && (
          <div style={{ padding: "0 24px", display: "flex", flexDirection: "column", gap: 16, opacity: animateIn ? 1 : 0, transition: "all 0.5s ease 0.2s" }}>
            <div style={{ background: "rgba(10,10,10,0.75)", borderRadius: 20, padding: 24, border: `1px solid ${todaySchedule.color}33` }}>
              <div style={{ fontSize: 11, letterSpacing: 3, color: todaySchedule.color, textTransform: "uppercase", marginBottom: 4 }}>Today — {todaySchedule.label}</div>
              <div style={{ fontSize: 13, color: "#888888", marginBottom: 20 }}>{todayNutrition.note}</div>
              <div style={{ textAlign: "center", marginBottom: 24 }}>
                <div style={{ fontSize: 11, color: "#888888", letterSpacing: 3, textTransform: "uppercase", marginBottom: 4 }}>Daily Calories</div>
                <div style={{ fontSize: 52, fontWeight: 900, letterSpacing: -2, color: todaySchedule.color }}>{todayNutrition.calories}<span style={{ fontSize: 16, fontWeight: 400, color: todaySchedule.color + "88" }}> kcal</span></div>
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
            <div style={{ background: "rgba(10,10,10,0.75)", borderRadius: 20, padding: 24, border: "1px solid #2a2a2a" }}>
              <div style={{ fontSize: 11, letterSpacing: 3, color: "#888888", textTransform: "uppercase", marginBottom: 16 }}>Nutrition Strategy</div>
              {[
                { type: "Football Days", cal: 2800, protein: 165, color: "#e8a020", note: "Mon & Sat" },
                { type: "Gym Days", cal: 2550, protein: 158, color: "#4080e8", note: "Wed, Thu, Fri, Sun" },
                { type: "Rest Days", cal: 2200, protein: 150, color: "#888888", note: "Tue" },
              ].map(row => (
                <div key={row.type} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: "1px solid #1e1e1e" }}>
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
              <div style={{ fontSize: 13, color: "#a0c0a0", lineHeight: 1.6 }}>Protein is non-negotiable every day. Carbs flex up on high-output days (football), flex down on rest days. Fat stays relatively stable.</div>
            </div>
          </div>
        )}

        {/* COACH */}
        {activeTab === "coach" && (
          <div style={{ padding: "0 24px", display: "flex", flexDirection: "column", gap: 12, opacity: animateIn ? 1 : 0, transition: "all 0.5s ease 0.2s" }}>
            <div style={{ background: "rgba(10,10,10,0.75)", borderRadius: 20, padding: 20, border: "1px solid #2a2a2a", minHeight: 380, maxHeight: 420, overflowY: "auto" }}>
              {messages.map((msg, i) => (
                <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start", marginBottom: 14 }}>
                  {msg.role === "assistant" && (
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#2a2a2a", marginRight: 8, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>💪</div>
                  )}
                  <div style={{ maxWidth: "78%", padding: "12px 16px", borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px", background: msg.role === "user" ? "#ffffff" : "#1e1e1e", color: msg.role === "user" ? "#0a0a0a" : "#f0f0f0", fontSize: 13, lineHeight: 1.6 }}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#2a2a2a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>💪</div>
                  <div style={{ background: "rgba(20,20,20,0.75)", borderRadius: "18px 18px 18px 4px", padding: "12px 16px" }}>
                    <div style={{ display: "flex", gap: 4 }}>
                      {[0,1,2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "#888888", animation: `bounce 1s ease ${i * 0.2}s infinite` }} />)}
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMessage()} placeholder="Ask your coach anything..." style={{ flex: 1, background: "rgba(15,15,15,0.75)", border: "1px solid #2a2a2a", borderRadius: 14, padding: "14px 18px", color: "#f0f0f0", fontSize: 14, outline: "none", fontFamily: "inherit" }} />
              <button onClick={sendMessage} disabled={loading} style={{ background: loading ? "#1a1a1a" : "#ffffff", color: loading ? "#666" : "#0a0a0a", border: "none", borderRadius: 14, padding: "14px 20px", cursor: loading ? "not-allowed" : "pointer", fontSize: 18, transition: "all 0.2s ease" }}>
                {loading ? "⏳" : "→"}
              </button>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {["What should I eat today?", "How hard should I train?", "Am I on track for summer?", "Tips for today's session"].map(prompt => (
                <button key={prompt} onClick={() => setInput(prompt)} style={{ background: "rgba(10,10,10,0.75)", border: "1px solid #2a2a2a", borderRadius: 20, padding: "8px 14px", color: "#888888", fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}
        {/* HISTORY */}
        {activeTab === "history" && (
          <div style={{ padding: "0 24px", display: "flex", flexDirection: "column", gap: 12, opacity: animateIn ? 1 : 0, transition: "all 0.5s ease 0.2s" }}>
            <div style={{ fontSize: 11, letterSpacing: 3, color: "#888", textTransform: "uppercase", marginBottom: 4 }}>Past Workouts</div>
            {workoutHistory.length === 0 && (
              <div style={{ background: "rgba(10,10,10,0.85)", borderRadius: 20, padding: 32, textAlign: "center", border: "1px solid #2a2a2a" }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>🏋️</div>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>No workouts yet</div>
                <div style={{ fontSize: 13, color: "#888" }}>Complete your first session to see it here</div>
              </div>
            )}
            {workoutHistory.map((w, i) => {
              const [expanded, setExpanded] = [false];
              return (
                <HistoryCard key={i} workout={w} color={SCHEDULE_FIXED[Object.keys(SCHEDULE_FIXED).find(k => SCHEDULE_FIXED[k].label === w.label)] ? SCHEDULE_FIXED[Object.keys(SCHEDULE_FIXED).find(k => SCHEDULE_FIXED[k].label === w.label)].color : "#888"} />
              );
            })}
          </div>
        )}

        {/* SETTINGS */}
        {activeTab === "settings" && (
          <div style={{ padding: "0 24px", display: "flex", flexDirection: "column", gap: 14, opacity: animateIn ? 1 : 0, transition: "all 0.5s ease 0.2s" }}>

            {/* Profile card */}
            <div style={{ background: "rgba(10,10,10,0.85)", borderRadius: 20, padding: 24, border: "1px solid #2a2a2a", textAlign: "center" }}>
              <div style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg, #e84040, #e8a020)", margin: "0 auto 14px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>🏃</div>
              <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 2 }}>Yassi</div>
              <div style={{ fontSize: 12, color: "#888", letterSpacing: 2, textTransform: "uppercase" }}>Peak.AI Athlete</div>
            </div>

            {/* Personal Details */}
            <div style={{ background: "rgba(10,10,10,0.85)", borderRadius: 20, padding: 24, border: "1px solid #2a2a2a" }}>
              <div style={{ fontSize: 11, letterSpacing: 3, color: "#888", textTransform: "uppercase", marginBottom: 16 }}>Personal Details</div>
              {[
                { label: "Age", value: "30 years" },
                { label: "Height", value: "171 cm" },
                { label: "Weight", value: "72.4 kg" },
                { label: "Goal", value: "Body Recomposition" },
                { label: "Target Body Fat", value: "12%" },
              ].map(item => (
                <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ fontSize: 13, color: "#888" }}>{item.label}</div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{item.value}</div>
                </div>
              ))}
            </div>

            {/* Body Composition */}
            <div style={{ background: "rgba(10,10,10,0.85)", borderRadius: 20, padding: 24, border: "1px solid #2a2a2a" }}>
              <div style={{ fontSize: 11, letterSpacing: 3, color: "#888", textTransform: "uppercase", marginBottom: 16 }}>InBody Scan Results</div>
              {[
                { label: "Body Fat %", value: "16.5%", color: "#e8a020" },
                { label: "Skeletal Muscle Mass", value: "34.6 kg", color: "#40c080" },
                { label: "Leg Lean Mass", value: "17.2 kg", color: "#4080e8" },
                { label: "ECW Ratio", value: "0.366", color: "#cccccc" },
              ].map(item => (
                <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ fontSize: 13, color: "#888" }}>{item.label}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: item.color }}>{item.value}</div>
                </div>
              ))}
              <div style={{ marginTop: 14, fontSize: 11, color: "#555", textAlign: "center" }}>Last scan: March 2026</div>
            </div>

            {/* Training Schedule */}
            <div style={{ background: "rgba(10,10,10,0.85)", borderRadius: 20, padding: 24, border: "1px solid #2a2a2a" }}>
              <div style={{ fontSize: 11, letterSpacing: 3, color: "#888", textTransform: "uppercase", marginBottom: 16 }}>Training Schedule</div>
              {[
                { label: "Training Split", value: "PPL + Full Body" },
                { label: "Gym Sessions / Week", value: "4" },
                { label: "Football", value: "Mon & Sat (competitive)" },
                { label: "Rest Days", value: "Tuesday (+ massage)" },
              ].map(item => (
                <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ fontSize: 13, color: "#888" }}>{item.label}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, textAlign: "right", maxWidth: "55%" }}>{item.value}</div>
                </div>
              ))}
            </div>

            {/* Integrations */}
            <div style={{ background: "rgba(10,10,10,0.85)", borderRadius: 20, padding: 24, border: "1px solid #2a2a2a" }}>
              <div style={{ fontSize: 11, letterSpacing: 3, color: "#888", textTransform: "uppercase", marginBottom: 16 }}>Integrations</div>
              {[
                { label: "Whoop", icon: "⌚", status: "Coming soon", color: "#e8a020" },
                { label: "MyFitnessPal", icon: "🍎", status: "Coming soon", color: "#4080e8" },
              ].map(item => (
                <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ fontSize: 20 }}>{item.icon}</div>
                  <div style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{item.label}</div>
                  <div style={{ fontSize: 11, color: item.color, fontWeight: 700, letterSpacing: 1 }}>{item.status}</div>
                </div>
              ))}
            </div>

            <div style={{ textAlign: "center", padding: "8px 0 20px" }}>
              <div style={{ fontSize: 11, color: "#444", letterSpacing: 2 }}>PEAK.AI · V1.0</div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(20px)", borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", padding: "12px 16px 20px", gap: 4, zIndex: 100 }}>
        {[
          { id: "dashboard", icon: "◈", label: "Main" },
          { id: "workout", icon: "💪", label: "Workout" },
          { id: "nutrition", icon: "🥗", label: "Nutrition" },
          { id: "coach", icon: "🎯", label: "Coach" },
          { id: "history", icon: "📋", label: "History" },
          { id: "settings", icon: "⚙️", label: "Settings" },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ flex: 1, background: activeTab === tab.id ? "rgba(255,255,255,0.1)" : "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "6px 2px", borderRadius: 10, transition: "all 0.2s ease" }}>
            <div style={{ fontSize: 16 }}>{tab.icon}</div>
            <div style={{ fontSize: 9, color: activeTab === tab.id ? "#fff" : "#555", fontWeight: activeTab === tab.id ? 700 : 400, letterSpacing: 0.5, textTransform: "uppercase" }}>{tab.label}</div>
          </button>
        ))}
      </div>

      <style>{`
        @keyframes bounce { 0%, 80%, 100% { transform: scale(0); opacity: 0.3; } 40% { transform: scale(1); opacity: 1; } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 2px; }
        input::placeholder { color: #444; }
      `}</style>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState("landing");
  const [fadeOut, setFadeOut] = useState(false);

  const handleEnter = () => {
    setFadeOut(true);
    setTimeout(() => {
      setScreen("dashboard");
      setFadeOut(false);
    }, 800);
  };

  return (
    <div style={{
      opacity: fadeOut ? 0 : 1,
      transition: "opacity 0.8s ease",
      minHeight: "100vh",
    }}>
      {screen === "landing" ? <LandingPage onEnter={handleEnter} /> : <CoachDashboard />}
    </div>
  );
}
