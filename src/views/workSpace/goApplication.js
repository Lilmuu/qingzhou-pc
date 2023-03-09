import store from '@/store'
import router from '@/router'
export const otherApp = (item) => {
    let param = ''
    switch (item.appId) {
        case 1:
            param = {name:'议题', path:'topics',query:''}
            break;
        case 2:
            param = {name:'签报', path:'sign',query:''}
            break;
        case 3:
            param = {name:'用印', path:'useSeal',query:''}
            break;
        case 4:
            param = {name:'发文', path:'dispatch',query:''}
            break;
        case 5:
            param = {name:'合同', path:'contract',query:''}
            break;
        case 6:
            param = '/message/index'
            break;
        case 7:
            param = '/my/index'
            break;
        case 8:
            param = '/myDate/index'
            break;
        case 9:
            param = '/contact/index'
            break;
        case 10:
            param = '/meeting/index'
            break;
        case 11:
            param = '/mail/index'
            break;
        default:
            break;
    }
    item.appType == '1' ? store.commit('pushTopNav',param) : router.push({path:param})
} 