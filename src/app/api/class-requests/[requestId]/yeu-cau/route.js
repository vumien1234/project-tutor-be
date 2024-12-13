import { validateToken } from "@tutor/app/utils/auth";
import { supabaseApi } from "@tutor/supabase/apiRouteClient";
import { NextResponse } from "next/server";

// Xử lý POST request - Nhận lớp học
export async function POST(req, { params }) {
  const { requestId } = params;
  const { total_price, description, plan } = await req.json();

  const username = await validateToken(req);
  if (!username) {
    return NextResponse.json({ error: "Not Authorized !" }, { status: 400 });
  }

  // Kiểm tra xem yêu cầu mở lớp đã tồn tại chưa
  const { data, error } = await supabaseApi
    .from('yeu_cau_mo_lop')
    .select('status')
    .eq('id', requestId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data.length) {
    return NextResponse.json({ error: 'Yêu cầu không tồn tại' }, { status: 404 });
  }

  // Tạo yêu cầu nhận lớp
  const { data: data2, error: error2 } = await supabaseApi
    .from('yeu_cau_nhan_lop')
    .insert({
      id_lop: requestId,
      username,
      total_price,
      description,
      status: 'pending',
      plan,
    });

  if (error2) {
    return NextResponse.json({ error: error2.message }, { status: 500 });
  }

  // Trả về phản hồi khi yêu cầu được tạo thành công
  return NextResponse.json({ message: 'Yêu cầu nhận lớp được tạo thành công' }, { status: 201 });
}

// Xử lý GET request - Lấy thông tin yêu cầu nhận lớp
export async function GET(req, { params }) {
  const { requestId } = params;
  const page = parseInt(req.nextUrl.searchParams.get('page') || '1');
  const limit = parseInt(req.nextUrl.searchParams.get('limit') || '1000');

  // Tính toán vị trí bắt đầu (offset) dựa trên trang hiện tại và số lượng bản ghi trên mỗi trang
  const offset = (page - 1) * limit;

  // Lấy tổng số bản ghi để tính tổng số trang
  const { count, error: countError } = await supabaseApi
    .from('yeu_cau_nhan_lop')
    .select('*', { count: 'exact', head: true })
    .eq('id_lop', requestId);

  if (countError) {
    return NextResponse.json({ error: countError.message }, { status: 500 });
  }

  const totalPages = Math.ceil(count / limit);

  // Lấy thông tin yêu cầu nhận lớp với phân trang
  const { data, error } = await supabaseApi
    .from('yeu_cau_nhan_lop')
    .select('id, id_lop, username, total_price, description, plan, created_at, status')
    .eq('id_lop', requestId)
    // Sắp xếp theo thời gian tạo yêu cầu
    .order('created_at', { ascending: false })
    // Áp dụng phân trang
    .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // get list of users
  for (let i = 0; i < data.length; i++) {
    const { data: user, error: userError } = await supabaseApi
      .from('user')
      .select('username, full_name, avatar, is_active, address, phone, email, role')
      .eq('username', data[i].username);

    if (userError) {
      return NextResponse.json({ error: userError.message }, { status: 500 });
    }

    data[i].author = user[0];
  }

  // Trả về thông tin yêu cầu nhận lớp cùng với dữ liệu phân trang
  return NextResponse.json({
    data,
    id_lop: requestId,
    currentPage: page,
    totalPages: totalPages,
  });
}


export async function PUT(req, { params }) {
  const { requestId } = params;
  const { status, username, id } = await req.json();

  // find id yeu_cau_nhan_lop
  const { data: data2, error: error2 } = await supabaseApi
    .from('yeu_cau_nhan_lop')
    .select('*')
    .eq('id', id);

  if (error2) {
    return NextResponse.json({ error: error2.message }, { status: 500 });
  }

  if (!data2.length) {
    return NextResponse.json({ error: 'Yêu cầu không tồn tại 1' }, { status: 404 });
  }

  let dataYeuCau = data2[0];

  // update status
  if (dataYeuCau.id_lop != requestId) {
    return NextResponse.json({ error: 'Yêu cầu không tồn tại 2' }, { status: 404 });
  }

  if (dataYeuCau.username !== username) {
    return NextResponse.json({ error: 'Yêu cầu không tồn tại 3' }, { status: 404 });
  }

  const { data: data3, error: error3 } = await supabaseApi
  .from('yeu_cau_mo_lop')
  .select('*')
  .eq('id', requestId);

  if (error3) {
    return NextResponse.json({ error: error3.message }, { status: 500 });
  }

  if (!data3.length) {
    return NextResponse.json({ error: 'Yêu cầu không tồn tại 4' }, { status: 404 });
  }

  let dataLop = data3[0];

  if (dataLop.status === "done"){
    return NextResponse.json({ error: 'Lớp đã được nhận' }, { status: 400 });
  }

  // update status yeu_cau_nhan_lop
  const { data: data4, error: error4 } = await supabaseApi
    .from('yeu_cau_nhan_lop')
    .update({ status })
    .eq('id', id);

  if (error4) {
    return NextResponse.json({ error: error4.message }, { status: 500 });
  }

  // update status yeu_cau_mo_lop
  let statusLop = dataLop.status;
  if (status === "waiting_payment") {
    statusLop = " ";
  }
  if (status === "done") {
    statusLop = "done";
  }
  if (status !== "rejected") {
    const { data: data5, error: error5 } = await supabaseApi
      .from('yeu_cau_mo_lop')
      .update({ status: statusLop })
      .eq('id', requestId);
    
      if (error5) {
      return NextResponse.json({ error: error5.message }, { status: 500 });
    }
  }


  // Trả về phản hồi khi yêu cầu được cập nhật thành công
  return NextResponse.json({ message: 'Yêu cầu nhận lớp đã được cập nhật' });
}

// Xử lý DELETE request - Hủy yêu cầu nhận lớp
export async function DELETE(req, { params }) {
  const { requestId } = params;

  const username = await validateToken(req);
  if (!username) {
    return NextResponse.json({ error: "Not Authorized !" }, { status: 400 });
  }

  // Xóa yêu cầu nhận lớp
  const { error: error2 } = await supabaseApi
    .from('yeu_cau_nhan_lop')
    .delete()
    .eq('id_lop', requestId)
    .eq('username', username);

  if (error2) {
    return NextResponse.json({ error: error2.message }, { status: 500 });
  }

  // Trả về phản hồi khi yêu cầu được xóa thành công
  return NextResponse.json({ message: 'Yêu cầu nhận lớp đã bị hủy' });
}