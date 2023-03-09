const setting = {
  state: {
    userInfo: "",
    realName: "",
    sender: "",
    deviceInfo: "",
    session_id: 0,
    handle_id: 0,
    status: ""
  },
  mutations: {
    ["SETDEVICEINFO"]: (state, data) => {
      localStorage.setItem("deviceInfo", JSON.stringify(data));
    },
    ["USERINFO"]: state => {
      state.userInfo = JSON.parse(localStorage.getItem("userInfo"))
        ? JSON.parse(localStorage.getItem("userInfo"))
        : {};
    },
    ["DEVICEINFO"]: state => {
      console.log("DEVICEINFO");
      console.log(localStorage.getItem("deviceInfo"));
      state.deviceInfo = JSON.parse(localStorage.getItem("deviceInfo"))
        ? JSON.parse(localStorage.getItem("deviceInfo"))
        : {};
    }
  },
  actions: {
    DeviceInfo: function({ commit }) {
      commit("DEVICEINFO");
    },
    SetDeviceInfo: function({ commit }, data) {
      commit("SETDEVICEINFO", data);
    },
  }
}

export default setting
