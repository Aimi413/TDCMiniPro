const app = getApp();
var eventNo = app.globalData.eventNo;
var apiUrl = app.globalData.apiUrl;
var eventType = app.eventType;
Page({
	data: {
		dynamicTabs: [
			{
				type: "all",
				name: "全部"
			},
			{
				type: "official",
				name: "官方"
			},
			{
				type: "selected",
				name: "精选"
			},
			{
				type: "personal",
				name: "我的"
			}
		],
		openType: "all",
		allList: [],
		officialList: [],
		selectedList: [],
		personalList: [],
		profile: {},
		allScrTop: 0,
		officialScrTop: 0,
		selectedScrTop: 0,
		personalScrTop: 0,
		hideGoPublish: false,
		complete_all: false,
		complete_official: false,
		complete_selected: false,
		complete_personal: false,
	},
	allPage: 1,
	officialPage: 1,
	selectedPage: 1,
	personalPage: 1,
	completeAll: false,
	completeOfficial: false,
	completeSelected: false,
	completePersonal: false,
	postLikedObj: {},
	canStarPost: true,
	onLoad: function (options) {
		this.loadList("all", "/Post/List", this.allPage);
		this.loadList("official", "/Post/OfficalList", this.officialPage);
		this.loadList("selected", "/Post/SelectList", this.selectedPage);
	},
	onShow: function () {
		var token = wx.getStorageSync('token');
		this.postLikedObj = wx.getStorageSync('postLikedObj') || {};
		if(token) {
			this.loadList("personal", "/Me/Post", this.personalPage);
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
						this.setData({
							profile: info
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
	switchDynamic: function(e) {
		var token = wx.getStorageSync('token');
		let { type } = e.currentTarget.dataset;
		if(type == 'personal') {
			if(token == "" || token == undefined || token == null || token.length < 0) {
				wx.navigateTo({
					url: `/pages/user/login/login?redirect=/pages/plaza/index/index`
				});
				return false;
			}
		}
		if(type == "official" || type == "selected") {
			this.setData({
				hideGoPublish: true
			});
		} else {
			this.setData({
				hideGoPublish: false
			});
		}
		this.setData({
			openType: type
		});

	},
	loadMoreList: function(e) {
		let { openType } = this.data;
		switch(openType) {
			case "all":
				if(!this.completeAll) {
					wx.showLoading({
						title: '正在加载中',
					});
					this.allPage++;
					this.loadList("all", "/Post/List", this.allPage);
				}
				break;
			case "official":
				if(!this.completeOfficial) {
					wx.showLoading({
						title: '正在加载中',
					});
					this.officialPage++;
					this.loadList("official", "/Post/OfficalList", this.officialPage);
				}
				break;
			case "selected":
				if(!this.completeSelected) {
					wx.showLoading({
						title: '正在加载中',
					});
					this.selectedPage++;
					this.loadList("selected", "/Post/SelectList", this.selectedPage);
				}
				break;
			case "personal":
				if(!this.completePersonal) {
					wx.showLoading({
						title: '正在加载中',
					});
					this.personalPage++;
					this.loadList("personal", "/Me/Post", this.personalPage);
				}
				break;
		}
	},
	loadList: function(type, url, typePage) {
		switch(type) {
			case "all":
				if(this.completeAll) {
					return false;
				}
				break;
			case "official":
				if(this.completeOfficial) {
					return false;
				}
				break;
			case "selected":
				if(this.completeSelected) {
					return false;
				}
				break;
			case "personal":
				if(this.completePersonal) {
					return false;
				}
				break;
		}
		var token = wx.getStorageSync('token');
		wx.request({
			url: `${apiUrl}${url}?eventno=${eventNo}&page=${typePage}`,
			method: "GET",
			header: {
				token: token
			},
			success: res => {
				let resData = res.data;
				if(resData.code == 0) {
					wx.hideLoading();
					let { allList, officialList, selectedList, personalList } = this.data;
					let resList = resData.data;
					let resDataLength = resList.length;
					var tempList = [];
					for(let i = 0; i < resDataLength; i++) {
						let currPost = resList[i];
						currPost.time = currPost.time.replace(/(\d{4})-(\d{1,2})-(\d{1,2})T(\d{1,2}):(\d{1,2}):(\d{1,2})(.*)/, "$2-$3 $4:$5");
						let program = currPost.program;
						if(program != null) {
							let reg = /(\d{4}-\d{1,2}-\d{1,2})T(\d{1,2}):(\d{1,2}):(\d{1,2})/;
							program.date = program.begin.replace(/(\d{4})-(\d{1,2})-(\d{1,2})T(\d{1,2}):(\d{1,2}):(\d{1,2})/, "$2月$3日");
							program.begin = program.begin.replace(reg, "$2:$3");
							program.end = program.end.replace(reg, "$2:$3");
							program.belong = eventType[program.location];
							let spkList = program.details;
							if(spkList != null || spkList.length != 0) {
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
						if(currPost.type == 1) {
							if(Object.keys(this.postLikedObj).length > 0) {
								Object.keys(this.postLikedObj).forEach((key) => {
									if(currPost.id == key) {
										currPost.isLike = this.postLikedObj[key];
									}
								});
							}
						}
					}
					if(type == "all") {
						if(resDataLength < 10) {
							this.completeAll = true;
							this.setData({
								complete_all: true
							});
						}
						if(this.allPage != 1) {
							tempList = [...allList, ...resList];
						} else {
							tempList = resList;
						}
					}
					if(type == "official") {
						if(resDataLength < 10) {
							this.completeOfficial = true;
							this.setData({
								complete_official: true
							});
						}
						if(this.officialPage != 1) {
							tempList = [...officialList, ...resList];
						} else {
							tempList = resList;
						}
					}
					if(type == "selected") {
						if(resDataLength < 10) {
							this.completeSelected = true;
							this.setData({
								complete_selected: true
							});
						}
						if(this.selectedPage != 1) {
							tempList = [...selectedList, ...resList];
						} else {
							tempList = resList;
						}
					}
					if(type == "personal") {
						if(resDataLength < 10) {
							this.completePersonal = true;
							this.setData({
								complete_personal: true
							});
						}
						if(this.personalPage != 1) {
							tempList = [...personalList, ...resList];
						} else {
							tempList = resList;
						}
					}
					this.setData({
						[`${type}List`]: tempList
					});
				} else {
					wx.hideLoading();
					wx.showModal({
						title: "提示",
						content: resData.message,
						showCancel: false
					});
				}
			},
			fail: res => {
				wx.hideLoading();
				wx.showModal({
					title: "提示",
					content: res.errMsg,
					showCancel: false
				});
			}
		});
	},
	goPublish: function() {
		var token = wx.getStorageSync('token');
		if(token == "" || token == undefined || token == null || token.length < 0) {
			wx.navigateTo({
				url: `/pages/user/login/login?redirect=/pages/plaza/index/index`
			});
			return false;
		}
		let { role } = this.data.profile;
		if(role != 2 && role != 4 && role != 9 && role != 10) {
			wx.showModal({
				title: "提示",
				content: "当前票种没有权限",
				showCancel: false
			});
			return false;
		}
		wx.navigateTo({
			url: `/pages/plaza/publish/publish`
		});
	},
	filterEle: function(filterId, arr, belong) {
		var filterObj = {};
		for(let i = 0, len = arr.length; i < len; i++) {
			var currEle = arr[i];
			if(currEle.id == filterId) {
				filterObj.ele = currEle;
				filterObj.index = i;
				filterObj.belong = belong;
				break;
			}
		}
		return filterObj;
	},
	starPost: function(e) {
		var token = wx.getStorageSync('token');
		let { belong, id, index, islike } = e.detail;
		let { allList, officialList, selectedList, personalList } = this.data;
		if(this.canStarPost == false) {
			return false;
		}
		this.canStarPost = false;
		wx.request({
			url: `${apiUrl}/Post/PostLike?eventno=${eventNo}&id=${id}&like=${!islike}`,
			method: "POST",
			header: {
				token: token
			},
			success: res => {
				let resData = res.data;
				if(resData.code == 0) {
					var filterObj1 = this.filterEle(id, allList, "allList");
					var filterObj2 = this.filterEle(id, officialList, "officialList");
					var filterObj3 = this.filterEle(id, selectedList, "selectedList");
					var filterObj4 = this.filterEle(id, personalList, "personalList");

					[filterObj1, filterObj2, filterObj3, filterObj4].forEach((item, index) => {
						if(item.ele != undefined || item.ele != null) {
							let state = item.ele.isLike;
							let idx = item.index;
							let likeCount = item.ele.likeCount;
							let type = "";
							if(index == 0) {
								type = "all"
							} else if(index == 1) {
								type = "official";
							} else if(index == 2) {
								type = "selected";
							} else {
								type = "personal"
							}
							wx.showToast({
								icon: "success",
								title: state ? '已取消点赞' : '已点赞',
								duration: 1000,
								mask: true
							});
							this.setData({
								[`${type}List[${idx}].isLike`]: state ? false : true,
								[`${type}List[${idx}].likeCount`]: state ? --likeCount : ++likeCount
							}, () => {
								this.canStarPost = true;
							});
						}
					});
					let tempObj = Object.assign(this.postLikedObj);
					tempObj[id] = islike ? false : true;
					wx.setStorageSync('postLikedObj', tempObj);
				} else {
					this.canStarPost = true;
					wx.showModal({
						title: "提示",
						content: resData.message,
						showCancel: false
					});
				}
			},
			fail: res => {
				this.canStarPost = true;
				wx.showModal({
					title: "提示",
					content: res.errMsg,
					showCancel: false
				});
			}
		});
	},
	delPost: function(e) {
		var token = wx.getStorageSync('token');
		let { belong, id, index } = e.detail;
		let { allList, personalList } = this.data;
		let tempAllPostItemIndex;
		for(let i = 0, allLen = allList.length; i < allLen; i++) {
			let currPost = allList[i];
			if(id == currPost.id) {
				tempAllPostItemIndex = i;
				break;
			}
		}
		let tempLeftAllPostList = [];
		if(tempAllPostItemIndex != undefined) {
			allList.splice(tempAllPostItemIndex, 1);
			tempLeftAllPostList = allList;
		}
		wx.request({
			url: `${apiUrl}/Me/PostDelete?eventno=${eventNo}&id=${id}`,
			method: "DELETE",
			header: {
				token: token
			},
			success: res => {
				let resData = res.data;
				if(resData.code == 0) {
					personalList.splice(index, 1);
					let tempList = personalList
					this.setData({
						personalList: tempList
					});
					if(tempAllPostItemIndex != undefined) {
						this.setData({
							allList: tempLeftAllPostList
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
	updateData: function(type, data) {
		let { allList, officialList, selectedList, personalList } = this.data;
		switch(type) {
			case "star":
				let { starId, isLike } = data;
				let tempAllIndex, tempOfficialIndex, tempSelectedIndex, tempPersonalIndex;
				let tempAllIndexItem = null, tempOfficialIndexItem = null, tempSelectedIndexItem = null, tempPersonalIndexItem = null;
				for(let i = 0, allLen = allList.length; i < allLen; i++) {
					let currItem = allList[i];
					if(starId == currItem.id) {
						tempAllIndex = i;
						tempAllIndexItem = currItem;
						break;
					}
				}
				for(let i = 0, officialLen = officialList.length; i < officialLen; i++) {
					let currItem = officialList[i];
					if(starId == currItem.id) {
						tempOfficialIndex = i;
						tempOfficialIndexItem = currItem;
						break;
					}
				}
				for(let i = 0, selectedLen = selectedList.length; i < selectedLen; i++) {
					let currItem = selectedList[i];
					if(starId == currItem.id) {
						tempSelectedIndex = i;
						tempSelectedIndexItem = currItem;
						break;
					}
				}
				for(let i = 0, personalLen = personalList.length; i < personalLen; i++) {
					let currItem = personalList[i];
					if(starId == currItem.id) {
						tempPersonalIndex = i;
						tempPersonalIndexItem = currItem;
						break;
					}
				}
				if(tempAllIndex != undefined) {
					let likeCount = tempAllIndexItem.likeCount;
					this.setData({
						[`allList[${tempAllIndex}].isLike`]: isLike ? false : true,
						[`allList[${tempAllIndex}].likeCount`]: isLike ? --likeCount : ++likeCount
					});
				}
				if(tempOfficialIndex != undefined) {
					let likeCount = tempOfficialIndexItem.likeCount;
					this.setData({
						[`officialList[${tempOfficialIndex}].isLike`]: isLike ? false : true,
						[`officialList[${tempOfficialIndex}].likeCount`]: isLike ? --likeCount : ++likeCount
					});
				}
				if(tempSelectedIndex != undefined) {
					let likeCount = tempSelectedIndexItem.likeCount;
					this.setData({
						[`selectedList[${tempSelectedIndex}].isLike`]: isLike ? false : true,
						[`selectedList[${tempSelectedIndex}].likeCount`]: isLike ? --likeCount : ++likeCount
					});
				}
				if(tempPersonalIndex != undefined) {
					let likeCount = tempPersonalIndexItem.likeCount;
					this.setData({
						[`personalList[${tempPersonalIndex}].isLike`]: isLike ? false : true,
						[`personalList[${tempPersonalIndex}].likeCount`]: isLike ? --likeCount : ++likeCount
					});
				}
				break;
			case "publishpost":
				
				let tempAllList = [...allList];
				tempAllList.unshift(data);
				let tempPersonalList = [...personalList];
				tempPersonalList.unshift(data);
				this.setData({
					allList: tempAllList,
					personalList: tempPersonalList,
					allScrTop: 0,
					personalScrTop: 0
				})
				break;
		}

	},
});