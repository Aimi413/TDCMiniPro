const app = getApp();
var eventNo = app.globalData.eventNo;
var apiUrl = app.globalData.apiUrl;
var uploadUrl = app.globalData.uploadUrl;
Page({
	data: {
		nopic: true,
		picUrl: "",
		commentContent: "",
		profile: {}
	},
	tempComment: "",
	canUpload: true,
	canPublish: true,
	onLoad: function (options) {		
	},
	onShow: function () {
		var token = wx.getStorageSync('token');
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
						this.setData({
							profile: info
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
	inputComment: function(e) {
		let val = e.detail.value;
		this.tempComment = val;
		this.setData({
			commentContent: val
		});
	},
	choosePhoto: function() {
		var token = wx.getStorageSync('token');
		if(this.canUpload == false) {
			return false;
		}
		wx.chooseImage({
			count: 1,
			sizeType: ['compressed'],
      		sourceType: ['album', 'camera'],
			success: res => {
				let temp = res.tempFilePaths[0];
				this.canUpload = false;
				wx.showLoading({
					title: '图片正在上传中',
					mask: true
				});
				wx.uploadFile({
					filePath: temp,
					name: 'postPic',
					formData: {
						"token": token,
					},
					url: `${uploadUrl}/uploadSocial/Moments`,
					success: res => {
						console.log(res);
						let resData = JSON.parse(res.data);
						console.log(resData)
						if(resData.Code == 0) {
							this.setData({
								picUrl: resData.Message,
								nopic: false
							}, () => {
								this.canUpload = true;
								wx.hideLoading();
							});
						} else {
							wx.hideLoading();
							wx.showModal({
								title: "提示",
								content: resData.Message,
								showCancel: false,
							});
						}
					},
					fail: res => {
						wx.hideLoading();
						wx.showModal({
							title: "提示",
							content: res.errMsg,
							showCancel: false
						});
					}
				});
				
			},
			fail: res => {
				this.canUpload = true;
				// wx.showModal({
				// 	title: "提示",
				// 	content: res.errMsg,
				// 	showCancel: false
				// });
			}
		});
	},
	closePic: function() {
		this.setData({
			nopic: true,
			picUrl: "",
		});
		this.canUpload = true;
	},
	publishPost: function() {
		var token = wx.getStorageSync('token');
		let { picUrl, profile } = this.data;
		// if(picUrl == "") {
		// 	wx.showModal({
		// 		content: "请选择配图",
		// 		showCancel: false
		// 	});
		// 	return false;
		// }
		if(this.tempComment == "") {
			wx.showModal({
				title: "提示",
				content: "请输入您的观点",
				showCancel: false
			});
			return false;
		}
		if(this.canPublish == false) {
			return false;
		}
		this.canPublish = false;
		wx.request({
			url: `${apiUrl}/Post/Post?eventno=${eventNo}&content=${this.tempComment}&image=${this.data.picUrl}`,
			method: "POST",
			header: {
				token: token
			},
			success: res => {
				console.log(res)
				let resData = res.data;
				if(resData.code == 0) {
					wx.showToast({
						icon: "success",
					  	title: '发布成功',
					}, 1000);
					let tempTime = new Date();
					let tempData = {
						commentCount: 0,
						commentList: [],
						content: this.tempComment,
						eventNo: eventNo,
						id: resData.data,
						image: picUrl,
						isLike: false,
						likeCount: 0,
						program: null,
						programId: 0,
						select: false,
						socialCompany: profile.company,
						socialId: profile.id,
						socialName: profile.name,
						socialPhoto: profile.photo,
						time: tempTime.toISOString().split("T")[0].substr(5) + " " + tempTime.toTimeString().substr(0, 5),
						top: false,
						type: 1
					};
					console.log(tempData)
					let pages = getCurrentPages();
					if(pages.length > 1) {
						let prePage = pages[pages.length - 2];
						prePage.updateData("publishpost", tempData);
					}
					this.canPublish = true;
					setTimeout(() => {
						wx.navigateBack({
							delta: 1,
						});
					}, 1000);
				} else {
					this.canPublish = true;
					wx.showModal({
						title: "提示",
						content: resData.message,
						showCancel: false
					});
				}
			},
			fail: res => {
				this.canPublish = true;
				wx.showModal({
					title: "提示",
					content: res.errMsg,
					showCancel: false
				});
			}
		});
	}
})