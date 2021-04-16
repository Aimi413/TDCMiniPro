const app = getApp();
var eventNo = app.globalData.eventNo;
var apiUrl = app.globalData.apiUrl;
var eventType = app.eventType;
Page({
	data: {
		searchType: "",
		guestList: [],
		proList: []
	},
	keyWord: "",
	onLoad: function (options) {
		let type = options.searchType;
		this.setData({
			searchType: type
		});
	},
	changeKeyWord: function(e) {
		let tempVal = e.detail.value;
		this.keyWord = tempVal;
	},
	submitSearch: function(e) {
		var token = wx.getStorageSync('token');
		let requestUrl = "";
		let searchType = this.data.searchType;
		if(searchType == "guest") {
			requestUrl = `${apiUrl}/Attendees/Search?eventno=${eventNo}&keyword=${this.keyWord}`
		} else if(searchType == "program") {
			requestUrl = `${apiUrl}/Program/Search?eventno=${eventNo}&keyword=${this.keyWord}`
		}
		wx.request({
			url: requestUrl,
			method: "GET",
			header: {
				token: token
			},
			success: res => {
				let resData = res.data;
				if(resData.code == 0) {
					let result = resData.data;
					if(result == "" || result.length == 0) {
						wx.showModal({
							title: "提示",
							content: '搜索结果为空，换个关键字试试吧',
							showCancel: false
						});
						return;
					}
					if(searchType == "guest") {
						this.setData({
							guestList: result
						});
					} else if(searchType == "program") {
						for(let i = 0, len = result.length; i < len; i++) {
							let pro = result[i];
							let reg = /(\d{4}-\d{1,2}-\d{1,2})T(\d{1,2}):(\d{1,2}):(\d{1,2})/;
							pro.date = pro.begin.replace(/(\d{4})-(\d{1,2})-(\d{1,2})T(\d{1,2}):(\d{1,2}):(\d{1,2})/, "$2月$3日");					
							pro.begin = pro.begin.replace(reg, "$2:$3");
							pro.end = pro.end.replace(reg, "$2:$3");
							pro.belong = eventType[pro.area];
							pro.parentindex = i;
							pro.proindex = 0;
							let spkList = pro.details;
							let spkType = "";
							for(let index = 0, sLen = spkList.length; index < sLen; index++) {
								let speaker = spkList[index];
								let speakerType = speaker.dataType;
								if(speakerType == spkType) {
									speaker.dataType = ""
								}
								spkType = speakerType;
							}
						}
						this.setData({
							proList: result
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
		
	},
	followProgram: function(e) {
		var token = wx.getStorageSync('token');
		let { id, parentindex, isConcern } = e.detail;
		if(token == "" || token == undefined || token == null || token.length < 0) {
			wx.navigateTo({
			  	url: `/pages/user/login/login?redirect=/pages/program/index/index`,
			});
			return false;
		}
		wx.request({
			url: `${apiUrl}/Program/Concern?eventno=${eventNo}&id=${id}&concern=${!isConcern}`,
			method: "POST",
			header: {
				token: token
			},
			success: res => {
				let resData = res.data;
				if(resData.code == 0) {
					wx.showModal({
						title: "提示",
						content: isConcern ? '已取消关注' : '关注成功',
						showCancel: false
					});
					this.setData({
						[`proList[${parentindex}].isSubscribed`]: isConcern ? false : true
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
	goGuestDetail: function(e) {
		let { id } = e.detail;
		wx.navigateTo({
			url: `/pages/guest/detail/detail?id=${id}`
		});
	}
})