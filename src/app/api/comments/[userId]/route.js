import { supabaseApi } from "@tutor/supabase/apiRouteClient";
import { NextResponse } from "next/server";

// Xử lý GET request - Xem danh sách nhận xét của người dùng
export async function GET(req, { params }) {
  const { userId } = params; // Lấy userId từ URL
  const page = parseInt(req.nextUrl.searchParams.get('page') || '1');
  const limit = parseInt(req.nextUrl.searchParams.get('limit') || '10');

  // Tính toán vị trí bắt đầu (offset) cho phân trang
  const offset = (page - 1) * limit;

  // Lấy tổng số bản ghi để tính tổng số trang
  const { count, error: countError } = await supabaseApi
    .from('comment')
    .select('*', { count: 'exact', head: true })
    .eq('username_voted', userId);

  if (countError) {
    return NextResponse.json({ error: countError.message }, { status: 500 });
  }

  const totalPages = Math.ceil(count / limit);

  // Lấy dữ liệu nhận xét theo phân trang
  const { data, error } = await supabaseApi
    .from('comment')
    .select('*')
    .eq('username_voted', userId)
    .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data.length) {
    return NextResponse.json({ message: 'Không có nhận xét.' }, { status: 404 });
  }

  // Trả về dữ liệu với thông tin phân trang
  return NextResponse.json({
    data,
    currentPage: page,
    totalPages: totalPages,
  }, { status: 200 });
}
