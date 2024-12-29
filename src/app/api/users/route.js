import { generateUsername } from "@tutor/app/utils/auth";
import sendEmail from "@tutor/app/utils/sendEmail";
import { supabaseApi } from "@tutor/supabase/apiRouteClient";
import { NextResponse } from "next/server";

// Xử lý POST request - Đăng ký người dùng
export async function POST(req) {
  const { full_name, email, password, role, phone = "" } = await req.json(); // Lấy dữ liệu từ request body

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

  let is_active = true;

  if (role === 'tutor') { 
    is_active = false
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
      <html lang="vi">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Đăng ký tài khoản thành công</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f9f9f9;
          }
          .email-container {
            background-color: #fff;
            padding: 20px;
            margin: 0 auto;
            width: 80%;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          }
          .email-header {
            background-color: #4CAF50;
            color: #fff;
            padding: 10px;
            text-align: center;
            border-radius: 5px;
          }
          .email-body {
            padding: 20px;
            background-color: #f4f4f4;
            margin-top: 20px;
            border-radius: 5px;
          }
          .footer {
            margin-top: 20px;
            text-align: center;
            font-size: 14px;
            color: #777;
          }
          .list {
            margin-left: 20px;
          }
          .list li {
            margin-bottom: 8px;
          }
          .link {
            color: #4CAF50;
            text-decoration: none;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="email-header">
            <h2>Chúc mừng! Đăng ký tài khoản thành công</h2>
          </div>
          <div class="email-body">
            <p>Xin chào <strong>${full_name}</strong>,</p>
            <p>Cảm ơn bạn đã đăng ký tài khoản trên hệ thống gia sư trực tuyến của chúng tôi. Chúng tôi rất vui mừng được chào đón bạn gia nhập cộng đồng học tập của chúng tôi.</p>
            
            <p><strong>Dưới đây là thông tin tài khoản của bạn:</strong></p>
            <ul class="list">
              <li><strong>Email:</strong> ${email}</li>
              <li><strong>Tên đăng nhập:</strong> ${username}</li>
            </ul>
  
            <p>Chúng tôi hy vọng bạn sẽ có những trải nghiệm học tập tuyệt vời cùng chúng tôi. Nếu có bất kỳ câu hỏi nào, đừng ngần ngại liên hệ với chúng tôi qua email hoặc số điện thoại hỗ trợ.</p>
            
            <p>Chúc bạn một ngày làm việc hiệu quả và nhiều niềm vui!</p>
          </div>
          <div class="footer">
            <p>Trân trọng,</p>
            <p><strong>Đội ngũ hỗ trợ của hệ thống gia sư trực tuyến</strong></p>
          </div>
        </div>
      </body>
      </html>`
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
