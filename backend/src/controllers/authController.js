const pool=require("../config/database");
const jwt=require("jsonwebtoken");
const {comparePassword}=require("../services/passwordService");
exports.login=async(req,res,next)=>{try{
 const {username,password}=req.body;
 if(!username||!password) return res.status(400).json({success:false,message:"Username dan password wajib diisi"});
 const {rows}=await pool.query("SELECT id,role_id,name,username,email,password_hash,status FROM users WHERE username=$1",[username]);
 const user=rows[0];
 if(!user||user.status!=="active"||!(await comparePassword(password,user.password_hash)))
   return res.status(401).json({success:false,message:"Username atau password salah"});
 const token=jwt.sign({id:user.id,role_id:user.role_id,username:user.username},process.env.JWT_SECRET,{expiresIn:"8h"});
 delete user.password_hash; delete user.status;
 res.json({success:true,message:"Login berhasil",token,user});
}catch(e){next(e)}};
