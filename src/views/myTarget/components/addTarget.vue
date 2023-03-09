<!-- 新增目标 -->
<template>
  <div class="addTarget-container">
    <el-dialog
      append-to-body
      :visible.sync="taskStatus"
      custom-class="add_target_cont"
      :close-on-click-modal="false"
    >
      <div slot="title" class="dialog-header-row">
        <span class="el-dialog__title">{{ scenePageTitle }}</span>
      </div>
      <div class="addTarget-main" v-if="taskStatus">
        <!-- 牵头人、年度、年度目标、工作策略 -->
        <avue-form ref="addForm" :option="addFormOption" v-model="addForm">
          <!-- 牵头人 -->
          <template slot="userName">
            <el-input v-model="addForm.userName" type="text" width="50%"
            size="small" @focus="handleFocus" placeholder="请选择牵头人"></el-input>
          </template>
          <!-- 年度 -->
          <template slot="annual">
            <el-date-picker v-model="addForm.annual" size="small" type="year" value-format="yyyy" placeholder="请选择年度"></el-date-picker>
          </template>
          <!-- 年度目标 -->
          <template slot="annualTarget">
            <el-input v-model="addForm.annualTarget" width="50%"
            type="textarea" :maxlength="100" show-word-limit size="small" 
            :rows="2" resize="none" placeholder="请输入年度目标"></el-input>
          </template>
          <!-- 工作策略 -->
          <template slot="annualStrategy">
            <el-input v-model="addForm.annualStrategy" 
            type="textarea" :maxlength="500" show-word-limit
            size="small" :rows="3" resize="none" placeholder="请输入年度目标工作策略"
            ></el-input>
          </template>
        </avue-form>
        <!-- 季度 -->
        <div class="quarter-main">
          <div class="quarter-item" v-for="(item, index) in quarterlyTargets" :key="index">
            <avue-form ref="quarterForm" :option="quartersOption" v-model="quarterlyTargets[index]" class="custom_class_quarter">
              <!-- 季度标题 -->
              <template slot="quarterLabel">
                <div class="item-tip">
                  <img src="@/assets/img/mytodo/new_task/newTask_quarter.png" alt="">
                  <span>{{ item.quarter }}</span>
                </div>
              </template>
              <template slot="quarter">
                <div></div>
              </template>
              <!-- 季度目标 -->
              <template slot="quarterTarget">
                <el-input type="textarea" :maxlength="100" 
                show-word-limit size="small" :rows="2" resize="none" 
                placeholder="请输入季度目标" v-model="quarterlyTargets[index].quarterTarget"
                ></el-input>
              </template>
              <!-- 工作策略 -->
              <template slot="quarterStrategy">
                <el-input type="textarea" :maxlength="500" 
                show-word-limit size="small" :rows="3" resize="none" 
                placeholder="请输入季度工作策略" v-model="quarterlyTargets[index].quarterStrategy"></el-input>
              </template>
            </avue-form>
          </div>
        </div>
      </div>
      <span class="dialog-footer" slot="footer">
        <el-button size="small" @click="taskStatusClose">取消</el-button>
        <el-button type="primary" size="small" :loading="loading" @click="handleConfirm">确定</el-button>
      </span>
    </el-dialog>
    <!--  添加执行人/添加关注人 dialog    -->
    <el-dialog
      append-to-body
      :visible.sync="addDialog"
      custom-class="select_user_box"
      id="addNewTaskNew"
      :close-on-click-modal="false"
    >
      <div slot="title" class="dialog-header-row">
        <span class="el-dialog__title">添加牵头人</span>
      </div>
      <selectPeople
        v-if="addDialog"
        addType="zxr"
        moduleMode="target"
        :executeList="executeList"
        :attentionList="attentionList"
        @selectUserSuccess="selectUserSuccess"
        @selectCancel="selectCancel"
      ></selectPeople>
    </el-dialog>
  </div>
</template>

<script>
import { addNewTarget, editTargetItem } from "@/api/target";
import { addFormOption, quartersOption } from "../crud";
import selectPeople from "@/views/myTodo/components/selectPeople";
const baseGuarterlyTargets = [
  {
    quarter: "一季度",
    quarterTarget: "",
    quarterStrategy: "",
  },
  {
    quarter: "二季度",
    quarterTarget: "",
    quarterStrategy: "",
  },
  {
    quarter: "三季度",
    quarterTarget: "",
    quarterStrategy: "",
  },
  {
    quarter: "四季度",
    quarterTarget: "",
    quarterStrategy: "",
  },
];
export default {
  name: "addTarget",
  components: {
    selectPeople,
  },
  data() {
    return {
      loading: false,
      rowForm: {},
      scenePage: "", // 组件状态
      scenePageTitle: "", // 标题
      taskStatus: false,
      relations: [], // 牵头人数组
      addDialog: false,
      executeList: [],
      attentionList: [], // 动态表单
      addFormOption: addFormOption, // 新增目标字典
      quartersOption: quartersOption, // 循环遍历季度s
      addForm: {
        userName: "",
        annual: "",
        annualTarget: "",
        annualStrategy: "",
      },
      quarterlyTargets: [],
    };
  },
  methods: {
    /**
     * 编辑处理数据
     * form: 需要编辑的数据
     * type: add：新增；edit：编辑
     */
    init(form, type) {
      this.scenePage = type;
      this.relations = [];
      this.executeList = [];
      this.loading = false;
      for (let i in this.addForm) {
        this.addForm[i] = "";
      }
      this.quarterlyTargets = JSON.parse(JSON.stringify(baseGuarterlyTargets));
      this.addForm = {};
      this.taskStatus = true;
      this.scenePageTitle = type == "add" ? "新增目标" : "编辑目标";
      // this.$refs.addForm.clearValidate();
      // this.$refs.quarterForm.forEach(item => {
      //     item.clearValidate();
      // });
      if (type == "edit") {
        let data = JSON.parse(JSON.stringify(form));
        this.rowForm = data;
        this.addForm = data;
        this.relations = data.relations;
        this.quarterlyTargets.forEach((pItem) => {
          form.quarterlyTargets.forEach((cItem) => {
            if (pItem.quarter === cItem.quarter) {
              console.log(cItem);
              pItem.quarterTarget = cItem.quarterTarget;
              pItem.quarterStrategy = cItem.quarterStrategy;
              let { quarter, quarterTarget, quarterStrategy, ...newItem } =
                cItem;
              pItem = Object.assign(pItem, newItem);
            }
          });
        });
        data.relations.forEach((item) => {
          this.executeList.push({
            userId: item.userId,
            deptId: item.deptId,
            realName: item.userName,
          });
        });
      }
    },

    /**
     * 选择牵头人确定回调
     * data: 返回值
     */
    selectUserSuccess(data) {
      let list = [],
        selList = [];
      let getName = data.lists.map((item) => item.username);
      this.addForm.userName = getName.join(",");
      data.lists.forEach((item) => {
        list.push({
          userName: item.username,
          userId: item.id,
          deptId: item.deptId,
        });
        selList.push({
          realName: item.username,
          userId: item.id,
          deptId: item.deptId,
        });
      });
      this.relations = list;
      this.executeList = selList;
      this.addDialog = false;
    },

    /**
     * 新增/编辑更多目标确定
     */
    handleConfirm() {
      this.$refs.addForm.validate((addVali, done) => {
        done();
        this.formValiFun(this.$refs.quarterForm).then((valiRes) => {
          if (addVali && !valiRes.includes(false)) {
            delete this.addForm.relations;
            delete this.addForm.quarterlyTargets;
            let quarterStatus = this.quarterlyTargets.some(
              (item) => item.quarterTarget != "" && item.quarterStrategy != ""
            );
            let newQuarterlyTargets = this.quarterlyTargets.filter(
              (item) => item.quarterTarget != "" && item.quarterStrategy != ""
            );
            console.log(newQuarterlyTargets);
            if (!quarterStatus) {
              this.$message.error("请添加至少一个季度的季度目标和工作策略!");
              return false;
            }
            let params = {
              quarterlyTargets: newQuarterlyTargets,
              relations: this.relations,
              ...this.addForm,
            };
            let requireApi =
              this.scenePage == "add" ? addNewTarget : editTargetItem;
            if (this.scenePage == "edit") {
              params.relations.forEach(
                (item) => (item.targetId = this.rowForm.id)
              );
            }
            this.loading = true;
            requireApi(params)
              .then((res) => {
                this.loading = false;
                if (res.data.code == 0) {
                  let text =
                    this.scenePageTitle == "add"
                      ? "新增目标成功"
                      : "编辑目标成功";
                  this.$message.success(text);
                  this.$emit("cbChange");
                  this.taskStatusClose();
                }
              })
              .catch(() => {
                this.loading = false;
              });
          }
        });
      });
    },

    /**
     * 动态表单校验
     * vNode: 表单节点
     */
    formValiFun(vNode) {
      return new Promise((resolve, reject) => {
        let valiList = [];
        vNode.forEach((item) => {
          item.validate((vali) => {
            valiList.push(vali);
          });
        });
        resolve(valiList);
      });
    },

    /**
     * 新增目标管理
     */
    taskStatusClose() {
      // this.$refs.addForm.clearContent();
      this.taskStatus = false;
    },

    /**
     * 过滤对象
     * data: 需要过滤的对象
     */
    filterFormItem(data) {
      for (let i in this.addForm) {
        this.addForm[i] = data[i];
      }
    },

    /**
     * 表单检验并返回参数
     */
    returnParams() {
      this.addForm.quarterlyTargets = this.quarterlyTargets;
      this.addForm.relations = this.relations;
      return this.addForm;
    },

    /**
     * 牵头人获取焦点
     */
    handleFocus() {
      this.addDialog = true;
    },

    /**
     * 选择牵头人取消回调
     * data: 返回值
     */
    selectCancel() {
      this.addDialog = false;
    },

    /**
     * 清除内容
     */
    clearContent() {
      this.addForm = {};
      this.quarterlyTargets.forEach((item) => {
        item.quarterTarget = "";
        item.quarterStrategy = "";
      });
    },
  },
};
</script>

<style lang='scss'>
.add_target_cont{
  width: 600px;
  user-select: none;
  font-family: 'SourceHanSansCN-Normal';
  .el-dialog__header {
    color: #1F2329;
    font-size: 16px;
    padding: 0 30px!important;
    .dialog-header-row{
      border: none;
    }
    .dialog-tip{
      width: 4px;
      border-radius: 0 3px 3px 0;
    }
  }
  .el-dialog__body{
    font-size: 14px;
    color: #646A73;
    padding: 20px 0 0 30px;
  }
  .el-dialog__footer{
    padding: 30px 20px 20px;
    border: none;
    .el-button{
      width: 82px;
      height: 32px;
    }
  }

  .addTarget-main {
    height: 580px;
    overflow-y: auto;
    padding-right: 20px;
    .quarter-main {
      .item-tip {
        text-align: left;
        color: #3471ff;
        font-size: 16px;
      }
    }

    .avue-form{
      .avue-form__group.avue-form__group--flex{
        .el-form-item__label{
          text-align: left;
        }
        .el-form-item__content{
          margin: 0!important;
        }
      }
    }
    .quarter-main{
      .avue-form__group.avue-form__group--flex >div:nth-child(4n+4){
        display: none;
      }
    }
  }



  .addTarget-main::-webkit-scrollbar{
    width: 5px;
    border-radius: 2px;
  }
  .addTarget-main::-webkit-scrollbar-thumb{
    background-color: #DDDDDD;
  }
  .addTarget-main::-webkit-scrollbar-track:active {
    background-color: #E1E1E1
  }
  .quarter-item {
    .avue-form__group>div:nth-child(1) .el-form-item{
      margin: 0;
    }
    .avue-form {
      .el-form-item__label {
        .item-tip{
          display: flex;
          align-items: center;
          img{
            width: 16px;
            margin-right: 10px;
          }
        }
      }
    }
    
  }
  .custom_class_quarter{
    .el-form-item.el-form-item--medium{
      .el-form-item__label{
        text-align: left;
      }
      .el-form-item__content{
        margin-left: 0!important;
      }
    }
  }
}

</style>