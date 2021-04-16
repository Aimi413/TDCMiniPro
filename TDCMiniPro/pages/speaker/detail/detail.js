const app = getApp();
var eventNo = app.globalData.eventNo;
var apiUrl = app.globalData.apiUrl;
var eventType = app.eventType;
var endShowRegisterTime = app.endShowRegisterTime;
Page({
	data: {
		speaker: {},
		profile: {},
		hidePoster: true,
		showRegisterBtn: true,
		posterImgUrl: "https://img.traveldaily.cn/events/app/2020/sunjieposter.png"
		// posterImgUrl: "https://img.traveldaily.cn/events/app/2020/testspeakerdetail.png"
	},
	speakerId: "",
	scanParameter: "",
	fromScanCode: false,
	onLoad: function (options) {
		let id = "";
		if(options.id != null && options.id != undefined && options.id != "") {
			id = options.id;
		} else if(options.scene != null && options.scene != undefined && options.scene != "") {
			let tempUrl = decodeURIComponent(options.scene);
			if(tempUrl.indexOf("_") != -1) {
				let tempArr = tempUrl.split("_");
				id = tempArr[0];
				this.scanParameter = tempArr[1];				
			} else {
				id = tempUrl;
			}
			this.fromScanCode = true;
		}
		this.speakerId = id;
	},
	onShow: function () {
		var token = wx.getStorageSync('token');
		let now = new Date();
		if(now - endShowRegisterTime >= 0) {
			this.setData({
				showRegisterBtn: false
			});
		}
		wx.request({
			url: `${apiUrl}/Speaker/Details?eventno=${eventNo}&id=${this.speakerId}`,
			method: "GET",
			header: {
				token: token
			},
			success: res => {
				let resData = res.data;
				if(resData.code == 0) {
					let reg = /(\d{4})-(\d{2})-(\d{2})(T)(\d{2}):(\d{2}):(\d{2})/;
					let speaker = resData.data;
					let proList = speaker.programList;
					if(proList != null) {
						for(let i = 0, len = proList.length; i < len; i++) {
							let pro = proList[i];
							let date = pro.begin.replace(reg, "$2月$3日");
							pro.begin = pro.begin.replace(reg, "$5:$6");
							pro.end = pro.end.replace(reg, "$5:$6");
							pro.date = date;
							pro.belong = eventType[pro.area];
						}
					}
					this.setData({
						speaker: speaker
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
		// if(this.scanParameter != "") {
			wx.request({
				url: `${apiUrl}/Home/ScanLog?eventno=${eventNo}&page=${encodeURIComponent('/pages/speaker/detail/detail')}&pageref=${this.fromScanCode ? this.scanParameter : ''}&requestid=${this.speakerId}`,
				method: "POST",
				header: {
					token: token
				},
				success: res => {
					let resData = res.data;
				},
				fail: res => {
					wx.showModal({
						title: "提示",
						content: res.errMsg,
						showCancel: false
					});
				}
			});
		// }
	},
	onShareAppMessage: function (obj) {
		return {
			title: "环球旅讯峰会演讲嘉宾",
		}
	},
	followSpeaker: function(e) {
		var token = wx.getStorageSync('token');
		if(token == "" || token == undefined || token == null) {
			wx.navigateTo({
				url: `/pages/user/login/login?redirect=/pages/speaker/detail/detail&id=${this.speakerId}`
			});
			return false;
		}
		let { id, concern: isConcern } = e.currentTarget.dataset;
		let role = this.data.profile.role;		
		if(role != 2 && role != 4 && role != 9 && role != 10) {
			wx.showModal({
				title: "提示",
				content: "当前票种没有权限",
				showCancel: false
			});
			return false;
		}
		wx.request({
			url: `${apiUrl}/Speaker/Concern?eventno=${eventNo}&id=${id}&concern=${!isConcern}`,
			method: "POST",
			header: {
				token: token
			},
			success: res => {
				let resData = res.data;
				if(resData.code == 0) {
					wx.showToast({
						title: isConcern ? '已取消关注' : '关注成功',
						duration: 1000,
						mask: true
					});
					this.setData({
						"speaker.isSubscribed": isConcern ? false : true
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
	shareSpeaker: function(e) {
		this.setData({
			hidePoster: false
		});
	},
	savePoster: function() {
		// wx.getSetting({
		// 	success: res => {
		// 		console.log(res)
		// 		let authSetting = res.authSetting;
		// 		if(!authSetting['scope.writePhotosAlbum']) {
		// 			wx.authorize({
		// 				scope: 'scope.writePhotoAlbue',
		// 				success: res => {
		// 					console.log(res)
		// 				}
		// 			});
		// 		}
		// 	}
		// })
		wx.showLoading({
		  title: '正在保存中',
		});
		wx.downloadFile({
			url: this.data.posterImgUrl,
			success: res => {
				console.log(res);
				let tempFileUrl = res.tempFilePath;
				wx.saveImageToPhotosAlbum({
					filePath: tempFileUrl,
					success: res => {
						wx.showToast({
							title: "保存成功",
							icon: "success",
							duration: 2000
						});
						wx.hideLoading();
						this.setData({
							hidePoster: true
						});
					},
					fail: err => {
						console.log(err);
						wx.hideLoading();
						if(err.errMsg == "saveImageToPhotosAlbum:fail auth deny") {
							wx.showModal({
								title: "提示",
								content: "您好,请先授权，再保存此图片。",
								showCancel: false,
								success: res => {
									if(res.confirm) {
										wx.openSetting({
											success: res => {
												let authSetting = res.authSetting;
												if(authSetting['scope.writePhotosAlbum']) {
													wx.saveImageToPhotosAlbum({
														filePath: tempFileUrl,
														success: res => {
															wx.showToast({
																title: "保存成功",
																icon: "success",
																duration: 2000
															});
															this.setData({
																hidePoster: true
															});
														}
													})
												} else {
													wx.showModal({
														title: "提示",
														content: "获取权限失败，无法正常使用",
														showCancel: false
													});
													this.setData({
														hidePoster: true
													});
												}
											}
										});
									}
								}
							})
						}
					}
				});
			},
			fail: err => {
				wx.hideLoading();
				wx.showModal({
					title: "提示",
					content: err.errMsg,
					showCancel: false
				});
				
			}
		});
	},
	cancelPoster: function() {
		this.setData({
			hidePoster: true
		});
	}
})