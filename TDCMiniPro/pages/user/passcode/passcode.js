const app = getApp();
var eventNo = app.globalData.eventNo;
var apiUrl = app.globalData.apiUrl;
Page({
	data: {
		codeImg: "",
		profile: {
			name: "",
			company: "",
			jobTitle: "",
			photo: "",
			role: 0
		}
	},
	timer: null,
	t: 35,
	onShow: function (options) {
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
					let { name, company, jobTitle, photo, role } = info;				
					this.setData({
						"profile.name": name,
						"profile.company": company,
						"profile.jobTitle": jobTitle,
						"profile.photo": photo,
						"profile.role": role
					});
					if(role == 1 || role == 9) {
						wx.setNavigationBarColor({
							backgroundColor: '#c30d23',
							frontColor: '#ffffff',
						});
					}
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
		this.getCode();
		let that = this;
		that.timer = setTimeout(function countDown() {
			that.t--;
			if(that.t <= 0) {
				that.t = 35;
				that.getCode();
			}
			that.timer = setTimeout(countDown, 1000);
		}, 1000);
	},
	onHide: function () {
		clearTimeout(this.timer);
		this.t = 35;
		this.timer = null;
	},
	onUnload: function () {
		clearTimeout(this.timer);
		this.t = 35;
		this.timer = null;
	},
	getCode: function() {
		var token = wx.getStorageSync('token');
		wx.request({
			url: `${apiUrl}/Me/QRCode?eventno=${eventNo}`,
			method: "GET",
			header: {
				token: token
			},
			success: res => {
				let resData = res.data;
				if(resData.code == 0) {
					let code = `data:image/jpeg;base64,${resData.data}`;
					this.setData({
						codeImg: code
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
	refreshCode: function() {
		clearTimeout(this.timer);
		this.t = 35;
		this.timer = null;
		this.getCode();
		let that = this;
		that.timer = setTimeout(function countDown() {
			that.t--;		
			if(that.t <= 0) {
				that.t = 35;
				that.getCode();
			}
			that.timer = setTimeout(countDown, 1000);
		}, 1000);
	}
})