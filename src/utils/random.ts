export default function random (max: number, min: number): number {
  return Math.round(Math.random() * (max - min) + min);
}
