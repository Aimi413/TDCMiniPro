const app = getApp();
var eventNo = app.globalData.eventNo;
var apiUrl = app.globalData.apiUrl;
var eventType = app.eventType;
Page({
	data: {
		topic: "",
		questionList: [],
		hideAskWin: true,
		profile: {},
		askContent: ""
	},
	programId: "",
	programTopic: "",
	questionLikedObj: {},
	canStarQuestion: true,
	canAsk: true,
	onLoad: function (options) {
		let { id, topic } = options;
		this.programId = id;
		this.programTopic = decodeURIComponent(topic);
		this.setData({
			topic: decodeURIComponent(topic)
		});
	},
	onShow: function () {
		var token = wx.getStorageSync('token');
		this.questionLikedObj = wx.getStorageSync('questionLikedObj') || {};
		wx.request({
			url: `${apiUrl}/Program/QuestionList?eventno=${eventNo}&id=${this.programId}`,
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
						question.postTime = question.postTime.replace(/(.*)T(\d{0,2}:\d{0,2}):(\d{0,2})(.*)/, "$1 $2");
						if(Object.keys(this.questionLikedObj).length > 0) {
							Object.keys(this.questionLikedObj).forEach((key) => {
								if(question.id == key) {
									question.isLike = this.questionLikedObj[key];
								}
							});
						}
					}
					this.setData({
						questionList: qList
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
						let { id, name, company, jobTitle, photo, role } = info;
						
						this.setData({
							"profile.id": id,
							"profile.name": name,
							"profile.company": company,
							"profile.jobTitle": jobTitle,
							"profile.photo": photo,
							"profile.role": role
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
	onShareAppMessage: function () {
	},
	tempAsk: "",
	openAskWin: function() {
		var token = wx.getStorageSync('token');
		let { role } = this.data.profile;
		if(!token) {
			wx.navigateTo({
				url: `/pages/user/login/login?redirect=/pages/program/questionlist/questionlist&id=${this.programId}&topic=${this.programTopic}`,
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
		if(this.canAsk == false) {
			return false;
		}		
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
		this.canAsk = false;
		wx.request({
			url: `${apiUrl}/Program/Ask?eventno=${eventNo}&programId=${this.programId}&content=${this.tempAsk}`,
			method: "POST",
			header: {
				token: token
			},
			success: res => {
				let resData = res.data;
				if(resData.code == 0) {
					let askId = resData.data;
					let qList = this.data.questionList;
					let { id, name, photo } = this.data.profile;
					wx.showToast({
						icon: "success",
						title: '提问成功',
						duration: 1000,
						mask: true
					});
					let tempTime = new Date();
					let postTime = tempTime.toISOString().split("T")[0] + " " + tempTime.toTimeString().substr(0, 5)
					let tempObj = {
						id: askId,
						programId: this.programId,
						netUserId: id,
						userName: name,
						userPhoto: photo,
						content: this.tempAsk,
						isLike: false,
						likeCount: 0,
						postTime: postTime,
					}
					qList.push(tempObj);
					this.tempAsk = "";
					this.setData({
						hideAskWin: true,
						questionList: qList,
						askContent: ""
					}, () => {
						this.canAsk = true;
					});
				} else {
					this.canAsk = true;
					wx.showModal({
						title: "提示",
						content: resData.message,
						showCancel: false
					});
				}
			},
			fail: res => {
				this.canAsk = true;
				wx.showModal({
					title: "提示",
					content: res.errMsg,
					showCancel: false
				});
			}
		});
	},
	starQuestion: function(e) {
		var token = wx.getStorageSync('token');
		let { id, index, isLike } = e.detail;
		// if(token == "" || token == undefined || token == null || token.length < 0) {
		// 	wx.navigateTo({
		// 		url: `/pages/user/login/login?redirect=/pages/program/questionlist/questionlist&id=${this.programId}&topic=${this.programTopic}`,
		// 	});
		// 	return false;
		// }
		if(this.canStarQuestion == false) {
			return false;
		}
		this.canStarQuestion = false;
		wx.request({
			url: `${apiUrl}/Program/QuestionLike?eventno=${eventNo}&programid=${this.programId}&targetid=${id}&like=${!isLike}`,
			method: "POST",
			header: {
				token: token
			},
			success: res => {
				let resData = res.data;
				if(resData.code == 0) {
					let state = this.data.questionList[index].isLike;
					let likeCount = this.data.questionList[index].likeCount;
					wx.showToast({
						icon: "success",
						title: state ? '已取消点赞' : '已点赞',
						duration: 1000,
						mask: true
					});
					this.setData({
						[`questionList[${index}].isLike`]: state ? false : true,
						[`questionList[${index}].likeCount`]: state ? --likeCount : ++likeCount
					}, () => {
						this.canStarQuestion = true;
					});
					let tempObj = Object.assign(this.questionLikedObj);
					tempObj[id] = state ? false : true;
					wx.setStorageSync('questionLikedObj', tempObj);
				} else {
					this.canStarQuestion = true;
					wx.showModal({
						title: "提示",
						content: resData.message,
						showCancel: false
					});
				}
			},
			fail: res => {
				this.canStarQuestion = true;
				wx.showModal({
					title: "提示",
					content: res.errMsg,
					showCancel: false
				});
			}
		});
	}
})