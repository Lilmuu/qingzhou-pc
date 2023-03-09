var valiStr = (rule, value, callback) => {
    if (/^\s+$/.test(value)) {
        callback(new Error('内容不能全为空格'));
    } else {
        callback();
    }
};

// 添加牵头人、年度...
export const addFormOption = {
    submitBtn: false,
    cancelBtn: false,
    emptyBtn: false,
    column: [{
            label: '牵头人',
            prop: 'userName',
            formslot: true,
            span: 24,
            rules: [
                { required: true, message: "请输入牵头人", trigger: "change" },
            ]
        },
        {
            label: '年度',
            prop: 'annual',
            type: 'year',
            format: "yyyy",
            valueFormat: "yyyy",
            span: 24,
            rules: [
                { required: true, message: "请选择年度", trigger: "change" }
            ]
        },
        {
            label: '年度目标',
            prop: 'annualTarget',
            formslot: true,
            span: 24,
            rules: [
                { required: true, message: "请输入年度目标", trigger: "blur" },
                { validator: valiStr, trigger: "blur" }
            ]
        },
        {
            label: '工作策略',
            prop: 'annualStrategy',
            formslot: true,
            span: 24,
            rules: [
                { required: true, message: "请输入工作策略", trigger: "blur" },
                { validator: valiStr, trigger: "blur" }
            ]
        }
    ]
}


// 季度
export const quartersOption = {
    submitBtn: false,
    cancelBtn: false,
    emptyBtn: false,
    column: [{
            label: '一季度',
            prop: 'quarter',
            formslot: true,
            labelslot: true
        },
        {
            label: '季度目标',
            prop: 'quarterTarget',
            formslot: true,
            span: 24,
            rules: [
                // { required: true, message: "请输入季度目标", trigger: "blur" },
                { validator: valiStr, trigger: "blur" }
            ]
        },
        {
            label: '工作策略',
            prop: 'quarterStrategy',
            formslot: true,
            span: 24,
            rules: [
                // { required: true, message: "请输入工作策略", trigger: "blur" },
                { validator: valiStr, trigger: "blur" }
            ]
        },
    ]
}