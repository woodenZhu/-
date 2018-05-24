var app = getApp();
Page({
  data: {
    kjid: '',
    userid: '',
    kjMesg: ''
  },

  onLoad: function(option) {
    var that = this;
    if(!wx.getStorageSync('token')) {
      wx.navigateTo({
        url: "/pages/authorize/authorize"
      })
    }else {
      wx.request({
        url: 'https://api.it120.cc/' + app.globalData.subDomain + '/shop/goods/kanjia/join',
        data: {
          kjid: option.kjid,
          token: wx.getStorageSync('token')
        },
        success: function(res) {
          console.log(res);
          that.setData({
            kjid: option.kjid,
            userid: res.data.data.uid,
          })
        }
      })
    }
  },
  onShow: function(option) {
    let that = this
    let userInfo = wx.getStorageSync('userInfo')
    if (!userInfo) {
      wx.navigateTo({
        url: "/pages/authorize/authorize"
      })
    } else {
      that.setData({
        userInfo: userInfo
      })
    }
  },
  goToIndex: function() {
    wx.reLaunch({
      url: "/pages/index/index"
    })
  },
  onShareAppMessage: function () {
    return {
      title: '我发现一件好物，来帮我砍价吧~',
      path: '/pages/kanjia/kanjia?kjid=' + this.data.kjid + '&token=' + wx.getStorageSync('token'),
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
})