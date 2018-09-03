//index.js
//获取应用实例
var app = getApp()
Page({
  data: {
    kjlist: []
  },
  onLoad: function () {
    if(wx.getStorageSync('kjid')) {
      var kjStr = wx.getStorageSync('kjid');
      var kjlist = [];
      if(kjStr.indexOf('&') > -1) {
        var kjArr = kjStr.split('&');
        for(var i = 0; i < kjArr.length; i++) {
          var item = JSON.parse(wx.getStorageSync(kjArr[i]));
          var dateEnd = new Date(item.dateEnd);
          var dateNow = new Date();
          item.state = dateEnd.getTime() - dateNow.getTime() > 0 ? '进行中' : '已完成';
          kjlist.push(item);
        }
      }else {
        console.log("item")
        var item = JSON.parse(wx.getStorageSync(kjStr));
        console.log(item)
        var dateEnd = new Date(item.dateEnd);
        var dateNow = new Date();
        item.state = dateEnd.getTime() - dateNow.getTime() > 0 ? '进行中' : '已完成';
        kjlist.push(item)
      }
      this.setData({
        kjlist: kjlist
      })
    }
  },
  onShow : function () {

  },
  routeToKanjia: function(e) {
    var kjid = e.currentTarget.dataset.kjid;
    var goodsid = e.currentTarget.dataset.goodsid;
    var userid = wx.getStorageSync('uid');
    wx.navigateTo({
      url: '/pages/kanjia/kanjia?kjid='+kjid+'&goodsid='
        +goodsid+'&userid='+userid
    })
  },
  toIndexPage: function(){
    wx.reLaunch({
      url: "/pages/index/index"
    })
  }
})
