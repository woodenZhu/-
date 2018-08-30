//index.js
//获取应用实例
var app = getApp()
Page({
  data: {
    remind: true,
    indicatorDots: true,
    autoplay: true,
    interval: 3000,
    duration: 1000,
    loadingHidden: false , // loading
    userInfo: {},
    swiperCurrent: 0,  
    selectCurrent:0,
    categories: [],
    activeCategoryId: 0,
    goods:[],
    scrollTop:"0",
    loadingMoreHidden:true,
    popupStatus: 'hide',

    hasNoCoupons:true,
    coupons: [],
    searchInput: '',
    tuijian: '',
  },

  //事件处理函数
  toDetailsTap:function(e){
    wx.navigateTo({
      url:"/pages/goods-details/goods-details?id="+e.currentTarget.dataset.id
    })
  },
  onLoad: function (option) {
    var that = this
    
    // wx.setNavigationBarTitle({
    //   title: wx.getStorageSync('mallName')
    // })
    that.setData({
      tuijian: wx.getStorageSync('tuijian')
    })
    /*
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function(userInfo){
      //更新数据
      that.setData({
        userInfo:userInfo
      })
    })
    */
    wx.request({
      url: 'https://api.it120.cc/'+ app.globalData.subDomain +'/shop/goods/category/all',
      success: function(res) {
        var categories = [{id:0, name:"全部"}];
        if (res.data.code == 0) {
          for (var i = 0; i < res.data.data.length; i++) {
            categories.push(res.data.data[i]);
          }
        }
        that.setData({
          categories:categories,
          activeCategoryId:0,
          remind: false
        });
        that.getGoodsList(0);
      }
    })
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
          goods:[],
          loadingMoreHidden:true
        });
        var goods = [];
        if (res.data.code != 0 || res.data.data.length == 0) {
          that.setData({
            loadingMoreHidden:false,
          });
          return;
        }
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
