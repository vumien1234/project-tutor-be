import { generateUsername } from "@tutor/app/utils/auth";
import sendEmail from "@tutor/app/utils/sendEmail";
import { supabaseApi } from "@tutor/supabase/apiRouteClient";
import { NextResponse } from "next/server";

// Xử lý POST request - Đăng ký người dùng
export async function POST(req) {
  const {data} = await req.json(); // Lấy dữ liệu từ request body

  for (let i = 0; i < data.length; i++) {
    const item = data[i];

    let { data: userCheck, error: errorCheck } = await supabaseApi.from('bank_history').select('id').eq('id', item.id);

    if (userCheck.length == 0) {
      await supabaseApi.from('bank_history').insert({...item});
    }

  }

  console.log(data);

  return NextResponse.json({
    message: "ok",
  }, { status: 201 });
}


export async function GET(request) {
  const limit = request.nextUrl.searchParams.get('limit') || 100;
  const content = request.nextUrl.searchParams.get('message') || '';
  const totalPrice = request.nextUrl.searchParams.get('price') || 0;
  const getData = request.nextUrl.searchParams.get('getData') || false;

  // if (content == '' || totalPrice == 0) {
  //   return NextResponse.json({
  //     message: "error",
  //     error: "message or price is required"
  //   }, { status: 400 });
  // }

  // get 100 records from bank_history sorted by created_at
  const { data: bankHistory, error } = await supabaseApi.from('bank_history').select('*').order('created_at', {ascending: false}).limit(limit);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  let transaction = null;
  let hasValidTransaction = false;

  for (let i = 0; i < bankHistory.length; i++) {
    const item = bankHistory[i];

    if (item.amount == totalPrice && item.description.includes(content)) {
      hasValidTransaction = true;
      transaction = item;
      break;
    }
  }

  return NextResponse.json({
    message: "ok",
    transaction: transaction,
    data: getData ? bankHistory : null,
    hasValidTransaction: hasValidTransaction
  }, { status: 200 });

}