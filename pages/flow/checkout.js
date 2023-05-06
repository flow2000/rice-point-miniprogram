let App = getApp();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    nav_select: false, // 快捷导航
    address: null, // 默认收货地址
    exist_address: false, // 是否存在收货地址
    order: [{
      dishId: 1,
      url: "https://cdn.panghai.top/d/rice-point/upload/2021/11/25/ca875341-c031-4a34-93fc-ed399d876fa5.jpeg",
      dishName: "辣椒炒肉",
      price: 11,
      number: 2
    }], // 商品信息
    dishOrders: [],
    flavor_list: [{
        'name': '无味'
      },
      {
        'name': '有味'
      },
      {
        'name': '重口味'
      },
    ], //口味
    flavor: '', //选中值
    table: {
      table_name: '请选择餐桌/包间'
    }, //桌位详情
    shop: {
      tang_mode: 1
    }, //门店详情
    tpl: [], //模板消息
    arrive_time: '现在', //到店时间
    people: 0, //就餐人数
    ware_price: 0.00, //餐具调料费
    food_mode: 1, //点餐模式 1店内，2打包，3外卖，大于10000，扫码。
    pay_mode: 0, //支付模式 0微信，1余额
    disabled: false,
    hasError: false,
    error: '',
    order_total_price: 111, //总价
    order_total_num: 5, //总数
    activity_price: 0, //优惠金额
    order_pay_price: 111, //实付款
    ware_price: 0, //餐具调料费
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let order = wx.getStorageSync('order')
    let order_total_num = 0
    let order_total_price = 0
    let activity_price = 0
    for (let key in order) {
      var item = order[key]
      order_total_num += item.number
      order_total_price += item.number * item.price
      var tmp = {}
      tmp['dishId'] = item.dishId
      tmp['number'] = item.number
      tmp['price'] = item.price
      tmp['dishesType'] = item.dishesType
      tmp['typeId'] = item.typeId
      tmp['url'] = item.url
      this.data.dishOrders.push(tmp)
    }
    this.setData({
      order: order,
      order_total_num: order_total_num,
      order_total_price: order_total_price,
      activity_price: activity_price,
      order_pay_price: order_total_price - activity_price
    })

  },


  /**
   * 口味选项
   */
  flavor: function (e) {
    let _this = this,
      index = e.currentTarget.dataset.index,
      flavor_list = _this.data.flavor_list,
      flavor = '';
    flavor_list[index].checked = !flavor_list[index].checked;
    for (let n = 0; n < flavor_list.length; n++) {
      if (flavor_list[n].checked) {
        if (flavor == '') {
          flavor = flavor_list[n].name;
        } else {
          flavor = flavor + ',' + flavor_list[n].name;
        }
      }
    }
    _this.setData({
      flavor: flavor,
      flavor_list: flavor_list
    });
  },

  /**
   * 设置支付模式
   */
  setPay(e) {
    let _this = this;
    let pay_mode = e.currentTarget.dataset.pay_mode;
    _this.setData({
      pay_mode: pay_mode
    });
  },

  /**
   * 获取当前订单信息
   */
  getOrderData: function () {
    let _this = this;
    // 获取订单信息回调方法
    let callback = function (result) {
      if (result.code !== 200) {
        App.showError(result.msg);
        return false;
      }
      // 显示错误信息
      if (result.data.has_error) {
        _this.data.hasError = true;
        _this.data.error = result.data.error_msg;
        App.showError(_this.data.error);
      }
      _this.setData(result.data);
    };

    // 购物车结算
    App._get('order/cart', {
      food_mode: wx.getStorageSync('table'),
      location: wx.getStorageSync('location')
    }, function (result) {
      callback(result);
    });
  },

  /**
   * 选择收货地址
   */
  selectAddress: function () {
    wx.navigateTo({
      url: '../address/' + (this.data.exist_address ? 'index?from=flow' : 'create')
    });
  },

  /**
   * 订单提交
   */
  submitOrder: function (e) {
    let _this = this
    let userInfo = wx.getStorageSync('user')
    let currentCanteen = wx.getStorageSync('currentCanteen')
    let message = e.detail.value.message || ''
    let flavor = _this.data.flavor
    const userId = userInfo.openId
    const canteenId = currentCanteen.canteenId
    const deptId = currentCanteen.deptId
    const dishOrders = _this.data.dishOrders
    if (_this.data.disabled) {
      return false;
    }
    if (_this.data.hasError) {
      App.showError(_this.data.error);
      return false;
    }

    // 构造请求数据
    let order = {
      "userId": userId,
      "canteenId": canteenId,
      "deptId": deptId,
      "dishOrders": dishOrders
    }
    console.log(order)

    // 提交订单
    wx.showModal({
      title: '提交订单',
      content: '确认提交订单吗',
      success(res) {
        if (res.confirm) {
          console.log('用户点击确定')
          wx.showLoading({
            title: '加载中',
          })
          App.post("/order/add", JSON.stringify(order)).then(res => {
            wx.setStorageSync('mealNumber', res.data.mealNumber)
            wx.setStorageSync('pay_order', res.data)
            console.log(res)
            wx.hideLoading()
            wx.redirectTo({
              url: '../order/detail?order_id=' + res.data.orderId,
            });
          })
        } else if (res.cancel) {
          wx.navigateBack()
        }
      }
    })
    return

  },

});