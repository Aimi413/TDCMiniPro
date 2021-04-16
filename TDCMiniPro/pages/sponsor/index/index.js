const app = getApp();
var eventNo = app.globalData.eventNo;
var apiUrl = app.globalData.apiUrl;
Page({
	data: {
		sponsorList: []
	},
	onLoad: function (options) {
		wx.request({
			url: `${apiUrl}/Exhibitors/List?eventno=${eventNo}`,
			method: "GET",
			success: res => {
				let resData = res.data;
				if(resData.code == 0) {
					let sList = resData.data;
					this.setData({
						sponsorList: sList	
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
	onShareAppMessage: function () {

	},
	previewExhibitionVenue: function() {
		wx.previewImage({
			urls: ["https://img.traveldaily.cn/events/app/2020/exhibitorVenue.jpg"],
			success: res => {
				console.log(res)
			},
			fail: err => {
				console.log(err)
			}
		});
	}
})