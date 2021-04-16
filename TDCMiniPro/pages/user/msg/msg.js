const app = getApp();
var eventNo = app.globalData.eventNo;
var apiUrl = app.globalData.apiUrl;
var eventType = app.eventType;
Page({
	data: {
		msgList: []
	},
	onLoad: function (options) {
		var token = wx.getStorageSync('token');
		wx.request({
			url: `${apiUrl}/Me/NoticeList?eventno=${eventNo}`,
			method: "POST",
			header: {
				token: token
			},
			success: res => {
				let resData = res.data;
				if(resData.code == 0) {
					let msglist = resData.data;
					let reg = /(\d{4}-\d{1,2}-\d{1,2})T(\d{1,2}):(\d{1,2}):(\d{1,2})(\.\d{0,2})*/;
					for(let i = 0, len = msglist.length; i < len; i++) {
						let msgItem = msglist[i];
						let { sentTime } = msgItem;
						msgItem.sentTime = sentTime.replace(reg, "$1 $2:$3");
					}
					this.setData({
						msgList: msglist
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
})