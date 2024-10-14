import { decrypt } from "./Security";

export function getToken(req) {
    const authorization = req.headers.get("authorization");
    const token = authorization?.split(" ")[1];
    
    if (!token) {
      return null;
    }
  
    return token;
}
  
export const validateToken = async (req) => {
    const token = await getToken(req);
    if (!token) {
      return null;
    }
    try {
      let decryptedToken = await decrypt(token);
      decryptedToken = JSON.parse(decryptedToken);
      return decryptedToken["username"];
    }
    catch (error) {
      return null;
    }
}

export function generateUsername(fullName) {
  // Chuyển họ tên về mảng các từ
  let nameParts = fullName.split(' ');
  
  // Lấy họ (từ đầu tiên) và tên (từ cuối cùng)
  let lastName = nameParts[0];
  let firstName = nameParts[nameParts.length - 1];

  if (nameParts.length === 1){
    firstName = "";
  }
  
  // Tạo username từ họ và tên, loại bỏ dấu
  let username = (lastName + firstName)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")  // Loại bỏ dấu
      .replace(/[^a-zA-Z0-9]/g, '');   // Loại bỏ ký tự đặc biệt

  // Thêm chuỗi ngẫu nhiên từ a-z, A-Z, 0-9 để đảm bảo tính duy nhất
  let randomString = Math.random().toString(36).substring(2, 8); // Tạo chuỗi ngẫu nhiên 6 ký tự

  return {
    username: username,
    username_add: username + randomString
  }
}