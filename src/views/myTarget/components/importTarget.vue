<!-- 导入任务 -->
<template>
    <div class="import-target">
        <el-dialog :visible.sync='importStatus' width="60%" append-to-body :close-on-click-modal="false">
            <div slot="title" class="dialog-header-row">
                <div class="dialog-tip"></div>
                <span class="el-dialog__title">导入任务</span>
            </div>
            <el-form :inline='true' label-position="right" label-width="150px">
                <el-row>
                    <el-col :span="24">
                        <el-form-item label="是否关联季度目标：">
                            <el-radio v-model="isRelevance" :label="true">是</el-radio>
                            <el-radio v-model="isRelevance" :label="false">否</el-radio>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row v-if="isRelevance">
                    <el-col :span="24">
                        <el-form-item label="季度目标：">
                            <el-select v-model="quarterTargetValue" size="small" placeholder="请选择">
                                <el-option
                                v-for="item in quarterOptions"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value">
                                </el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="24">
                        <el-form-item label="导入任务：">
                            <el-upload
                                class="upload-file"
                                :action="uploadUrl"
                                :headers='headers'
                                :accept='accept'
                                :show-file-list="false"
                                :before-upload="handleUploadBefore"
                                :on-success="handleUploadSuccess">
                                <el-button size="small">请上传文件</el-button>
                                <div slot="tip" class="el-upload__tip">只能上传.xlsx, .xls文件</div>
                            </el-upload>
                        </el-form-item>
                    </el-col>
                </el-row>
            </el-form>
        </el-dialog>
    </div>
</template>

<script>
import { config } from "@/const/dicData"
export default {
    name: 'importTarget',
    data() {
        return {
            accept: '.xlsx, .xls',
            quarterOptions: [],         // 季度目标
            quarterTargetValue: '',     // 选中季度目标
            isRelevance: true,          // 是否管理目标
            importStatus: false,        // 导入目标
            headers: {
                'Authorization': this.$store.getters.token
            },
        }
    },
    computed: {
        uploadUrl() {
            let targetId = this.isRelevance ? this.quarterTargetValue : -1;
            return `${config.baseURL}/mgr/task-engine/task/target/import/task/${targetId}`;
        }
    },
    methods: {
        // 初始
        init(data) {
            this.quarterTargetValue = '';
            this.quarterOptions = [];
            let list = [];
            data[0].quarterlyTargets.forEach(item => {
                list.push({
                    label: item.quarterTarget,
                    value: item.id
                })
            });
            this.quarterOptions = list;
            this.importStatus = true;
        },

        /**
         * 文件上传之前回调
         * file: 所选择的文件
        */
        handleUploadBefore(file) {
            const format = file.name.split('.')
            const suffix = format[format.length - 1]
            const formatArr = ['xlsx', 'xls'];
            if (format.length < 2) {
                this.$message.error('您上传文件的格式不正确！')
                return false
            }
            if (formatArr.indexOf(suffix) === -1) {
                this.$message.error('请上传.xlsx, .xls两种格式的文件');
                return false
            }
            // if (this.maxSize && file.size > this.maxSize) {
            //     const size = parseInt(String(this.maxSize / 1024 / 1024))
            //     if(this.showMaxSizeErrorText) {
            //     this.$message.error(`上传文件大于${size}Mb，请使用超大附件上传!`)
            //     } else {
            //     this.$message.error(`上传文件大于${size}Mb，请重新上传!`)
            //     }
            //     return false
            // }
            if(this.isRelevance && this.quarterTargetValue == '') {
                this.$message.error('请关联选择关联目标');
                return false;
            }
        },

        /**
         * 文件上传成功回调
         * file: 上传文件返回值
        */
        handleUploadSuccess(file) {
           let uploadStatus = file.code === 0 ? 'success' : 'error';
           this.$message[uploadStatus](file.msg);
        },

        // 当前季度目标
        handleChange(value) {
            console.log(value);
        }
    }
}
</script>

<style lang='scss'>

</style>