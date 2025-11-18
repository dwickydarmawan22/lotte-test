import { NextRequest, NextResponse } from 'next/server';

interface WeatherReading {
  timestamp: string;
  airTemperature: number;
  rainfall: number;
  relativeHumidity: number;
  windSpeed: number;
}

function generateWeatherReading(): WeatherReading {
  const now = new Date();

  const baseTemp = 23.5;
  const tempVariation = (Math.random() - 0.5) * 3;

  const baseRainfall = 12.5;
  const rainfallVariation = Math.random() * 5;

  const baseHumidity = 68;
  const humidityVariation = (Math.random() - 0.5) * 6;

  const baseWindSpeed = 8.3;
  const windVariation = Math.random() * 4;

  return {
    timestamp: now.toISOString(),
    airTemperature: parseFloat((baseTemp + tempVariation).toFixed(1)),
    rainfall: parseFloat((baseRainfall + rainfallVariation).toFixed(1)),
    relativeHumidity: parseFloat((baseHumidity + humidityVariation).toFixed(1)),
    windSpeed: parseFloat((baseWindSpeed + windVariation).toFixed(1)),
  };
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function GET() {
  try {
    const data = generateWeatherReading();

    return NextResponse.json(
      {
        success: true,
        data, // single item
      },
      {
        status: 200,
        headers: corsHeaders,
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch weather data',
      },
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}
