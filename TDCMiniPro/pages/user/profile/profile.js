const app = getApp();
var eventNo = app.globalData.eventNo;
var apiUrl = app.globalData.apiUrl;
var uploadUrl = app.globalData.uploadUrl;
Page({
	data: {
		profile: {
			photo: "",
			name: "",
			company: "",
			jobTitle: "",
			mobile: "",
			email: "",
			wechat: "",
			intro: ""
		}
	},
	canUpload: true,
	onLoad: function (options) {
		
	},
	onShow: function () {
		var token = wx.getStorageSync('token');
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
					let { photo, name, company, jobTitle, intro, contactList } = info;
					let tempMobile = contactList.filter(item => item.id == 1);
					let tempEmail = contactList.filter(item => item.id == 2);
					let tempWechat = contactList.filter(item => item.id == 3);
					let mobileVal = tempMobile[0] != undefined ? tempMobile[0].name : '未填写';
					let emailVal = tempEmail[0] != undefined ? tempEmail[0].name : '未填写';
					let wechatVal = tempWechat[0] != undefined ? tempWechat[0].name : '未填写';

					this.setData({
						"profile.photo": photo,
						"profile.name": name,
						"profile.company": company,
						"profile.jobTitle": jobTitle,
						"profile.mobile": mobileVal,
						"profile.email": emailVal,
						"profile.wechat": wechatVal,
						"profile.intro": intro
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
	changePhoto: function() {
		var token = wx.getStorageSync('token');
		if(this.canUpload == false) {
			return false;
		}
		if(this.canUpload) {
			wx.chooseImage({
				count: 1,
				sizeType: ['compressed'],
				  sourceType: ['album', 'camera'],
				success: res => {
					let temp = res.tempFilePaths[0];
					this.canUpload = false;
					wx.showLoading({
						title: '图片正在上传中',
						mask: true
					});
					wx.uploadFile({
						filePath: temp,
						name: 'profilePhoto',
						// name: 'file',
						formData: {
							"token": token,
						},
						url: `${uploadUrl}/uploadSocial/UserPhoto`,
						success: res => {
							let resData = JSON.parse(res.data);
							this.setData({
								"profile.photo": resData.Message,
							}, () => {
								this.canUpload = true;
								wx.hideLoading();
							});
						}
					});				
				},
				fail: res => {
					this.canUpload = true;
					// wx.showModal({
					// 	title: "提示",
					// 	content: res.errMsg,
					// 	showCancel: false
					// });
				}
			});
		}
	}
})