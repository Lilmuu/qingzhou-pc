<template>
  <span v-text="text" :class="['vux-badge', {'vux-badge-dot': typeof text === 'undefined', 'vux-badge-single': typeof text !== 'undefined' && text.toString().length === 1}]"></span>
</template>


<script>
  export default {
    props: {
      text: {
      }
    },
    name: "Badge"
  }
</script>

<style>
  .vux-badge {
    display: inline-block;
    text-align: center;
    background: #f74c31;
    color: #fff;
    font-size: 12px;
    height: 16px;
    line-height: 16px;
    border-radius: 8px;
    padding: 0 6px;
    background-clip: padding-box;
    vertical-align: middle;
  }
  .vux-badge-single {
    padding: 0;
    width: 16px;
  }
  .vux-badge-dot {
    height: auto;
    padding: 5px
  }
</style>
