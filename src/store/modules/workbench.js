/*
 * @Author: your name
 * @Date: 2021-12-06 15:25:37
 * @LastEditTime: 2022-01-14 14:42:27
 * @LastEditors: Please set LastEditors
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: \task-pc-ui\src\store\modules\workbench.js
 */
import router from '@/router'
const workbench = {
    state: {
        requestParameters:{},
        navigationName:'workspace',
        topNavData:[{name: '工作台', path: 'workspace'}], // 顶部导航栏 ,{ name: '记录查询', path: "recordMuery"}
        keepaliveList: [{name: '工作台', path: 'workspace'}], // keepalive缓存的路由
        sealType: [], // 工作台合同印章类型
        contracttype: [], // 工作台合同类型
        articleType: [], // 发文类别
        secrtLevel: [], // 密级 - 议题
        meetType: [], // 会议类型 - 议题
        secretLevel: [], // 密级 - 发文
        articleUrgent: [], // 缓急 - 发文
        printSealName: [], // 印章名称 - 印章
        routesQuery:'',
        unReadNumber: 0,
    },
    getters:{
      addOrEdit: state => {
        let newAdd = JSON.stringify(state.requestParameters) == '{}' // 新建
        let tit = state.requestParameters.tit == '编辑'
        return newAdd || tit
      },
    },
    mutations: {
      pushTopNav(state,param){
        state.navigationName = param.path
        // 顶部导航
        const bool = state.topNavData.every(item => item.path != param.path)
        if(bool){
          state.topNavData.push(param)
        }
        // 缓存路由
        const keepalive = state.keepaliveList.every(item => item.path != param.path)
        if(keepalive){
          state.keepaliveList.push(param)
        }
        router.push({
          path:param.path,
        })
        param.query ? state.routesQuery = param.query : state.routesQuery = ''
      },
      delTopNav(state,{item,index}){
        if(item.path == state.navigationName){
          state.navigationName = state.topNavData[index-1].path
          router.push({
            path:state.topNavData[index-1].path
          })
        }
        state.topNavData.splice(index,1)
      },
      SET_SEALTYPE(state, arr){
        state.sealType = arr
      },
      SET_CONTRACT_TYPE(state, arr){
        state.contracttype = arr
      },
      SET_REQUESTPARAMETERS(state, obj){
        state.requestParameters = obj
      },
      SET_ARTICLETYPE(state, arr){
        state.articleType = arr
      },
      SET_UNREADNUMBER(state, unm){
        state.unReadNumber = unm
      },
      SET_SECRET_LEVEL(state, arr){
        state.secrtLevel = arr
      },
      SET_MEET_TYPE(state, arr){
        state.meetType = arr
      },
      // 印章名称
      SET_PRINT_SEALNAME(state, arr){
        state.printSealName = arr
      },
      // 发文密级 
      SET_FILOWABLE_ARTICLE_SECRET_LEVEL(state, arr){
        state.secretLevel = arr
      },
      // 发文缓急
      SET_FILOWABLE_ARTICLE_URGENT(state, arr){
        state.articleUrgent = arr
      },
    },
    actions: {

    }
  }

  export default workbench
