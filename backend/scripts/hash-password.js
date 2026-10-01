const bcrypt=require("bcrypt");const password=process.argv[2]||"";
(async()=>{if(!password){console.log('Gunakan: npm run hash -- "PasswordAnda"');return;}console.log(await bcrypt.hash(password,10));})();
