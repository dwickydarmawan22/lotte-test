import { Grid } from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { LineChart } from "@mui/x-charts/LineChart";
import { useEffect, useEffectEvent, useState } from "react";
import CustomGauge from "./components/gauge";
import { useQuery } from "@tanstack/react-query";
import CustomWaterTank from "./components/watertank";

interface WeatherReading {
  timestamp: string;
  airTemperature: number;
  rainfall: number;
  relativeHumidity: number;
  windSpeed: number;
}

interface ApiResponse {
  success: boolean;
  data: WeatherReading;
}

function App() {
  const [dataCollection, setDataCollection] = useState<WeatherReading[]>([]);
  const [lastUpdate, setLastUpdate] = useState("");

  const fetchWeather = async (): Promise<ApiResponse> => {
    const res = await fetch(import.meta.env.VITE_API_URL);
    if (!res.ok) throw new Error("Failed to fetch");
    return res.json();
  };

  const {
    data,
    error,
    isLoading: loading,
    refetch,
  } = useQuery({
    queryKey: ["weather"],
    queryFn: fetchWeather,
    refetchInterval: 60000,
    refetchIntervalInBackground: true,
  });

  const updateCollection = useEffectEvent((newItem: WeatherReading) => {
    setDataCollection((prev) => {
      const updated = [...prev, newItem];
      return updated.length > 10 ? updated.slice(-10) : updated;
    });
  });

  const updateLastCall = useEffectEvent((timestamp: string) => {
    setLastUpdate(timestamp);
  });

  useEffect(() => {
    if (!data?.data) return;

    updateCollection(data.data);
    updateLastCall(new Date(data.data.timestamp).toLocaleTimeString());
  }, [data]);

  const generateTimeLabels = () => {
    if (dataCollection.length === 0) return [];

    const firstTs = new Date(dataCollection[0].timestamp).getTime();

    return Array.from({ length: 10 }, (_, i) =>
      new Date(firstTs + i * 1000).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    );
  };

  const timeLabels = generateTimeLabels();

  const expandTo10 = (values: number[]) => {
    const padded: (number | null)[] = [...values];
    while (padded.length < 10) padded.push(null);
    return padded.slice(0, 10);
  };

  const temperatureData = expandTo10(
    dataCollection.map((r) => r.airTemperature)
  );
  const rainfallData = expandTo10(dataCollection.map((r) => r.rainfall));
  const humidityData = expandTo10(
    dataCollection.map((r) => r.relativeHumidity)
  );
  const windSpeedData = expandTo10(dataCollection.map((r) => r.windSpeed));

  const getMax = (arr: (number | null)[], fallback: number) => {
    const nums = arr.filter((x): x is number => x !== null);
    return nums.length ? Math.ceil(Math.max(...nums)) : fallback;
  };

  const maxTemp = getMax(temperatureData, 30);
  const maxRainfall = getMax(rainfallData, 20);
  const maxHumidity = getMax(humidityData, 100);
  const maxWindSpeed = getMax(windSpeedData, 15);

  const chartMargin = { top: 10, right: 24, bottom: 30, left: 50 };
  const currentWeather = data?.data;

  if (loading && !currentWeather) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          background: "#0f2249",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100vw",
        }}
      >
        <Typography
          sx={{
            color: "white",
            fontSize: "1.5rem",
            fontWeight: 500,
          }}
        >
          Loading weather data...
        </Typography>
      </Box>
    );
  }

  if (!currentWeather) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          background: "#0f2249",
          width: "100vw",
        }}
      >
        <Box sx={{ p: { xs: 2, md: 4 } }}>
          <Box
            sx={{
              borderRadius: 4,
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
              mb: 4,
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              justifyContent: "space-between",
              alignItems: { xs: "center", md: "flex-start" },
              gap: { xs: 3, md: 0 },
              textAlign: { xs: "center", md: "left" },
            }}
          >
            <Box>
              <Typography
                variant="h4"
                sx={{
                  color: "white",
                  fontWeight: 700,
                  mb: 0.5,
                  fontSize: { xs: "1.5rem", md: "2rem" },
                }}
              >
                Weather Monitoring Dashboard
              </Typography>
              <Typography
                sx={{
                  color: "#f0f4f8",
                  fontSize: { xs: "0.85rem", md: "0.95rem" },
                }}
              >
                Real-time environmental data tracking
              </Typography>
            </Box>
            <Box sx={{ textAlign: { xs: "center", md: "right" } }}>
              <Typography
                sx={{
                  color: "#f0f4f8",
                  fontSize: "0.75rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  mb: 0.5,
                }}
              >
                Last updated:
              </Typography>
              <Typography
                sx={{
                  color: "white",
                  fontSize: "1.1rem",
                  fontWeight: 600,
                }}
              >
                {lastUpdate}
              </Typography>
            </Box>
          </Box>
          <Box
            sx={{
              background: "#fee2e2",
              color: "#991b1b",
              p: 2,
              borderRadius: 3,
              borderLeft: "4px solid #dc2626",
            }}
          >
            No data available
          </Box>
        </Box>
      </Box>
    );
  }

  const metrics = [
    {
      title: "Air Temperature",
      value: currentWeather.airTemperature,
      unit: "°C",
      icon: "🌡️",
      data: temperatureData,
      color: "#ef4444",
      max: maxTemp,
      gradientFrom: "#fee2e2",
      gradientTo: "#fecaca",
      additionalcomponent: (
        <CustomGauge value={currentWeather.windSpeed} max={50} unit={"°C"} />
      ),
    },
    {
      title: "Rainfall",
      value: currentWeather.rainfall,
      unit: "mm",
      icon: "🌧️",
      data: rainfallData,
      color: "#3b82f6",
      max: maxRainfall,
      gradientFrom: "#dbeafe",
      gradientTo: "#bfdbfe",
      additionalcomponent: (
        <CustomWaterTank value={currentWeather.rainfall} max={26} unit={"mm"} />
      ),
    },
    {
      title: "Relative Humidity",
      value: currentWeather.relativeHumidity,
      unit: "%",
      icon: "💧",
      data: humidityData,
      color: "#06b6d4",
      max: maxHumidity,
      gradientFrom: "#cffafe",
      gradientTo: "#a5f3fc",
      additionalcomponent: (
        <CustomWaterTank
          value={currentWeather.relativeHumidity}
          max={100}
          unit={"%"}
        />
      ),
    },
    {
      title: "Wind Speed",
      value: currentWeather.windSpeed,
      unit: "m/s",
      icon: "💨",
      data: windSpeedData,
      color: "#10b981",
      max: maxWindSpeed,
      gradientFrom: "#d1fae5",
      gradientTo: "#a7f3d0",
      additionalcomponent: (
        <CustomGauge value={currentWeather.windSpeed} max={30} unit={"m/s"} />
      ),
    },
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "#1f88e6",
        p: { xs: 2, md: 4 },
      }}
    >
      <Box sx={{ margin: "0 auto" }}>
        <Box
          sx={{
            borderRadius: 4,
            mb: 4,
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "center", md: "flex-start" },
            gap: { xs: 3, md: 0 },
            textAlign: { xs: "center", md: "left" },
          }}
        >
          <Box>
            <Typography
              variant="h4"
              sx={{
                color: "white",
                fontWeight: 700,
                mb: 0.5,
                fontSize: { xs: "1.5rem", md: "2rem" },
              }}
            >
              Weather Monitoring Dashboard
            </Typography>
            <Typography
              sx={{
                color: "#f0f4f8",
                fontSize: { xs: "0.85rem", md: "0.95rem" },
              }}
            >
              Real-time environmental data tracking
            </Typography>
          </Box>
          <Box sx={{ textAlign: { xs: "center", md: "right" } }}>
            <Typography
              sx={{
                color: "#f0f4f8",
                fontSize: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                mb: 0.5,
              }}
            >
              Last updated:
            </Typography>
            <Typography
              sx={{
                color: "white",
                fontSize: "1.1rem",
                fontWeight: 600,
              }}
            >
              {lastUpdate}
            </Typography>
          </Box>
        </Box>

        {error && (
          <Box
            sx={{
              background: "#fee2e2",
              color: "#991b1b",
              p: 2,
              borderRadius: 3,
              mb: 4,
              borderLeft: "4px solid #dc2626",
            }}
          >
            <strong>Error:</strong> {error.message}
          </Box>
        )}

        <Grid container spacing={2}>
          {metrics.map((metric) => (
            <Grid size={{ xs: 12, md: 6 }} key={metric.title}>
              <Box
                sx={{
                  background: "white",
                  borderRadius: 4,
                  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
                  transition: "transform 0.3s, box-shadow 0.3s",
                  flexGrow: 1,
                  width: "100%",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: "0 15px 40px rgba(0, 0, 0, 0.15)",
                  },
                }}
              >
                <Box sx={{ padding: "16px" }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      mb: 2,
                    }}
                  >
                    <Box>
                      <Typography
                        sx={{
                          color: "#64748b",
                          fontSize: "0.9rem",
                          fontWeight: 600,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          mb: 1,
                        }}
                      >
                        {metric.title}
                      </Typography>
                      <Typography
                        sx={{
                          color: "#1e293b",
                          fontSize: { xs: "1.75rem", md: "2.5rem" },
                          fontWeight: 700,
                          lineHeight: 1,
                        }}
                      >
                        {metric.value}
                        {metric.unit}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        fontSize: { xs: "2.5rem", md: "3rem" },
                        width: { xs: 70, md: 80 },
                        height: { xs: 70, md: 80 },
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 4,
                        background: `linear-gradient(135deg, ${metric.gradientFrom}, ${metric.gradientTo})`,
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                      }}
                    >
                      {metric.icon}
                    </Box>
                  </Box>

                  <Box
                    sx={{ width: "100%", height: 200, mt: 2, display: "flex" }}
                  >
                    {metric?.additionalcomponent}
                    <LineChart
                      series={[
                        {
                          data: metric.data,
                          label: metric.title,
                          color: metric.color,
                          showMark: false,
                        },
                      ]}
                      xAxis={[
                        {
                          scaleType: "point",
                          data: timeLabels,
                          tickLabelStyle: {
                            fontSize: 10,
                            angle: -45,
                            textAnchor: "end",
                          },
                        },
                      ]}
                      yAxis={[
                        {
                          max: metric.max,
                          label: metric.unit,
                        },
                      ]}
                      margin={chartMargin}
                    />
                  </Box>

                  <Box
                    sx={{
                      mt: 2,
                      pt: 2,
                      borderTop: "1px solid #e2e8f0",
                    }}
                  >
                    <Typography
                      sx={{
                        color: "#64748b",
                        fontSize: "0.85rem",
                      }}
                    >
                      {metric.data.length > 0
                        ? (() => {
                            const numericOnly = metric.data.filter(
                              (x): x is number => x !== null
                            );

                            if (numericOnly.length === 0) {
                              return "Collecting data...";
                            }

                            const minVal = Math.min(...numericOnly).toFixed(1);
                            const maxVal = Math.max(...numericOnly).toFixed(1);

                            return (
                              <>
                                Range: {minVal}
                                {metric.unit} - {maxVal}
                                {metric.unit}
                              </>
                            );
                          })()
                        : "Collecting data..."}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>

        <Button
          onClick={() => refetch()}
          disabled={loading}
          sx={{
            display: "block",
            width: "100%",
            maxWidth: 250,
            margin: "16px auto",
            p: 2,
            background: "white",
            color: "#1e3a8a",
            borderRadius: 3,
            fontSize: "1rem",
            fontWeight: 600,
            textTransform: "none",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
            transition: "all 0.3s",
            "&:hover:not(:disabled)": {
              background: "linear-gradient(135deg, #1e3a8a, #3b82f6)",
              color: "white",
              transform: "translateY(-3px)",
              boxShadow: "0 15px 35px rgba(0, 0, 0, 0.15)",
            },
            "&:disabled": {
              opacity: 0.6,
            },
            "&:active:not(:disabled)": {
              transform: "translateY(-1px)",
            },
          }}
        >
          {"🔄 Refresh Now"}
        </Button>
      </Box>
    </Box>
  );
}

export default App;
