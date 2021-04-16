const app = getApp();
var eventNo = app.globalData.eventNo;
var apiUrl = app.globalData.apiUrl;
var eventType = app.eventType;
var token = wx.getStorageSync('token');
Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		bannerList: [
			// {
			// 	imageFile: "/imgs/home/banner5.png",
			// 	link: "https://event.traveldaily.cn/tdc2020/service/miniprogram&ccc=555",
			// 	hasHttp: false
			// },
			// {
			// 	imageFile: "/imgs/home/banner4.png",
			// 	link: `https://event.traveldaily.cn/tdc2020/survey/100/`,
			// 	hasHttp: true
			// },
		],
		dynamicList: [],
		tdcList: [],
		hmcList: [],
		ddcList: [],
		dtaList: [],
		largerList: [],
		currProIndex: 0,
		autoHeight: false,
		spkList: [],		
		partnerList: [],
		adList: [],
		profile: {
			name: "",
			company: "",
			jobTitle: "",
			photo: "",
			newMessageCount: 0
		},
		hideAdWin: true,
		winAdList: [],
	},
	t: 8,
	timer: null,
	hasProgramData: false,
	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		wx.removeStorageSync('hideAdWin');
		var token = wx.getStorageSync('token');
		wx.showToast({
			title: '玩命加载中',
			icon: "loading",
			mask: true,
			duration: 1500
		});
		// let isHideAdWin = wx.getStorageSync('hideAdWin');
		let that = this;
		wx.request({
			url: `${apiUrl}/Program/List?eventno=${eventNo}`,
			method: "GET",
			success: res => {
				let resData = res.data;
				if(resData.code == 0) {
					let proList = resData.data;
					let tdcList = [], hmcList = [], ddcList = [], dtaList = [];
					let tempTdcList = proList.filter(item => item.area == 4);
					let tempHmcList = proList.filter(item => item.area == 5);
					let tempDdcList = proList.filter(item => item.area == 7);
					let tempDtaList = proList.filter(item =>　item.area == 100);

					if(tempTdcList[0] != undefined || tempTdcList[0] != null) {
						tdcList = tempTdcList[0].program;
					}
					if(tempHmcList[0] != undefined || tempHmcList[0] != null) {
						hmcList = tempHmcList[0].program;
					}
					if(tempDdcList[0] != undefined || tempDdcList[0] != null) {
						ddcList = tempDdcList[0].program;
					}
					if(tempDtaList[0] != undefined || tempDtaList[0] != null) {
						dtaList = tempDtaList[0].program;
					}

					let tempLarger = hmcList.length > ddcList.length ? hmcList : ddcList;

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
							pro.belong = eventType[currProList.area];
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
					this.hasProgramData = true;
					this.setData({
						tdcList: tdcList,
						hmcList: hmcList,
						ddcList: ddcList,
						dtaList: dtaList,
						largerList: tempLarger
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
				if(resData.code == 0) {
					let resAdList = resData.data;
					let partnerAdList = [], banList = [], winAdList = [];
					let tempPartnerAdList = resAdList.filter(item => item.key == 202);
					let tempBanList = resAdList.filter(item => item.key == 201);
					let tempWinAdList = resAdList.filter(item => item.key == 204);

					if(tempBanList[0] != undefined || tempBanList[0] != null) {
						banList = tempBanList[0].value;
						for(let i = 0, len = banList.length; i < len; i++) {
							let banner = banList[i];
							let realLink = banner.realLink;
							if(realLink.startsWith("http")) {
								banner.hasHttp = true;
							} else if(realLink.startsWith("sid")) {
								banner.questionnaire = true;
							} else {
								banner.hasHttp = false;
								banner.questionnaire = false;
							}
							if(realLink.indexOf("survey") != -1) {
								banner.realLink = banner.realLink + "&token=" + token;
							}
						}
						this.setData({
							bannerList: banList
						});
					}
					if(tempPartnerAdList[0] != undefined || tempPartnerAdList[0] != null) {
						partnerAdList = tempPartnerAdList[0].value
						for(let i = 0, len = partnerAdList.length; i < len; i++) {
							let partnerAd = partnerAdList[i];
							let realLink = partnerAd.realLink;
							if(realLink.startsWith("http")) {
								partnerAd.hasHttp = true;
							} else if(realLink.startsWith("sid")) {
								banner.questionnaire = true;
							} else {
								partnerAd.hasHttp = false;
								partnerAd.questionnaire = false;
							}
							if(realLink.indexOf("survey") != -1) {
								partnerAd.realLink = partnerAd.realLink + "&token=" + token;
							}
						}
						this.setData({
							adList: partnerAdList
						});
					}
					if(tempWinAdList[0] != undefined || tempWinAdList[0] != null) {
						winAdList = tempWinAdList[0].value;
						for(let i = 0, len = winAdList.length; i < len; i++) {
							let winAdItem = winAdList[i];
							let realLink = winAdItem.realLink;
							if(realLink.startsWith("http")) {
								winAdItem.hasHttp = true;
							} else if(realLink.startsWith("sid")) {
								winAdItem.questionnaire = true;
							} else {
								winAdItem.hasHttp = false;
								winAdItem.questionnaire = false;
							}
							if(realLink.indexOf("survey") != -1) {
								winAdItem.realLink = winAdItem.realLink + "&token=" + token;
							}
						}
						this.setData({
							winAdList: winAdList,
							hideAdWin: false
							// hideAdWin: isHideAdWin ? true : false
						}, () => {
							// if(!isHideAdWin) {
								// wx.setStorageSync('hideAdWin', true);
								that.timer = setTimeout(function countDown() {
									console.log(that.t);
									that.t--;
									if(that.t <= 0) {
										that.t = 8;
										clearTimeout(that.timer);
										that.timer = null;
										that.setData({
											hideAdWin: true
										});
										return false;
									}
									that.timer = setTimeout(countDown, 1000);
								}, 1000);
							// }
						});
					} else {
						this.setData({
							hideAdWin: true
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
		wx.request({
			url: `${apiUrl}/Home/Post?eventno=${eventNo}`,
			method: "GET",
			success: res => {
				let resData = res.data;
				if(resData.code == 0) {
					let dynamicList = resData.data;
					this.setData({
						dynamicList: dynamicList
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
			url: `${apiUrl}/Speaker/List?eventno=${eventNo}`,
			method: "GET",
			success: res => {
				let resData = res.data;
				if(resData.code == 0) {
					let spkList = resData.data;
					let newSpkList = spkList.slice(0, 8);
					this.setData({
						spkList: newSpkList
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
			url: `${apiUrl}/Partner/List?eventno=${eventNo}`,
			method: "GET",
			success: res => {
				let resData = res.data;
				if(resData.code == 0) {
					let partnerList = resData.data;
					for(let i = 0, len = partnerList.length; i < len; i++) {
						let currList = partnerList[i];
						let tempTypeName = "";
						for(let j = 0, cLen = currList.length; j < cLen; j++) {
							let currPartner = currList[j];
							let typeName = currPartner.typeName;
							if(tempTypeName == typeName) {
								currPartner.typeName = "";
							}
							tempTypeName = typeName;
						}
					}
					this.setData({
						partnerList: partnerList
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
	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function () {
	},
	/**
	 * 生命周期函数--监听页面显示
	 */
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
						let { name, company, jobTitle, photo, role, newMessageCount } = info;						
						this.setData({
							"profile.name": name,
							"profile.company": company,
							"profile.jobTitle": jobTitle,
							"profile.photo": photo,
							"profile.role": role,
							"profile.newMessageCount": newMessageCount
						});
					} else {
						wx.removeStorageSync('token');
					}
				},
				fail: res => {
					wx.removeStorageSync('token');
					wx.showModal({
						title: "提示",
						content: res.errMsg,
						showCancel: false
					});
				}
			});
		}
		setTimeout(() => {
			let { dtaList, tdcList, hmcList, ddcList, largerList } = this.data;
			let tempArr = [];
			let time = new Date();
			let date = time.getDate();
			let index = 0;
			let idx = 0;
			if(date == 25) {
				index = 0;
				tempArr = dtaList;
			} else if(date == 26) {
				index = dtaList.length;
				tempArr = tdcList;
			} else if(date == 27) {
				index = dtaList.length + tdcList.length;
				tempArr = largerList;
			}
			if(tempArr.length > 0) {
				for(let i = 0, len = tempArr.length; i < len; i++) {
					let currPro = tempArr[i];
					let tempDate = "";
					let currProDate = currPro.date;
					if(currProDate == "11月25日") {
						tempDate = "2020-11-25";
					} else if(currProDate == "11月26日") {
						tempDate = "2020-11-26";
					} else if(currProDate == "11月27日") {
						tempDate = "2020-11-27";
					}
					let beginTime = new Date(tempDate + " " + currPro.begin);
	
					let endTime = new Date(tempDate + " " + currPro.end);
	
					if(time - beginTime >= 0 && time - endTime < 0) {
						idx = i;
						break;
					}
				}
				this.setData({
					currProIndex: (index + idx)
				});
			}
		}, this.hasProgramData ? 0 : 1000);
	},
	/**
	 * 生命周期函数--监听页面隐藏
	 */
	onHide: function () {
		this.t = 8;
		clearTimeout(this.timer);
		this.timer = null;
		this.setData({
			hideAdWin: true
		});
	},
	/**
	 * 生命周期函数--监听页面卸载
	 */
	onUnload: function () {
		this.t = 8;
		clearTimeout(this.timer);
		this.timer = null;
		this.setData({
			hideAdWin: true
		});
	},
	/**
	 * 页面相关事件处理函数--监听用户下拉动作
	 */
	onPullDownRefresh: function () {

	},
	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom: function () {

	},
	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function () {

	},
	goUrlLink: function(e) {
		let { hashttp, link, reallink } = e.currentTarget.dataset;
		wx.navigateTo({
		  url: reallink,
		});
		wx.request({
			url: link,
			method: "GET",
			success: res => {
				let resData = res.data;
				if(resData.code == 0) {

				} else {
					
				}
				
			},
			fail: res => {
			}
		});
		
	},
	goUserPage: function(e) {
		let { url, type } = e.currentTarget.dataset;
		let token = wx.getStorageSync('token');
		if(token) {
			if(type == "goPasscode") {
				let role = this.data.profile.role;
				console.log(role);
				if(role != 2 && role != 4 && role != 9 && role != 1) {
					wx.showModal({
						title: "提示",
						content: "您购买的门票不能签到，如有疑问请咨询现场工作人员。",
						showCancel: false
					});
					return false;
				}
			}
			wx.navigateTo({
			  url: url
			});
		} else {
			wx.navigateTo({
			  url: '/pages/user/login/login',
			});
		}
	},
	changeHeight: function(e) {
		let { tdcList, dtaList, hmcList, ddcList, largerList } = this.data;
		let len = tdcList.length + dtaList.length;
		let current = e.detail.current;
		let allLen = tdcList.length + dtaList.length + largerList.length
	
		if(current == allLen - 1 && hmcList.length != ddcList.length) {
			this.setData({
				autoHeight: false
			});
		} else if(current >= len) {
			this.setData({
				autoHeight: true
			});
		} else {
			this.setData({
				autoHeight: false
			});
		}
	},
	goProgramDetail: function(e) {
		let { id, topic } = e.currentTarget.dataset;
		// if(topic != "") {
		// }
		wx.navigateTo({
			url: `/pages/program/detail/detail?id=${id}`
		});
	},
	closeAdWin: function() {
		this.t = 8;
		clearTimeout(this.timer);
		this.timer = null;
		this.setData({
			hideAdWin: true
		});
	}
})