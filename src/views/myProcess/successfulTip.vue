<template>
    <div class="successfulTipClass">
        <el-dialog
        :visible.sync="flowChartVisible"
        :show-close="false"
        width="480px"
        :before-close="handleClose">
        <template slot="title">
            <div class="page-header-left-clos"><i class="el-icon-close" @click="flowChartClick"></i></div>
        </template>
        <div class="body-center">
            <i class="el-icon-success"></i>
            <div>申请{{tit}}成功!</div>
        </div>

        </el-dialog>
    </div>
</template>

<script>
export default {
    name: 'successfulTip',

    components: {},
    data() {
        return {
            flowChartVisible: false,
            tit:''
        };
    },

    mounted() {

    },

    methods: {
        handleClose(done) {
            done();
            // this.$parent.getList()
        },
        flowChartClick(){
            this.flowChartVisible=false
            // this.$parent.getList()
        },
        handleSubmit(){
            this.flowChartVisible= false

        },
        handleUp(tit){
            this.tit=tit
            this.flowChartVisible= true
        },
    },
};
</script>

<style lang="scss">
.successfulTipClass{
    .el-dialog__header{
        justify-content: space-between;
        padding: 0;
        .el-dialog__title{
            font-size: 16px;
        }
    }
    .el-dialog{
        display: flex;
        flex-direction: column;
        margin:0 !important;
        position:absolute;
        top:50%;
        left:50%;
        transform:translate(-50%,-50%);
        .el-dialog__body{
            padding-top:0;
            padding: 0;

            .body-center{
                padding: 33px 184px 57px !important;
                text-align: center;
                i{
                    color: #3471FF;
                    font-size: 50px;
                }
                div{
                    margin-top: 20px;
                }
            }
            }
            .page-header-left-clos{
                width: 100%;
                height: 34px;
                display: flex;
                flex-direction: row-reverse;
                align-items: center;
                i{
                    color: #BFBFBF;
                    font-size: 14px;
                    cursor: pointer;
                    margin-right: 10px;
                }
            }
        }



}
</style>
