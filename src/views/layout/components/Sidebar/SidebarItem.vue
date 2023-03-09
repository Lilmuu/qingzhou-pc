<!--
 * @Author: your name
 * @Date: 2021-09-28 11:08:46
 * @LastEditTime: 2022-06-22 17:56:37
 * @LastEditors: youshijun 1046422605@qq.com
 * @Description: In User Settings Edit
 * @FilePath: \task-pc-ui\src\views\layout\components\Sidebar\SidebarItem.vue
-->
<!--左边菜单-->
<template>
  <div class="menu-wrapper main-left-menu">
    <template v-for="item in routes" >
      <div :key="item.children[0].name" v-if="!item.hidden && item.children">
      <!-- 没有二级children -->
      <router-link @click.native="handleRouteTo(item.path+'/'+item.children[0].path,item.path, item)"
        v-if="hasOneShowingChildren(item.children) &&!item.alwaysShow"
        :to="item.path == '/workbench' ? item.path+'/'+item.children[0].path+'/workspace': item.path+'/'+item.children[0].path"
        >
        <!-- workspace   navigationName -->
        <el-menu-item
          :index="item.path == '/workbench' ? 'workbench' : item.path+'/'+item.children[0].path"
          :class="{'submenu-title-noDropdown':!isNest}"
          >
          <el-badge v-if="item.path === '/message' && totalNum > 0" :value="totalNum" :max="99" class="item">
            <img v-if="currentRouter(item.path)" class="menu_icon" :src="iconType(item.path+'_select')" alt="">
            <img v-else class="menu_icon" :src="iconType(item.path)" alt="">
          </el-badge>
          <div v-else>
            <img v-if="currentRouter(item.path)" class="menu_icon" :src="iconType(item.path+'_select')" alt="">
            <img v-else class="menu_icon" :src="iconType(item.path)" alt="">
          </div>
          <div class="menu_title">{{item.children[0].meta.title}}</div>
        </el-menu-item>
      </router-link>

      <el-submenu v-else :index="item.name||item.path" :key="item.name">
        <template slot="title">
          <svg-icon v-if="item.meta&&item.meta.icon" :class-name="item.meta.icon" :icon-class="item.meta.icon"></svg-icon>
          <span v-if="item.meta&&item.meta.title" slot="title">{{item.meta.title}}</span>
        </template>

        <template v-for="child in item.children" v-if="!child.hidden">
          <!-- item  -->
          <sidebar-item :is-nest="true" class="nest-menu" v-if="child.children&&child.children.length>0" :routes="[child]" :key="child.path"></sidebar-item>
          <router-link v-else :to="item.path+'/'+child.path" :key="child.name">
            <el-menu-item :index="item.path+'/'+child.path">
              <svg-icon v-if="child.meta&&child.meta.icon" :class-name="child.meta.icon" :icon-class="child.meta.icon"></svg-icon>
              <span v-if="child.meta&&child.meta.title" slot="title">{{child.meta.title}}</span>
            </el-menu-item>
          </router-link>
        </template>
      </el-submenu>
      </div>
    </template>
  </div>
</template>

<script>
import { mapGetters,mapState } from 'vuex'
export default {
  name: 'SidebarItem',
  props: {
    routes: {
      type: Array
    },
    isNest: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      // 当前 active 路由路径
      currentPath: '/message'
    }
  },
  computed:{
    ...mapGetters({
      ChatList: 'Im/Information/ChatList', // 聊天列表
    }),
    ...mapState({
      navigationName: state => state.workbench.navigationName,
      routerFullPath: (state) => state.app.routerFullPath,
    }),
    totalNum(){
      let sum = 0
      let total = this.ChatList.map(e=>e.newMessageNumber)
      total.forEach(item=>{ sum = sum + item})
      return sum
    },

    currentRouter(){
      return (val)=>{
        let regRouter = /\/[a-zA-Z]+\//
        let aa = this.routerFullPath.match(regRouter)
        return aa ? `${val}/` == aa[0] : false
      }
    },
    iconType(){
      return (val)=>{
        return require(`@/assets/img/menu${val}.png`)
      }
    },
  },
  methods: {
  /**
 * TODO: 路由跳转钩子
 * @param event {Event}
 * @param path  {String}
 * */
    handleRouteTo(path,itemPath, item) {
      console.log(itemPath);
      let pp = item.path == '/workbench' ? item.path+'/'+item.children[0].path+'/'+ this.navigationName : item.path+'/'+item.children[0].path
      console.log(pp);
      this.currentPath = itemPath
    },
    hasOneShowingChildren(children) {
      const showingChildren = children.filter(item => {
        return !item.hidden
      })
      if (showingChildren.length === 1) {
        return true
      }
      return false
    },
  },
}
</script>
<style lang="scss" scoped>
.menu-wrapper{
  display: flex;
  flex-flow: column;
  align-items: center;
  .el-menu-item{
    margin-bottom: 2px;
    height: 68px;
    width: 68px;
  }
  .menu_icon{
    width: 30px;
  }
}
</style>
