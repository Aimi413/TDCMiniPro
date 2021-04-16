const app = getApp();
var eventNo = app.globalData.eventNo;
var apiUrl = app.globalData.apiUrl;
Page({
	data: {
		guest: {},
		profile: {
			id: "",
			name: "",
			company: "",
			jobTitle: "",
			photo: "",
			role: "",
			mobile: "",
			email: "",
			wechat: ""
		},
		defaultMsg: "很高兴认识您，这是我的名片",
		hideHelloWin: true
	},
	guestId: "",
	onLoad: function (options) {
		let id = options.id;
		this.guestId = id;
	},
	onShow: function () {
		var token = wx.getStorageSync('token');
		wx.request({
			url: `${apiUrl}/Attendees/Details?eventno=${eventNo}&id=${this.guestId}`,
			method: "GET",
			header: {
				token: token
			},
			success: res => {
				let resData = res.data;
				if(resData.code == 0) {
					let guest = resData.data;
					let { messages, contactList } = guest;

					let tempMobileArr = contactList.filter(item => item.id == 1);
					let tempEmail = contactList.filter(item => item.id == 2);
					let tempWechat = contactList.filter(item => item.id == 3);

					let mobileVal = tempMobileArr[0] != undefined ? tempMobileArr[0].name : '未填写';
					let emailVal = tempEmail[0] != undefined ? tempEmail[0].name : '未填写';
					let wechatVal = tempWechat[0] != undefined ? tempWechat[0].name : '未填写';
					// let privacyMobile = mobileVal.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2");
					// let privacyEmail = emailVal.replace(/(\w{1})(.*)@(.*)/, "$1****@$3");
					// let privacyWechat = wechatVal.substr(0, 1) + "****" + wechatVal.substr(-1);
					for(let i = 0, len = messages.length; i < len; i++) {
						let msg = messages[i];
						msg.sentTime = msg.sentTime.replace(/(.*)T(\d{0,2}:\d{0,2}):(\d{0,2})\.\d{0,2}/, "$1 $2");
					};
					guest.mobile = mobileVal;
					guest.email = emailVal;
					guest.wechat = wechatVal;			
					this.setData({
						guest: guest
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
		if(token) {
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
						let { id, name, company, jobTitle, photo, role, contactList } = info;
						let tempMobile = contactList.filter(item => item.id == 1);
						let tempEmail = contactList.filter(item => item.id == 2);
						let tempWechat = contactList.filter(item => item.id == 3);
						let mobileVal = tempMobile[0] != undefined ? tempMobile[0].name : '未填写';
						let emailVal = tempEmail[0] != undefined ? tempEmail[0].name : '未填写';
						let wechatVal = tempWechat[0] != undefined ? tempWechat[0].name : '未填写';
						this.setData({
							"profile.id": id,
							"profile.name": name,
							"profile.company": company,
							"profile.jobTitle": jobTitle,
							"profile.photo": photo,
							"profile.role": role,
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
		}
	},
	tempMsg: "很高兴认识您，这是我的名片",
	closeHelloWin: function() {
		this.setData({
			hideHelloWin: true
		});
	},
	openContactWin: function() {
		var token = wx.getStorageSync('token');
		if(!token) {
			wx.navigateTo({
			  url: `/pages/user/login/login?redirect=/pages/guest/detail/detail&id=${this.guestId}`,
			});
			return false;
		}
		let { role } = this.data.profile;
		console.log(role);
		if(role != 2 && role != 4 && role != 9 && role != 10) {
			wx.showModal({
				title: "提示",
				content: "当前票种没有权限",
				showCancel: false
			});
			return false;
		}
		this.setData({
			hideHelloWin: false
		});
	},
	inputHelloMsg: function(e) {
		let tempVal = e.detail.value;
		this.tempMsg = tempVal;
	},
	sendHello: function(e) {
		var token = wx.getStorageSync('token');
		let targetId = e.currentTarget.dataset.target;
		if(this.tempMsg.length == 0) {
			wx.showModal({
				title: "提示",
				content: "请输入打招呼内容",
				showCancel: false
			});
			return false;
		}
		wx.request({
			url: `${apiUrl}/Attendees/SendBusinessCard?eventno=${eventNo}&target=${targetId}&content=${this.tempMsg}`,
			method: "POST",
			header: {
				token: token
			},
			success: res => {
				let resData = res.data;
				if(resData.code == 0) {
					let messages = this.data.guest.messages;
					let { id, name, company, jobTitle, photo } = this.data.profile;
					let tempTime = new Date();
					let sendTime = tempTime.toISOString().split("T")[0] + " " + tempTime.toTimeString().substr(0, 5)
					let msgObj = {
						id: resData.data,
						socialUser: {
							id: id,
							name: name,
							company: company,
							jobTitle: jobTitle,
							photo: photo
						},
						senderId: 0,
						targetId: this.guestId,
						type: 0,
						content: this.tempMsg,
						sendTime: sendTime
					}
					let msgList = [...messages];
					msgList.push(msgObj);
					wx.showToast({
						title: '发送成功',
						icon: 'success',
						duration: 1000
					});
					this.tempMsg = "";
					this.setData({
						hideHelloWin: true,
						defaultMsg: "很高兴认识您，这是我的名片",
						"guest.messages": msgList
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