"use client";

import type { UserPosition } from "@/lib/rooms/RoomService";

interface RemoteAvatarsProps {
  users: UserPosition[];
  currentUserId: string;
}

export function RemoteAvatars({ users, currentUserId }: RemoteAvatarsProps) {
  // Filter out current user, only show other players
  const otherUsers = users.filter((user) => user.userId !== currentUserId);

  return (
    <>
      {otherUsers.map((user) => (
        <RemoteAvatarBadge key={user.userId} user={user} />
      ))}
    </>
  );
}

/**
 * Individual remote avatar badge (name + direction indicator)
 */
function RemoteAvatarBadge({ user }: { user: UserPosition }) {
  const directionIcons = ["↓", "↙", "←", "↖", "↑", "↗", "→", "↘"];
  const directionIcon = directionIcons[user.direction % 8] || "↓";

  return (
    <div
      className="remote-avatar-badge"
      style={{
        position: "fixed",
        left: `${user.x}px`,
        top: `${user.y}px`,
        zIndex: 10,
        pointerEvents: "none",
      }}
    >
      <div className="badge-content">
        <div className="badge-name">{user.username}</div>
        <div className="badge-direction">{directionIcon}</div>
      </div>
    </div>
  );
}
