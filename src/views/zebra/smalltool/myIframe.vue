<!--
 * @Author: your name
 * @Date: 2021-09-28 11:08:46
 * @LastEditTime: 2021-10-20 19:09:22
 * @LastEditors: your name
 * @Description: In User Settings Edit
 * @FilePath: \task-pc-ui\src\views\zebra\smalltool\myIframe.vue
-->
<template>
  <iframe
    id="myIframe"
    :src="src"
    frameborder="0"
    @load="iframeLoaded"
    style="width: 100%;height: 90vh;"
  ></iframe>
</template>

<script>
export default {
  name: "myIframe",
  props:{
    src:{
      type:String,
      default:''
    }
  },
  methods: {
    iframeLoaded () {
      var frame = document.getElementById('myIframe');
      const StorageData = window.localStorage
      const object = {
        type: 'setLocalStorage',
        data: {
          TOKEN: StorageData.getItem('TOKEN'),
          USERID: StorageData.getItem('USERID'),
          USERNAME: StorageData.getItem('USERNAME'),
          socketToken: StorageData.getItem('socketToken'),
          tenantId: StorageData.getItem('tenantId'),
        }
      }

      frame.contentWindow.postMessage(object, '*');
    },
  }
}
</script>

<style scoped>
</style>
