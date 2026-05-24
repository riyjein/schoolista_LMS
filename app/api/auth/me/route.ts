import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    user: {
      id: "dev-auth-bypass",
      email: "admin@olopsc.edu.ph",
      role: "ADMIN",
    },
  });
}
