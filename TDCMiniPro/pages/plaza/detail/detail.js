const app = getApp();
var eventNo = app.globalData.eventNo;
var apiUrl = app.globalData.apiUrl;
Page({
	data: {
		profile: {},
		post: null,
		showCommentItem: null,
		hideCommentDetailWin: true,
		hideInputWin: true,
		commentType: "comment",
		commentInputVal: ""
	},
	postId: "",
	postLikedObj: {},
	postCommentLikedObj: {},
	canStarPost: true,
	canStarComment: true,
	canPublishComment: true,
	onLoad: function (options) {
		var token = wx.getStorageSync('token');
		let id = options.id;
		this.postId = id;
		this.postLikedObj = wx.getStorageSync('postLikedObj') || {};
		this.postCommentLikedObj = wx.getStorageSync('postCommentLikedObj') || {};
		wx.request({
			url: `${apiUrl}/Post/Details?eventno=${eventNo}&id=${id}`,
			method: "GET",
			success: res => {
				let resData = res.data;
				if(resData.data.id == 0) {
					wx.showModal({
						title: '提示',
						content: "该动态已删除",
						showCancel: false,
						success: res => {
							if(res.confirm) {
								wx.navigateBack({
								  	delta: 0,
								});
							}
						}
					});
					return false;
				}
				if(resData.code == 0) {
					let resPost = resData.data;
					let reg = /(\d{4})-(\d{1,2})-(\d{1,2})T(\d{1,2}):(\d{1,2}):(\d{1,2})(.*)/;
					resPost.time = resPost.time.replace(reg, "$1-$2-$3 $4:$5");
					let commentList = resPost.commentList;
					if(commentList != null) {
						let commentListLength = commentList.length;
						if(commentListLength > 0) {
							for(let i = 0; i < commentListLength; i++) {
								let commentItem = commentList[i];
								commentItem.postTime = commentItem.postTime.replace(reg, "$1-$2-$3 $4:$5");
								let replyList = commentItem.replyList;
								let replyListLength = replyList.length;
								if(replyListLength > 0) {
									for(let j = 0; j < replyListLength; j++) {
										let replyItem = replyList[j];
										replyItem.postTime = replyItem.postTime.replace(reg, "$1-$2-$3 $4:$5");
									}
								}
								if(Object.keys(this.postCommentLikedObj).length > 0) {
									Object.keys(this.postCommentLikedObj).forEach((key) => {
										if(commentItem.id == key) {
											commentItem.isLike = this.postCommentLikedObj[key];
										}
									});
								}
							}
						}
					}
					if(Object.keys(this.postLikedObj).length > 0) {
						Object.keys(this.postLikedObj).forEach((key) => {
							if(resPost.id == key) {
								resPost.isLike = this.postLikedObj[key];
							}
						});
					}
					this.setData({
						post: resPost
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
	onShow: function () {
	},
	onHide: function() {
		this.tempComment = "";
		this.setData({
			showCommentItem: null
		});
		this.canStarPost = true;
		this.canStarComment = true;
		this.canPublishComment = true;
	},
	onUnload: function() {
		this.tempComment = "";
		this.setData({
			showCommentItem: null
		});
		this.canStarPost = true;
		this.canStarComment = true;
		this.canPublishComment = true;
	},
	onShareAppMessage: function () {

	},
	openCommentDetailWin: function(e) {
		let { item } = e.currentTarget.dataset;
		this.setData({
			hideCommentDetailWin: false,
			showCommentItem: item
		});
	},
	closeCommentDetailWin: function() {
		this.setData({
			hideCommentDetailWin: true,
			showCommentItem: null
		});
	},
	goReplyGuestDetail: function(e) {
		let { id } = e.currentTarget.dataset;
		let role = this.data.profile.role;
		var token = wx.getStorageSync('token');
		if(token == "" || token == undefined || token == null || token.length < 0) {
			wx.navigateTo({
			  	url: `/pages/user/login/login?redirect=/pages/plaza/detail/detail&id=${this.postId}`,
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
		this.setData({
			hideCommentDetailWin: true,
			showCommentItem: null
		}, () => {
			wx.navigateTo({
				url: `/pages/guest/detail/detail?id=${id}`
			});
		});		
	},
	replyWho: null,
	replyItemIndex: 0,
	openInputWin: function(e) {
		let { type, item } = e.currentTarget.dataset;
		var token = wx.getStorageSync('token');
		if(token == undefined || token == null || token == "") {
			wx.navigateTo({
				url: `/pages/user/login/login?redirect=/pages/plaza/detail/detail&id=${this.postId}`
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
		if(type == "reply") {
			this.replyWho = item;
		}
		this.setData({
			hideInputWin: false,
			commentType: type
		});
	},
	closeInputWin: function() {
		this.setData({
			hideInputWin: true,
			commentInputVal: ""
		});
		this.tempComment = "";				
	},
	starComment: function(e) {
		var token = wx.getStorageSync('token');
		let showCommentItem = this.data.showCommentItem;
		let { commentList } = this.data.post;
		let { item } = e.currentTarget.dataset;
		let { id, isLike, like } = item;
		if(this.canStarComment == false) {
			return false;
		}
		let index;
		for(let i = 0, len = commentList.length; i < len; i++) {
			let currCommentItem = commentList[i];
			if(id == currCommentItem.id) {
				index = i;
				break;
			}
		}
		this.canStarComment = false;
		wx.request({
			url: `${apiUrl}/Post/CommentLike?eventno=${eventNo}&id=${id}&like=${!isLike}`,
			method: "POST",
			header: {
				token: token
			},
			success: res => {
				let resData = res.data;
				if(resData.code == 0) {
					wx.showToast({
						icon: "success",
						title: isLike ? '已取消点赞' : '已点赞',
						duration: 1000,
						mask: true
					});
					this.setData({
						[`post.commentList[${index}].isLike`]: isLike ? false : true,
						[`post.commentList[${index}].like`]: isLike ? ((like - 1) < 0 ? 0 : --like) : ++like
					}, () => {
						this.canStarComment = true;
					});

					if(showCommentItem != null) {
						this.setData({
							"showCommentItem.isLike": isLike ? false : true,
							"showCommentItem.like": like
						});
					}

					let tempObj = Object.assign(this.postCommentLikedObj);
					tempObj[id] = isLike ? false : true;
					wx.setStorageSync('postCommentLikedObj', tempObj);
				} else {
					this.canStarComment = true;
					wx.showModal({
						title: "提示",
						content: resData.message,
						showCancel: false
					});
				}
			},
			fail: res => {
				this.canStarComment = true;
				wx.showModal({
					title: "提示",
					content: res.errMsg,
					showCancel: false
				});
			}
		});
	},
	tempComment: "",
	inputComment: function(e) {
		let val = e.detail.value;		
		this.tempComment = val;
	},
	submitComment: function() {
		var token = wx.getStorageSync('token');
		let { commentType } = this.data;
		if(this.tempComment == "") {
			wx.showModal({
				title: "提示",
				content: "请输入观点",
				showCancel: false
			});
			return false;
		}
		if(this.canPublishComment == false) {
			return false;
		}
		this.canPublishComment = false;
		if(commentType == "comment") {
			wx.request({
				url: `${apiUrl}/Post/Comment?eventno=${eventNo}&postid=${this.postId}&replyid=0&replyuser=0&replyusername=&content=${this.tempComment}`,
				method: "POST",
				header: {
					token: token
				},
				success: res => {
					let resData = res.data;
					let { id, photo, name, company } = this.data.profile;
					let post = this.data.post;
					let tempList = [...post.commentList];
					if(resData.code == 0) {
						let tempTime = new Date();
						let tempObj = {
							id: resData.data,
							postId: this.postId,
							socialId: id,
							socialName: name,
							socialPhoto: photo,
							socialCompany: company,
							content: this.tempComment,
							postTime: tempTime.toISOString().split("T")[0] + " " + tempTime.toTimeString().substr(0, 5),
							isLike: false,
							like: 0,
							replyId: 0,
							replySocialId: post.socialId,
							replyName: post.socialName,
							replyList: [],
						}
						tempList.push(tempObj);
						this.setData({
							"post.commentList": tempList,
							hideInputWin: true,
							commentInputVal: ""
						},() => {
							this.canPublishComment = true;
						});
						this.tempComment = "";
					} else {
						this.canPublishComment = true;
						wx.showModal({
							title: "提示",
							content: resData.message,
							showCancel: false
						});
					}
					
				},
				fail: res => {
					this.canPublishComment = true;
					wx.showModal({
						title: "提示",
						content: res.errMsg,
						showCancel: false
					});
				}
			});
		} else if(commentType == "reply") {
			var replyItemIndex = 0;
			let replyItemId = this.replyWho.id;
			let commentList = this.data.post.commentList;
			for(let i = 0, len = commentList.length; i < len; i++) {
				let currComment = commentList[i];
				if(currComment.id == replyItemId) {
					replyItemIndex = i;
					break;
				}
			}
			wx.request({
				url: `${apiUrl}/Post/Comment?eventno=${eventNo}&postid=${this.postId}&replyid=${this.replyWho.id}&replyuser=${this.replyWho.socialId}&replyusername=${this.replyWho.socialName}&content=${this.tempComment}`,
				method: "POST",
				header: {
					token: token
				},
				success: res => {
					let resData = res.data;
					let { id, photo, name, company } = this.data.profile;
					let originalReplyList = this.replyWho.replyList;
					let tempList = [...originalReplyList];
					if(resData.code == 0) {
						let tempTime = new Date();
						let tempObj = {
							id: resData.data,
							postId: this.postId,
							socialId: id,
							socialName: name,
							socialPhoto: photo,
							socialCompany: company,
							content: this.tempComment,
							postTime: tempTime.toISOString().split("T")[0] + " " + tempTime.toTimeString().substr(0, 5)
						}
						tempList.push(tempObj);
						this.setData({
							[`post.commentList[${replyItemIndex}].replyList`]: tempList,
							"showCommentItem.replyList": tempList,
							hideInputWin: true,
							commentInputVal: ""
						},() => {
							this.canPublishComment = true;
						});
						this.tempComment = "";
					} else {
						this.canPublishComment = true;
						wx.showModal({
							title: "提示",
							content: resData.message,
							showCancel: false
						});
					}
					
				},
				fail: res => {
					this.canPublishComment = true;
					wx.showModal({
						title: "提示",
						content: res.errMsg,
						showCancel: false
					});
				}
			});
		}
	},
	starPost: function(e) {
		var token = wx.getStorageSync('token');
		let { id, islike, likecount } = e.currentTarget.dataset;
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
					wx.showToast({
						icon: "success",
						title: islike ? '已取消点赞' : '已点赞',
						duration: 1000,
						mask: true
					});
					this.setData({
						"post.isLike": islike ? false : true,
						"post.likeCount": islike ? ((likecount - 1) < 0 ? 0 : --likecount) : ++likecount
					}, () => {
						this.canStarPost = true;
					});

					// https://developers.weixin.qq.com/community/develop/doc/00046eafb50cc0ae51c8a1b605b000
					var pages = getCurrentPages();
					if(pages.length > 1) {
						var prePage = pages[pages.length - 2];
						prePage.updateData("star", { starId: id, isLike: islike });
					}

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
	previewImg: function(e) {
		let { img } = e.currentTarget.dataset;
		wx.previewImage({
			urls: [img],
			success: res => {
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