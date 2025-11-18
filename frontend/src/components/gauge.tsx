import { Box, Typography } from "@mui/material";
import {
  GaugeContainer,
  GaugeReferenceArc,
  useGaugeState,
} from "@mui/x-charts/Gauge";

function GaugePointer() {
  const { valueAngle, outerRadius, cx, cy } = useGaugeState();

  if (valueAngle === null) {
    return null;
  }

  const target = {
    x: cx + outerRadius * Math.sin(valueAngle),
    y: cy - outerRadius * Math.cos(valueAngle),
  };
  return (
    <g>
      <circle cx={cx} cy={cy} r={5} fill="red" />
      <path
        d={`M ${cx} ${cy} L ${target.x} ${target.y}`}
        stroke="red"
        strokeWidth={3}
      />
    </g>
  );
}

// Circular gradient that follows the arc
function CircularGradientArc() {
  const { valueAngle, outerRadius, innerRadius, cx, cy, startAngle, endAngle } =
    useGaugeState();

  if (valueAngle === null) {
    return null;
  }

  const arcLength = endAngle - startAngle;
  const segments = 100; // Number of color segments for smooth gradient
  const segmentAngle = (valueAngle - startAngle) / segments;

  // Function to get color based on angle position
  const getColor = (angle: number) => {
    const normalizedAngle = (angle - startAngle) / arcLength;

    if (normalizedAngle < 0.33) {
      // Green to Yellow
      const t = normalizedAngle / 0.33;
      return interpolateColor("#4ade80", "#fbbf24", t);
    } else if (normalizedAngle < 0.66) {
      // Yellow to Orange
      const t = (normalizedAngle - 0.33) / 0.33;
      return interpolateColor("#fbbf24", "#fb923c", t);
    } else {
      // Orange to Red
      const t = (normalizedAngle - 0.66) / 0.34;
      return interpolateColor("#fb923c", "#ef4444", t);
    }
  };

  // Helper function to interpolate between two hex colors
  const interpolateColor = (color1: string, color2: string, t: number) => {
    const r1 = parseInt(color1.slice(1, 3), 16);
    const g1 = parseInt(color1.slice(3, 5), 16);
    const b1 = parseInt(color1.slice(5, 7), 16);

    const r2 = parseInt(color2.slice(1, 3), 16);
    const g2 = parseInt(color2.slice(3, 5), 16);
    const b2 = parseInt(color2.slice(5, 7), 16);

    const r = Math.round(r1 + (r2 - r1) * t);
    const g = Math.round(g1 + (g2 - g1) * t);
    const b = Math.round(b1 + (b2 - b1) * t);

    return `rgb(${r}, ${g}, ${b})`;
  };

  return (
    <g>
      {Array.from({ length: segments }).map((_, i) => {
        const angle1 = startAngle + i * segmentAngle;
        const angle2 = startAngle + (i + 1) * segmentAngle;
        const color = getColor(angle1);

        const x1Out = cx + outerRadius * Math.sin(angle1);
        const y1Out = cy - outerRadius * Math.cos(angle1);
        const x2Out = cx + outerRadius * Math.sin(angle2);
        const y2Out = cy - outerRadius * Math.cos(angle2);
        const x2In = cx + innerRadius * Math.sin(angle2);
        const y2In = cy - innerRadius * Math.cos(angle2);
        const x1In = cx + innerRadius * Math.sin(angle1);
        const y1In = cy - innerRadius * Math.cos(angle1);

        const largeArc = Math.abs(angle2 - angle1) > Math.PI ? 1 : 0;

        const pathD = `
          M ${x1Out} ${y1Out}
          A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2Out} ${y2Out}
          L ${x2In} ${y2In}
          A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x1In} ${y1In}
          Z
        `;

        return <path key={i} d={pathD} fill={color} />;
      })}
    </g>
  );
}

export default function CustomGauge({
  value,
  max = 50,
  unit = "",
}: {
  value?: number;
  max?: number;
  unit?: string;
}) {
  const targetmax = 110;
  const proportion = (value ?? 0) / max;
  const scaledvalue = proportion * targetmax;
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <GaugeContainer
        width={200}
        height={200}
        startAngle={-110}
        endAngle={110}
        value={scaledvalue}
        min={0}
        max={targetmax}
      >
        <GaugeReferenceArc />
        <CircularGradientArc />
        <GaugePointer />
      </GaugeContainer>
      <Typography
        sx={{ color: "black", fontSize: "1rem", fontWeight: 600 }}
      >{`${value} ${unit} / ${max} ${unit}`}</Typography>
    </Box>
  );
}
