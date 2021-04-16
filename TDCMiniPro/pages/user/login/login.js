const app = getApp();
var eventNo = app.globalData.eventNo;
var apiUrl = app.globalData.apiUrl;
Page({
	data: {
		accountVal: '',
		hideLoginForm: false,
		hideAccountTip: true,
		hideValicodeTip: true,
		accountTip: "请输入手机号或邮箱",
		valicodeTip: "请输入验证码",
		disabledGetCode: false,
		disabledLogin: false,
		codeBtnTxt: '获取验证码',
		hideCantLoginTip: true,
		cantLoginTipText: "",
	},
	timer: null,
	redirectObj:{},
	redirectParameters: "",
	onLoad: function (options) {
		Object.keys(options).forEach(key => {
			this.redirectObj[key] = options[key];
			if(key != "redirect") {
				this.redirectParameters += `&${key}=${options[key]}`
			}
		});
		let subIndex = this.redirectParameters.indexOf("&") + 1;
		this.redirectParameters = this.redirectParameters.substr(subIndex);
	},
	onHide: function() {
		this.setData({
			hideCantLoginTip: true,
			cantLoginTipText: ""
		});
	},
	getPhone: function(e) {
		console.log(e);
	},
	showLoginForm: function() {
		this.setData({
			hideLoginForm: false
		})
	},
	hideForm: function() {
		this.setData({
			hideLoginForm: true
		});
	},
	inputAccountVal: function(e) {
		this.setData({
			accountVal: e.detail.value,
			hideAccountTip: true,
			hideValicodeTip: true
		});
	},
	getCode() {
		if(this.data.accountVal.length <= 0) {
			this.setData({
				hideAccountTip: false
			});
			return false;
		}
		if (!/(^(13[0-9]|14[579]|15[0-9]|166|17[0135678]|18[0-9]|19[8-9])[0-9]{8}$)|\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/.test(this.data.accountVal)) {
			this.setData({
				hideAccountTip: false,
				accountTip: "手机号或邮箱格式不正确，请检查"
			});
			return false;
		}
		
		let t = 59;
		this.setData({
			disabledGetCode: true,
			codeBtnTxt: t + "s"
		});

		this.timer = setInterval(() => {
			t--;
			if(t <= 0) {
				clearInterval(this.timer);
				this.timer = null;
				this.setData({
					disabledGetCode: false,
					codeBtnTxt: '重新发送'
				});
				t = 59;
				return;
			}
			this.setData({
				codeBtnTxt: t + "s"
			});
		}, 1000);
		wx.request({
			url: `${apiUrl}/Home/SendCode?eventno=${eventNo}&loginname=${this.data.accountVal}`,
			data: {},
			method: "POST",
			success: res => {
				if (res.data.code != 0) {
					clearInterval(this.timer);
					this.timer = null;
					t = 59;
					this.setData({
						disabledGetCode: false,
						codeBtnTxt: '重新发送'
					});
					wx.showModal({
						title: "提示",
						showCancel: false,
						content: res.data.message
					});
				}
			},
			fail: res => {
				console.log(this)
				clearInterval(this.timer);
				this.timer = null;
				t = 59;
				wx.showModal({
				  title: "提示",
				  content: res.errMsg,
				  showCancel: false
				});
				this.setData({
					disabledGetCode: false,
					codeBtnTxt: '重新发送'
				});
			}
		});
	},
	hideTip: function() {
		this.setData({
			hideValicodeTip: true,
			hideAccountTip: true
		})
	},
	handleLogin(e) {
		let account = e.detail.value.account,
			code = e.detail.value.code;

		if (!/(^(13[0-9]|14[579]|15[0-9]|166|17[0135678]|18[0-9]|19[8-9])[0-9]{8}$)|\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/.test(account)) {
			this.setData({
				hideAccountTip: false,
				accountTip: "手机号或邮箱格式不正确，请检查"
			});
			return false;
		}
		if(code.length <= 0){
			this.setData({
				hideValicodeTip: false,				
			});
			return false;
		}
		this.setData({
			disabledLogin: true
		});
		wx.request({
			url: `${apiUrl}/Home/Login?eventno=${eventNo}&loginname=${account}&code=${code}`,
			method: "POST",
			data: {},
			success: res => {
				let resData = res.data;
				let token = resData.data;
				if (resData.code == 0) {					
					wx.setStorageSync('token', token);
					wx.showToast({
						title: '登录成功',
						icon: 'success',
						duration: 1000
					});
					clearInterval(this.timer);
					this.timer = null;
					setTimeout(() => {
						if(this.redirectObj.hasOwnProperty('redirect')) {
							wx.redirectTo({
								url: `${this.redirectObj.redirect}?${this.redirectParameters}`
							});
						} else {
							wx.redirectTo({
								url: '/pages/home/index/index'
							});
						}
					}, 1000);
				} else{
					// wx.showModal({
					// 	title: "提示",
					// 	content: resData.message,
					// 	showCancel: true,
					// 	confirmText: "提交反馈",
					// 	success: res => {
					// 		wx.navigateTo({
					// 			url: `/pages/user/feedback/feedback`
					// 		})
					// 	},
					// 	fail: res => {

					// 	}
					// });
					this.setData({
						hideCantLoginTip: false,
						cantLoginTipText: resData.message
					});
					clearInterval(this.timer);
					this.timer = null;
					this.setData({
						disabledLogin: false
					});
				}

			},
			fail: res => {
				// wx.showModal({
				// 	title: "提示",
				// 	content: res.errMsg,
				// 	showCancel: false
				// });
				this.setData({
					hideCantLoginTip: false,
					cantLoginTipText: res.errMsg,
					disabledLogin: false
				});
				// this.setData({
				// 	disabledLogin: false
				// });
			}
		})
	},
	closeCantLoginWin: function() {
		this.setData({
			hideCantLoginTip: true,
			cantLoginTipText: ""
		});
	},
	goFeedBack: function() {
		wx.navigateTo({
			url: "/pages/user/feedback/feedback"
		});
	},
	makePhone: function(e) {
		let { phone } = e.currentTarget.dataset;
		wx.makePhoneCall({
		  phoneNumber: phone,
		});
	}
})