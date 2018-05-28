//index.js
//获取应用实例

var app = getApp()
Page({
  data: {
    page:1,
    pageSize:10000,
    keyword:'',
    loadingHidden: false, // loading
    userInfo: {},
    categories: [],
    goods: [],
    scrollTop: 0,
    loadingMoreHidden: false,
    hasNoCoupons: true,
    couponsTitlePicStr:'',
    coupons: [],
    networkStatus: true, //正常联网
    couponsStatus: 0,
    getCoupStatus: -1,
    kanJiaList: []
  },
  onShareAppMessage: function () {
    return {
      title: wx.getStorageSync('mallName') + '——' + app.globalData.shareProfile,
      path: '/pages/finder/finder',
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
  onShow: function () {
    var that = this;
    
  },
  onLoad: function () {
    var that = this

    that.getCouponsTitlePicStr();
    that.getCoupons();
    that.getKanjia();
  },
  getCouponsTitlePicStr: function () {
    var that = this;
    //  获取商城名称
    wx.request({
      url: 'https://api.it120.cc/' + app.globalData.subDomain + '/config/get-value',
      data: {
        key: 'couponsTitlePicStr'
      },
      success: function (res) {
        if (res.data.code == 0) {
          that.setData({
            couponsTitlePicStr: res.data.data.value
          })
        }
      },
    })
  },
  //事件处理函数
  getGoodsList: function (categoryId) {
    if (categoryId == 0) {
      categoryId = "";
    }
    var that = this;
    wx.request({
      url: 'https://api.it120.cc/' + app.globalData.subDomain + '/shop/goods/list',
      data: {
        page: that.data.page,
        pageSize: that.data.pageSize,
        categoryId: categoryId
      },
      success: function (res) {
        that.setData({
          goods: [],
          loadingMoreHidden: true
        });
        var goods = [];
        if (res.data.code != 0 || res.data.data.length == 0) {
          that.setData({
            loadingMoreHidden: false,
            prePageBtn: false,
            nextPageBtn: true,
            toBottom: true
          });
          return;
        }
        for (var i = 0; i < res.data.data.length; i++) {
          goods.push(res.data.data[i]);
        }
        for (let i = 0; i < goods.length; i++) {
          goods[i].starscore = (goods[i].numberGoodReputation / goods[i].numberOrders) * 5
          goods[i].starscore = Math.ceil(goods[i].starscore / 0.5) * 0.5
          goods[i].starpic = starscore.picStr(goods[i].starscore)
        }
      }
    })
  },
  getCoupons: function () {
    var that = this;
    wx.request({
      url: 'https://api.it120.cc/' + app.globalData.subDomain + '/discounts/coupons',
      data: {
        type: ''
      },
      success: function (res) {
        if (res.data.code == 0) {
          that.setData({
            hasNoCoupons: false,
            coupons: res.data.data,
            couponsStatus: 1
          });
          setTimeout(() => {
            that.setData({
              couponsStatus: -1
            })
          }, 1500)
        } else if (res.data.code == 700) {
          that.setData({
            hasNoCoupons: true,
            coupons: res.data.data,
            couponsStatus: 2
          });
          setTimeout(() => {
            that.setData({
              couponsStatus: -1
            })
          }, 1500)
        }
      },
      fail: function(res) {
        that.setData({
          networkStatus: false
        })
        setTimeout(() => {
          that.setData({
            networkStatus: true
          })
        }, 1500)
      }
    })
  },
  gitCoupon: function (e) {
    var that = this;
    var token = wx.getStorageSync('token');
    wx.request({
      url: 'https://api.it120.cc/' + app.globalData.subDomain + '/discounts/fetch',
      data: {
        id: e.currentTarget.dataset.id,
        token: token
      },
      success: function (res) {
        if (res.data.code == 20001 || res.data.code == 20002) {
          that.setData({
            getCoupStatus: 0
          })
          setTimeout(() => {
            that.setData({
              getCoupStatus: -1
            })
          }, 1500)
          return;
        }
        if (res.data.code == 20003) {
          that.setData({
            getCoupStatus: 2
          })
          setTimeout(() => {
            that.setData({
              getCoupStatus: -1
            })
          }, 1500)
          return;
        }
        if (res.data.code == 30001) {
          that.setData({
            getCoupStatus: 3
          })
          setTimeout(() => {
            that.setData({
              getCoupStatus: -1
            })
          }, 1500)
          return;
        }
        if (res.data.code == 20004) {
          that.setData({
            getCoupStatus: 4
          })
          setTimeout(() => {
            that.setData({
              getCoupStatus: -1
            })
          }, 1500)
          return;
        }
        if (res.data.code == 0) {
          that.setData({
            getCoupStatus: 1
          })
          setTimeout(() => {
            that.setData({
              getCoupStatus: -1
            })
          }, 1500)
        } else {
          wx.showModal({
            title: '错误',
            content: res.data.msg,
            showCancel: false,
            success: () => {
              wx.navigateTo({
                url: "/pages/authorize/authorize"
              })
            }
          })
        }
      }
    })
  },
  getKanjia() {
    var that = this;
    wx.request({
      url: 'https://api.it120.cc/'+ app.globalData.subDomain +'/shop/goods/kanjia/list',
      success: function(res) {
        var kanJiaList = [];
        for(var i = 0; i < res.data.data.result.length; i++) {
          var item = res.data.data.result[i];
          item.name = wx.getStorageSync(item.goodsId.toString());
          item.pic = wx.getStorageSync(item.goodsId + 'pic');
          kanJiaList.push(item);
        }
        that.setData({
          kanJiaList: kanJiaList
        })
      }
    })
  },
  goKanJia: function(e) {
    var kjid = e.currentTarget.dataset.kjid;
    var goodsid = e.currentTarget.dataset.goodsid
    if(!wx.getStorageSync('token')) {
      wx.navigateTo({
        url: "/pages/authorize/authorize"
      })
    }else {
      wx.request({
        url: 'https://api.it120.cc/' + app.globalData.subDomain + '/shop/goods/kanjia/join',
        data: {
          kjid: kjid,
          token: wx.getStorageSync('token')
        },
        success: function(res) {
          var token = wx.getStorageSync('token');
          var userInfo = JSON.stringify(wx.getStorageSync('userInfo'));
          var userid = res.data.data.uid;
          wx.navigateTo({
            url: '/pages/kanjia/kanjia?kjid='+kjid+'&token='+token+'&userInfo='+userInfo+'&goodsid='+goodsid+'&userid='+userid
          })
        }
      })
    }
  }
})
