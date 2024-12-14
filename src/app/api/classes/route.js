import { supabaseApi } from "@tutor/supabase/apiRouteClient";
import { NextResponse } from "next/server";

// Xử lý GET request - Xem danh sách lớp học
export async function GET(req) {
  // Lấy các tham số từ URL query string
  const username_user = req.nextUrl.searchParams.get('username_user') || '';
  const username_tutor = req.nextUrl.searchParams.get('username_tutor') || '';

  // Xây dựng câu truy vấn động tùy vào việc có tham số username_user và username_tutor hay không
  let query = supabaseApi.from('lop_hoc').select('*');

  // Nếu có username_user, thêm điều kiện lọc cho username_user
  if (username_user) {
    query = query.eq('username_user', username_user);
  }

  // Nếu có username_tutor, thêm điều kiện lọc cho username_tutor
  if (username_tutor) {
    query = query.eq('username_tutor', username_tutor);
  }

  // Thực thi câu truy vấn
  const { data, error } = await query;

  // Kiểm tra lỗi và trả về phản hồi thích hợp
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  for (let i = 0; i < data.length; i++) {
    const { data: dataClass, error: errorUser } = await supabaseApi.from('yeu_cau_mo_lop').select('subject,address,time,end_time,gender,level').eq('id', data[i].id_danh_sach_lop).single();
    if (errorUser) {
      return NextResponse.json({ error: errorUser.message }, { status: 500 });
    }
    data[i].dataClass = dataClass;
  }

  return NextResponse.json({
    data,
    message: 'Danh sách lớp học'
  });
}

// Xử lý POST request - Tạo lớp học sau khi yêu cầu được xác nhận
export async function POST(req) {
  const { id_danh_sach_lop, id_yeu_cau_nhan_lop, id_tutor, id_user, address, price, time, note } = await req.json();

  const { data, error } = await supabaseApi
    .from('lop_hoc')
    .insert([
      { id_danh_sach_lop, id_yeu_cau_nhan_lop, id_tutor, id_user, address, price, time, status: 'active', note }
    ]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
