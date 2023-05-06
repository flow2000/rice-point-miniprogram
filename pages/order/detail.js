let App = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    PIC_API: App.getPicAPI(),
    orderStatusMap: {
      "0": "待处理",
      "1": "已完成",
      "2": "处理失败",
      "3": "已取消"
    },
    orderId: 52,
    mealNumber: 0,
    currentCanteen: {
      canteenName: "八坡食堂"
    },
    orderStatus: "待处理",
    orderNumber: "12321",
    dishes: [{
      dishId: 53,
      dishName: "酿茄子",
      number: 2,
      price: 3.5,
      url: "/upload/2021/11/25/aee97e05-c9af-462f-8b24-3db67b263586.jpeg"
    }],
    total_price: 23,
    dishNumber: 0,
    orderTotalPrices: 0,
    activityPrice: 0,
    errorReason: "菜品无剩余"
  },

  /** 
   * 生命周期函数--监听页面加载
   */  
  onLoad: function (options) {
    var orderId = 1
    try {
      orderId = options.order_id
      wx.setStorageSync('selected_order_id', orderId)
    } catch (error) {
      orderId = wx.getStorageSync('selected_order_id')
    }  
    this.getOrderDetail(orderId);
  },

  /** 
   * 获取订单详情 
   */
  getOrderDetail: function (order_id) {
    let _this = this;
    let currentCanteen = wx.getStorageSync('currentCanteen')
    let dishes = []
    let dishNumber = 0
    let orderTotalPrices = 0
    // console.log(order_id)
    App.get('/order/' + order_id).then(res => {
      if (res.data != undefined) {
        console.log(res)
        res.data.dishOrders.forEach(element => {
          dishes.push(element)
          dishNumber += element.number
          orderTotalPrices += element.number * element.price
        })
        _this.setData({
          mealNumber: res.data.mealNumber,
          currentCanteen: currentCanteen,
          orderStatus: _this.data.orderStatusMap[res.data.status],
          orderNumber: res.data.orderCode,
          dishes: dishes,
          dishNumber: dishNumber,
          orderTotalPrices: orderTotalPrices
        })
      }

    })
  },

  /**
   * 跳转到商品详情
   */
  goodsDetail: function (e) {
    let goods_id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../goods/index?goods_id=' + goods_id
    });
  },
  /**
   * 拨打电话
   */
  phone: function (e) {
    wx.makePhoneCall({
      phoneNumber: e.currentTarget.dataset.phone
    })
  },

});