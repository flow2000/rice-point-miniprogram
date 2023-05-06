let App = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLogin: false,
    userInfo: {},
    currentCanteen: {},
    PIC_API: "",
    orderStatusMap: {
      "0": "待处理",
      "1": "已完成",
      "2": "处理失败",
      "3": "已取消"
    },
    orderList: [],
    dataType: -1,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let _this = this
    let isLogin = App.checkLogin()
    let order_type = wx.getStorageSync('order_type')

    _this.data.orderList = []
    _this.setData({
      isLogin: isLogin,
      PIC_API: wx.getStorageSync('PIC_API'),
      dataType: order_type,
      userInfo: wx.getStorageSync('user'),
      currentCanteen: wx.getStorageSync('currentCanteen')
    });
    if (isLogin) {
      _this.getOrderList();
    }
  },

  /**
   * 获取订单列表
   */
  getOrderList: function () {
    let _this = this;
    wx.pageScrollTo({
      scrollTop: 0
    });
    var userId = _this.data.userInfo.openId
    var status = _this.data.dataType == -1 ? "" : _this.data.dataType
    App.get('/order/list?pageNum=1&pageSize=100&userId=' + userId + "&status=" + status).then(res => {
      var orderList = []
      var tmp = {}
      res.rows.forEach(element => {
        tmp = element
        tmp.dishNumber = 0
        element.dishOrders.forEach(dish => {
          tmp.dishNumber += dish.number
        })
        orderList.push(tmp)
      })
      _this.setData({
        orderList: res.rows
      });
    })
  },

  /**
   * 取消订单
   */
  cancelOrder: function (e) {
    let _this = this;
    let order_id = e.currentTarget.dataset.id;
    wx.showModal({
      title: "提示",
      content: "确认取消订单？",
      success: function (o) {
        if (o.confirm) {
          App.put('/order/update', {
            orderId: order_id,
            status: "3"
          }).then(res => {
            _this.getOrderList();
          })
        }
      }
    });
  },

  /**
   * 确认收货
   */
  receipt: function (e) {
    let _this = this;
    let order_id = e.currentTarget.dataset.id;
    wx.showModal({
      title: "提示",
      content: "确认用餐完毕？",
      success: function (o) {
        if (o.confirm) {
          App.put('/order/update', {
            orderId: order_id,
            status: "1"
          }).then(res => {
            _this.getOrderList();
          })
        }
      }
    });
  },

  /**
   * 切换标签
   */
  bindHeaderTap: function (e) {
    this.setData({
      dataType: e.target.dataset.type
    });
    // 获取订单列表
    this.getOrderList();
  },

  /**
   * 发起付款
   */
  payOrder: function (e) {
    let _this = this;
    let order_id = _this.data.order_id;
    let pay_mode = e.currentTarget.dataset.pay_mode;
    _this.hideModal();
    // 显示loading
    wx.showLoading({
      title: '正在处理...',
    });
    App._post_form('user/order/pay', {
      order_id: order_id,
      pay_mode: pay_mode
    }, function (result) {
      if (result.code === -10) {
        App.showError(result.msg);
        return false;
      }
      // 发起微信支付
      if (pay_mode == 0) {
        wx.requestPayment({
          timeStamp: result.data.timeStamp,
          nonceStr: result.data.nonceStr,
          package: result.data.package,
          signType: 'MD5',
          paySign: result.data.paySign,
          success: function (res) {
            // 跳转到已付款订单
            wx.navigateTo({
              url: '/pages/order/detail?order_id=' + order_id
            });
          },
          fail: function () {
            App.showError('订单未支付');
          },
        });
      }
      // 发起余额支付
      if (pay_mode == 1) {
        // 跳转到已付款订单
        wx.navigateTo({
          url: '/pages/order/detail?order_id=' + order_id
        });
      }
    });
  },

  /**
   * 跳转订单详情页
   */
  detail: function (e) {
    let order_id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/order/detail?order_id=' + order_id
    });
  },

  onPullDownRefresh: function () {
    wx.stopPullDownRefresh();
  },

  //点击我显示底部弹出框
  clickme: function (e) {
    this.data.order_id = e.currentTarget.dataset.id;
    this.showModal();
  },

  //显示对话框
  showModal: function () {
    // 显示遮罩层
    var animation = wx.createAnimation({
      duration: 200,
      timingFunction: "linear",
      delay: 0
    })
    this.animation = animation
    animation.translateY(300).step()
    this.setData({
      animationData: animation.export(),
      showModalStatus: true
    })
    setTimeout(function () {
      animation.translateY(0).step()
      this.setData({
        animationData: animation.export()
      })
    }.bind(this), 200)
  },
  //隐藏对话框
  hideModal: function () {
    // 隐藏遮罩层
    var animation = wx.createAnimation({
      duration: 200,
      timingFunction: "linear",
      delay: 0
    })
    this.animation = animation
    animation.translateY(300).step()
    this.setData({
      animationData: animation.export(),
    })
    setTimeout(function () {
      animation.translateY(0).step()
      this.setData({
        animationData: animation.export(),
        showModalStatus: false
      })
    }.bind(this), 200)
  },
  /**
   * 跳转到登录页
   */
  onLogin() {
    let _this = this
    App.getUserInfo(function () {
      _this.onShow()
    })
  },

});