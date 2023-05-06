let App = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    list: [
      {
        "activity_type": {
          "text":  "xxxxxxxx",
          "value": 10
        },
        "min_price": 50,
        "reduce_price": 5
      }
    ],
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getList();
  },

  /**
   * 获取优惠活动列表
   */
  getList: function (dataType) {
    let _this = this;
    // App._get('market.activity/lists', { dataType }, function (result) {
    //   _this.setData(result.data);
    // });
  },



});