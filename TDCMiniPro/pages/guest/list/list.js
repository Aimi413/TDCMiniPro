const app = getApp();
var eventNo = app.globalData.eventNo;
var apiUrl = app.globalData.apiUrl;
Page({
	data: {
		industryList: [],
		showCompany: {},
		hideAttendsWin: true,
		profile: {
			role: ""
		}
	},
	filters: "",
	onLoad: function (options) {
		var token = wx.getStorageSync('token');
		let filter = options.filter;
		this.filters = filter;
		wx.request({
			url: `${apiUrl}/Attendees/List?eventno=${eventNo}&industry=${filter}`,
			method: "GET",
			header: {
				token: token
			},
			success: res => {
				let resData = res.data;
				if(resData.code == 0) {
					let indyList = resData.data;					
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
	concernIndustry: function(e) {
		var token = wx.getStorageSync('token');
		let { concern: isConcern, id, index } = e.currentTarget.dataset;
		if(token == null || token == undefined || token.length == 0) {
			wx.navigateTo({
			  url: `/pages/user/login/login?redirect=/pages/guest/list/list&filter=${this.filters}`
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
		wx.request({
			url: `${apiUrl}/Attendees/IndustryConcern?eventno=${eventNo}&id=${id}&concern=${!isConcern}`,
			method: "POST",
			header: {
				token: token
			},
			success: res => {
				let resData = res.data;
				if(resData.code == 0) {
					let state = this.data.industryList[index].concern;
					wx.showToast({
						icon: "success",
						title: state ? '已取消关注' : '关注成功',
						duration: 1000,
						mask: true
					});
					this.setData({
						[`industryList[${index}].concern`]: state ? false : true
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
	closeWin: function() {
		this.setData({
			hideAttendsWin: true
		});
	},
	checkAttends: function(e) {
		let { parent, company } = e.currentTarget.dataset;
		let category = this.data.industryList.filter(item => item.name == parent)[0];
		let companies = category.companies;
		let filteredCompany = companies.filter(item => item.name == company)[0];
		this.setData({
			hideAttendsWin: false,
			showCompany: filteredCompany
		});
	},
	goGuestDetail: function(e) {
		var token = wx.getStorageSync('token');
		let { id } = e.detail;
		let role = this.data.profile.role;		
		if(token == "" || token == undefined || token == null || token.length < 0) {
			wx.navigateTo({
			  	url: `/pages/user/login/login?redirect=/pages/guest/list/list&filter=${this.filters}`,
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
		wx.navigateTo({
			url: `/pages/guest/detail/detail?id=${id}`
		});
	}
})