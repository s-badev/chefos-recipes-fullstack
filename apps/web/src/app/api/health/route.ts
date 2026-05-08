import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    status: "ok",
    appName: "Chefo’s Recipes",
    timestamp: new Date().toISOString()
  });
}
