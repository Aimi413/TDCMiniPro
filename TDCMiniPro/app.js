App({
  onLaunch: function () {
    // 展示本地存储能力
    // var logs = wx.getStorageSync('logs') || []
    // logs.unshift(Date.now())
    // wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        wx.request({
            url: `${apiUrl}/Weixin/WxCode2Session?code=${res.code}`,
            method: "POST",
            success: res => {
              let resData = res.data;
              if(resData.code == 0) {
                wx.setStorageSync('session', resData.data);
              } else {
                wx.showModal({
                  title: "提示",
                  content: resData.message,
                  showCancel: false
                });
              }
            },
            fail: res => {
              wx.showModal({
                title: "提示",
                content: res.errMsg,
                showCancel: false
              });
            }
        });
      }
    });
    // 获取用户信息
    /*wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })*/

    var token = wx.getStorageSync('token');
    let { apiUrl, eventNo } = this.globalData;
    wx.request({
      url: `${apiUrl}/Home/Online?eventno=${eventNo}`,
      method: "POST",
      header: {
        token: token
      },
      success: res => {
        let resData = res.data;
        if(resData.code == 40001 || resData.code == 40403) {
          wx.removeStorageSync('token');
        }
      },
      fail: res => {
        wx.removeStorageSync('token');
        // wx.showModal({
        //   title: "提示",
        //   content: res.errMsg,
        //   showCancel: false
        // });
      }
    });
  },
  endShowRegisterTime: new Date("2020-11-27 17:00"),
  globalData: {
    // eventNo: 63,
    eventNo: 79,
    // apiUrl: "http://192.168.1.21:199",
    apiUrl: "https://socialapi.traveldaily.cn",
    uploadUrl: "https://files.traveldaily.cn",
    // uploadUrl: "http://192.168.1.21:88",
    // apiUrl: "http://192.168.1.11:90",
    // apiUrl: "http://192.168.1.21:185",
  },
  eventType: {
    4: "tdc",
    5: "hmc",
    7: "ddc",
    100: "dta"
  },
})