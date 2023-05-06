const App = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLogin: false,
    RICE_API: "",
    userProfile: {
      userInfo: {
        avatarUrl: "../../images/default-avatar.png",
        nickName: "微信用户",
      }
    },
    userInfo: {},
    orderCount: {
      "tang": 1,
      "bao": 2,
      "wai": 3,
      "activity": 4,
    },
    copyright: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    let isLogin = App.checkLogin()
    this.setData({
      isLogin: isLogin,
      PIC_API: wx.getStorageSync('PIC_API'),
      userProfile: wx.getStorageSync('userProfile'),
      copyright: "",
    });
  },

  /**
   * 获取当前用户信息
   */
  onLogin() {
    let _this = this
    App.getUserInfo(function () {
      _this.onShow()
    })
  },

  /**
   * 拨打电话
   */
  callMe() {
    let config = wx.getStorageSync('config')
    if (config.phone == undefined) {
      App.showError('商家没有留电话号码');
    } else {
      wx.makePhoneCall({
        phoneNumber: 12314
      })
    }
  },

  /**
   * 订单导航跳转
   */
  onTargetOrder(e) {
    console.log(e.currentTarget.dataset.type)
    wx.setStorageSync('order_type', e.currentTarget.dataset.type);
    // 转跳指定的页面
    wx.switchTab({
      url: '/pages/order/index'
    })
  },

  /**
   * 菜单列表导航跳转
   */
  onTargetMenus(e) {
    let _this = this;
    wx.navigateTo({
      url: '/pages/' + e.currentTarget.dataset.url
    })
  },

  /**
   * 验证是否已登录
   */
  onCheckLogin() {
    let _this = this;
    if (!_this.data.isLogin) {
      App.showError('很抱歉，您还没有登录');
      return false;
    }
    return true;
  },


})