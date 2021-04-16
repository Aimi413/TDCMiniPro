const app = getApp();
var eventNo = app.globalData.eventNo;
var apiUrl = app.globalData.apiUrl;
Page({
	data: {
		hideIndustryWin: true,
		concernList: [],
		recentList: [],
		adList: [],
		industryList: []
	},
	choosedIndustry: [],
	onLoad: function (options) {
		var token = wx.getStorageSync('token');		
		wx.request({
			url: `${apiUrl}/Attendees/IndustryMenu?eventno=${eventNo}`,
			method: "GET",
			success: res => {
				let resData = res.data;
				if(resData.code == 0) {
					let indyList = resData.data;
					for(let i = 0, len = indyList.length; i < len; i++) {
						let groupList = indyList[i].children;
						for(let j = 0, groupLen = groupList.length; j < groupLen; j++) {
							let currIndustry = groupList[j];
							currIndustry.concern = false;
						}
					}
					this.setData({
						industryList: indyList
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
		wx.request({
			url: `${apiUrl}/Home/Advert?eventno=${eventNo}`,
			method: "GET",
			success: res => {
				let resData = res.data;
				let resAdList = resData.data;
				let adList = resAdList.filter(item => item.key == 203);
				if(adList.length > 0) {
					let adArr = adList[0].value;
					for(let i = 0, len = adArr.length; i < len; i++) {
						let adItem = adArr[i];
						let realLink = partnerAd.realLink;
						if(realLink.startsWith("http")) {
							adItem.hasHttp = true;
						} else if(realLink.startsWith("sid")) {
							adItem.questionnaire = true;
						} else {
							adItem.hasHttp = false;
							adItem.questionnaire = false;
						}
						if(realLink.indexOf("survey") != -1) {
							adItem.realLink = adItem.realLink + "&token=" + token;
						}
					}
					this.setData({
						adList: adArr
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
				url: `${apiUrl}/Attendees/ContactList?eventno=${eventNo}`,
				method: "GET",
				header: {
					token: token,
				},
				success: res => {
					let resData = res.data;
					if(resData.code == 0) {
						let list = resData.data;
						let newList = [];
						Object.keys(list).forEach((item, index) => {
							let msgList = list[item];
							for(let i = 0, len = msgList.length; i < len; i++) {
								let msg = msgList[i];
								newList.push(msg);
							}
						});
						this.setData({
							recentList: newList
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
			})
		}
	},
	onShow: function () {
		var token = wx.getStorageSync('token');
		if(token) {
			wx.request({
				url: `${apiUrl}/Attendees/IndustryConcernList?eventno=${eventNo}`,
				method: "GET",
				header: {
					token: token
				},
				success: res => {
					let resData = res.data;
					if(resData.code == 0) {
						let myConsernList = resData.data;
						this.setData({
							concernList: myConsernList
						});
					} else {
						wx.showModal({
							title: "提示",
							content: res.errMsg,
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
	openIndustryWin: function() {
		this.setData({
			hideIndustryWin: false
		});
	},
	closeIndustryWin: function() {
		this.setData({
			hideIndustryWin: true
		});
	},
	industryChoose: function(e) {
		let { parent, parentindex, subindex, id } = e.currentTarget.dataset;
		let whichGroup = this.data.industryList.filter(item => item.name == parent);
		let groupList = whichGroup[0].children;
		let currentIndustryObj = groupList.filter(item => item.id == id)[0];
		let state = currentIndustryObj.concern;
		if(state == false) {
			this.choosedIndustry.push(id);
		} else {
			this.choosedIndustry = this.choosedIndustry.filter(item => item != id);
		}
		this.setData({
			[`industryList[${parentindex}].children[${subindex}].concern`]: !state
		});
	},
	resetChoose: function() {
		this.choosedIndustry.length = 0;
		let tempList = this.data.industryList;
		for(let i = 0, len = tempList.length; i < len; i++) {
			let { children: groupList } = tempList[i];
			for(let j = 0, gLen = groupList.length; j < gLen; j++) {
				let currTag = groupList[j];
				currTag.concern = false;
			}
		}
		this.setData({
			industryList: tempList
		});
	},
	submitIndustry: function(e) {		
		if(this.choosedIndustry.length == 0) {
			wx.showModal({
				title: "提示",
				content: "请选择筛选标签",
				showCancel: false
			});
			return false;
		}
		this.setData({
			hideIndustryWin: true
		});
		wx.navigateTo({
		  	url: `/pages/guest/list/list?filter=${this.choosedIndustry}`,
		});
	}
})