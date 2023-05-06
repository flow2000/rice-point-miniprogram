let App = getApp();
Page({
  data: {
    canteenList: [],
    config: {},
    carouselMapList: [],
    currentCanteen: {},
    PIC_API: App.getPicAPI(),
  },
  onShow() {
    let that = this
    var currentCanteen = wx.getStorageSync('currentCanteen')
    if (currentCanteen == "") {
      this.getLatestLocation().then(res => {
        that.setData({
          currentCanteen: res
        })
      })
    } else {
      that.setData({
        currentCanteen: currentCanteen
      })
    }
    that.getConfig()
    that.getCarouselMap()
  },
  /**
   * 获取当前位置坐标
   */
  getLocation: function () {
    return new Promise(function (resolve, reject) {
      wx.getLocation({
        type: 'wgs84',
        isHighAccuracy: true,
        success: function (res) {
          resolve(res)
          wx.setStorageSync('location', res.longitude + ',' + res.latitude);
        },
        fail: function (res) {
          reject(res)
        }
      });
    })
  },

  // 获取食堂列表并存入缓存
  getLatestLocation() {
    let that = this
    return new Promise(function (resolve, reject) {
      that.getLocation().then(res => {
        console.log('【定位】', res.latitude + ',' + res.longitude)
        var lat1 = res.latitude
        var lng1 = res.longitude
        App.get('/canteen/list', null).then(res => {
          if (res.code == 200) {
            var list = []
            res.rows.forEach(element => {
              element.canteenUrl = element.canteenUrl.replace("/profile", "")
              list.push(element)
            })
            wx.setStorageSync('canteenList', list)
            var currentCanteen = that.getLatestLocationCanteen(lat1, lng1, list)
            resolve(currentCanteen)
          } else {
            reject(res)
          }
        })
      })
    })
  },

  // 循环遍历查找距离当前位置最近的食堂
  getLatestLocationCanteen(lat1, lng1, list) {
    var latestLocation = 999999
    let currentCanteen = {}
    list.forEach(element => {
      var tudes = element.tude.split(",")
      // console.log(element)
      if (tudes != null && tudes.length > 1) {
        // console.log(tudes)
        let lng2 = element.tude.split(",")[0]
        let lat2 = element.tude.split(",")[1]
        var l = App.getDistance(lat1, lng1, lat2, lng2)
        if (l < latestLocation) {
          latestLocation = l
          currentCanteen = element
        }
      }
    });
    wx.setStorageSync('currentCanteen', currentCanteen)
    return currentCanteen
  },

  // 获取小程序配置并存入缓存
  getConfig() {
    let that = this;
    if (wx.getStorageSync('config') == '') {
      App.get('/config/list?appId=' + App.appid, null).then(res => {
        if (res.code == 200) {
          res.rows.forEach(element => {
            if (element.appId == wx.getStorageSync('appid')) {
              wx.setStorageSync('config', element)
            }
          })
          that.setData({
            config: wx.getStorageSync('element')
          })
        }
      })
    } else {
      that.setData({
        config: wx.getStorageSync('config')
      })
    }
  },

  // 获取轮播图并存入缓存
  getCarouselMap() {
    let that = this;
    if (wx.getStorageSync('carouselMapList') == '') {
      App.get('/home/list?appId=' + App.appid, null).then(res => {
        if (res.code == 200) {
          var list = []
          res.rows.forEach(element => {
            element.img = element.img.replace("/profile", "")
            list.push(element)
          })
          wx.setStorageSync('carouselMapList', list)
          that.setData({
            carouselMapList: wx.getStorageSync('carouselMapList')
          })
        }
      })
    } else {
      that.setData({
        carouselMapList: wx.getStorageSync('carouselMapList')
      })
    }

  },
  /**
   * 多门店切换
   */
  goCanteen: function () {
    // 转跳指定的页面
    wx.navigateTo({
      url: '/pages/canteen/index'
    })
  },

  /**
   * 点餐
   */
  food: function (e) {
    let _this = this;
    if (_this.data.currentCanteen.status == 1) {
      App.showError('该门店歇业中');
      return false;
    }
    if (!App.checkLogin()) {
      App.getUserInfo(function(){
        wx.navigateTo({
          url: "/pages/canteen/food"
        });
      })
    } else {
      wx.navigateTo({
        url: "/pages/canteen/food"
      });
    }
  },

  ticket: function (e) {
    if (!App.checkLogin()) {
      App.getUserInfo(function(){
        wx.navigateTo({
          url: "/pages/user/ticket/ticket"
        });
      })
    } else {
      wx.navigateTo({
        url: "/pages/user/ticket/ticket"
      });
    }
  }

})