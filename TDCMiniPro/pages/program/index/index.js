const app = getApp();
var eventNo = app.globalData.eventNo;
var apiUrl = app.globalData.apiUrl;
var eventType = app.eventType;
Page({
	data: {
		programList: [],
		currentIndex: 0,
		hideProIntroWin: true,
		showPro: {},
		profile: {
			role: ""
		}
	},
	proIntroList: {
		dta: {
			name: "数字旅游奖",
			venue: "会场：格乐利雅艺术中心（徐汇店）16号宴会厅",
			logo: "/imgs/seriesAward.svg",
			introList: [
				"一场突如其来的疫情“黑天鹅事件”，对于旅游业的影响仍在持续。疫情迫使旅游企业缩减营销预算，延缓产品上线时间，加大了拉新获客的压力，同时倒逼我们重新思考产品和营销的数字创新本质以及提升可持续应对风险的能力。",
				"琳琅满目的营销创意能否真正打动目标人群？居高不下的营销投入能否实现最大程度的有效转化？产品功能优化是否真正解决了用户痛点？产品迭代过程中如何合理均衡匹配用户体验和商业价值？",
				"创新，从被看到开始。“2020 DTA数字旅游奖”由环球旅讯主办，由专业奖项策划团队与顶级奖项评委团队鼎力打造。希望通过对优秀营销&产品案例的征集和展示，为业者明晰领先者的宝贵经验和方法论，为行业提供策略参考，从而指导自身的转型实践。"
			]
		},
		tdc: {
			name: "环球旅讯峰会",
			venue: "会场：上海国际会议中心7楼【上海厅】",
			logo: "/imgs/seriesTDC_cn.jpg",
			introList: [
				"中国旅游业持续近20年的高光时刻，因为一场突如其来的”黑天鹅事件”提前结束。许多产业深层次问题逐渐显露，让我们不得不重新思考市场和商业的本质。",
				"2019年是过去十年最具有转折意义的一年。支撑中国旅游市场高速增长的人口红利和流量红利已然消退，行业面临周期性调整，细分市场增长天花板逐渐显露……旅游业发展面临前所未有的大变局。",
				"2020，归零归零。变局来临，认知需要重构，思维需要重构，价值需要重构。黑天鹅是常态，不承担风险就是最大的风险。本届“环球旅讯峰会”，我们希望引领业者重新思考和探讨，逆境下的旅游业如何负重前行？如何布局企业数字化以降本增效，提高“反脆弱能力“？如何构建共生逻辑，增强抗风险能力？"
			]
		},
		hmc: {
			name: "中国住宿业峰会",
			venue: "会场：上海国际会议中心7楼【上海厅】",
			logo: "/imgs/seriesHMC.svg",
			introList: [
				"中国旅游业持续近20年的高光时刻，因为一场突如其来的”黑天鹅事件”提前结束。许多产业深层次问题逐渐显露，让我们不得不重新思考市场和商业的本质。",
				"2019年是过去十年最具有转折意义的一年。支撑中国旅游市场高速增长的人口红利和流量红利已然消退，行业面临周期性调整，细分市场增长天花板逐渐显露……旅游业发展面临前所未有的大变局。",
				"2020，归零归零。变局来临，认知需要重构，思维需要重构，价值需要重构。黑天鹅是常态，不承担风险就是最大的风险。本届“环球旅讯峰会”，我们希望引领业者重新思考和探讨，逆境下的旅游业如何负重前行？如何布局企业数字化以降本增效，提高“反脆弱能力“？如何构建共生逻辑，增强抗风险能力？"
			]
		},
		ddc: {
			name: "中国目的地数字化峰会",
			venue: "会场：上海国际会议中心7楼【上海厅】",
			logo: "/imgs/seriesDDC.svg",
			introList: [
				"疫情对旅游业市场的冲击仍在持续，景区和目的地经受了空前的挑战。随着国内疫情逐步得到控制，景区及主题公园等陆续开放，通过直播、预售等方式，目的地突破了传统的营销获客模式，并且加速了数字化进程。本次峰会，我们将共同聚焦于目的地与景区的营销创新与智慧应用，围绕产品与内容探讨核心竞争力的正确打开方式，关注传统文化与未来科技的有机融合，共同探索目的地发展模式变革与新的机遇。",
			]
		},
	},
	scanParameter: "",
	fromScanCode: false,
	onLoad: function (options) {
		let go = options.go;
		if(options.scene != null && options.scene != undefined && options.scene != "") {
			let tempUrl = decodeURIComponent(options.scene);
			this.scanParameter = tempUrl;
			this.fromScanCode = true;
		}
		if(go == "tdc") {
			this.setData({
				currentIndex: 1
			});
		} else if(go == "hmc") {
			this.setData({
				currentIndex: 2
			});
		} else if(go == "ddc") {
			this.setData({
				currentIndex: 3
			});
		}
		
	},
	onShow: function () {
		var token = wx.getStorageSync('token');		
		wx.request({
			url: `${apiUrl}/Program/List?eventno=${eventNo}`,
			method: "GET",
			header: {
				token: !!token ? token : ""
			},
			success: res => {
				let resData = res.data;
				let doing = resData.message.split(",");
				let hasDoing = doing.length > 0 ? true : false;
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
							if(hasDoing) {
								for(let k = 0; k < doing.length; k++) {
									let currDo = doing[k];
									if(pro.id == currDo) {
										pro.doing = true;
										continue;
									}
								}
							}
							pro.belong = eventType[currProList.area];
							currProList.type = eventType[currProList.area];
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
			url: `${apiUrl}/Home/ScanLog?eventno=${eventNo}&page=${encodeURIComponent('/pages/program/index/index')}&pageref=${this.fromScanCode ? this.scanParameter : ''}&requestid=0`,
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
	openProIntroWin: function(e) {
		let { type } = e.currentTarget.dataset;
		let willShow = this.proIntroList[type];
		this.setData({
			hideProIntroWin: false,
			showPro:  willShow
		});
	},
	closeProIntroWin: function() {
		this.setData({
			hideProIntroWin: true
		});
	},
	switchProgram: function(e) {
		let index = e.currentTarget.dataset.index;
		this.setData({
			currentIndex: index
		});
	},
	followProgram: function(e) {
		var token = wx.getStorageSync('token');
		let { id, parentindex, proindex, isConcern } = e.detail;
		let role = this.data.profile.role;		
		if(token == "" || token == undefined || token == null || token.length < 0) {
			wx.navigateTo({
			  	url: `/pages/user/login/login?redirect=/pages/program/index/index`,
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
						title: isConcern ? '已取消关注' : '关注成功',
						duration: 1000,
						mask: true
					});
					this.setData({
						[`programList[${parentindex}].program[${proindex}].isSubscribed`]: isConcern ? false : true
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