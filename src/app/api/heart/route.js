import sendEmail from "@tutor/app/utils/sendEmail";
import { NextResponse } from "next/server";

export async function GET() {
  // await sendEmail({
  //   email: "cong.pttc@gmail.com",
  //   subject: "Test email",
  //   html: "<h1>Hello</h1>",
  // })
  return NextResponse.json({ message: "Welcome to API Routes!" });
}

export async function POST(request) {
  const body = await request.json();
  return NextResponse.json({ message: `You submitted the following data: ${JSON.stringify(body)}` });
}
