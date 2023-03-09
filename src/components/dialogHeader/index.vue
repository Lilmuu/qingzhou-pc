<template>
    <div class="elModalTitle">
        <span class="">{{title}}</span>
        <img @click="closeCustomDialog" src="@/assets/img/calendar/close.png" alt="" >
    </div>
</template>

<script>
export default({
    props:{
        title:{
            type:String,
            default:''
        }
    },
    methods: {
        closeCustomDialog(){
            this.$emit('closeCustomDialog')
        }
    },
})
</script>