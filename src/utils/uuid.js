/***
 * @Author: 罗兴
 * @LastEditors: 罗兴
 * @Date: 2021-12-10 14:19:23
 * @LastEditTime: 2021-12-10 14:20:43
 * @FilePath: \task-pc-ui\src\utils\uuid.js
 * @Description: file content
 */
export const getUUID = ()=>{
  return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}
export const S4 = ()=>{
  return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
}
