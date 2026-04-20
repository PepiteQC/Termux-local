type WallProps = {
  side: "left" | "right";
};

export function Wall({ side }: WallProps) {
  const sharedStyle = {
    position: "absolute" as const,
    border: "1px solid rgba(255,255,255,0.08)",
    background:
      "linear-gradient(180deg, rgba(32, 40, 69, 0.98), rgba(12, 15, 28, 0.98))",
    boxShadow: "0 35px 55px rgba(0, 0, 0, 0.35)"
  };

  if (side === "left") {
    return (
      <div
        aria-hidden
        style={{
          ...sharedStyle,
          left: 30,
          top: 74,
          width: 525,
          height: 320,
          transform: "skewY(30deg)",
          borderRadius: "26px 0 18px 12px",
          overflow: "hidden",
          zIndex: 14
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(90deg, rgba(126,253,249,0.15), transparent 42%), repeating-linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.04) 16px, transparent 16px, transparent 32px)"
          }}
        />
      </div>
    );
  }

  return (
    <div
      aria-hidden
      style={{
        ...sharedStyle,
        right: 54,
        top: 78,
        width: 525,
        height: 320,
        transform: "skewY(-30deg)",
        borderRadius: "0 26px 12px 18px",
        overflow: "hidden",
        zIndex: 13
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(270deg, rgba(177,109,255,0.18), transparent 46%), repeating-linear-gradient(90deg, rgba(255,255,255,0.03), rgba(255,255,255,0.03) 18px, transparent 18px, transparent 36px)"
        }}
      />
    </div>
  );
}
