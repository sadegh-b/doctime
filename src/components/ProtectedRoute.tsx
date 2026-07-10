import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { getRole } from "../services/auth";


type Role =
  | "doctor"
  | "patient"
  | "admin";


interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: Role[];
}


export default function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {


  const token =
    localStorage.getItem(
      "access_token"
    );


  const role =
    getRole();



  if(!token){

    return (
      <Navigate
        to="/login"
        replace
      />
    );

  }



  if(
    allowedRoles &&
    (
      !role ||
      !allowedRoles.includes(
        role as Role
      )
    )
  ){

    return (
      <Navigate
        to="/"
        replace
      />
    );

  }



  return (
    <>
      {children}
    </>
  );

}