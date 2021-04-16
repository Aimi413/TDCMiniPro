const app = getApp();
var eventNo = app.globalData.eventNo;
var apiUrl = app.globalData.apiUrl;
var endShowRegisterTime = app.endShowRegisterTime;
Page({
	data: {
		profile: {
			role: ""
		},
		sponsor: {},
		contact: {},
		events: [],
		products: [],
		hideWin: true,
		hideType: "",
		showProduct: {},
		showEvent: {},
		showRegisterBtn: true,
		contactPerson: [],
	},
	sponsorId: "",
	scanParameter: "exb",
	fromScanCode: false,
	onLoad: function (options) {
		var token = wx.getStorageSync('token');
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
		this.sponsorId = id;
		wx.request({
			url: `${apiUrl}/Exhibitors/Details?eventno=${eventNo}&id=${id}`,
			method: "GET",
			header: {
				token: token,
			},
			success: res => {
				let resData = res.data;
				if(resData.code == 0) {
					let sponsor = resData.data;
					let { attendees: attends, contactList, products, events } = sponsor;
					let contactPerson = [];
					if(attends.length > 0) {
						contactPerson = attends.filter(item => (item.isContact == true));
					}
			
					let tempName = contactList.filter(item => item.id == 8);
					let tempMobile = contactList.filter(item => item.id == 1);
					let tempPhone = contactList.filter(item => item.id == 10);
					let tempEmail = contactList.filter(item => item.id == 2);

					if(products.length > 0) {
						for(let i = 0, len = products.length; i < len; i++) {
							let pro = products[i];
							pro.isShow = false;
						}
						this.setData({
							products: products
						});
					}
					if(events.length > 0) {
						for(let i = 0, len = events.length; i < len; i++) {
							let event = events[i];
							event.isShow = false;
						}
						this.setData({
							events: events
						});
					}
					if(attends.length > 0) {
						this.setData({
							contactPerson: contactPerson,
							"contact.name": tempName[0] != undefined ? tempName[0].name : '' || "未填写",
							"contact.mobile": tempMobile[0] != undefined ? tempMobile[0].name : '' || '未填写',
							"contact.phone": tempPhone[0] != undefined ? tempPhone[0].name : '' || '未填写',
							"contact.email": tempEmail[0] != undefined ? tempEmail[0].name : '' || '未填写',
						});
					}
					this.setData({
						sponsor: sponsor,
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
		let now = new Date();
		if(now - endShowRegisterTime >= 0) {
			this.setData({
				showRegisterBtn: false
			});
		}
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
			url: `${apiUrl}/Home/ScanLog?eventno=${eventNo}&page=${encodeURIComponent('/pages/sponsor/detail/detail')}&pageref=${this.fromScanCode ? this.scanParameter : ''}&requestid=${this.sponsorId}`,
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
			title: "环球旅讯峰会展商赞助商",
			path: `/pages/sponsor/detail/detail?id=${id}`
		}
	},
	goGuestDetail: function(e) {
		let { id } = e.currentTarget.dataset;
		let role = this.data.profile.role;
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
	},
	expandEvent: function(e) {
		let { id } = e.currentTarget.dataset;
		let showEvent = this.data.events.filter(item => item.id == id)[0];
		this.setData({
			hideWin: false,
			hideType: "event",
			showEvent: showEvent,
		});
	},
	expandProduct: function(e) {
		let { id } = e.currentTarget.dataset;
		let showProList = this.data.products.filter(item => item.id == id);
		let showPro = showProList[0];
		this.setData({
			hideWin: false,
			hideType: "product",
			showProduct: showPro,
		});
	},
	closeWin: function() {
		this.setData({
			hideWin: true,
			showEvent: {},
			showProduct: {}
		})
	},
	followSponsor: function(e) {
		var token = wx.getStorageSync('token');
		let { id, concern: isConcern } = e.currentTarget.dataset;
		if(!token) {
			wx.navigateTo({
			  url: `/pages/user/login/login?redirect=/pages/sponsor/detail/detail&id=${this.sponsorId}`,
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
			url: `${apiUrl}/Exhibitors/Concern?eventno=${eventNo}&id=${id}&concern=${!isConcern}`,
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
						"sponsor.concern": isConcern ? false : true
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
	shareSponsor: function(e) {

	}
})