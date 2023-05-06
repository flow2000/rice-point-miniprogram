let App = getApp(),
  wxParse = require("../../wxParse/wxParse.js");

Page({
  /**
   * 页面的初始数据
   */
  data: {
    PIC_API: App.getPicAPI(),
    dish: {}
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log(options)
    let _this = this;
    var goodsId = 1
    try {
      goodsId = options.goods_id
      wx.setStorageSync('selected_goods_id', goodsId)
    } catch (error) {
      goodsId = wx.getStorageSync('selected_goods_id')
    }
    // 获取商品信息 
    _this.getGoodsDetail(goodsId);
  },

  /** 
   * 获取商品信息
   */
  getGoodsDetail(goods_id) {
    let _this = this;
    console.log(goods_id)
    if (goods_id == "") {
      return
    }
    App.get('/dish/' + goods_id).then(res => {
      // 初始化商品详情数据
      _this.setData({
        dish: res.data
      });
    });
  },

})