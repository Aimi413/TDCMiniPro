const app = getApp();
var eventNo = app.globalData.eventNo;
var apiUrl = app.globalData.apiUrl;
Page({
	data: {
		hideDataTip: true,
		hideServinceWin: true,
		profile: {
			name: "",
			company: "",
			jobTitle: "",
			photo: "",
			role: "",
			newMessageCount: "",
			intro: "",
			mobile: "",
			email: "",
			wechat: "",
		}
	},
	onLoad: function (options) {
	},
	onShow: function () {
		var token = wx.getStorageSync('token');
		if(!token) {
			wx.redirectTo({
			  url: '/pages/user/login/login',
			});
			return false;
		}
		wx.request({
			url: `${apiUrl}/Me/UserInfo?eventno=${eventNo}`,
			method: "GET",
			header: {
				token: token
			},
			success: res => {
				let resData = res.data;
				if(resData.code == 40403) {
					wx.removeStorageSync('token');
					return false;
				}
				if(resData.code == 0) {
					let info = resData.data;
					let { name, company, jobTitle, photo, role, newMessageCount, intro, contactList } = info;
					let tempMobile = contactList.filter(item => item.id == 1);
					let tempEmail = contactList.filter(item => item.id == 2);
					let tempWechat = contactList.filter(item => item.id == 3);
					let mobileVal = tempMobile[0] != undefined ? tempMobile[0].name : '未填写';
					let emailVal = tempEmail[0] != undefined ? tempEmail[0].name : '未填写';
					let wechatVal = tempWechat[0] != undefined ? tempWechat[0].name : '未填写';
					if(tempMobile[0] != undefined && tempMobile[0].value != 1 && tempMobile[0].name != null) {
						mobileVal = mobileVal.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2");
					}
					if(tempEmail[0] != undefined && tempEmail[0].value != 1 && tempEmail[0].name != null) {
						emailVal = emailVal.replace(/(\w{1})(.*)@(.*)/, "$1****@$3");
					}
					if(tempWechat[0] != undefined && tempWechat[0].value != 1 && tempWechat[0].name != null) {
						wechatVal = wechatVal.substr(0, 1) + "****" + wechatVal.substr(-1);
					}
					this.setData({
						"profile.name": name,
						"profile.company": company,
						"profile.jobTitle": jobTitle,
						"profile.photo": photo,
						"profile.role": role,
						"profile.newMessageCount": newMessageCount,
						"profile.intro": intro,
						"profile.mobile": mobileVal,
						"profile.email": emailVal,
						"profile.wechat": wechatVal,
					});
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
	},
	closeDataTip: function() {
		this.setData({
			hideDataTip: true,
			hideServinceWin: true
		});
	},
	openServinceWin: function() {
		this.setData({
			hideServinceWin: false
		});
	},
	makePhone: function(e) {
		let { phone } = e.currentTarget.dataset;
		wx.makePhoneCall({
		  phoneNumber: phone,
		});
	},
	loginOut: function() {
		wx.removeStorageSync('token');
		// wx.redirectTo({
		//   url: '/pages/user/login/login',
		// });
		wx.reLaunch({
			url: "/pages/user/login/login"
		});
	}
})