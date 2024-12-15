import { supabaseApi } from "@tutor/supabase/apiRouteClient";
import { NextResponse } from "next/server";

// Xử lý GET request - Lấy thông tin yêu cầu nhận lớp
export async function GET(req) {
  const username = req.nextUrl.searchParams.get('username') || "";

  let data, error;

  // Lấy thông tin yêu cầu nhận lớp với phân trang
  if (username === "") {
    // Lấy tất cả yêu cầu nhận lớp
    ({ data, error } = await supabaseApi
      .from('yeu_cau_nhan_lop')
      .select('id, id_lop, username, total_price, description, plan, created_at, status')
      .order('created_at', { ascending: false }));
  } else {
    // Lấy yêu cầu nhận lớp của một username cụ thể
    ({ data, error } = await supabaseApi
      .from('yeu_cau_nhan_lop')
      .select('id, id_lop, username, total_price, description, plan, created_at, status')
      .eq('username', username)
      .order('created_at', { ascending: false }));
  }

  // Xử lý lỗi nếu có
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Nếu không có dữ liệu, trả về kết quả rỗng
  if (!data || data.length === 0) {
    return NextResponse.json({ data: [] }, { status: 200 });
  }

  // Lấy thông tin chi tiết lớp cho từng yêu cầu
  for (let i = 0; i < data.length; i++) {
    const { data: user, error: userError } = await supabaseApi
      .from('yeu_cau_mo_lop')
      .select('id, subject, address, total_price, due_date, status, gender, level')
      .eq('id', data[i].id_lop);

    // Xử lý lỗi nếu có
    if (userError) {
      return NextResponse.json({ error: userError.message }, { status: 500 });
    }

    // Gán dữ liệu lớp vào yêu cầu
    if (user && user.length > 0) {
      data[i].request = user[0];
    } else {
      data[i].request = null; // Nếu không tìm thấy lớp, gán null
    }
  }

  // Trả về thông tin yêu cầu nhận lớp cùng với dữ liệu phân trang
  return NextResponse.json({
    data,
    status: 200
  });
}
