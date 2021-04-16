const app = getApp();
var eventNo = app.globalData.eventNo;
var apiUrl = app.globalData.apiUrl;
var eventType = app.eventType;
Page({
	data: {
		question: {},
		questioner: {},
		starBtnText: "为TA点赞",
		profile: {
			id: ""
		}
	},
	questionId: "",
	programId: "",
	questionLikedObj: {},
	canStarQuestion: true,
	onLoad: function (options) {
		let { id } = options;
		this.questionId = id;		
	},
	onShow: function () {
		var token = wx.getStorageSync('token');
		this.questionLikedObj = wx.getStorageSync('questionLikedObj') || {};
		wx.request({
			url: `${apiUrl}/Program/QuestionDetail?eventno=${eventNo}&id=${this.questionId}`,
			method: "GET",
			header: {
				token: !!token ? token : ""
			},
			success: res => {
				let resData = res.data;
				if(resData.code == 0) {
					let question = resData.data;
					let { id, programId, programBegin, programEnd, postTime, isLike, netUserId, userName, userCompany, userJobTitle, userPhoto } = question;
					let reg = /(\d{4}-\d{1,2}-\d{1,2})T(\d{1,2}):(\d{1,2}):(\d{1,2})(\.\d{0,2})*/;
					question.date = programBegin.split("T")[0].replace(/(\d{4})-(\d{1,2})-(\d{1,2})/, "$2月$3日");
					question.programBegin = programBegin.replace(reg, "$2:$3");
					question.programEnd = programEnd.replace(reg, "$2:$3");
					question.postTime = postTime.replace(reg, "$1 $2:$3");
					this.programId = programId;
					if(Object.keys(this.questionLikedObj).length > 0) {
						Object.keys(this.questionLikedObj).forEach((key) => {
							if(id == key) {
								question.isLike = this.questionLikedObj[key];
							}
						});
					}
					let questioner = {
						id: netUserId,
						name: userName,
						company: userCompany,
						jobTitle: userJobTitle,
						photo: userPhoto
					}
					this.setData({
						question: question,
						questioner: questioner,
						starBtnText: isLike ? '已为TA点赞' : '为TA点赞'
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
						let { id } = info;
						
						this.setData({
							"profile.id": id,
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
	onShareAppMessage: function (options) {
		let { id } = options.target.dataset;
		return {
			title: "环球旅讯峰会日程提问详情",
			path: `/pages/program/question/question?id=${id}`
		}
	},
	starAsk: function(e) {
		var token = wx.getStorageSync('token');
		// if(token == "" || token == undefined || token == null) {
		// 	wx.navigateTo({
		// 		url: `/pages/user/login/login?redirect=/pages/program/question/question&id=${this.questionId}`
		// 	});
		// 	return false;
		// }
		let { id, islike: isLike } = e.currentTarget.dataset;
		if(this.canStarQuestion == false) {
			return false;
		}
		this.canStarQuestion = false;
		wx.request({
			url: `${apiUrl}/Program/QuestionLike?eventno=${eventNo}&programid=${this.programId}&targetid=${this.questionId}&like=${!isLike}`,
			method: "POST",
			header: {
				token: token
			},
			success: res => {
				let resData = res.data;
				if(resData.code == 0) {
					let likeCount = this.data.question.likeCount;
					wx.showToast({
						title: isLike ? '已取消点赞' : '点赞成功',
						duration: 1000,
						mask: true
					});
					this.setData({
						starBtnText: isLike ? '为TA点赞' : '已为TA点赞',
						"question.isLike": isLike ? false : true,
						"question.likeCount": isLike ? --likeCount : ++likeCount
					}, () => {
						this.canStarQuestion = true;
					});
					let tempObj = Object.assign(this.questionLikedObj);
					tempObj[this.questionId] = isLike ? false : true;
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