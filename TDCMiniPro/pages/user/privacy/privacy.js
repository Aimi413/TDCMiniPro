const app = getApp();
var eventNo = app.globalData.eventNo;
var apiUrl = app.globalData.apiUrl;
Page({
	data: {
		showMobile: true,
		showEmail: true,
		showWechat: true,
		hideMobileState: "已隐藏",
		showMobileState: "已显示",
		hideEmailState: "已隐藏",
		showEmailState: "已显示",
		hideWechatState: "已隐藏",
		showWechatState: "已显示",
		profile: {
			mobile: "",
			privacyMobile: "",
			email: "",
			privacyEmail: "",
			wechat: "",
			privacyWechat: "",
			intro: ""
		}
	},
	onLoad: function (options) {
		var token = wx.getStorageSync('token');
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
					let { intro, contactList } = info;
					let tempMobile = contactList.filter(item => item.id == 1);
					let tempEmail = contactList.filter(item => item.id == 2);
					let tempWechat = contactList.filter(item => item.id == 3);

					let mobileVal = tempMobile[0] != undefined ? tempMobile[0].name : '未填写';
					let emailVal = tempEmail[0] != undefined ? tempEmail[0].name : '未填写';
					let wechatVal = tempWechat[0] != undefined ? tempWechat[0].name : '未填写';

					let privacyMobile = null, privacyEmail = null, privacyWechat = null;

					if(tempMobile[0] != undefined && tempMobile[0].name != null) {
						privacyMobile = mobileVal.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2");
					}
					if(tempEmail[0] != undefined && tempEmail[0].name != null) {
						privacyEmail = emailVal.replace(/(\w{1})(.*)@(.*)/, "$1****@$3");
					}
					if(tempWechat[0] != undefined && tempWechat[0].name != null) {
						privacyWechat = wechatVal.substr(0, 1) + "****" + wechatVal.substr(-1);
					}

					let isShowMobile = true;
					let isShowEmail = true;
					let isShowWechat = true;
					if(tempMobile[0] != undefined && tempMobile[0].value != 1) {
						isShowMobile = false;
					}
					if(tempEmail[0] != undefined && tempEmail[0].value != 1) {
						isShowEmail = false;
					}
					if(tempWechat[0] != undefined && tempWechat[0].value != 1) {
						isShowWechat = false;
					}
					this.setData({
						"profile.mobile": mobileVal,
						"profile.privacyMobile": privacyMobile,
						"profile.email": emailVal,
						"profile.privacyEmail": privacyEmail,
						"profile.wechat": wechatVal,
						"profile.privacyWechat": privacyWechat ? privacyWechat : '未填写',
						"profile.intro": intro,
						"showMobile": isShowMobile,
						"showEmail": isShowEmail,
						"showWechat": isShowWechat

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
	switchItem: function(e) {
		var token = wx.getStorageSync('token');
		let whichItem = e.currentTarget.dataset.item;
		let val = e.detail.value;

		let { mobile, email, wechat, intro } = this.data.profile;
		
		if(whichItem == "mobile") {
			this.setData({
				showMobile: val
			});
		} else if(whichItem == "email") {
			this.setData({
				showEmail: val
			});
		} else if(whichItem == "wechat") {
			this.setData({
				showWechat: val
			});
		}
		
		let { showMobile, showEmail, showWechat } = this.data;
		let contactList = [
			{ id: 1, name: mobile, value: showMobile ? 1 : 9 },
			{ id: 2, name: email, value: showEmail ? 1 : 9 },
			{ id: 3, name: wechat, value: showWechat ? 1 : 9 },
		];
		wx.request({
			url: `${apiUrl}/Me/UserInfoSave?eventno=${eventNo}`,
			method: "PUT",
			header: {
				token: token
			},
			data: {
				intro: intro,
				contactList: contactList
			},
			success: res => {
				let resData = res.data;
				if(resData.code == 0) {
					wx.showToast({
						title: "设置已更新",
						duration: 1000,
						mask: true
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
	}
})