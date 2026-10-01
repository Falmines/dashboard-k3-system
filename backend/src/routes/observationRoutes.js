const r=require("express").Router();const c=require("../controllers/observationController");const auth=require("../middleware/authMiddleware");
r.use(auth);r.get("/",c.getAll);r.get("/:id",c.getOne);r.post("/",c.create);r.put("/:id",c.update);r.delete("/:id",c.remove);module.exports=r;
