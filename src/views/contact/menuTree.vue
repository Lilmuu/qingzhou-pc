<!--
 * @Author: 罗兴
 * @LastEditors: Please set LastEditors
 * @Date: 2021-09-08 16:52:46
 * @LastEditTime: 2022-04-21 10:09:11
 * @FilePath: \task-pc-ui\src\views\contact\menuTree.vue
 * @Description: file content
-->
<template>
  <div class="recursion-unit">
    <div class="deepItemRow cursor" v-for="(children, index) in treeList" :key="'depchildren' + index">
      <div v-if="children.parentId" :class="['deepItemTitle', children.showTip ? '' : 'deepItemNotShowTip' ]"
        @click.stop="clickGetDeptPage(children.id, [...newArr,index],children)">
        <div>
          <img v-show="true" class="open_icon" src="@/assets/img/contact/department_img.png" alt="">
          <span class="ellipsis deepTitleName">{{ children.name }}</span>
          <span>({{ children.totalPeople}})</span>
        </div>
        <div @click.stop="handleConfirmDepDialog(children.id)" class="launch_group_chat" v-if="children.show" >
          <img src="@/assets/img/contact/launch_group_chat.png" alt="">
          <span>发起群聊</span>
        </div>
      </div>
      <!-- 部门下的用户 -->
      <div class="user_header" @click.stop="openUserInfoBox(children)" v-else>
        <headAvatar 
          :size="32" 
          :fontSize='12'
          :avatarUrl="children.headImage ? children.headImage: ''" 
          :username='children.realName || children.nickName'>
        </headAvatar>
        <div>{{ children.realName || children.nickName }}</div>
      </div>

      <template v-if="children.childList && children.show">
        <menuTree :treeList="children.childList" 
          :newArr='[...newArr,index]'
          @handleGetDeptPage="handleGetDeptPage" 
          @openUserInfoBox="openUserInfoBox"
          @handleConfirmDepDialog="handleConfirmDepDialog"></menuTree>
      </template>
    </div>
    
  </div>
</template>

<script>
import headAvatar from "@/components/headAvatar"
import { mapState } from "vuex"
  export default {
    name:'menuTree',
    components: {headAvatar},
    props: {
      treeList:{
        type:Array,
        default:()=>{
          return []
        }
      },
      newArr:{
        type:Array,
        default:()=>{
          return []
        }
      }
    },
    data() {
      return {
        clientX: 0,
        clientY: 0,
        deptIdArr: [],
      };
    },
    watch: {},
    created() {},
    mounted() {},
    computed: {
      ...mapState({
        contactShowTip: (state) => state.app.contactShowTip,
      }),
      styVal(){
        // let x = window.clientX
        return `left:${this.clientX}px;top:${this.clientY}px;margin-top: -12px;`
      }
    },
    methods: {
      clickGetDeptPage(deptId, index, children) {
        console.log(deptId,'deptId -- index',index)
        this.$emit('handleGetDeptPage',[deptId,...index])

        children.show = !children.show
        this.$emit('otherClickHideDeptTip',children)
        this.$forceUpdate();
      },
      handleGetDeptPage(val){
        this.$emit('handleGetDeptPage',[...val])
      },
      handleConfirmDepDialog(childrenId){
        this.$emit('handleConfirmDepDialog',childrenId)
      },
      openUserInfoBox(children){
        console.log(children,'children - openUserInfoBox')
        this.$emit('openUserInfoBox',children)
      }
    }
  };
</script>
<style lang="scss" scoped>
.deepItemTitle {
  &:hover{
    border-radius:4px;
  }
  .el-icon {
    font-size: 18px;
    font-weight: 600;
    color: #3471FF;
  }
}
.select_icon{
  width: 9px;
}
.select_no_icon{
  width: 6px;
}
.open_icon{
  width: 32px;
  margin-right: 10px;
}
</style>
