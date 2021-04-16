const app = getApp();
var eventNo = app.globalData.eventNo;
var eventType = app.eventType;
var apiUrl = app.globalData.apiUrl;
var endShowRegisterTime = app.endShowRegisterTime;
Page({
	data: {
		typeClass: "",
		program: {},
		profile: {
			role: ""
		},
		showRegisterBtn: true,
		hideAskWin: true,
		askContent: ""
	},
	programId: "",
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
		this.programId = id;
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
			url: `${apiUrl}/Program/Details?eventno=${eventNo}&id=${this.programId}`,
			method: "GET",
			header: {
				token: !!token ? token : ""
			},
			success: res => {
				let resData = res.data;
				if(resData.code == 0) {
					let proObj = resData.data;
					let reg = /(\d{4}-\d{1,2}-\d{1,2})T(\d{1,2}):(\d{1,2}):(\d{1,2})/;
					proObj.date = proObj.begin.replace(/(\d{4})-(\d{1,2})-(\d{1,2})T(\d{1,2}):(\d{1,2}):(\d{1,2})/, "$2月$3日");
					proObj.begin = proObj.begin.replace(reg, "$2:$3");
					proObj.end = proObj.end.replace(reg, "$2:$3");
					
					let { details: spkList, questionList: questions } = proObj;
					let spkType = "";
					for(let index = 0, sLen = spkList.length; index < sLen; index++) {
						let speaker = spkList[index];
						let speakerType = speaker.dataType;
						if(speakerType == spkType) {
							speaker.dataType = ""
						}
						spkType = speakerType;
					}
					if(questions.length > 0) {
						for(let i = 0, len = questions.length; i < len; i++) {
							let question = questions[i];
							question.postTime = question.postTime.replace(reg, "$1 $2");
						}
					}
					this.setData({
						program: proObj,
						typeClass: eventType[proObj.location]
					})
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
		wx.request({
			url: `${apiUrl}/Home/ScanLog?eventno=${eventNo}&page=${encodeURIComponent('/pages/program/detail/detail')}&pageref=${this.fromScanCode ? this.scanParameter : ''}&requestid=${this.programId}`,
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
	},
	onShareAppMessage: function (options) {
		let { id } = options.target.dataset;
		return {
			title: "环球旅讯峰会会议日程",
			path: `/pages/program/detail/detail?id=${id}`
		}
	},
	followPro: function(e) {
		var token = wx.getStorageSync('token');
		if(token == "" || token == undefined || token == null) {
			wx.navigateTo({
				url: `/pages/user/login/login?redirect=/pages/program/detail/detail&id=${this.programId}`
			});
			return false;
		}
		let role = this.data.profile.role;		
		if(role != 2 && role != 4 && role != 9 && role != 10) {
			wx.showModal({
				title: "提示",
				content: "当前票种没有权限",
				showCancel: false
			});
			return false;
		}
		let { id, concern: isConcern } = e.currentTarget.dataset;
		wx.request({
			url: `${apiUrl}/Program/Concern?eventno=${eventNo}&id=${id}&concern=${!isConcern}`,
			method: "POST",
			header: {
				token: token
			},
			success: res => {
				let resData = res.data;				
				if(resData.code == 0) {
					wx.showToast({
						icon: "success",
						title: isConcern ? '已取消关注' : '关注成功',
						duration: 1000,
						mask: true
					});
					this.setData({
						"program.isSubscribed": isConcern ? false : true
					})
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
	sharePro: function(e) {

	},
	tempAsk: "",
	openAskWin: function() {
		var token = wx.getStorageSync('token');
		let { role } = this.data.profile;
		if(!token) {
			wx.navigateTo({
				url: `/pages/user/login/login?redirect=/pages/program/detail/detail&id=${this.programId}`,
			});
			return false;
		}
		if(role != 2 && role != 4 && role != 9 && role != 10) {
			wx.showModal({
				title: "提示",
				content: "当前票种没有权限",
				showCancel: false
			});
			return false;
		}
		this.setData({
			hideAskWin: false
		});
	},
	closeWin: function() {
		this.setData({
			hideAskWin: true
		});
	},
	inputAsk: function(e) {
		let ask = e.detail.value;
		this.tempAsk = ask;
	},
	submitAsk: function() {
		var token = wx.getStorageSync('token');
		if(this.tempAsk.length == 0) {
			wx.showModal({
				content: "请输入提问内容",
				showCancel: false
			});
			return false;
		} else if(this.tempAsk.length > 100) {
			wx.showModal({
				content: "提问字数限100字",
				showCancel: false
			});
			return false;
		}
		let { program } = this.data;
		wx.request({
			url: `${apiUrl}/Program/Ask?eventno=${eventNo}&programId=${program.id}&content=${this.tempAsk}`,
			method: "POST",
			header: {
				token: token
			},
			success: res => {
				let resData = res.data;
				if(resData.code == 0) {
					wx.showToast({
						icon: "success",
						title: '提问成功',
						duration: 1000,
						mask: true
					});
					this.tempAsk = "";
					this.setData({
						hideAskWin: true,
						askContent: ""
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