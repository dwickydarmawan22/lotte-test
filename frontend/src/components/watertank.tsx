import { Box, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import React from "react";

interface WaterTankProps {
  fillPercentage: number;
  width?: number;
}

const TankBody = styled(Box)<{ width: number }>(({ width }) => ({
  position: "relative",
  width: `${width}px`,
  height: `100%`,
  background: "e0e0e0",
  borderRadius: "0 0 20px 20px",
  border: "1px solid #1e1b4b",
  borderTop: "none",
  overflow: "hidden",
  boxShadow: "inset 0 0 20px rgba(0, 0, 0, 0.3)",
}));

const WaterFill = styled(Box)<{ fillPercentage: number }>(
  ({ fillPercentage }) => ({
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: `${fillPercentage}%`,
    background:
      "linear-gradient(to top, #3b82f6 0%, #60a5fa 50%, #22d3ee 100%)",
    transition: "height 0.5s ease-in-out",
  })
);

const WaterTank: React.FC<WaterTankProps> = ({
  fillPercentage,
  width = 150,
}) => {
  const clampedFill = Math.max(0, Math.min(100, fillPercentage));

  return (
    <Box position="relative" sx={{ height: "100%" }}>
      <TankBody width={width}>
        <WaterFill fillPercentage={clampedFill} />
      </TankBody>
    </Box>
  );
};

// Example usage component
export default function CustomWaterTank({
  value,
  max,
  unit,
}: {
  value?: number;
  max?: number;
  unit?: string;
}) {
  const fillPercentage = ((value ?? 0) / (max ?? 0)) * 100;

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 1,
        flexDirection: "column",
      }}
    >
      <WaterTank fillPercentage={fillPercentage} width={150} />
      <Typography
        sx={{ color: "black", fontSize: "1rem", fontWeight: 600 }}
      >{`${value} ${unit} / ${max} ${unit}`}</Typography>
    </Box>
  );
}
