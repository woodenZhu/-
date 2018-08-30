var app = getApp();
Page({
  data: {
    kjMesg: '',
    kjTap: '',
    currentId: '',
    sourceId: '',
    currentPrice: 0,
    cutPrice: 0,
    itemInfo: {},
    kjEnd: false,
    popupStatus: 'hide',
    popupStatusImg: 'hide',
    showToast: false
  },

  onLoad: function(option) {
    var that = this;
    var optionObj = {};
    if(option.scene) {
      var sceneStr = decodeURIComponent(option.scene);
      var scenes = sceneStr.split(',');
      optionObj = {
        kjid: scenes[0],
        goodsid: scenes[1],
        userid: scenes[2]
      };
    }else {
      optionObj = option;
    }
    that.setData({
      option: optionObj
    })
    wx.request({
      url: 'https://api.it120.cc/'+ app.globalData.subDomain +'/shop/goods/kanjia/list',
      success: function(res) {
        var allItems = res.data.data.result;
        for(var i = 0; i < allItems.length; i++) {
          if(allItems[i].id == that.data.option.kjid) {
            var timestampNow = Date.parse(new Date());
            var timestampEnd = Date.parse(new Date(allItems[i].dateEnd));
            var countdown = timestampEnd / 1000 - timestampNow / 1000;
            that.setData({
              countdown: countdown > 0 ? countdown : 0,
              kjEnd: countdown == 0 ? true : false
            })
            break;
          }
        }
      }
    })
    if(!wx.getStorageSync('token')) {
      wx.navigateTo({
        url: "/pages/authorize/authorize"
      })
    }
  },
  onShow: function() {
    this.getItemInfo();
  },
  goToIndex: function() {
    wx.reLaunch({
      url: "/pages/index/index"
    })
  },
  onShareAppMessage: function () {
    var that = this;
    if(that.data.popupStatus == 'show') {
      that.setData({
        popupStatus: 'hide'
      })
    }
    return {
      title: '我发现一件好物，来帮我砍价吧~',
      path: '/pages/kanjia/kanjia?kjid='+that.data.option.kjid+'&goodsid='+that.data.option.goodsid+'&userid='+that.data.option.userid,
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
          itemInfo: res.data.data
        })
        that.getKanjiaInfo();
      }
    })

  },
  getKanjiaInfo: function() {
    var that = this;
    wx.request({
      url: 'https://api.it120.cc/' + app.globalData.subDomain + '/shop/goods/kanjia/info',
      data: {
        kjid: that.data.option.kjid,
        joiner: that.data.option.userid
      },
      success: function(res) {
        var currentNickName = wx.getStorageSync('userInfo').nickName;
        var sourceNickName = res.data.data.joiner.nick;
        var sourcePic = res.data.data.joiner.avatarUrl;
        var helpers = res.data.data.helps;
        var kjMesg = '', kjTap = '', invite = '', inviteTap = '';
        var curPrice = res.data.data.kanjiaInfo.curPrice;
        var cutPrice = 0;
        if(helpers.length == 1) {
          cutPrice = helpers[0].cutPrice;
        }else {
          for(var i = 0; i < helpers.length; i++) {
            cutPrice = that.addtr(cutPrice, helpers[i].cutPrice);
          }
        }
        var originalPrice = that.addtr(curPrice,cutPrice);
        for(var i = 0; i < helpers.length; i++){
          if(currentNickName == helpers[i].nick) {
            if(currentNickName == sourceNickName){
              invite = '邀请好友砍价';
              kjMesg = '以当前价格购买';
              kjTap = 'goToPay';
              inviteTap = 'inviteKanjia';
            }else {
              kjMesg = '已帮好友砍' + helpers[i].cutPrice + '元';
              kjTap = '';
              invite = '我也要砍价';
              inviteTap = 'goToKanjia';
            }
            break;
          }
        }
        if(i == helpers.length) {
          if(currentNickName == sourceNickName) {
            kjMesg = '自己砍一刀';
            kjTap = 'kanjia';
            invite = '邀请好友砍价';
            inviteTap = 'inviteKanjia';
          }else {
            kjMesg = '帮好友砍一刀';
            kjTap = 'kanjia';
            invite = '我也要砍价';
            inviteTap = 'goToKanjia';
          }
        }
        that.setData({
          invite: invite,
          inviteTap: inviteTap,
          kjMesg: kjMesg,
          kjTap: kjTap,
          sourceNickName: sourceNickName,
          sourcePic: sourcePic,
          minPrice: res.data.data.kanjiaInfo.minPrice,
          currentPrice: curPrice,
          cutPrice: cutPrice,
          helpers: helpers,
          originalPrice: originalPrice
        })
      }
    })
    
  },
  kanjia: function() {
    var that = this;
    wx.request({
      url: 'https://api.it120.cc/' + app.globalData.subDomain + '/shop/goods/kanjia/help',
      data: {
        token: wx.getStorageSync('token'),
        kjid: that.data.option.kjid,
        joinerUser: that.data.option.userid
      },
      success: function(res) {
        if(res.data.code == 30000) {
          wx.showModal({
            title: '提示',
            content: '暂无该砍价记录',
            showCancel: false
          })
        }else if(res.data.code == 30001) {
          wx.showModal({
            title: '提示',
            content: '已砍到底价',
            showCancel: false
          })
        }else if(res.data.code == 30002) {
          wx.showModal({
            title: '提示',
            content: '活动已结束',
            showCancel: false
          })
        }
        that.getKanjiaInfo()
      },
    })
  },
  goToPay: function() {
    var buyNowInfo = this.buliduBuyNowInfo();
    // 写入本地存储
    wx.setStorage({
      key:"buyNowInfo",
      data:buyNowInfo
    })

    wx.navigateTo({
      url: "/pages/to-pay-order/to-pay-order?orderType=buyNow&kjid=" + this.data.option.kjid
    })    
  },
  inviteKanjia: function() {
    this.setData({
      popupStatus: 'show'
    })
  },
  goToKanjia: function() {
    wx.reLaunch({
      url: "/pages/finder/finder"
    });
  },
  addtr: function(arg1, arg2) {
    var r1,r2,m,n; 
    try{r1=arg1.toString().split(".")[1].length}catch(e){r1=0} 
    try{r2=arg2.toString().split(".")[1].length}catch(e){r2=0} 
    m=Math.pow(10,Math.max(r1,r2)); 
    n=(r1>=r2)?r1:r2; 
    return ((arg1*m+arg2*m)/m).toFixed(n); 
  },
  endcount: function() {
    this.setData({
      kjEnd: true
    })
  },
  buliduBuyNowInfo: function () {
    
    var properties = this.data.itemInfo.properties;
    // var childsCurGoods = properties[0].childsCurGoods;
    // var propertyChildIds = properties[properties.length - 1].id + ':' + childsCurGoods[childsCurGoods.length - 1].id;
    // var propertyChildNames = properties[properties.length - 1].name + ':' + childsCurGoods[childsCurGoods.length - 1].name;
    var propertyChildIds = '';
    var propertyChildNames = '';
    var shopCarMap = {};
    shopCarMap.goodsId = this.data.itemInfo.basicInfo.id;
    shopCarMap.pic = this.data.itemInfo.basicInfo.pic;
    shopCarMap.name = this.data.itemInfo.basicInfo.name;
    shopCarMap.propertyChildIds = propertyChildIds;
    shopCarMap.label = propertyChildNames;
    shopCarMap.price = this.data.currentPrice;
    shopCarMap.score = 0;
    shopCarMap.left = "";
    shopCarMap.active = true;
    shopCarMap.number = 1;
    shopCarMap.logisticsType = this.data.itemInfo.basicInfo.logisticsId;
    shopCarMap.logistics = this.data.itemInfo.logistics;
    shopCarMap.weight = this.data.itemInfo.basicInfo.weight;

    var buyNowInfo = {};
    if (!buyNowInfo.shopNum) {
      buyNowInfo.shopNum = 0;
    }
    if (!buyNowInfo.shopList) {
      buyNowInfo.shopList = [];
    }
    buyNowInfo.shopList.push(shopCarMap);
    buyNowInfo.kjId = this.data.option.kjId;
    return buyNowInfo;
  },   
  closePopup: function() {
    this.setData({
      popupStatus: 'hide'
    })
  },
  createErweima: function() {
    var that = this;
    var kjid = that.data.option.kjid;
    var goodsid = that.data.option.goodsid;
    var userid = that.data.option.userid;
    var scene = kjid + ',' + goodsid + ',' + userid;
    wx.request({
      url: 'https://api.it120.cc/guoyz/qrcode/wxa/unlimit',
      data: {
        scene: scene,
        path: '/pages/finder/finder'
      },
      success: function(res) {
        that.setData({
          popupStatus: 'hide',
          popupStatusImg: 'show',
          srcErweima: res.data.data
        })
      },
      fail: function(res) {
        console.log(res);
      }
    })
  },
  saveImage: function() {
    var that = this;
    wx.getImageInfo({
      src: that.data.srcErweima,
      success: function(res) {
        wx.saveImageToPhotosAlbum({
          filePath: res.path,
          success: function(res) {
            that.setData({
              popupStatusImg: 'hide',
            })
          }
        })
      },
      fail: function(err) {
        console.log(err)
      }
    })
  }
})