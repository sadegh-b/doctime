import api from "./api";


export interface LoginResponse {
  access_token: string;
  token_type: string;
}


export interface RegisterPayload {
  name: string;
  phone: string;
  password: string;
  email?: string;
  role: "patient" | "doctor";
}


// استخراج اطلاعات JWT
function decodeToken(token:string){

  try{

    const payload =
      token.split(".")[1];

    return JSON.parse(
      atob(payload)
    );

  }catch{

    return null;

  }

}



// LOGIN

export async function login(
 phone:string,
 password:string
){

 const formData =
 new URLSearchParams();


 formData.append(
  "username",
  phone
 );


 formData.append(
  "password",
  password
 );



 const response =
 await api.post<LoginResponse>(
  "/auth/login",
  formData,
  {
   headers:{
    "Content-Type":
    "application/x-www-form-urlencoded"
   }
  }
 );



 const token =
 response.data.access_token;



 if(!token){

  throw new Error(
   "Token دریافت نشد"
  );

 }



 localStorage.setItem(
  "access_token",
  token
 );



 const decoded =
 decodeToken(token);



 if(decoded?.role){

  localStorage.setItem(
   "role",
   decoded.role
  );

 }



 return response.data;

}




// REGISTER

export async function register(
 data:RegisterPayload
){

 const response =
 await api.post(
  "/auth/register",
  data
 );


 return response.data;

}




// LOGOUT

export function logout(){

 localStorage.removeItem(
  "access_token"
 );


 localStorage.removeItem(
  "role"
 );


}



// ROLE

export function saveRole(
 role:"doctor"|"patient"
){

 localStorage.setItem(
  "role",
  role
 );

}



export function getRole(){

 return localStorage.getItem(
  "role"
 );

}



export function isLoggedIn(){

 return Boolean(
  localStorage.getItem(
   "access_token"
  )
 );

}