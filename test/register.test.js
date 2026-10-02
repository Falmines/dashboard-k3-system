'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const create = require('../src/register-controller');
const { validate } = require('../src/validation');
const limit = require('../src/rate-limit');
const valid = { name:'Karyawan Uji', employee_number:'TEST-001', username:'uji.staff', email:'uji@example.com', password:'PasswordUji123!', confirm_password:'PasswordUji123!' };
function response() { return { code:200, status(c){this.code=c;return this;}, json(d){this.data=d;return this;}, set(k,v){this[k]=v;} }; }
test('invalid input is rejected before querying database', async () => {
 const handler=create({pool:{query(){throw Error('must not query');}},bcrypt:{}}); const res=response();
 await handler({body:{...valid,confirm_password:'different'}},res); assert.equal(res.code,400); assert.ok(res.data.errors.confirm_password);
});
test('registration hashes password and ignores elevated role/status from client',async()=>{
 const calls=[]; const pool={async query(sql,values){calls.push({sql,values});if(sql.startsWith('SELECT id FROM roles'))return{rows:[{id:7}]};if(sql.startsWith('SELECT id FROM users'))return{rows:[]};return{rows:[{id:11,name:valid.name,username:valid.username,email:valid.email}]};}};
 const bcrypt={async hash(value,cost){assert.equal(value,valid.password);assert.equal(cost,12);return 'hashed-password';}};
 const res=response();await create({pool,bcrypt})({body:{...valid,username:'UJI.STAFF',email:'UJI@EXAMPLE.COM',role_id:1,status:'admin',password_hash:'evil'}},res);
 assert.equal(res.code,201);assert.equal(calls[2].values[0],7);assert.equal(calls[2].values[5],'hashed-password');assert.equal(calls[2].values[3],'uji.staff');assert.equal(calls[2].values[4],'uji@example.com');assert.match(calls[2].sql,/'active'/);assert.equal(res.data.user.password_hash,undefined);
});
test('existing username/email returns conflict without hashing',async()=>{
 const pool={async query(){return{rows:[{id:7}]};}};const res=response();await create({pool,bcrypt:{hash(){throw Error('must not hash');}}})({body:valid},res);assert.equal(res.code,409);
});
test('unique constraint race maps to conflict',async()=>{
 let n=0;const pool={async query(){n++;if(n===1)return{rows:[{id:7}]};if(n===2)return{rows:[]};throw Object.assign(new Error('private detail'),{code:'23505'});}};
 const res=response();await create({pool,bcrypt:{async hash(){return 'hash';}}})({body:valid},res);assert.equal(res.code,409);assert.ok(!JSON.stringify(res.data).includes('private detail'));
});
test('missing Staff role blocks registration',async()=>{
 const res=response();await create({pool:{async query(){return {rows:[]};}},bcrypt:{}})({body:valid},res);assert.equal(res.code,503);
});
test('non-string input and multibyte bcrypt limit validated',()=>{
 assert.ok(validate({...valid,name:{x:1}}).errors.name);
 assert.ok(validate({...valid,password:'😊'.repeat(19),confirm_password:'😊'.repeat(19)}).errors.password);
 assert.equal(Object.keys(validate(valid).errors).length,0);
});
test('rate limiter refuses excess submissions and provides Retry-After',()=>{
 const middleware=limit({limit:2});let passed=0;const req={ip:'127.0.0.1'},res=response();
 middleware(req,res,()=>passed++);middleware(req,res,()=>passed++);middleware(req,res,()=>passed++);
 assert.equal(passed,2);assert.equal(res.code,429);assert.ok(Number(res['Retry-After'])>0);
});
