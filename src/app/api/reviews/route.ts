import { getReviews } from "@/db/reviews";
import { NextResponse } from "next/server";

export async function GET() {
  const reviews = getReviews();
  return NextResponse.json(reviews);
} 