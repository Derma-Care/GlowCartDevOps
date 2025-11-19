import React, { useEffect, useState } from "react";

export default function LaunchCountdown() {
  const targetDate = new Date("2025-12-31T00:00:00").getTime();
  const [timeLeft, setTimeLeft] = useState({});

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const diff = targetDate - now;

      if (diff <= 0) {
        clearInterval(interval);
        setTimeLeft({});
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #ff99c8, #ff2e85)",
        padding: "24px",
        borderRadius: "18px",
        color: "#fff",
        textAlign: "center",
        maxWidth: 420,
        margin: "auto",
        boxShadow: "0 8px 25px rgba(255,0,128,0.25)",
      }}
    >
      <h2 style={{ marginBottom: 8, fontSize: 24, fontWeight: 700 ,  color: "#fff",}}>
        🚀 Launching the App Soon
      </h2>

      <p style={{ fontSize: 16, opacity: 0.9, marginBottom: 20 ,  color: "#fff",}}>
        Going live on <strong>31st December 2025</strong>
      </p>

      {timeLeft.days !== undefined ? (
        <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>
          {["days", "hours", "minutes", "seconds"].map((unit) => (
            <div
              key={unit}
              style={{
                background: "rgba(255,255,255,0.15)",
                padding: "12px 10px",
                borderRadius: 12,
                width: 70,
                backdropFilter: "blur(5px)",
              }}
            >
              <div style={{ fontSize: 24, fontWeight: 700 }}>
                {timeLeft[unit]}
              </div>
              <div style={{ fontSize: 12, opacity: 0.8 }}>{unit.toUpperCase()}</div>
            </div>
          ))}
        </div>
      ) : (
        <h3 style={{ margin: 0 }}>🎉 We Are Live!</h3>
      )}
    </div>
  );
}
