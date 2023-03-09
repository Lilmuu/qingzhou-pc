<!--表格封装-->
<template>
  <div>
    <el-table :data="tableData">
      <el-table-column
        v-for="{ prop, label } in tableOption.column"
        :key="prop"
        :prop="prop"
        :label="label">
      </el-table-column>
    </el-table>
    <el-pagination
      v-if="usePager"
      :current-page.sync="page.currentPage"
      :page-sizes="page.pageSizes"
      :page-size.sync="page.pageSize"
      :total="page.total"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="sizeChange"
      @current-change="currentChange"
    >
    </el-pagination>
  </div>
</template>

<script>
export default {
  name: "BTable",
  props: {
    tableData: {
      type: Array,
      required: true
    },
    tableOption: {
      type: Object,
      required: true
    },
    usePager: {
      type: Boolean,
      default: true
    },
    page: {
      type: Object,
      default: () => {
        return {
          currentPage: 1,
          pageSizes: [50, 100],
          pageSize: 50,
          total: 1
        }
      }
    },
    getList: {
      type: Function
    }
  },
  data() {
    return {}
  },
  methods: {
    currentChange(page) {
      this.getList(page)
    },
    sizeChange(page) {
      this.getList(page)
    }
  }
}
</script>
