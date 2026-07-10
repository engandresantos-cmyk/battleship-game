import type { Orientation, ShipKind } from "./types";

export function shipImageSrc(kind: ShipKind, orientation: Orientation): string {
  return `${import.meta.env.BASE_URL}ships/${kind}-${orientation}.png`;
}
