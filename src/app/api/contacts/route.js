import { generateUsername } from "@tutor/app/utils/auth";
import sendEmail from "@tutor/app/utils/sendEmail";
import { supabaseApi } from "@tutor/supabase/apiRouteClient";
import { NextResponse } from "next/server";

// Xử lý POST request - Đăng ký người dùng
export async function POST(req) {
  const {name, email, message} = await req.json(); // Lấy dữ liệu từ request body

  // update insert data to database contacts

  await supabaseApi.from('contacts').insert({name, email, message, updated_at: new Date()});

  return NextResponse.json({
    message: "ok",
  }, { status: 201 });  

}


export async function GET(request) {

  const { data: contacts, error } = await supabaseApi.from('contacts').select('*').order('created_at', {ascending: false});

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    data: contacts,
    status: 200
  });
}

// put update

export async function PUT(req) {
  const {id, status} = await req.json(); // Lấy dữ liệu từ request body

  // update insert data to database contacts

  await supabaseApi.from('contacts').update({status, updated_at: new Date()}).eq('id', id);

  return NextResponse.json({
    message: "ok",
    data: {id, status}
  }, { status: 201 });  

}