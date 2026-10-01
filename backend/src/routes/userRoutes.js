const r=require("express").Router();const c=require("../controllers/userController");const auth=require("../middleware/authMiddleware");const {requireAdmin}=require("../middleware/roleMiddleware");
r.use(auth);r.get("/",c.getAll);r.get("/:id",c.getOne);r.post("/",requireAdmin,c.create);r.put("/:id",requireAdmin,c.update);r.delete("/:id",requireAdmin,c.remove);module.exports=r;
