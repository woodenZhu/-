var app = getApp();
Page({
  data: {
    kjMesg: '',
    kjTap: '',
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
    }
      // this.getKanjiaInfo();
      // this.joinKanjia();
      // this.kanjia();
  },
  onShow: function() {
    if(wx.getStorageSync('token') === this.data.option.token) {
      this.joinKanjia();
    }else {
      this.getItemInfo();
    }
    
  },
  goToIndex: function() {
    wx.reLaunch({
      url: "/pages/index/index"
    })
  },
  onShareAppMessage: function () {
    var that = this;
    return {
      title: '我发现一件好物，来帮我砍价吧~',
      path: '/pages/kanjia/kanjia?kjid='+that.data.option.kjid+'&token='+that.data.option.token+'&userInfo='+that.data.option.userInfo+'&goodsid='+that.data.option.goodsid+'&userid='+that.data.option.userid,
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
        that.getKanjiaInfo();
      }
    })
  },
  joinKanjia: function() {
    var that = this;
    wx.request({
      url: 'https://api.it120.cc/' + app.globalData.subDomain + '/shop/goods/kanjia/my',
      data: {
        kjid: that.data.option.kjid,
        token: wx.getStorageSync('token')
      },
      success: function(res) {
        if(res.data.code == 700) {
          wx.request({
            url: 'https://api.it120.cc/' + app.globalData.subDomain + '/shop/goods/kanjia/join',
            data: {
              kjid: that.data.option.kjid,
              token: wx.getStorageSync('token')
            },
            success: function(res) {
              this.getItemInfo();
            }
          })
        }
      }
    })
  },
  getKanjiaInfo: function() {
    var that = this;
    var sourceNickName = JSON.parse(that.data.option.userInfo).nickName;
    var currentNickName = wx.getStorageSync('userInfo').nickName;
    wx.request({
      url: 'https://api.it120.cc/' + app.globalData.subDomain + '/shop/goods/kanjia/info',
      data: {
        kjid: that.data.option.kjid,
        joiner: that.data.option.userid
      },
      success: function(res) {
        var helpers = res.data.data.helps;

        var currentNickName = wx.getStorageSync('userInfo').nickName;
        var kjMesg = '', kjTap = '';
        var originalPrice = that.data.itemInfo.originalPrice;
        var curPrice = res.data.data.kanjiaInfo.curPrice;
        var cutPrice = that.subtr(originalPrice, curPrice);
        wx.showModal({
          title: helpers.length.toString(),
          content: 'curPrice: ' + curPrice + ' and cutPrice: ' + cutPrice
        })
        for(var i = 0; i < helpers.length; i++){
          if(currentNickName == helpers[i].nick) {
            if(currentNickName == sourceNickName){
              kjMesg = '以当前价格购买';
              kjTap = 'kanjia';
            }else {
              kjMesg = '已帮好友砍' + helpers[i].cutPrice + '元';
            }
            break;
          }
        }
        if(i == helpers.length) {
          kjMesg = currentNickName == sourceNickName ? '自己砍一刀' : '帮好友砍一刀';
          kjTap = 'kanjia';
        }
        that.setData({
          kjMesg: kjMesg,
          kjTap: kjTap,
          currentPrice: res.data.data.kanjiaInfo.curPrice,
          cutPrice: cutPrice
        })
      }
    })
    
  },
  kanjia: function() {
    var that = this;
    var token = that.data.option.token;
    var kjid = that.data.kjid;
    var joinerUser = that.data.currentId;
    wx.request({
      url: 'https://api.it120.cc/' + app.globalData.subDomain + '/shop/goods/kanjia/help',
      data: {
        token: that.data.option.token,
        kjid: that.data.option.kjid,
        joinerUser: wx.getStorageSync('uid')
      },
      success: function(res) {
        wx.showModal({
          content: res.data.data.cutPrice.toString()
        })
        that.getKanjiaInfo()
      },
    })
  },
  goToPay: function() {
    console.log("goToPay");
  },
  subtr: function(arg1, arg2) {
    var r1,r2,m,n; 
    try{r1=arg1.toString().split(".")[1].length}catch(e){r1=0} 
    try{r2=arg2.toString().split(".")[1].length}catch(e){r2=0} 
    m=Math.pow(10,Math.max(r1,r2)); 
    n=(r1>=r2)?r1:r2; 
    return ((arg1*m-arg2*m)/m).toFixed(n); 
  }
})