import { NextResponse } from "next/server";

export async function GET() {
  const users = [
    { id: "1", name: "Alice Admin", email: "alice@example.com", role: "ADMIN" },
    { id: "2", name: "Bob Teacher", email: "bob@example.com", role: "TEACHER" },
  ];

  return NextResponse.json({ users });
}
