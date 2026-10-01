const r=require("express").Router();const c=require("../controllers/authController");r.post("/login",c.login);module.exports=r;
