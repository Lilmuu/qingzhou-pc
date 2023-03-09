<template>
  <ul id="nav" style="margin-top: -4px;">
    <li>
      <a class="fly" @click="init" tabindex="1">
        <div class="cursor action-icon" slot="reference">
          <!-- <svg-icon icon-class="mail_more" style="width: 2em;margin-top:-54px"></svg-icon> -->
          <img src="@/assets/img/icon/mail/more.png" alt="">
        </div>
<!--        <img class="action-icon"-->
<!--             style="width: 21px"-->
<!--             slot="reference"-->
<!--             src="@/assets/img/mail/headerAction/menu_active.png" alt="">-->
      </a>
      <ul class="dd">
        <!-- 一级  -->
        <li v-for="(menuItem, index) in menu" :key="'menuItem' + index">
          <a class="flyRow" @click="changeMenu(menuItem)" tabindex="1">
            <span class="flex-center">
                <div class="cursor action-icon" slot="reference" style="width: 21px">
                  <!-- <svg-icon :icon-class="menuItem.icon" style="width: 17px;"></svg-icon> -->
                  <img :src="menuItem.icon" alt="">
                </div>
              {{ menuItem.label }}
            </span>
            <i class="el-icon-arrow-right" v-if="menuItem.menu && menuItem.menu.length"></i></a>
          <!-- 二级   -->
          <ul v-if="menuItem.menu && menuItem.menu.length">
            <li v-for="(item, index) in menuItem.menu" :key="'menuItemMenu' + index">
              <a :class="item.divided ? 'divided' : ''" @click="changeMenu(item, menuItem.value)" >{{ item.label }}</a>
            </li>
          </ul>
        </li>
      </ul>
    </li>
  </ul>
</template>

<script>
  import { bj_dropDownOption, ydd_dropDownOption } from "@/const/dicData"
  import { getQueryGroup } from "@/api/mail"

  export default {
    name: "DropDownMenu",
    props: {
      config: {
        type: Object,
        required: true
      },
      entry: {
        type: String,
        required: true
      }
    },
    data() {
      return {
        defaultMenu: [
          { label: '删除', value: 'sc', icon: require('@/assets/img/icon/mail/del.png') },
          { label: '彻底删除', value: 'cdsc', icon: require('@/assets/img/icon/mail/del_all.png')},
          { label: '信任', value: 'xr', icon: require('@/assets/img/icon/mail/trust.png')},
          { label: '再次编辑', value: 'zcbj', icon: require('@/assets/img/icon/mail/compile.png')},
          { label: '标记为', value: 'bjw', icon: require('@/assets/img/icon/mail/flagAs.png'),
            menu: []
          },
          { label: '移动到', value: 'ydd', icon: require('@/assets/img/icon/mail/set.png'),
            menu: []
          },
        ],
        menu: []
      }
    },
    async mounted() {
      await this.init()
    },
    methods: {
      async init() {
        let menu = []
        let configKeys = Object.keys(this.config)
        const bjwMenu = this.get_bjwOptions()
        const yddMenu = await this.getFolderList()

        configKeys.forEach(key => {
          const menuChecked = this.defaultMenu.filter(m => m.value === key)
          if(!menuChecked || menuChecked.length === 0) {
            console.warn('菜单配置不存在')
          } else {
            if(key === 'ydd') {
              menuChecked[0].menu = yddMenu
            }
            if(key === 'bjw') {
              menuChecked[0].menu = bjwMenu
            }
            menu.push(menuChecked[0])
          }
        })
        console.log('menu', menu)
        this.menu = menu
      },
      // 菜单选中
      changeMenu(menu, parentAction = '') {
        let action = {
          action: '',
          value: '',
        }
        // 是子菜单，展开
        if(menu.menu && menu.menu.length) {
        } else {
          // 菜单选中
          // 二级菜单
          if(parentAction) {
            action = {
              action: parentAction,
              value: menu.value
            }
          } else {
            action = {
              action: menu.value,
            }
          }
          console.log(action,'12sdazcaa')
          this.$emit('changeMenu', action)
        }
      },
      // 标记为
      get_bjwOptions() {
        // 草稿箱、已发送
        if(this.entry === 'inbox') {
          return bj_dropDownOption
        }
        return [
          { label: '红旗邮件', value: 2 },
          { label: '取消红旗', value: 3 }
        ]
      },
      // 获取文件夹列表
      getFolderList() {
        return new Promise((resolve, reject) => {
          const dirArr = []
          getQueryGroup().then(async res => {
            if (res.data.code === 200) {
              res.data.data.forEach(item => {
                dirArr.push({
                  label: item.groupName,
                  value: item.id
                })
              })
              const options = this.yddDrownOptionFiler()
              let dropDownOption = [...dirArr, ...options]
              // 没有文件夹，去掉分割线
              if(dirArr.length === 0) {
                dropDownOption.forEach(item => {
                  item.divided = false
                })
              }
              // 合并
              resolve(dropDownOption)
            }
          }).catch(e => {
            resolve([])
          })
        })
      },
      // 移动到 过滤
      yddDrownOptionFiler() {
        const entry = this.entry
        let option = []
        console.log('entry', entry)
        switch (entry) {
          // { label: '收件箱', value: 1, divided: true },
          // { label: '草稿箱', value: 2 },
          // { label: '已发送', value: 3 },
          // { label: '已删除', value: 4 },
          // { label: '垃圾邮件', value: 5 }
          //  收件箱
          case 'inbox':
            option = [
              { label: '已发送', value: 3, divided: true },
              { label: '已删除', value: 4 },
              { label: '垃圾邮件', value: 5 }
            ]
            break
          //草稿箱
          case 'drafts':
            option = [
              { label: '收件箱', value: 1, divided: true },
              { label: '已发送', value: 3 },
              { label: '已删除', value: 4 },
              { label: '垃圾邮件', value: 5 }
            ]
            break
          // 已发送
          case 'sentMail':
            option = [
              { label: '收件箱', value: 1, divided: true },
              { label: '已删除', value: 4 },
              { label: '垃圾邮件', value: 5 }
            ]
            break
          // 已删除
          case 'deletedMail':
            option = [
              { label: '收件箱', value: 1, divided: true },
              { label: '已发送', value: 3 },
              { label: '垃圾邮件', value: 5 }
            ]
            break
          // 垃圾箱
          case 'spamMail':
            option = [
              { label: '收件箱', value: 1, divided: true },
              { label: '已发送', value: 3 },
              { label: '已删除', value: 4 },
            ]
            break
          // 文件夹
          case 'directory':
            option = [
              { label: '收件箱', value: 1, divided: true },
              { label: '已发送', value: 3 },
              { label: '已删除', value: 4 },
              { label: '垃圾邮件', value: 5 }
            ]
            break
          default:
            option = [...ydd_dropDownOption]
        }
        return option
      },
    }
  }
</script>

<style lang="scss" scoped>
  /* main menu styles */
  #nav,#nav ul {
    list-style:none;
    margin:0;
    padding:0;
  }

  #nav {
    position:relative;
    z-index:2;
    ul {
      background: #fff;
      left:-9999px;
      position:absolute;
      top:47px;
      width:auto;
      padding: 10px 0;
      border-radius: 6px;
      // box-shadow: 0px 3px 10px 0px rgba(34, 34, 34, 0.1);
      border: 1px solid #DEE0E3;
      ul {
        left:-9999px;
        position:absolute;
        top:0;
        // width: 135px;
      }
    }
  }
  #nav li {
    float:left;
    // margin-right:5px;
    position:relative;
    a {
      color:#000;
      float:left;
      font-size:14px;
      padding: 0 14px;
      text-decoration:none;
    }
  }

  #nav > li > a {
    border-radius:6px;
    overflow:hidden;
  }
  #nav li a.fly {
    //background:#c1c1bf;
    padding: 0;
    &:hover{
      background: none;
    }
  }
  #nav ul li {
    margin:0;
    line-height: 30px;

    // position: relative;
    // height: 38px;
    // width: 135px;
    // overflow: hidden;
    a {
      width: 125px;

      // position: absolute;
      // top: 0;
      // margin-top: -41%;
    }
    a.divided {
      border-top: 1px solid #eee;
      margin-top: 3px;
      padding-top: 3px;
    }
    a.fly {
      padding-right:10px;
    }
  }

  /*hover styles*/
  #nav li:hover > a {
    // background-color: #ecf5ff;
    // color: #66b1ff;
  }

  /*focus styles*/
  #nav li a:focus {
    outline-width:0;
  }

  /*popups*/
  #nav li a:active + ul.dd,#nav li a:focus + ul.dd,#nav li ul.dd:hover {
    left: -90px;
  }
  #nav ul.dd li a:active + ul,#nav ul.dd li a:focus + ul,#nav ul.dd li ul:hover {
    width: 125px;
    left: -125px;
  }
  .flyRow {
    display: flex;
    align-items: center;
    justify-content: space-between;
    .flex-center{
      justify-content: left;
    }
    img {
      width: 13px;
      margin-right: 7px;
    }
  }
  .action-icon {
    width: 14px;
    color: #778099;
    // margin-right: 8px;
    width: 26px;
    height: 26px;
    display: flex;
    justify-content: center;
    align-items: center;
    &:hover {
     color: #3471FF;
    }
  }
  .flyRow {
    &:hover {
      .action-icon {
        color: #3471FF;
      }
    }
  }
  .dd{
    .action-icon {
      height: 30px;

    }
  }
</style>
