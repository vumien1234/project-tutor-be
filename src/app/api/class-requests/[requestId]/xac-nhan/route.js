import sendEmail from "@tutor/app/utils/sendEmail";
import { supabaseApi } from "@tutor/supabase/apiRouteClient";
import { NextResponse } from "next/server";

// Xử lý PUT request - Cập nhật yêu cầu lớp học
export async function POST(req, { params }) {
    const { requestId } = params;
    const { transaction_id } = await req.json();

    const { data, error } = await supabaseApi
      .from('yeu_cau_mo_lop')
      .select('*')
      .eq('id', requestId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (data.length == 0) {
      return NextResponse.json({ error: 'Yêu cầu không tồn tại' }, { status: 404 });
    }

    if (data[0].status == 'done') {
      return NextResponse.json({ error: 'Yêu cầu đã được xác nhận trước đó' }, { status: 400 });
    }

    // get yeu cau nhan lop

    const { data: yeuCauNhanLop, error: yeuCauNhanLopError } = await supabaseApi
      .from('yeu_cau_nhan_lop')
      .select('*')
      .eq('id_lop', requestId)
      .eq('status', 'waiting_payment');

    if (yeuCauNhanLopError) {
      return NextResponse.json({ error: yeuCauNhanLopError.message }, { status: 500 });
    }

    if (yeuCauNhanLop.length == 0) {
      // error
      return NextResponse.json({ error: 'Yêu cầu nhận lớp không tồn tại' }, { status: 404 });
    }

    // update status to done
    const { error: updateError } = await supabaseApi
      .from('yeu_cau_mo_lop')
      .update({
        status: 'done',
        transaction_id: transaction_id
      })
      .eq('id', requestId);
    
    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // update status to done
    const { error: updateYeuCauNhanLopError } = await supabaseApi
      .from('yeu_cau_nhan_lop')
      .update({
        status: 'done'
      })
      .eq('id_lop', requestId)
      .eq('status', 'waiting_payment');

    if (updateYeuCauNhanLopError) {
      return NextResponse.json({ error: updateYeuCauNhanLopError.message }, { status: 500 });
    }

    const payload = {
      id_danh_sach_lop: parseInt(requestId),
      id_yeu_cau_nhan_lop: yeuCauNhanLop[0].id,
      username_user: data[0].username,
      username_tutor: yeuCauNhanLop[0].username,
      status: 'active',
    };

    // insert danh_sach_lop
    const { error: insertDanhSachLopError } = await supabaseApi
      .from('lop_hoc')
      .insert(payload);

    if (insertDanhSachLopError) {
      return NextResponse.json({ error: insertDanhSachLopError }, { status: 500 });
    }


    // get email of tutor and user
    const { data: tutorData, error: tutorError } = await supabaseApi
      .from('user')
      .select('email')
      .eq('username', yeuCauNhanLop[0].username);

    if (tutorError) {
      return NextResponse.json({ error: tutorError.message }, { status: 500 });
    }

    const { data: userData, error: userError } = await supabaseApi
      .from('user')
      .select('email')
      .eq('username', data[0].username);


    if (userError) {
      return NextResponse.json({ error: userError.message }, { status: 500 });
    }

    // send email to tutor
    // send email to tutor
await sendEmail({
  email: tutorData[0].email,
  subject: 'Lớp của bạn đã được nhận',
  html: `
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Lớp của bạn đã được nhận</title>
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
        .link {
          color: #4CAF50;
          text-decoration: none;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="email-header">
          <h2>Lớp của bạn đã được nhận</h2>
        </div>
        <div class="email-body">
          <p>Chào bạn,</p>
          <p>Lớp học của bạn đã được nhận và xác nhận.</p>
          <p>Vui lòng truy cập <a href="https://onllearning.edu.vn/ho-so?tab=lich-hoc" class="link">đây</a> để xem thêm chi tiết và quản lý lớp học của bạn.</p>
          <p>Cảm ơn bạn đã hợp tác!</p>
        </div>
        <div class="footer">
          <p>Trân trọng,</p>
          <p>Đội ngũ hỗ trợ lớp học</p>
        </div>
      </div>
    </body>
    </html>`
});


// send email to user
await sendEmail({
  email: userData[0].email,
  subject: 'Lớp của bạn đã được mở',
  html: `
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Lớp của bạn đã được mở</title>
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
        .link {
          color: #4CAF50;
          text-decoration: none;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="email-header">
          <h2>Lớp của bạn đã được mở</h2>
        </div>
        <div class="email-body">
          <p>Chào bạn,</p>
          <p>Lớp học của bạn đã được mở thành công.</p>
          <p>Vui lòng truy cập <a href="https://onllearning.edu.vn/ho-so?tab=lich-hoc" class="link">đây</a> để xem thêm chi tiết và quản lý lớp học của bạn.</p>
          <p>Cảm ơn bạn đã chọn tham gia!</p>
        </div>
        <div class="footer">
          <p>Trân trọng,</p>
          <p>Đội ngũ hỗ trợ lớp học</p>
        </div>
      </div>
    </body>
    </html>`
});


    return NextResponse.json({ message: 'Xác nhận yêu cầu lớp học thành công' }, { status: 200 });
}