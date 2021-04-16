const app = getApp();
var eventNo = app.globalData.eventNo;
var apiUrl = app.globalData.apiUrl;
var eventType = app.eventType;
Page({
	data: {
		tabs: [
			{
				name: "会议日程"
			},
			{
				name: "演讲嘉宾"
			},
			{
				name: "展商&赞助商"
			}
		],
		currentIndex: 0,
		programList: [],
		spkList: [],
		sponsorList: [],
		profile: {
			role: ""
		}
	},
	onLoad: function (options) {
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
	},
	onShow: function () {
		var token = wx.getStorageSync('token');
		wx.request({
			url: `${apiUrl}/Me/ProgramConcern?eventno=${eventNo}`,
			method: "GET",
			header: {
				token: token
			},
			success: res => {
				let resData = res.data;
				if(resData.code == 0) {
					let proList = resData.data;
					for(let i = 0, len = proList.length; i < len; i++) {
						let currProList = proList[i];
						currProList.date = currProList.date.replace(/(\d{4})-(\d{1,2})-(\d{1,2})/, "$2月$3日");
						let programs = currProList.program;
						for(let j = 0, pLen = programs.length; j < pLen; j++) {
							let pro = programs[j];
							let reg = /(\d{4}-\d{1,2}-\d{1,2})T(\d{1,2}):(\d{1,2}):(\d{1,2})/;
							pro.begin = pro.begin.replace(reg, "$2:$3");
							pro.end = pro.end.replace(reg, "$2:$3");
							pro.date = currProList.date;
							pro.parentindex = i;
							pro.proindex = j;
							pro.belong = eventType[pro.area];
							pro.isSubscribed = true;
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
					}
					this.tempProList = proList;
					this.setData({
						programList: proList
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
		wx.request({
			url: `${apiUrl}/Me/SpeakerConcern?eventno=${eventNo}`,
			method: "GET",
			header: {
				token: token
			},
			success: res => {
				let resData = res.data;
				if(resData.code == 0) {
					let speakers = resData.data;
					for(let i = 0, len = speakers.length; i < len; i++) {
						let speaker = speakers[i];
						speaker.isSubscribed = true;
					}
					this.tempSpeakerList = speakers;					
					this.setData({
						spkList: speakers
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
		wx.request({
			url: `${apiUrl}/Me/ExhibitorConcern?eventno=${eventNo}`,
			method: "GET",
			header: {
				token: token
			},
			success: res => {
				let resData = res.data;
				if(resData.code == 0) {
					let sponsors = resData.data;
					for(let i = 0, len = sponsors.length; i < len; i++) {
						let sponsor = sponsors[i];
						sponsor.concern = true;
					}
					this.tempSponsorList = sponsors;
					this.setData({
						sponsorList: sponsors
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
	onShareAppMessage: function (options) {
		let { id, type } = options.target.dataset;
		let url = "";
		if(type == "program") {
			url = `/pages/program/detail/detail?id=${id}`;
		} else if(type == "speaker") {
			url = `/pages/speaker/detail/detail?id=${id}`;
		} else if(type == "sponsor") {
			url = `/pages/sponsor/detail/detail?id=${id}`;
		}
		return {
			title: "我的关注",
			path: url
		}
	},
	switchConcern: function(e) {
		let index = e.currentTarget.dataset.index;
		this.setData({
			currentIndex: index
		});
	},
	tempProList: [],
	followProgram: function(e) {
		var token = wx.getStorageSync('token');
		let { id, parentindex, proindex, isConcern } = e.detail;
		this.tempProList[parentindex].program.splice(proindex, 1);
		wx.request({
			url: `${apiUrl}/Program/Concern?eventno=${eventNo}&id=${id}&concern=false`,
			method: "POST",
			header: {
				token: token
			},
			success: res => {
				let resData = res.data;
				if(resData.code == 0) {
					wx.showToast({
						icon: "success",
						title: "已取消关注",
						duration: 1000,
						mask: true
					});
					this.setData({
						programList: this.tempProList
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
	tempSpeakerList: [],
	followSpeaker: function(e) {
		var token = wx.getStorageSync('token');
		let { index, id, isConcern } = e.detail;
		this.tempSpeakerList.splice(index, 1);
		wx.request({
			url: `${apiUrl}/Speaker/Concern?eventno=${eventNo}&id=${id}&concern=false`,
			method: "POST",
			header: {
				token: token
			},
			success: res => {
				let resData = res.data;
				if(resData.code == 0) {		
					wx.showToast({
						icon: "success",
						title: "已取消关注",
						duration: 1000,
						mask: true
					});			
					this.setData({
						spkList: this.tempSpeakerList
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
	tempSponsorList: [],
	followSponsor: function(e) {
		var token = wx.getStorageSync('token');
		let { id, index, isConcern } = e.detail;
		this.tempSponsorList.splice(index, 1);
		wx.request({
			url: `${apiUrl}/Exhibitors/Concern?eventno=${eventNo}&id=${id}&concern=false`,
			method: "POST",
			header: {
				token: token
			},
			success: res => {
				let resData = res.data;
				if(resData.code == 0) {
					wx.showToast({
						icon: "success",
						title: "已取消关注",
						duration: 1000,
						mask: true
					});
					this.setData({
						sponsorList: this.tempSponsorList
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
})