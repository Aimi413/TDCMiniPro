const app = getApp();
var eventNo = app.globalData.eventNo;
var apiUrl = app.globalData.apiUrl;
Page({
	data: {
		questionList: []
	},
	onLoad: function (options) {
		var token = wx.getStorageSync('token');
		wx.request({
			url: `${apiUrl}/Me/Question?eventno=${eventNo}`,
			method: "GET",
			header: {
				token: token
			},
			success: res => {
				let resData = res.data;
				if(resData.code == 0) {
					let qList = resData.data;
					for(let i = 0, len = qList.length; i < len; i++) {
						let question = qList[i];
						question.postTime = question.postTime.replace(/(.*)T(\d{0,2}:\d{0,2}):(\d{0,2})\.\d{0,2}/, "$1 $2");
					}
					this.setData({
						questionList: qList
					});
					this.tempList = qList;
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
	tempList: [],
	deleteQuestion: function(e) {
		var token = wx.getStorageSync('token');
		let { id, idx } = e.currentTarget.dataset;
		this.tempList.splice(idx, 1);		
		wx.request({
			url: `${apiUrl}/Me/QuestionDelete?eventno=${eventNo}&id=${id}`,
			method: "DELETE",
			header: {
				token: token
			},
			success: res => {
				let resData = res.data;
				if(resData.code == 0) {
					this.setData({
						questionList: this.tempList
					});
					wx.showToast({
						title: "删除成功",
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