var app = getApp();
Page({
  data: {
    kjMesg: '',
    currentId: '',
    sourceId: '',
    currentPrice: 0,
    cutPrice: 0,
    itemInfo: {}
  },

  onLoad: function(option) {
    this.setData({
      option: option,
      userInfo: JSON.parse(option.userInfo)
    })
    if(!wx.getStorageSync('token')) {
      wx.navigateTo({
        url: "/pages/authorize/authorize"
      })
    }else {
      this.getItemInfo();
      this.getKanjiaInfo();
      // this.joinKanjia();
      // this.kanjia();
    }
  },
  onShow: function() {
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
  getItemInfo: function() {
    var that = this;
    wx.request({
      url: 'https://api.it120.cc/' + app.globalData.subDomain + '/shop/goods/detail',
      data: {
        id: that.data.option.goodsid,
      },
      success: function(res) {
        that.setData({
          itemInfo: res.data.data.basicInfo
        })
      }
    })
  },
  joinKanjia: function() {
    var that = this;
    wx.request({
      url: 'https://api.it120.cc/' + app.globalData.subDomain + '/shop/goods/kanjia/join',
      data: {
        kjid: that.data.option.kjid,
        token: wx.getStorageSync('token')
      },
      success: function(res) {
        that.setData({
          currentId: res.data.data.uid,
          sourceId: that.data.option.userid ? that.data.option.userid : res.data.data.uid
        })
      }
    })
  },
  getKanjiaInfo: function() {
    var that = this;
    if(that.data.option.userid) {
      wx.request({
        url: 'https://api.it120.cc' + app.globalData.subDomain + '/shop/goods/kanjia/info',
        data: {
          kjid: that.data.option.kjid,
          joiner: that.data.option.userid
        },
        success: function(res) {
          console.log(res)
        }
      })
    }else {
      
    }
    
  },
  kanjia: function() {
    var that = this;
    var token = that.data.option.token;
    var kjid = that.data.kjid;
    var joinerUser = that.data.currentId;
    var sourceId = that.data.sourceId;
    wx.request({
      url: 'https://api.it120.cc/' + app.globalData.subDomain + '/shop/goods/kanjia/help',
      data: {
        token: token,
        kjid: kjid
      },
      success: function(res) {
        console.log(res)
        wx.request({
          url: 'https://api.it120.cc/' + app.globalData.subDomain + '/shop/goods/kanjia/info',
          data: {
            kjid: kjid,
            joiner: sourceId
          },
          success: function(res) {
            console.log(res)
          }
        })
      },
    })
  }
})