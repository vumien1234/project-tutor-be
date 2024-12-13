import { generateUsername } from "@tutor/app/utils/auth";
import sendEmail from "@tutor/app/utils/sendEmail";
import { supabaseApi } from "@tutor/supabase/apiRouteClient";
import { NextResponse } from "next/server";

// Xử lý POST request - Đăng ký người dùng
export async function POST(req) {
  const { full_name, email, password, role, phone = "", is_active = false } = await req.json(); // Lấy dữ liệu từ request body

  // Kiểm tra dữ liệu đầu vào
  if (!full_name || !email || !password) {
    return NextResponse.json({ error: "Thiếu thông tin đăng ký" }, { status: 400 });
  }

  let { username, username_add } = generateUsername(full_name); // Tạo username từ họ tên
  // kieem tra username đã tồn tại chưa
  let { data: userCheck, error: errorCheck } = await supabaseApi.from('user').select('id').eq('username', username);
  if (errorCheck) {
    return NextResponse.json({ error: errorCheck.message }, { status: 500 });
  }

  if (userCheck.length > 0) {
    username = username_add;
  }

  // Tạo tài khoản người dùng
  const { error: insertError } = await supabaseApi.from('user').insert([
    { username, full_name, email, password, role, is_active, phone }
  ]);

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  await sendEmail({
    email: email,
    subject: "Chúc mừng! Đăng ký tài khoản thành công",
    html: `
      <p>Xin chào ${full_name},</p>
      <p>Cảm ơn bạn đã đăng ký tài khoản trên hệ thống gia sư trực tuyến của chúng tôi. Chúng tôi rất vui mừng được chào đón bạn gia nhập cộng đồng học tập của chúng tôi.</p>
      <p>Dưới đây là thông tin tài khoản của bạn:</p>
      <ul>
        <li><strong>Email:</strong> ${email}</li>
        <li><strong>Tên đăng nhập:</strong> ${username}</li>
      </ul>
      <p>Chúng tôi hy vọng bạn sẽ có những trải nghiệm học tập tuyệt vời cùng chúng tôi. Nếu có bất kỳ câu hỏi nào, đừng ngần ngại liên hệ với chúng tôi.</p>
      
      <p>Chúc bạn một ngày làm việc hiệu quả và nhiều niềm vui!</p>
      
      <p>Trân trọng,</p>
      <p><strong>Đội ngũ hỗ trợ của hệ thống gia sư trực tuyến</strong></p>
    `
  });  

  return NextResponse.json({
    message: "Đăng ký tài khoản thành công",
  }, { status: 201 });
}

// Xử lý GET request - get all user
export async function GET(req) {
  const page = parseInt(req.nextUrl.searchParams.get('page') || '1');
  const limit = parseInt(req.nextUrl.searchParams.get('limit') || '1000');
  const role = req.nextUrl.searchParams.get('role') || '';

  // Tính offset cho phân trang
  const offset = (page - 1) * limit;

  // Bắt đầu truy vấn với Supabase
  let query = supabaseApi
    .from('user')
    .select('*', { count: 'exact', head: true })
    .range(offset, offset + limit - 1);

  // Nếu role có giá trị, thêm điều kiện lọc theo role
  if (role) {
    query = query.eq('role', role);
  }

  // Lấy tổng số bản ghi để tính toán tổng số trang
  const { count, error: countError } = await query;

  if (countError) {
    return NextResponse.json({ error: countError.message }, { status: 500 });
  }

  const totalPages = Math.ceil(count / limit);

  // Truy vấn lấy dữ liệu với phân trang và điều kiện search role (nếu có)
  let dataQuery = supabaseApi
    .from('user')
    .select('id, username, full_name, email, subjects, role, is_active, avatar, address, gender, cccd, introduction, job, full_name, phone')
    .range(offset, offset + limit - 1);

  // Nếu role có giá trị, thêm điều kiện lọc theo role
  if (role) {
    dataQuery = dataQuery.eq('role', role);
  }

  // Lấy dữ liệu
  const { data, error } = await dataQuery;

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
