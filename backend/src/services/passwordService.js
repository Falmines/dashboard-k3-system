const bcrypt=require("bcrypt");
exports.hashPassword=p=>bcrypt.hash(p,10);
exports.comparePassword=(p,h)=>bcrypt.compare(p,h);
