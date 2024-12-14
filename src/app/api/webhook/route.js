import { generateUsername } from "@tutor/app/utils/auth";
import sendEmail from "@tutor/app/utils/sendEmail";
import { supabaseApi } from "@tutor/supabase/apiRouteClient";
import { NextResponse } from "next/server";

// Xử lý POST request - Đăng ký người dùng
export async function POST(req) {
  const {data} = await req.json(); // Lấy dữ liệu từ request body

  for (let i = 0; i < data.length; i++) {
    const item = data[i];

    let { data: userCheck, error: errorCheck } = await supabaseApi.from('bank_history').select('id').eq('id', item.id);

    if (userCheck.length == 0) {
      const { error: insertError } = await supabaseApi.from('bank_history').insert({item});
      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }
    }

  }

  return NextResponse.json({
    message: "ok",
  }, { status: 201 });
}
