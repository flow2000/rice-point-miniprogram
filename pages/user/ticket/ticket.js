var App = getApp();
var math = require('../../../utils/math.min.js')
Page({
  data: {
    PIC_API: App.getPicAPI(),
    currentCanteen: wx.getStorageSync('currentCanteen'),
    classifySeleted: 0,
    dishTypeList: [],
    ticketList: {},
    dishTypeId: 0,
    dishOrder: {},
  },
  onLoad: function (options) {
    let _this = this;
    const currentCanteen = wx.getStorageSync('currentCanteen')
    _this.setData({
      currentCanteen: currentCanteen,
    });
    _this.getList(); //获取商品和分类
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  getList: function () {
    let that = this;
    that.getTicketList().then(res => {
      if (res.code == 200) {
        that.setTicket(res.rows)
      }
    })
  },

  getTicketList() {
    let that = this;
    return new Promise(function (resolve, reject) {
      App.get('/ticket/list', {
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
  setTicket(ticketList) {
    let that = this;
    // 处理菜品数据 
    const ticketObj = {}
    ticketList.forEach(element => {
      if (element.url == undefined) {
        console.log(element)
        console.log("url为空")
      }
      var tmpList = []
      element.selectedNumber = 0
      if (ticketObj[element.typeId] === undefined) {
        tmpList.push(element)
        ticketObj[element.typeId] = tmpList
        var tmp = {}
        tmp.category_id = element.typeId
        tmp.name = element.typeName
        that.data.dishTypeList.push(tmp)
      } else {
        tmpList = ticketObj[element.typeId]
        tmpList.push(element)
        ticketObj[element.typeId] = tmpList
      }
    })
    wx.setStorageSync('ticketList', ticketObj)
    that.setData({
      classifySeleted: 0,
      category: that.data.dishTypeList,
      goods: ticketObj,
      min_price: 0,
      order_total_num: 0,
      order_total_price: 0,
    });
    // console.log(ticketObj)
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

  // 投票
  add(e) {
    let _this = this;
    let ticketId = e.currentTarget.dataset.ticket_id
    let openId = wx.getStorageSync('user').openId
    console.log(ticketId)
    console.log(openId)
    App.post('/ticket', {
      ticketId: ticketId,
      openId: openId
    }).then(res => {
      if (res.code == 200) {
        App.showSuccess("投票成功")
        _this.getList();
      } else {
        App.showError(res.msg)
      }
    })
  },

});