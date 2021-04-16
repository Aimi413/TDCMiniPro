const app = getApp();
var eventNo = app.globalData.eventNo;
var apiUrl = app.globalData.apiUrl;
Page({
	data: {
		speakerList: [],
		profile: {
			role: ""
		}
	},
	onLoad: function (options) {
		
	},
	onShow: function () {
		var token = wx.getStorageSync('token');
		wx.request({
			url: `${apiUrl}/Speaker/List?eventno=${eventNo}`,
			method: "GET",
			header: {
				token: token
			},
			success: res => {
				let resData = res.data;
				if(resData.code == 0) {
					let spkList = resData.data;
					this.setData({
						speakerList: spkList
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
						let { role } = info;
						
						this.setData({
							"profile.role": role,
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
	onShareAppMessage: function (options) {
		let { id } = options.target.dataset;
		return {
			title: "环球旅讯峰会演讲嘉宾",
			path: `/pages/speaker/detail/detail?id=${id}`
		}
	},
	followSpeaker: function(e) {
		var token = wx.getStorageSync('token');
		let { index, id, isConcern } = e.detail;
		if(!token) {
			wx.navigateTo({
				url: `/pages/user/login/login?redirect=/pages/speaker/index/index`
			});
			return false;
		}
		let { role } = this.data.profile;
		if(role != 2 && role != 4 && role != 9 && role != 10) {
			wx.showModal({
				title: "提示",
				content: "当前票种没有权限",
				showCancel: false
			});
			return false;
		}
		wx.request({
			url: `${apiUrl}/Speaker/Concern?eventno=${eventNo}&id=${id}&concern=${isConcern}`,
			method: "POST",
			header: {
				token: token
			},
			success: res => {
				let resData = res.data;
				if(resData.code == 0) {
					let state = this.data.speakerList[index].isSubscribed;
					wx.showToast({
						title: state ? '已取消关注' : '关注成功',
						duration: 1000,
						mask: true
					});
					this.setData({
						[`speakerList[${index}].isSubscribed`]: state ? false : true
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