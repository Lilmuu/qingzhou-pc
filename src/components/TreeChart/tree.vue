<template>
	<div class="treechart" id="treechart" ref="treechart">
		<table id="tablebody" v-if="treeData && treeData.username" style="margin:0 auto;">
			<tr>
				<td :colspan="treeData.children ? treeData.children.length * 2 : 1" :class="{parentLevel: treeData.children, extend: treeData.children.length>0 && treeData.extend}">
					<div :class="{node: true, hasMate: treeData.mate}">
						<div class="person">
							<!--               @click="$emit('click-node', treeData)" -->
							<div class="avat" slot="reference" :style="treeData.enlarge?{'min-height':'35px'}:{}">
								<div>{{treeData.username}}</div>
							</div>
              <div class="border_box"></div>
						</div>
						<!-- <div class="point" @click="$emit('changecontent', treeData)" v-if="isFirstPoint"></div> -->
            <div class="point" @click="pointClick(treeData.taskId)" v-if="isFirstPoint"></div>
						<div class="person" v-if="treeData.mate">
							<!--  @click="$emit('click-node', treeData.mate)" -->
							<div class="avat">
								{{treeData.mate.name}}
							</div>
						</div>
					</div>
					<div v-if="treeData.children && treeData.children.length" @click="toggleExtend(treeData)"></div>
				</td>
			</tr>
			<!-- 这是一个递归组件,注意,这里还要调用,需要传递的数据这里也要传递,否则操作时拿不到子级的数据 -->
			<tr v-show="treeData" v-if="treeData.children && treeData.children.length && treeData.extend">
				<td v-for="(childers, index) in treeData.children" v-if="treeData.children.length>0" :key="index" colspan="2" class="childLevel">
					<TreeChart :totalRates="totalRates" :json="childers" :oldTreeData="treeData" :id="lastId"
					 />
           <!--  @changecontent="$emit('changecontent', childers)" -->
				</td>
			</tr>
		</table>
	</div>
</template>

<script>
  // 这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
  // 例如：import 《组件名称》 from '《组件路径》';
  // import common from '@/utils/common'
  import {
    Loading
  } from 'element-ui'

  export default {
    name: 'TreeChart',
    props: {
      json: {}, // 渲染数据
      oldTreeData: {}, // 原始数据
      treeDatas: [],
      totalRates: 0, // 比例
      treeData1: {},
      isFirstPoint: {
        type: Boolean,
        default: true
      },
      id: null // 最后一级id,前端添加数据需要
    },
    data() {
      const validateName = (rule, value, callback) => {
        if (/^[\u0391-\uFFE5A-Za-z]{1,50}$/.test(value)) {
          callback()
        } else {
          return callback(new Error('请输入1-50字的名称'))
        }
      }
      return {
        tableData: [],
        treeData: {},
        // oldTreeData: {},
        rateCount: 0, // 占比总和
        oldCount: 0, // 编辑之前的总和
        oldRate: 0, // 编辑之前的单个值
        dataList: [],
        totalRate: 0,
        data: [],
        total: 0
      }
    },

    created() {
      // 设置语言
      this.lastId = Number(this.id)
    },

    watch: {
      json: {
        // 遍历当前的数据
        handler: function(Props) {
          const extendKey = function(jsonData) {
            jsonData.extend =
              jsonData.extend === void 0 ? true : !!jsonData.extend
            if (!Array.isArray(jsonData.children)) {
              jsonData.children = []
            }
            if (Array.isArray(jsonData.children) && jsonData.children.length > 0) {
              jsonData.children.forEach(c => {
                extendKey(c)
              })
            }
            return jsonData
          }
          if (Props) {
            this.treeData = extendKey(Props)
          }
        },
        immediate: true
      }
    },
    methods: {
      pointClick(id) {
        this.$store.commit('SET_POPUP_ID', id)
        this.$store.commit('SET_POPUP_SHOW', true)
      },
      toggleExtend(treeData) {
        treeData.extend = !treeData.extend
        this.$forceUpdate()
      },

      // 循环树形图 获得个数
      forData(data) {
        const obj = {
          totalRate: 0,
          leg: 0
        }
        if (data.childers && data.childers.length) {
          data.childers.forEach(v => {
            // obj.totalRate += v.proportionShares
          })
          obj.leg = data.childers.length
        }
        return obj
      },

      // 循环树形图
      getRate(data, id) {
        // 如果是第一级
        if (id) {
          if (!id || data.partnerCode === id) {
            if (data.childers && data.childers.length) {
              data.childers.forEach(v => {
                // this.rateCount += v.proportionShares
              })
            }
            return this.rateCount
          } else if (data.childers && data.childers.length) {
            data.childers.some(v => {
              this.getRate(v, id)
            })
          }
        }
      },

      closeMoveHandle() {
        sessionStorage.setItem('startStopMove', 'stop')
      },
      startMove() {
        sessionStorage.setItem('startStopMove', 'start')
      },
      changestartStopMove(done) {
        sessionStorage.setItem('startStopMove', 'start')
        done()
      }
    },
    directives: {
      drag(el) {
        const oDiv = el // 当前元素
        const self = this // 上下文
      }
    }
  }
</script>
<style lang='scss' scoped>
	//@import url(); 引入公共css类
	.treechart {
    margin: 0 auto;
    min-width: 160px;
    display: flex;
		align-items: center;
		justify-content: center;
		table {
			border-collapse: separate !important;
			border-spacing: 0 !important;
			/*display: flex;
			align-items: center;
			justify-content: center;
			flex-direction: column; */
		}

		td {
			position: relative;
			vertical-align: top;
			padding: 35px 0 100px 0;
			text-align: center;
/* 			display: flex;
			justify-content: center; */
		}

		.parent {
			background: #199ed8 !important;
			font-weight: bold;
		}

		.extend_handle {
			position: absolute;
			left: 50%;
			bottom: 27px;
			width: 10px;
			height: 10px;
			padding: 10px;
			transform: translate3d(-15px, 0, 0);
			cursor: pointer;
		}

		.extend_handle:before {
			content: "";
			display: block;
			width: 100%;
			height: 100%;
			box-sizing: border-box;
			border: 2px solid;
			border-color: #ccc #ccc transparent transparent;
			transform: rotateZ(135deg);
			transform-origin: 50% 50% 0;
			transition: transform ease 300ms;
		}

		.extend_handle:hover:before {
			border-color: #333 #333 transparent transparent;
		}

		.extend .extend_handle:before {
			transform: rotateZ(-45deg);
		}
		/* .extend::before{
			content: "";
			position: absolute;
			width: 0;
			height: 0;
			border-width: 17rpx;
			border-style: solid;
			left: 48%;
			bottom: 30rpx;
			border-color: #008cff transparent transparent transparent;
		} */
		.extend::after {
			content: "";
			position: absolute;
			left: 50%;
			bottom: 20px;
			height: 100px;
			border-left: 2px solid #3471FF;
			transform: translate3d(-1px, 0, 0);
		}
		.extend{
			.point{
				display: none;
			}
		}

		.childLevel::before {
			content: "";
			position: absolute;
			left: 50%;
			top: -20px;
			height: 100px;
			// border-left: 2px solid #008CFF;
      border-left: 2px solid #3471FF;
			transform: translate3d(-1px, 0, 0);
		}
		.childLevel{
			.point{
        cursor: pointer;
				position: absolute;
        // left: 43% !important;
        left: calc(100% - 80px) !important;
				top: calc(100% - 115px);
				// top: -95px;
				width: 10px;
				height: 10px;
				border-radius: 50%;
				background-color: #3471FF;
				display: block !important;
			}
		}
		.childLevel::after {
			content: "";
			position: absolute;
			left: 0;
			right: 0;
			top: -20px;
			border-top: 2px solid #3471FF;
		}

		.childLevel:first-child:before,
		.childLevel:last-child:before {
			display: none;
		}
		.childLevel:first-child:before{
			left: 44%;
		}
		.childLevel:last-child:before{
			left: 38%;
		}
		.childLevel:first-child:after {
			left: 50%;
			height: 100px;
			border: 2px solid;
			border-color: #3471FF transparent transparent #3471FF;
			border-radius: 6px 0 0 0;
			transform: translate3d(1px, 0, 0);
		}
		.childLevel:last-child:after {
			right: 50%;
			height: 100px;
			border: 2px solid;
			border-color: #3471FF #3471FF transparent transparent;
			border-radius: 0 6px 0 0;
			transform: translate3d(-1px, 0, 0);
		}
		
		.childLevel:first-child.childLevel:last-child::after {
			left: auto;
			border-radius: 0;
			border-color: transparent #3471FF transparent transparent;
			transform: translate3d(1px, 0, 0);
		}
		.node {
			position: relative;
			display: inline-block;
			box-sizing: border-box;
			text-align: center;
			padding: 0 10px;
		}

		.node .person {
			position: relative;
			display: inline-block;
			z-index: 2;
			width: auto;
			border-radius: 5px;
			box-shadow: 0px 0px 5px #888888;
		}
    .node .person .border_box{
			position: absolute;
			width: 100%;
			height: 100%;
			background: transparent;
			border: 1px solid #3471FF;
			background-color: #FFFFFF;
			border-radius: 3px;
			top: 2px;
			left: 2px;
			z-index: 0;
		}

		.node .person .avat {
			padding: 5px 6px 5px;
			display: flex;
			align-items: center;
			justify-content: center;
			width: auto;
			max-width: 130px;
			min-width: 130px;
			min-height: 22px;
			margin: auto;
			word-break: break-all;
			box-sizing: border-box;
			border-radius: 4px;
			font-size: 12px;
			font-family: Source Han Sans CN;
			font-weight: 500;
			color: #FFFFFF;
      background: #3471FF;
      z-index: 2;
      position: relative;
			.opreate_icon {
				display: none;
			}
			&:hover {
				.opreate_icon {
					display: block;
					position: absolute;
					top: -3px;
					right: -3px;
					padding: 5px;
				}
			}
			&.other {
				background: #ccc;
			}
		}

		.node .person .avat img {
			cursor: pointer;
		}
		.node .person .name {
			height: 2em;
			line-height: 2em;
			overflow: hidden;
			width: 100%;
		}
		.node.hasMate::after {
			content: "";
			position: absolute;
			left: 2em;
			right: 2em;
			top: 15px;
			border-top: 2px solid #ccc;
			z-index: 1;
		}
		.node.hasMate .person:last-child {
			margin-left: 1em;
		}
		.landscape {
			transform: rotate(-90deg);
			padding: 0 4em;
		}
		.landscape .node {
			text-align: left;
			height: 8em;
			width: 8em;
		}
		.landscape .person {
			position: relative;
			transform: rotate(90deg);
			padding-left: 4.5em;
			height: 4em;
			top: 4em;
			left: -1em;
		}
		.landscape .person .avat {
			position: absolute;
			left: 0;
		}
		.landscape .person .name {
			height: 4em;
			line-height: 4em;
		}
		.landscape .hasMate {
			position: relative;
		}
		.landscape .hasMate .person {
			position: absolute;
		}
		.landscape .hasMate .person:first-child {
			left: auto;
			right: -4em;
		}
		.landscape .hasMate .person:last-child {
			left: -4em;
			margin-left: 0;
		}
		.el-dialog__header {
			padding: 0;
			padding-top: 30px;
			margin: 0 30px;
			border-bottom: 1px solid #f1f1f1;
			text-align: left;
			.el-dialog__title {
				font-size: 14px;
				font-weight: bold;
				color: #464c5b;
				line-height: 20px;
			}
		}
		.tips {
			padding: 0 20px;
			.el-select {
				width: 100%;
			}
			.blue {
				color: #00b5ef;
			}
			.check {
				margin-left: 100px;
			}
			.inquiry {
				font-weight: bold;
			}
			.el-form-item__label {
				display: block;
				float: none;
				text-align: left;
			}
			.el-form-item__content {
				margin-left: 0;
			}
		}
		.el-dialog__headerbtn {
			top: 30px;
			right: 30px;
		}
	}
	.el-popover {
		.el-button {
			padding: 8px !important;
			margin: 5px !important;
			width: 145px;
			float: left;
		}
	}
	.el-button {
		margin: 0px 10px;
	}
	.showbtn {
		div {
			text-align: center;
			padding: 5px;
		}
		div:hover {
			color: green;
			cursor: pointer;
		}
	}
	.setDepartmentHead {
		display: flex;
	}
	.searchBtn {
		display: flex;
		align-items: center;

		.el-form-item {
			margin-bottom: 0px !important;
		}
	}
	.point{
    cursor: pointer;
    position: absolute;
    left: 43%;
    top: -95px;
		width: 10px;
		height: 10px;
		border-radius: 50%;
		background-color: #3471FF;
	}
	
</style>
