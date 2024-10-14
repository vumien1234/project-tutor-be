import { supabaseApi } from "@tutor/supabase/apiRouteClient";
import { NextResponse } from "next/server";

// Xử lý GET request - Xem danh sách yêu cầu lớp học
export async function GET(request) {
  const page = parseInt(request.nextUrl.searchParams.get('page') || '1');
  const limit = parseInt(request.nextUrl.searchParams.get('limit') || '10');

  // Tính offset cho phân trang
  const offset = (page - 1) * limit;

  // Lấy tổng số bản ghi để tính toán tổng số trang
  const { count, error: countError } = await supabaseApi
    .from('yeu_cau_mo_lop')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');

  if (countError) {
    return NextResponse.json({ error: countError.message }, { status: 500 });
  }

  const totalPages = Math.ceil(count / limit);

  // Lấy dữ liệu với phân trang
  const { data, error } = await supabaseApi
    .from('yeu_cau_mo_lop')
    .select('*')
    .eq('status', 'pending')
    .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(
    {
      data,
      currentPage: page,
      totalPages: totalPages,
    },
    { status: 200 }
  );
}

// Xử lý POST request - Tạo yêu cầu thuê lớp học
export async function POST(req) {
  const { username, subject, address, total_price, time, note, due_date } = await req.json();

  const { data, error } = await supabaseApi
    .from('yeu_cau_mo_lop')
    .insert([{ username, subject, address, total_price, time, note, due_date, status: 'pending' }]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    message: "Đã gửi yêu cầu thuê lớp học thành công !",
  }, { status: 201 });
}
