Page({
  data: {

  },

  onLoad: function() {
  },
  onShow: function() {
    let that = this
    let userInfo = wx.getStorageSync('userInfo')
    console.log(userInfo)
    if (!userInfo) {
      console.log("not login")
      wx.navigateTo({
        url: "/pages/authorize/authorize"
      })
    } else {
      console.log(login)
      that.setData({
        userInfo: userInfo
      })
    }
  }
})