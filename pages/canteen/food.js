var App = getApp();
var math = require('../../utils/math.min.js')
Page({
  data: {
    PIC_API: App.getPicAPI(),
    currentCanteen: wx.getStorageSync('currentCanteen'),
    classifySeleted: 0,
    dishTypeList: [],
    dishList: {},
    dishTypeId: 0,
    dishOrder: {},
  },

  onLoad: function (options) {
    let _this = this;
    const currentCanteen = wx.getStorageSync('currentCanteen')
    this.clearCar()
    _this.setData({
      currentCanteen: currentCanteen,
    });
    _this.getList(); //获取菜品
  },

  //清空购物车
  clearCar() {
    console.log("清空购物车成功")
    wx.removeStorage({
      key: 'order'
    })
  },

  getList: function () {
    let that = this;
    that.getDishList().then(res => {
      if (res.code == 200) {
        that.setDish(res.rows)
      }
    })
  },

  getDiashTypeList() {
    let that = this; 
    return new Promise(function (resolve, reject) {
      App.get('/type/list', {
        pageNum: 1,
        pageSize: 1000,
        deptId: that.data.currentCanteen.deptId
      }).then(result => {
        resolve(result)
      }).catch(result => {
        reject(result)
      })
    })
  },

  //获取菜品数据
  getDishList() {
    let that = this;
    return new Promise(function (resolve, reject) {
      App.get('/dish/list', {
        pageNum: 1,
        pageSize: 1000,
        deptId: that.data.currentCanteen.deptId
      }).then(result => {
        resolve(result)
      }).catch(result => {
        reject(result)
      })
    })
  },

  // 设置菜品数据
  setDish(dishList) {
    let that = this;
    // 处理菜品数据
    const dishObj = {}
    dishList.forEach(element => {
      if (element.url == undefined) {
        console.log(element)
      }
      var tmpList = []
      element.selectedNumber = 0
      if (dishObj[element.typeId] === undefined) {
        tmpList.push(element)
        dishObj[element.typeId] = tmpList
        var tmp = {}
        tmp.category_id = element.typeId
        tmp.name = element.dishesType
        that.data.dishTypeList.push(tmp)
      } else {
        tmpList = dishObj[element.typeId]
        tmpList.push(element)
        dishObj[element.typeId] = tmpList
      }
    })
    wx.setStorageSync('dishList', dishObj)
    that.setData({
      classifySeleted: 0,
      category: that.data.dishTypeList,
      goods: dishObj,
      min_price: 0,
      order_total_num: 0,
      order_total_price: 0,
    });
  },

  //转到订单页面
  gotoCart: function () {
    wx.navigateTo({
      url: '../flow/checkout'
    })
  },

  onGoodsScroll: function (e) {
    var _this = this;
    var scale = e.detail.scrollWidth / 550,
      scrollTop = e.detail.scrollTop / scale,
      h = 0,
      classifySeleted;
    _this.data.category.forEach(function (classify, i) {
      var _h = 70 + _this.data.goods[classify.category_id].length * (46 * 3 + 20 * 2);
      if (scrollTop >= h - 100 / scale) {
        classifySeleted = classify.category_id;
      }
      h += _h;
    });
    if (_this.data.classifySeletedTemp != classifySeleted) {
      _this.setData({
        classifySeleted: classifySeleted,
        classifySeletedTemp: classifySeleted
      });
    }
  },

  //点击左侧分类
  tapClassify: function (e) {
    var _this = this;
    var id = e.target.dataset.id;
    _this.setData({
      classifyViewed: id,
      classifySeleted: id.replace(/id/, "")
    });
  },

  // 减少菜品
  sub(e) {
    let dishId = e.currentTarget.dataset.dish_id
    let typeId = e.currentTarget.dataset.dish_type_id
    let index = e.currentTarget.dataset.index
    let price = this.data.goods[typeId][index].price
    let number = --this.data.goods[typeId][index].selectedNumber
    let order = wx.getStorageSync('order')
    var tmp = {}
    if (order == "") {
      order = {}
    }
    if (number === 0) {
      delete order[dishId]
    } else {
      tmp['dishId'] = dishId
      tmp['dishName'] = this.data.goods[typeId][index].dishesName
      tmp['typeId'] = typeId
      tmp['dishesType'] = this.data.goods[typeId][index].dishesType
      tmp['price'] = price
      tmp['number'] = number
      tmp['url'] = this.data.PIC_API + this.data.goods[typeId][index].url
      order[dishId] = tmp
    }
    wx.setStorageSync('order', order)
    let order_total_price = math.format(math.subtract(this.data.order_total_price, price), {
      precision: 14
    })
    this.setData({
      goods: this.data.goods,
      order_total_num: this.data.order_total_num - 1,
      order_total_price: order_total_price
    })
  },

  // 添加菜品
  add(e) {
    let dishId = e.currentTarget.dataset.dish_id
    let typeId = e.currentTarget.dataset.dish_type_id
    let index = e.currentTarget.dataset.index
    let price = this.data.goods[typeId][index].price
    let number = ++this.data.goods[typeId][index].selectedNumber
    let order = wx.getStorageSync('order')
    var tmp = {}
    if (order == "") {
      order = {}
    }
    tmp['dishId'] = dishId
    tmp['dishName'] = this.data.goods[typeId][index].dishesName
    tmp['typeId'] = typeId
    tmp['dishesType'] = this.data.goods[typeId][index].dishesType
    tmp['price'] = price
    tmp['number'] = number
    tmp['url'] = this.data.PIC_API + this.data.goods[typeId][index].url
    order[dishId] = tmp
    wx.setStorageSync('order', order)
    let order_total_price = math.format(math.add(this.data.order_total_price, price), {
      precision: 14
    })
    this.setData({
      goods: this.data.goods,
      order_total_num: this.data.order_total_num + 1,
      order_total_price: order_total_price
    })
  },

});