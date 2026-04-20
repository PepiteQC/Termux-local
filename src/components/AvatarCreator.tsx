import Image from "next/image";
import { loadAvatarSprites } from "@/lib/avatarSprites";

export default function AvatarCreator() {
  const sprites = loadAvatarSprites();

  return (
    <div className="avatar-creator">
      {/* Exemple : liste des coiffures */}
      <section>
        <h2>Hair</h2>
        <div className="grid">
          {sprites.hair.map((src) => (
            <button key={src} className="slot">
              <Image src={src} alt={src} width={64} height={64} />
            </button>
          ))}
        </div>
      </section>

      {/* Tu répètes pour shirt, jacket, pants, shoes, glasses, jewelry */}
    </div>
  );
}
