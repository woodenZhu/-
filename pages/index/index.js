//index.js
//获取应用实例
var app = getApp()
Page({
  data: {
    remind: true,
    goods:[],
    searchInput: '',
  },

  //事件处理函数
  toDetailsTap:function(e){
    wx.navigateTo({
      url:"/pages/goods-details/goods-details?id="+e.currentTarget.dataset.id
    })
  },
  onLoad: function (option) {
    this.getGoodsList(0);
  },
  getGoodsList: function (categoryId) {
    if (categoryId == 0) {
      categoryId = "";
    }
    var that = this;
    wx.request({
      url: 'https://api.it120.cc/'+ app.globalData.subDomain +'/shop/goods/list',
      data: {
        categoryId: categoryId,
        nameLike: that.data.searchInput
      },
      success: function(res) {
        that.setData({
          remind: false,
          goods:[]
        });
        var goods = [];
        for(var i=0;i<res.data.data.length;i++){
          goods.push(res.data.data[i]);
          var itemId = res.data.data[i].id;
          var itemName = res.data.data[i].name;
          var itemPic = res.data.data[i].pic;
          wx.setStorageSync(itemId.toString(), itemName);
          wx.setStorageSync(itemId + 'pic', itemPic);
        }
        that.setData({
          goods:goods,
        });
      }
    })
  },
  onShareAppMessage: function () {
    return {
      title: wx.getStorageSync('mallName') + '——' + app.globalData.shareProfile,
      path: '/pages/index/index',
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  }
})
