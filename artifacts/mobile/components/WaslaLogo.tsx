import Svg, { Circle, Path } from "react-native-svg";

interface Props {
  size?: number;
  color?: string;
}

/**
 * Wasla abstract logo — two nodes connected by a graceful arc.
 *
 * Expresses the brand mission: connecting people through shared
 * transit data. Two dots = origin/destination (or passenger + bus).
 * The arc = the journey/link (وصلة) between them.
 *
 * 2 colors only: primary gold + transparent background.
 * No buses, no trains — purely abstract.
 */
export default function WaslaLogo({ size = 72, color = "#C49A3C" }: Props) {
  const w = size;
  const h = size * 0.55;

  // Viewbox: 80 × 44
  // Left node:  (8, 36) r=6
  // Right node: (72, 36) r=6
  // Arc: cubic bezier lifting to y=6 at midpoint
  return (
    <Svg width={w} height={h} viewBox="0 0 80 44">
      {/* Connecting arc */}
      <Path
        d="M 8 36 C 8 8, 72 8, 72 36"
        stroke={color}
        strokeWidth="2.8"
        fill="none"
        strokeLinecap="round"
      />
      {/* Left node — origin */}
      <Circle cx="8" cy="36" r="5.5" fill={color} />
      {/* Right node — destination */}
      <Circle cx="72" cy="36" r="5.5" fill={color} />
      {/* Centre node — the shared moment of connection */}
      <Circle cx="40" cy="9" r="3" fill={color} opacity={0.45} />
    </Svg>
  );
}
