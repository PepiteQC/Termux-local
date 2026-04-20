"use client";

import { useEffect, useRef } from "react";
import { RoomEngine } from "./RoomEngine";

export default function RoomCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const engine = new RoomEngine(ctx);

    const setup = async () => {
      // Sol (3 tuiles pour tester)
      await engine.addEntity(0, 0, "/sprites/furnitures/sol/tile-ether.svg");
      await engine.addEntity(1, 0, "/sprites/furnitures/sol/tile-ether.svg");
      await engine.addEntity(0, 1, "/sprites/furnitures/sol/tile-ether.svg");

      // Murs
      await engine.addEntity(
        0,
        -1,
        "/sprites/furnitures/murs/wall-left.svg",
        48
      );
      await engine.addEntity(
        1,
        -1,
        "/sprites/furnitures/murs/wall-right.svg",
        48
      );
      await engine.addEntity(
        0,
        -2,
        "/sprites/furnitures/murs/wall-top.svg",
        64
      );

      // Exemple meuble (quand tu auras un sprite)
      // await engine.addEntity(1, 1, "/sprites/furnitures/meubles/chair-nebula.png", 32);

      const loop = () => {
        engine.render();
        requestAnimationFrame(loop);
      };

      loop();
    };

    setup();
  }, []);

  return <canvas ref={canvasRef} width={2000} height={2000} />;
}
