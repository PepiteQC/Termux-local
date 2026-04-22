export type AvatarProfile = {
  username: string;
  gender: "boy" | "girl";
  skin: string;
  hair: string;
  top: string;
  bottom: string;
  figureString: string;
};

export function buildFigureString(input: Omit<AvatarProfile, "figureString">) {
  return `gender=${input.gender};skin=${input.skin};hair=${input.hair};top=${input.top};bottom=${input.bottom}`;
}

export function getStoredAvatar(): AvatarProfile | null {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem("ew-avatar");
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AvatarProfile;
  } catch {
    return null;
  }
}

export function saveStoredAvatar(profile: Omit<AvatarProfile, "figureString">) {
  if (typeof window === "undefined") return null;

  const fullProfile: AvatarProfile = {
    ...profile,
    figureString: buildFigureString(profile),
  };

  window.localStorage.setItem("ew-avatar", JSON.stringify(fullProfile));
  return fullProfile;
}
