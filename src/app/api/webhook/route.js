import { generateUsername } from "@tutor/app/utils/auth";
import sendEmail from "@tutor/app/utils/sendEmail";
import { supabaseApi } from "@tutor/supabase/apiRouteClient";
import { NextResponse } from "next/server";

// Xử lý POST request - Đăng ký người dùng
export async function POST(req) {
  const {data} = await req.json(); // Lấy dữ liệu từ request body

  // save data to database
  const { error: insertError } = await supabaseApi.from('bank_history').insert([
    ...data
  ]);

  console.log(insertError);

  console.log(data);

  return NextResponse.json({
    message: "Đăng ký tài khoản thành công",
  }, { status: 201 });
}
