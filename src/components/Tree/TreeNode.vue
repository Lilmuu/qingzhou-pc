<template>
  <div class="main">
    <div class="label" v-if="!item.hidden">
      <span
        @click="onExpend"
        v-if="item.children.length"
        :class="['sanjiao', { unExpend: unExpend }]"
      ></span>
<!--      <input-->
<!--        :checked="item.selected"-->
<!--        type="checkbox"-->
<!--        @click="oneSelect"-->
<!--        v-if="item.children.length"-->
<!--        :indeterminate.prop="item.indeterminate"-->
<!--      />-->
      <label @click="oneSelect">{{ item.name }}</label>
    </div>
    <transition name="fade">
      <div v-if="!item.hidden && !unExpend">
        <tree-node
          @on-select="onSelect"
          :data="data"
          v-if="item.children"
          v-for="(sub, index) in item.children"
          :item="sub"
          :key="index"
        />
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  name: "TreeNode",
  data() {
    return {
      unExpend: false
    }
  },
  props: {
    item: Object,
    data: Array,
    index: Number
  },
  methods: {
    onSelect(item) {
      this.$emit("on-select", item)
    },
    onExpend() {
      this.unExpend = !this.unExpend
    },
    oneSelect() {
      this.data.forEach(item => {
        if (item.node.name === this.item.name) {
          console.log('select', item)
          this.$emit("on-select", item)
        }
      })
    }
  }
}
</script>

<style scoped>
.label {
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-top: 6px;
}
.main {
  padding-left: 30px;
}
.sanjiao {
  cursor: pointer;
  position: absolute;
  left: -12px;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 6px 6px 0 6px;
  border-color: #444 transparent transparent transparent;
  margin-right: 4px;
  transition: all 0.4s;
}
.unExpend {
  transform: rotate(-90deg);
}
</style>
