import Link from "next/link";

export const metadata = {
  title: "EtherWorld — Marketplace"
};

export default function MarketplacePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background:
          "radial-gradient(circle at top, #322b3d 0%, #1a1822 42%, #0c0d13 100%)",
        color: "#f8f6ff",
        padding: 32
      }}
    >
      <section
        style={{
          maxWidth: 560,
          width: "100%",
          display: "grid",
          gap: 18,
          padding: 28,
          borderRadius: 22,
          border: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(255,255,255,0.055)",
          boxShadow: "0 18px 48px rgba(0,0,0,0.18)",
          textAlign: "center"
        }}
      >
        <div
          style={{
            fontSize: 12,
            textTransform: "uppercase",
            letterSpacing: 2,
            opacity: 0.72
          }}
        >
          EtherWorld / Marketplace
        </div>

        <h1 style={{ margin: 0, fontSize: 32 }}>Bourse en préparation</h1>

        <p style={{ margin: 0, opacity: 0.82, lineHeight: 1.5 }}>
          La bourse des meubles EtherWorld sera bientôt disponible dans le
          client principal. Elle sera branchée sur l’économie en temps réel une
          fois que le backend sera prêt.
        </p>

        <Link
          href="/room"
          style={{
            justifySelf: "center",
            padding: "12px 22px",
            borderRadius: 14,
            background:
              "linear-gradient(180deg, rgba(198,188,255,0.24), rgba(117,103,186,0.22))",
            border: "1px solid rgba(255,255,255,0.12)",
            color: "#f8f6ff",
            fontWeight: 800,
            textDecoration: "none"
          }}
        >
          Retour à la suite
        </Link>
      </section>
    </main>
  );
}
