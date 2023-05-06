const App = getApp();
Page({
  data: {
    canteenList: [],
    PIC_API: App.getPicAPI(),
  },

  onLoad(options) {
    this.setData({
      canteenList: wx.getStorageSync('canteenList')
    })
  },
  onReady() {

  },
  onShow() {

  },
  onHide() {

  },
  onUnload() {

  },
  onPullDownRefresh() {

  },

  onReachBottom() {

  },
  onShareAppMessage() {},
  /**
   * 门店歇业中
   */
  shopStop: function (e) {
    let that = this;
    let index = e.currentTarget.dataset.index;
    App.showError(that.data.canteenList[index].canteenName + ' - 歇业中');
    return false;
  },
  /**
   * 选择门店
   */
  shop: function (e) {
    let _this = this;
    let index = e.currentTarget.dataset.index;
    wx.setStorageSync('currentCanteen', _this.data.canteenList[index])
    wx.navigateBack(); //返回
  },
})