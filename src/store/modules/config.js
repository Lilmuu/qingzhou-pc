const config = {
    state: {
        isFull: localStorage.getItem('isFull') || true,
        ratio: localStorage.getItem("ratio") || 100
    },
    mutations:{
        SET_IS_FULL:(state, value) => {
            localStorage.setItem('isFull',value)
            state.isFull = value
        },
        SET_RATIO:(state, value)=>{
            localStorage.setItem('ratio',value)
            state.ratio = value
        }
    },
    actions:{
        
    }
}
export default config