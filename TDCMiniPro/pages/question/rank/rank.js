const app = getApp();
var eventNo = app.globalData.eventNo;
var apiUrl = app.globalData.apiUrl;
Page({
	data: {
		rankList: [],
		hideRuleWin: true,
	},
	canStarQuestion: true,
	questionLikedObj: {},
	onLoad: function (options) {
		
	},
	onShow: function () {
		this.questionLikedObj = wx.getStorageSync('questionLikedObj') || {};
		wx.request({
			url: `${apiUrl}/Topic/QuestionList?eventno=${eventNo}`,
			method: "GET",
			success: res => {
				let resData = res.data;
				let ranks = resData.data;	
				for(let i = 0, len = ranks.length; i < len; i++) {
					let question = ranks[i];
					if(Object.keys(this.questionLikedObj).length > 0) {
						Object.keys(this.questionLikedObj).forEach((key) => {
							if(question.id == key) {
								question.isLike = this.questionLikedObj[key];
							}
						});
					}
				}	
				this.setData({
					rankList: ranks
				});
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
	goGuestDetail: function(e) {
		let { id } = e.currentTarget.dataset;
		wx.navigateTo({
			url: `/pages/guest/detail/detail?id=${id}`
		});
	},
	starQuestion: function(e) {
		var token = wx.getStorageSync('token');
		let { id, index, islike, programid } = e.currentTarget.dataset;
		if(this.canStarQuestion == false) {
			return false;
		}
		this.canStarQuestion = false;
		wx.request({
			url: `${apiUrl}/Program/QuestionLike?eventno=${eventNo}&programid=${programid}&targetid=${id}&like=${!islike}`,
			method: "POST",
			header: {
				token: token
			},
			success: res => {
				let resData = res.data;
				if(resData.code == 0) {
					let likeCount = this.data.rankList[index].likeCount;
					wx.showToast({
						icon: "success",
						title: islike ? '已取消点赞' : '已点赞',
						duration: 1000,
						mask: true
					});
					this.setData({
						[`rankList[${index}].isLike`]: islike ? false : true,
						[`rankList[${index}].likeCount`]: islike ? --likeCount : ++likeCount
					}, () => {
						this.canStarQuestion = true;
					});
					let tempObj = Object.assign(this.questionLikedObj);
					tempObj[id] = islike ? false : true;
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
	},
	openRuleWin: function() {
		this.setData({
			hideRuleWin: false
		});
	},
	closeRuleWin: function() {
		this.setData({
			hideRuleWin: true
		});
	}
})