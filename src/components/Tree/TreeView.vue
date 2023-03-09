<template>
  <div class="container">
<!--    <div class="selected-Items">-->
<!--      <span>已选{{ counts }}个元素</span>-->
<!--    </div>-->
    <div class="tree">
<!--      <div class="title">-->
<!--        <div>请选择元素</div>-->
<!--        <div class="title_right">-->
<!--          <div class="select-all" @click="selectedAll">全选</div>-->
<!--          <div class="clear-all" @click="clearAll">清空</div>-->
<!--        </div>-->
<!--      </div>-->

<!--      <div class="input-box">-->
<!--        <input v-model="queryValue" type="text" placeholder="请输入筛选条件" />-->
<!--      </div>-->

      <div class="tree-nodes">
        <tree-node
          @on-select="onSelect"
          :data="treeList"
          v-for="(item, index) in list"
          :index="index"
          :key="`${item.nodeKey}`"
          :item="item"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { flatten, flatTree } from "./data"
import TreeNode from "./TreeNode"
export default {
  name: "TreeView",
  components: { TreeNode },
  props: {
    // 数据列表
    propList: {
      type: Array,
      default: () => []
    },
    // 已选中的
    selected: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      selectedItems: [],
      list: [],
      queryValue: "",
      treeList: []
    }
  },
  // created() {
  //   console.log('list',  flatTree(this.list))
  //   this.treeList = flatTree(this.list);
  // },
  mounted() {
    // console.log('propList', this.propList)
    // this.list = this.propList
    // this.treeList = flatTree(this.propList);
  },
  computed: {
    counts() {
      return this.treeList.filter(item => item.node.selected === true).length
    }
  },
  watch: {
    propList(val) {
      this.list = val
    },
    selected(val) {
      this.selected = val
    },
    queryValue(val) {
      this.fliterList(val)
    }
  },
  methods: {
    fliterList(query) {
      this.treeList.forEach(item => {
        const flag = item.node.name.includes(query)
        if (flag) {
          const _parent = this.treeList[item.parent]
          _parent && this.$set(_parent.node, "hidden", !flag)
        }
        this.$set(item.node, "hidden", !flag)
      })
    },
    onSelect({ nodeKey, node, parent }) {
      const _node = this.treeList[nodeKey]
      const flag = !_node.node.selected
      this.$set(_node.node, "selected", flag)
      this.$nextTick(() => {
        this.revParent(parent, flag)
        this.revChildren(_node, flag)
      })
    },
    revChildren(node, flag) {
      node.children &&
      node.children.forEach(index => {
        const _node = this.treeList[index]
        this.$set(_node.node, "selected", flag)
        this.revChildren(_node, flag)
      })
    },
    revParent(parentId, flag) {
      const _parent = this.treeList[parentId]
      if (!_parent) return
      const indeterminate = _parent.children.some(
        index =>
          !this.treeList[index].node.selected &&
          !this.treeList[index].node.indeterminate
      )
      const t = _parent.children.every(
        index =>
          !this.treeList[index].node.selected &&
          !this.treeList[index].node.indeterminate
      )
      this.$set(
        _parent.node,
        "selected",
        _parent.children.every(index => this.treeList[index].node.selected)
      )
      this.$set(_parent.node, "indeterminate", t ? false : indeterminate)
      this.revParent(_parent.parent, flag)
    },
    selectedAll() {
      this.treeList.forEach(item => {
        this.$set(item.node, "selected", true)
        this.$set(item.node, "indeterminate", false)
      })
    },
    clearAll() {
      this.treeList.forEach(item => {
        this.$set(item.node, "selected", false)
        this.$set(item.node, "indeterminate", false)
      })
    }
  }
}
</script>

<style scoped>
.tree-nodes {
  margin-top: 20px;
  user-select: none;
}

.input-box {
  margin-top: 15px;
}
.input-box input {
  width: 100%;
  height: 30px;
}
.container {
  display: flex;
  flex-direction: column;
}
.selected-Items,
.tree {
  border: 1px solid #ddd;
  padding: 10px;
  border-radius: 2px;
}
.selected-Items span {
  color: #888;
}
.tree {
  margin-top: 20px;
}
.title {
  display: flex;
  flex-direction: row;
  width: 100%;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  user-select: none;
  margin-top: 20px;
}
.title_right {
  display: flex;
  flex-direction: row;
}
.select-all {
  margin-right: 10px;
  color: #666;
  cursor: pointer;
}
.clear-all {
  color: #666;
  cursor: pointer;
}
.clear-all:hover,
.select-all:hover {
  color: #aaa;
}
</style>
