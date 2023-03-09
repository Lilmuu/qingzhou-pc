<template>
  <el-tabs class="paddingTabs" v-model="tabActiveName">
    <el-tab-pane label="最近查看" name="latest">
      <div class="latest-container">
        <div class="latest-container-inner">
          <div class="latest-item flex-align-center cursor"
               :class="isUserSelected(item.id) ? 'latest-item-active' : 'latest-item-unactive'"
               @click="handleSelectUser(item)"
               v-for="(item, index) in latestList"
               :key="'latestList' + index">
            <div class="latest-item-title ellipsis">
              <img :src="item.img" alt="" v-if="item.img">
              <HeadAvatar v-else :size="32" :username="item.realName"></HeadAvatar>
              <span>{{ item.realName }}</span>
            </div>
          </div>
        </div>
      </div>
    </el-tab-pane>
    <el-tab-pane label="组织架构" name="organization">
      <div class="latest-container">
        <div class="organizationContainer">
          <div v-for="(tree, treeIndex) in deptTreeList" :key="'deptTreeList' + treeIndex">
            <div>
              <div @click="handleSelectTree(tree.id)" class="tree-item cursor">{{ tree.name }}</div>
              <el-collapse-transition>
                <div v-show="treeActiveId === tree.id">
                  <div class="deepItemRow cursor"
                       v-for="(children, departIndex) in tree.childList"
                       :key="'depchildren' + departIndex">
                    <div :class="['o-deepItemTitle', children.showTip ? '' : 'deepItemNotShowTip' ]">
                      <div class="deepTitleName-row" @click="handleGetDeptPage(children.id)">
                        <img src="@/assets/img/calendar/selectRight.png" :class="children.id === departActiveId ? 'selectIconActive' : ''" style="width:8px;object-fit: scale-down;margin-right:10px;" />
                        <img src="@/assets/img/calendar/treeTitle.png" alt="">
                        <span class="ellipsis deepTitleName" :class="children.id === departActiveId ? 'deepTitleNameActive' : ''">{{ children.name }}</span>
                      </div>
                      <el-collapse-transition>
                        <div class="user-container latest-container-inner" v-show="departActiveId === children.id">
                          <div class="g-latest-item flex-align-center cursor"
                               @click.stop="handleSelectUser(user)"
                               v-for="(user, userIndex) in users"
                               :key="'user' + userIndex">
                            <div class="latest-item-title ellipsis">
                              <img :src="user.headImage" alt="" v-if="user.headImage">
                              <HeadAvatar v-else :size="32" :username="user.realName"></HeadAvatar>
                              <span>{{ user.realName }}</span>
                            </div>
<!--                            <i class="el-icon-success" style="font-size: 15px;"></i>-->
                          </div>
                        </div>
                      </el-collapse-transition>
                    </div>
                  </div>
                </div>
              </el-collapse-transition>
            </div>
          </div>
        </div>
      </div>
    </el-tab-pane>
  </el-tabs>
</template>

<script>
import { getDeptTree, getUserByDeptId } from "@/api/dept";
import { getVisitCache, addVisitCache } from "@/api/calendar";
import { async } from "q";
import HeadAvatar from '@/components/headAvatar'

export default {
  name: "myDate",
  components:{HeadAvatar},
  props: {
    // { id: '', realName: ''}
    activeUser: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      tabActiveName: 'latest',    // [latest 最近查看,  organization 组织架构]
      latestList: [
        // {id: 1, realName: '李某某'},
      ],
      deptTreeList: [],
      treeActiveId: '',
      departActiveId: '',
      users: [],
      userSelected: [],
    }
  },
  mounted() {
    this.handleGetDeptTree();
    this.handleGetVisitCache()
  },
  methods: {
    // 获取公司分组
    handleGetDeptTree() {
      // 公司分组
      getDeptTree().then((res) => {
        if (res.data.code === 200) {
          const deptTreeList = res.data.data
          deptTreeList.forEach(item => {
            item.childList = item.childList || []
            item.allTotal = this.getTreeChildrenTotal(item.childList)
          })
          this.deptTreeList = deptTreeList
        }
      });
    },
    handleGetDeptPage(deptId) {
      this.departActiveId = this.departActiveId === deptId ? '' : deptId
      getUserByDeptId({ deptId }).then((res) => {
        if (res.data.code === 200) {
          this.users = res.data.data;
        }
      });
    },
    handleSelectTree(id) {
      this.treeActiveId = this.treeActiveId === id ? '' : id
    },
    // 获取最近查看人数据
    handleGetVisitCache() {
      getVisitCache().then(async res => {
        if (res.data.code === 200) {
          this.latestList = res.data.data.map(item => {
            return {
              id:item.userId,
              realName: item.userName,
              img:item.headImg
            }
          })
        }
      })
    },
    /**
     * 递归 获取 公司总人数
     * @param   {Array}   childrenList
     * @param   {Number}   total
     * @return  {Number}
     * */
    getTreeChildrenTotal(childrenList, total = 0) {
      childrenList.forEach(item => {
        if (item.children) {
          total += item.totalPeople || 0
          total = this.getTreeChildrenTotal(item.children, total)
        } else {
          total += item.totalPeople || 0
        }
      })
      return total
    },
    // 添加 缓存最近查看人数据
    handleAddVisitCache(userId) {
      const data = {
        userId
      }
      addVisitCache(data).then(res => {
        if(res.data.code === 200) {
          //
        }
      })
    },
    // user 选中
    handleSelectUser(user) {
      let currentUser = {}
      // 取消选中
      if(String(this.activeUser.id) === String(user.id)) {
        currentUser = {}
      } else {
        currentUser = user
      }
      if(currentUser.id) {
        this.handleAddVisitCache(currentUser.id)
      }
      this.$emit('changeActiveUser', currentUser)
      this.$emit('close')
    },
    isUserSelected(id) {
      return String(this.activeUser.id) === String(id)
    }
  }
}
</script>

<style lang="scss" scoped>
  .latest-container {
    height: 100%;
    .latest-container-inner {
      .latest-item {
         
       }
      .g-latest-item {
        width: 100%;
      }
      .latest-item-title {
        padding: 0 10px;
        width: 100%;
        height: 50px;
        font-size: 14px;
        color: #404758;
        display: flex;
        align-items: center;
        img{
          width: 32px;
          height: 32px;
          border-radius: 50%;
          margin-right: 10ox;
        }
        >span{
          margin-left:10px
        }
      }
      .latest-item-title:hover{
        background: #F5F6F7;
        border-radius: 6px;
      }
      .g-latest-item {
        width: 100%;
        .latest-item-title {
          padding: 0 10px 0 72px;
        }
      }
     }
     .latest-item-active {
       color: #3471FF!important;
       background: #F3F3F3;
     }
     .latest-item-unactive {
       color: #222222;
       /*.el-icon-successel-icon-success {*/
      /*  color: #3471FF;*/
      /*}*/
    }
    .organizationContainer {
      font-size: 14px;
      color: #404758;
      font-family: Source Han Sans CN;
      .tree-item {
        margin-bottom: 15px;
      }
      .deepItemRow {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        margin: 0 0 18px 11px;
      }
      .o-deepItemTitle {
        width: 100%;
        font-weight: 500;
        line-height: 20px;
        display: flex;
        align-items: flex-start;
        flex-direction: column;
        .deepTitleName-row {
          width: 100%;
          display: flex;
          align-items: center;
          .deepArrow {
            font-size: 18px;
            margin-right: 5px;
          }
          .deepTitleName {
            width: 150px;
            display: inline-block;
          }
          .deepTitleName.deepTitleNameActive {
            color: #6795FF;
          }
          img{
            width: 32px;
            height: 32px;
            border-radius: 50%;
            margin-right: 10px;
          }
        }
        .user-container {
          margin-top: 10px;
          width: 100%;
          .user-name {
            width: 123px;
          }
        }
      }
    }
  }
  .selectIconActive{
    transform:rotate(90deg)
  }
</style>

