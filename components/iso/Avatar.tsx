import type { AvatarRecord } from "@/lib/iso/types";
import { getIsoZIndex, roomToScreen } from "@/lib/iso/renderer";

type AvatarProps = {
  avatar: AvatarRecord;
  walking: boolean;
};

const directionRotation = {
  north: "translate(-50%, 0) scaleX(1)",
  east: "translate(-50%, 0) scaleX(1)",
  south: "translate(-50%, 0) scaleX(-1)",
  west: "translate(-50%, 0) scaleX(-1)"
} as const;

export function Avatar({ avatar, walking }: AvatarProps) {
  const position = roomToScreen(avatar.x, avatar.y, 0);

  return (
    <div
      aria-label="Avatar"
      style={{
        position: "absolute",
        left: position.left,
        top: position.top - 78,
        width: 68,
        height: 98,
        transform: directionRotation[avatar.direction],
        zIndex: getIsoZIndex(avatar.x, avatar.y, 2, 7),
        pointerEvents: "none"
      }}
    >
      <div
        style={{
          position: "absolute",
          left: "50%",
          bottom: 0,
          width: 42,
          height: 18,
          transform: "translateX(-50%)",
          borderRadius: "50%",
          background: "rgba(0,0,0,0.38)",
          filter: "blur(5px)"
        }}
      />
      <div
        style={{
          position: "absolute",
          left: "50%",
          bottom: 18,
          width: 22,
          height: walking ? 40 : 36,
          transform: "translateX(-50%)",
          borderRadius: 10,
          background: "linear-gradient(180deg, #a06cff, #3d2f7d)",
          boxShadow: "0 0 18px rgba(177,109,255,0.26)"
        }}
      />
      <div
        style={{
          position: "absolute",
          left: "50%",
          bottom: 54,
          width: 30,
          height: 24,
          transform: "translateX(-50%)",
          borderRadius: 10,
          background: "linear-gradient(180deg, #8cf8ff, #4d88ff)"
        }}
      />
      <div
        style={{
          position: "absolute",
          left: "50%",
          bottom: 70,
          width: 26,
          height: 26,
          transform: "translateX(-50%)",
          borderRadius: "50%",
          background: "linear-gradient(180deg, #f7e7ff, #d5b6ff)",
          border: "1px solid rgba(255,255,255,0.45)"
        }}
      />
      <div
        style={{
          position: "absolute",
          left: "50%",
          bottom: 84,
          width: 30,
          height: 14,
          transform: "translateX(-50%)",
          borderRadius: "12px 12px 4px 4px",
          background: "linear-gradient(180deg, #15213c, #090d18)"
        }}
      />
    </div>
  );
}
