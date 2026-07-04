import { NextResponse } from "next/server";

// Mock database untuk mapping provinsi ke harga dasar (sebagai simulasi API real-time)
const PROVINCE_RATES: { [key: string]: number } = {
  "dki jakarta": 9000,
  "jawa barat": 11000,
  "banten": 11000,
  "jawa tengah": 18000,
  "diy yogyakarta": 18000,
  "jawa timur": 22000,
  "bali": 25000,
  "lampung": 25000,
  "sumatera selatan": 30000,
  "sumatera utara": 45000,
  "sumatera barat": 40000,
  "riau": 40000,
  "jambi": 35000,
  "bengkulu": 35000,
  "kepulauan riau": 45000,
  "kalimantan barat": 50000,
  "kalimantan tengah": 55000,
  "kalimantan selatan": 50000,
  "kalimantan timur": 60000,
  "kalimantan utara": 65000,
  "sulawesi utara": 65000,
  "sulawesi tengah": 65000,
  "sulawesi selatan": 55000,
  "sulawesi tenggara": 65000,
  "gorontalo": 70000,
  "sulawesi barat": 65000,
  "nusa tenggara barat": 50000,
  "nusa tenggara timur": 75000,
  "maluku": 80000,
  "maluku utara": 85000,
  "papua": 95000,
  "papua barat": 95000,
  "papua selatan": 100000,
  "papua tengah": 100000,
  "papua pegunungan": 110000,
};

export async function POST(req: Request) {
  try {
    const { destination, weight, courier } = await req.json();

    if (!destination || !weight) {
      return NextResponse.json({ error: "Missing required data" }, { status: 400 });
    }

    const province = destination.provinsi.toLowerCase();
    const weightInKg = Math.ceil(weight / 1000);
    
    // Base rate dari mapping (Simulasi hit ke API RajaOngkir)
    let baseRate = PROVINCE_RATES[province] || 45000;

    // Variasi harga antar kurir
    let courierMultiplier = 1;
    let estimasi = "2-4 hari";

    switch (courier.toLowerCase()) {
      case "jne":
        courierMultiplier = 1.1;
        estimasi = "2-3 hari";
        break;
      case "jnt":
        courierMultiplier = 1.0;
        estimasi = "1-3 hari";
        break;
      case "sicepat":
        courierMultiplier = 1.05;
        estimasi = "2-3 hari";
        break;
      case "anteraja":
        courierMultiplier = 0.95;
        estimasi = "2-5 hari";
        break;
    }

    const finalCost = Math.round(baseRate * courierMultiplier * weightInKg);

    // Simulasi delay API
    await new Promise((resolve) => setTimeout(resolve, 500));

    return NextResponse.json({
      courier,
      cost: finalCost,
      estimasi,
      weight_kg: weightInKg
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
