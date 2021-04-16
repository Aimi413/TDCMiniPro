const app = getApp();
var eventNo = app.globalData.eventNo;
var apiUrl = app.globalData.apiUrl;
Page({
	data: {
		recentList: []
	},
	onLoad: function (options) {
		var token = wx.getStorageSync('token');
		wx.request({
			url: `${apiUrl}/Attendees/ContactList?eventno=${eventNo}`,
			method: "GET",
			header: {
				token: token
			},
			success: res => {
				let resData = res.data;
				if(resData.code == 0) {
					let list = resData.data;
					let newList = [];
					Object.keys(list).forEach((item, index) => {
						newList[index] = {
							time: item,
							contactList: [],
							newMessageCount: 0
						};
						let msgList = list[item];
						for(let i = 0, len = msgList.length; i < len; i++) {
							let { newMessageCount, socialUser } = msgList[i];
							newList[index].contactList.push(socialUser);
							newList[index].newMessageCount = newMessageCount;
						}
					});
					this.setData({
						recentList: newList
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
	goGuestDetail: function(e) {
		let { id } = e.detail;
		wx.navigateTo({
			url: `/pages/guest/detail/detail?id=${id}`
		});
	}
})