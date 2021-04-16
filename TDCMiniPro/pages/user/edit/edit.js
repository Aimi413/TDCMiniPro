const app = getApp();
var eventNo = app.globalData.eventNo;
var apiUrl = app.globalData.apiUrl;
Page({
	data: {
		showMobile: true,
		showEmail: true,
		showWechat: true,
		editType: "",
		placeHolder: "",
		profile: {
			mobile: "",
			email: "",
			wechat: "",
			intro: ""
		}
	},
	onLoad: function (options) {
		var token = wx.getStorageSync('token');
		let type = options.type;
		let tempHolder = "";
		if(type == "wechat") {
			tempHolder = "微信号";
		} else if(type == "intro") {
			tempHolder = "个人简介";
		}
		this.setData({
			editType: type,
			placeHolder: tempHolder
		});
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
						"profile.email": emailVal,
						"profile.wechat": wechatVal,
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
	tempWechat: "",
	tempIntro: "",
	changeVal: function(e) {
		let editType = e.currentTarget.dataset.type;
		let tempVal = e.detail.value;
		if(editType == "wechat") {
			this.tempWechat = tempVal;
		} else if(editType == "intro") {
			this.tempIntro = tempVal;
		}
	},
	saveInfo: function() {
		var token = wx.getStorageSync('token');
		let { editType, showMobile, showEmail, showWechat } = this.data;
		let { mobile, email, wechat, intro } = this.data.profile;
		let contactList = [
			{ id: 1, name: mobile, value: showMobile ? 1 : 9 },
			{ id: 2, name: email, value: showEmail ? 1 : 9 },
			{ id: 3, name: (editType == "wechat" ? (this.tempWechat) : wechat), value: 1 },
			// { id: 3, name: (editType == "wechat" ? (this.tempWechat) : wechat), value: showWechat ? 1 : 9 },
		];
		wx.request({
			url: `${apiUrl}/Me/UserInfoSave?eventno=${eventNo}`,
			method: "PUT",
			header: {
				token: token
			},
			data: {
				intro: (editType == "intro" ? (this.tempIntro) : intro),
				contactList: contactList
			},
			success: res => {
				let resData = res.data;
				if(resData.code == 0) {
					wx.navigateBack({
					  	delta: 1,
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