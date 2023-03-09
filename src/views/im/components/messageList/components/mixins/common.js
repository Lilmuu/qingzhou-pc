// 公共mixin
export default {
  methods: {
    /**
     * 处理获取图片容器宽高
     * @param aimsNum 目标值
     * @param aidNum 辅助值
     * @param aimsMax 目标最大值
     * @param aidMax 辅助最大值
     */
    handleGetImgBoxWH (aimsNum, aidNum, aimsMax, aidMax) {
      let result = 0 // 返回值
      if (aimsNum < aimsMax && aidNum < aidMax) {
        // 宽高如果都小于最大值，则直接使用图片宽高
        aimsNum === 0 ? result = aimsMax : result = aimsNum
      } else {
        // 如果图片大于设定最大值，则需要通过图片的宽比计算宽
        if (aimsNum <= aidNum) {
          // 计算高度最大值与图片的高度比
          const scale = aidMax / aidNum // 高度比
          result = Math.round(aimsNum * scale) // 计算宽度
        } else {
          result = aimsMax
        }
      }
      return `${result}px`
    }
  }
}
