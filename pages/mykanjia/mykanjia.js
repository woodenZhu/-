//index.js
//获取应用实例
var app = getApp()
Page({
  data: {
    kjlist: []
  },
  onLoad: function () {
    var kjStr = wx.getStorageSync('kjid');
    var kjArr = kjStr.split('&');
    var kjlist = [];
    for(var i = 0; i < kjArr.length; i++) {
      var item = JSON.parse(wx.getStorageSync(kjArr[i]));
      var dateEnd = new Date(item.dateEnd);
      var dateNow = new Date();
      item.state = dateEnd.getTime() - dateNow.getTime() > 0 ? '进行中' : '已完成';
      kjlist.push(item);
    }
    this.setData({
      kjlist: kjlist
    })
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
  }
})
