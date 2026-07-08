import api from "./api";


export interface Doctor {

id:number;
name:string;
specialty:string;
city:string;

image?:string;
rating?:number;
nextAvailable?:string;

bio?:string;

}



export async function getDoctors():Promise<Doctor[]>{

const response =
await api.get("/doctors");


if(Array.isArray(response.data)){
return response.data;
}


if(Array.isArray(response.data.items)){
return response.data.items;
}


return [];

}




export async function getDoctorById(
id:number
):Promise<Doctor>{

const response =
await api.get(`/doctors/${id}`);


return response.data;

}