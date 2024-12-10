import { supabaseApi } from "@tutor/supabase/apiRouteClient";
import { NextResponse } from "next/server";

// Xử lý GET request - Xem hồ sơ người dùng
export async function GET(req, { params }) {
  const { userId } = params; // Lấy userId từ URL

  // lấy thông tin người dùng từ database user và profile thông qua userId
  const { data, error } = await supabaseApi
    .from('user')
    .select('*')
    .eq('username', userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  const userInfo = data[0];
  // remove password before sending to client
  delete userInfo.password;

  return NextResponse.json(userInfo, { status: 200 });
}

// Xử lý PUT request - Cập nhật hồ sơ người dùng
export async function PUT(req, { params }) {
    const { userId } = params;
    const {
      role,
      is_active,
      address,
      avatar,
      gender,
      cccd,
      introduction,
      job,
      full_name,
      phone,
      password,
      subjects
    } = await req.json();

    // Cập nhật thông tin người dùng trong database user. cái nào rỗng thì không cập nhật
    const { error: updateError } = await supabaseApi
      .from('user')
      .update({
        role,
        is_active,
        password,
        address,
        avatar,
        gender,
        cccd,
        introduction,
        job,
        full_name,
        phone,
        subjects
      })
      .eq('username', userId);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }
  
    return NextResponse.json({
      message: "Cập nhật hồ sơ thành công",
    }, { status: 200 });
  }