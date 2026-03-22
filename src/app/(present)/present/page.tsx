"use client";

import { Suspense, useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useImageStore } from "@/stores/image-store";
import { useMapStore } from "@/stores/map-store";
import { useImageData } from "@/hooks/use-image-data";
import type { PinType, MapPin } from "@/types";

const PIN_COLORS: Record<PinType, string> = {
  location: "#3b82f6",
  npc: "#22c55e",
  encounter: "#ef4444",
  loot: "#eab308",
  note: "#a855f7",
};

function PresentContent() {
  const searchParams = useSearchParams();
  const imageId = searchParams.get("img");
  const mapIdParam = searchParams.get("map");
  const showPins = searchParams.get("pins") === "1";
  const { images } = useImageStore();
  const { maps } = useMapStore();

  const image = imageId ? images.find((i) => i.id === imageId) : null;
  const map = mapIdParam ? maps.find((m) => m.id === mapIdParam) : null;

  const imageBlob = useImageData(imageId ? `img:${imageId}` : null, image?.dataUri || undefined);
  const src = imageBlob ?? map?.imageDataUri ?? null;
  const alt = image?.name ?? map?.name ?? "Presented image";

  const visiblePins = showPins && map
    ? map.pins.filter((p) => p.showToPlayers)
    : [];

  const [hoveredPin, setHoveredPin] = useState<MapPin | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [imgRect, setImgRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    function updateRect() {
      if (imgRef.current) {
        setImgRect(imgRef.current.getBoundingClientRect());
      }
    }
    updateRect();
    window.addEventListener("resize", updateRect);
    return () => window.removeEventListener("resize", updateRect);
  }, [src]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        window.close();
      }
      if (e.key === "f" || e.key === "F") {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
        } else {
          document.exitFullscreen().catch(() => {});
        }
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  if (!src) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <p className="text-white/50 text-lg">No image found</p>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 bg-black flex items-center justify-center select-none"
      onDoubleClick={() => {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
        } else {
          document.exitFullscreen().catch(() => {});
        }
      }}
    >
      <div className="relative max-w-full max-h-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          className="max-w-[100vw] max-h-[100vh] object-contain"
          draggable={false}
          onLoad={() => {
            if (imgRef.current) setImgRect(imgRef.current.getBoundingClientRect());
          }}
        />

        {/* Player-visible pins */}
        {imgRect && visiblePins.map((pin) => {
          const color = PIN_COLORS[pin.pinType];
          return (
            <div
              key={pin.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
              style={{
                left: `${pin.x}%`,
                top: `${pin.y}%`,
              }}
              onMouseEnter={() => setHoveredPin(pin)}
              onMouseLeave={() => setHoveredPin(null)}
            >
              {/* Pin dot */}
              <div
                className="size-4 rounded-full border-2 border-white shadow-lg shadow-black/50 transition-transform group-hover:scale-150"
                style={{ backgroundColor: color }}
              />
              {/* Pin label */}
              <div
                className="absolute left-1/2 -translate-x-1/2 top-5 whitespace-nowrap px-2 py-0.5 rounded text-xs font-medium text-white shadow-lg"
                style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}
              >
                {pin.title}
              </div>
            </div>
          );
        })}

        {/* Hovered pin tooltip with description */}
        {hoveredPin && hoveredPin.description && imgRect && (
          <div
            className="absolute z-50 max-w-xs rounded-lg px-3 py-2 text-sm text-white shadow-xl pointer-events-none"
            style={{
              backgroundColor: 'rgba(0,0,0,0.9)',
              left: `${hoveredPin.x}%`,
              top: `${hoveredPin.y}%`,
              transform: hoveredPin.x > 70
                ? 'translate(calc(-100% - 16px), -50%)'
                : 'translate(16px, -50%)',
            }}
          >
            <p className="font-semibold mb-1">{hoveredPin.title}</p>
            <p className="text-white/80 whitespace-pre-wrap">{hoveredPin.description}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PresentPage() {
  return (
    <Suspense
      fallback={
        <div className="fixed inset-0 bg-black flex items-center justify-center">
          <p className="text-white/50">Loading...</p>
        </div>
      }
    >
      <PresentContent />
    </Suspense>
  );
}
