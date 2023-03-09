// 登录加固模块
import { Type } from '@/module'
import Ordinary from './ordinary'
import Reinforce from './reinforce'

// 选择版本
let select
if (Type.login === 'Reinforce') select = Reinforce
else if (Type.login === 'Ordinary') select = Ordinary
else console.log('找不到模块')

export default select
