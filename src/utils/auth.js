/**
 * @description     存储 auth localStorage
 * @author          Beats0(https://github.com/Beats0)
 * @date            2021-05-09 22:53:01
 */


const key = 'auth'

export function getToken() {
  return localStorage.getItem(key)
}

export function setToken(token) {
  return localStorage.setItem(key, token)
}

export function removeToken() {
  return localStorage.removeItem(key)
}
// 保存当前是否最大化
export function clearAll() {
  let isFull = localStorage.getItem('isFull')
  let ratio =  localStorage.getItem('ratio')
  sessionStorage.clear()
  localStorage.clear()
  localStorage.setItem('isFull',isFull)
  localStorage.setItem('ratio',ratio)
  return true
}
