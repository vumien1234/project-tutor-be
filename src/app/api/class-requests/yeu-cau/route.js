import { supabaseApi } from "@tutor/supabase/apiRouteClient";
import { NextResponse } from "next/server";

// Xử lý GET request - Lấy thông tin yêu cầu nhận lớp
export async function GET(req) {
  const username = req.nextUrl.searchParams.get('username') || "";

  // Lấy thông tin yêu cầu nhận lớp với phân trang
  const { data, error } = await supabaseApi
    .from('yeu_cau_nhan_lop')
    .select('id, id_lop, username, total_price, description, plan, created_at, status')
    .eq('username', username)
    // Sắp xếp theo thời gian tạo yêu cầu
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  for (let i = 0; i < data.length; i++) {
    const { data: user, error: userError } = await supabaseApi
      .from('yeu_cau_mo_lop')
      .select('id,subject, address, total_price, due_date, status, gender, level')
      .eq('id', data[i].id_lop);

    if (userError) {
      return NextResponse.json({ error: userError.message }, { status: 500 });
    }

    data[i].request = user[0];
  }

  // Trả về thông tin yêu cầu nhận lớp cùng với dữ liệu phân trang
  return NextResponse.json({
    data,
    status: 200
  });
}
