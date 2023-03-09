<template>
  <div class="main-view-container">
    <div class="left-container">
      <div style="margin-top: 0;">
        <li @click="setActiveRouter(router)"
            role="menuitem"
            tabindex="-1"
            :class="['el-menu-item el-menu-item-li', activeName === router.path ? 'el-menu-item-li_active menu_item_border_active' : 'menu_item_border' ]"
            v-for="(router, index) in routerLists" :key="'routerlist' + index">
          <div :class="['flex-center menu-item-row', activeName === router.path ? 'menu-item-active' : '']">
            <span :class="['menu_item_icon_container flex-center', activeName === router.path ? 'menu_item_icon_container_active' : '']">
              <img :style="{width: `${activeName === router.path ? 17 : 18}px`}"
                   :src="activeName === router.path ? router.activeIcon : router.icon" alt="">
            </span>
            <span class="menu-text">{{ router.title }}</span>
        <!-- <span class="unreaderCount" v-if="router.path === 'myTodo'">{{ unreadCount > 99 ? 99 : unreadCount }}</span>-->
          </div>
        </li>
      </div>
    </div>
    <div class="right-container">
      <div class="top-label flexd-top-label">
        <span class="tip"></span>
        <span class="label-text">{{activeRouter.title}}</span>
      </div>
      <MyIframe style="margin-top: 50px;" :src="activeRouter.link"></MyIframe>
    </div>
  </div>
</template>

<script>
  import MyIframe from "@/views/zebra/smalltool/myIframe"

  export default {
    name: "layout",
    data() {
      return {
        activeName: 'gzt',
        activeRouter: { path: 'gzt', link:'http://dcode-test.cguarantee.com/flowable-ui/#/tasklist', title: '工作台', icon: require('@/assets/img/icon/myTodo.png'), activeIcon: require('@/assets/img/icon/myTodo_active.png') },
        routerLists: [
          { path: 'gzt', link:'http://dcode-test.cguarantee.com/flowable-ui/#/tasklist', title: '工作台', icon: require('@/assets/img/icon/myTodo.png'), activeIcon: require('@/assets/img/icon/myTodo_active.png') },
          { path: 'fxbg',link:'http://dcode-test.cguarantee.com/zebra-risk-ui/#/riskReport', title: '风险报告', icon: require('@/assets/img/icon/myExec.png'), activeIcon: require('@/assets/img/icon/myExec_active.png') },
        ]
      }
    },
    components: {
      MyIframe
    },
    methods: {
      setActiveRouter(router) {
        this.activeName = router.path
        this.activeRouter = router
      }
    }
  }
</script>

<style lang="scss" scoped>
  .main-view-container {
    display: flex;
    position: relative;
    padding: 0;
    .left-container {
      width: 220px;
      background: #FBFBFC;
      height: 100vh;
    }

    .right-container {
      width: 100%;
      padding: 10px 0 10px 10px;
      background: #fff;
      .top-label {
        position: absolute;
        z-index: 5;
        background: #fff;
        width: 100%;
        height: 46px;
        top: 0;
        display: flex;
        align-items: center;
        justify-content: flex-start;
        border-bottom: 1px solid #e2e2e2;
        .label-text {
          font-size: 17px;
          margin-left: 15px;
        }
      }
    }
    .el-menu-item-li {
      display: flex;
      align-items: center;
      justify-content: center;
      padding-left: 20px;
      color: #222222;
      //&:hover {
      //  background: #EEEEEE;
      //}
      .menu-text {
        margin-left: 20px;
        margin-right: 20px;
        min-width: 56px;
      }
      .menu-item-active {
        display: flex;
        align-items: center;
      }
    }
    .el-menu-item-li_active {
      background: #EEEEEE;
      color: #3471FF;
    }
  }
</style>
