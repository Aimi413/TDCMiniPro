const app = getApp();
var eventNo = app.globalData.eventNo;
var apiUrl = app.globalData.apiUrl;
var eventType = app.eventType;
Page({
	data: {

	},
	canSubmit: true,
	onLoad: function (options) {

	},
	onShow: function () {

	},
	onHide: function () {

	},
	onUnload: function () {

	},
	tempName: "",
	inputName: function(e) {
		let name = e.detail.value;
		this.tempName = name;
	},
	tempMobile: "",
	inputMobile: function(e) {
		let mobile = e.detail.value;
		this.tempMobile = mobile;
	},
	tempFeedback: "",
	inputFeedback: function(e) {
		let feedback = e.detail.value;
		this.tempFeedback = feedback;
	},
	submitFeedback: function() {
		var token = wx.getStorageSync('token');
		if(this.tempName == "" || this.tempMobile == "" || this.tempFeedback == "") {
			wx.showModal({
				content: "请输入完整信息",
				showCancel: false
			});
			return false;
		}
		if(this.canSubmit == false) {
			return false;
		}
		this.canSubmit = false;
		wx.request({
			url: `${apiUrl}/Home/FeedBack?eventno=${eventNo}&content=${this.tempFeedback}&name=${this.tempName}&mobile=${this.tempMobile}`,
			method: "POST",
			header: {
				token: token
			},
			success: res => {
				console.log(res)
				let resData = res.data;
				if(resData.code == 0) {
					wx.showModal({
						title: "提示",
						content: "提交成功，我们的工作人员将会尽快跟进",
						showCancel: false,
						success: res => {
							wx.navigateTo({
								url: `/pages/home/index/index`
							})
						}
					});
	
					this.canSubmit = true;
					this.tempMobile = "";
					this.tempName = "";
					this.tempFeedback = "";
					
				} else {
					this.canSubmit = true;
					wx.showModal({
						title: "提示",
						content: resData.message,
						showCancel: false
					});
				}
			},
			fail: res => {
				this.canSubmit = true;
				wx.showModal({
					title: "提示",
					content: res.errMsg,
					showCancel: false
				});
			}
		});

	}

})