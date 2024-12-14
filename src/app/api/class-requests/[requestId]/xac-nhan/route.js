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
    }

    // insert danh_sach_lop
    const { error: insertDanhSachLopError } = await supabaseApi
      .from('lop_hoc')
      .insert(payload);

    if (insertDanhSachLopError) {
      return NextResponse.json({ error: insertDanhSachLopError }, { status: 500 });
    }

    return NextResponse.json({ message: 'Xác nhận yêu cầu lớp học thành công' }, { status: 200 });
}