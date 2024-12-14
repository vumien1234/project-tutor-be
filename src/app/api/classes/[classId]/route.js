import { supabaseApi } from "@tutor/supabase/apiRouteClient";
import { NextResponse } from "next/server";

// Xử lý GET request - Xem chi tiết lớp học
export async function GET(req, { params }) {
  const { classId } = params;

  const { data, error } = await supabaseApi
    .from('lop_hoc')
    .select('*')
    .eq('id', classId)
    .single();

  const { data: dataClass, error: errorUser } = await supabaseApi.from('yeu_cau_mo_lop').select('*').eq('id', data.id_danh_sach_lop).single();
  if (errorUser) {
    return NextResponse.json({ error: errorUser.message }, { status: 500 });
  }
  data.dataClass = dataClass;

  const { data: dataNhanLop, error: _errorUser } = await supabaseApi.from('yeu_cau_nhan_lop').select('*').eq('id', data.id_yeu_cau_nhan_lop).single();
  if (_errorUser) {
    return NextResponse.json({ error: _errorUser.message }, { status: 500 });
  }
  data.dataNhanLop = dataNhanLop;

  const { data: dataTutor, error: errorTutor } = await supabaseApi.from('user').select('*').eq('username', data.username_tutor).single();
  if (errorTutor) {
    return NextResponse.json({ error: errorTutor.message }, { status: 500 });
  }
  data.dataTutor = dataTutor;

  const { data: dataUser, error: errorUser_ } = await supabaseApi.from('user').select('*').eq('username', data.username_user).single();
  if (errorUser_) {
    return NextResponse.json({ error: errorUser_.message }, { status: 500 });
  }
  data.dataUser = dataUser;
    

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  return NextResponse.json({
    data: data,
    message: "m"
  });
}