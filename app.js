App({
  // 后台API
  RICE_API: "https://rice.panghai.top/prod-api/miniprogram",
  // 图片API
  PIC_API: "https://cdn.panghai.top/d/rice-point",
  // appid
  appid: "wxbf3900cf3c523624",
  // 启动方法
  onLaunch() {
    let _this = this
    wx.setStorageSync('RICE_API', this.RICE_API)
    wx.setStorageSync('PIC_API', this.PIC_API)
    wx.setStorageSync('appid', this.wxbf3900cf3c523624)
    _this.login()
  },

  // 登录
  login(callback) {
    let that = this;
    if (!this.checkLogin()) {
      wx.login({
        success(res) {
          if (res.code) {
            console.log("【请求登录】" + res.code)
            const data = {
              "code": res.code,
              "appid": that.appid
            }
            that.post_form('/user/login', data)
              .then(res => {
                if (res.code === 200) {
                  wx.setStorageSync('token', res.data.token)
                  wx.setStorageSync('appid', res.data.appid)
                  wx.setStorageSync('openid', res.data.openid)
                  wx.setStorageSync('user', res.data.user)
                  console.log("【" + that.getOpenId() + "】登录成功")
                  callback && callback();
                }
              }).catch(res => {
                console.log(res)
              })
          } else {
            console.error('登录失败！' + res.errMsg)
          }
        }
      })
    } else {
      console.log("【" + that.getOpenId() + "】已登陆")
    }
  },

  /**
   * 获取头像昵称
   */
  getUserInfo(callback) {
    let _this = this
    wx.getUserProfile({
      desc: '用于完善会员资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        wx.setStorageSync('userProfile', res)
        let data = {
          id: wx.getStorageSync('user').id,
          avatar: res.userInfo.avatarUrl,
          nickName: res.userInfo.nickName,
          country: res.userInfo.country,
          province: res.userInfo.province,
          city: res.userInfo.city,
          encryptedData: res.encryptedData
        }
        _this.put("/user", JSON.stringify(data)).then(res => {
          if (res.code == 200) {
            callback && callback();
          } else {
            console.log(res)
          }
        }).catch(res => {
          console.log(res)
        })
      },
      fail: res => {
        console.log(res)
      }
    })
  },

  // 检查登录状态
  checkLogin() {
    return wx.getStorageSync('user') != "" && wx.getStorageSync('userProfile') != "";
  },

  //检查授权状态
  checkAuth() {

  },

  // 封装get请求
  get(url, data) {
    return this.request(url, 'get', data, 'json')
  },
  //封装表单的post请求
  post_form(url, data) {
    return this.request(url, 'post', data, 'form')
  },
  //封装post请求
  post(url, data) {
    return this.request(url, 'post', data, 'json')
  },
  //封装delete请求
  delete(url, data) {
    return this.request(url, 'delete', data, 'json')
  },
  //封装put请求
  put(url, data) {
    return this.request(url, 'put', data, 'json')
  },
  //封装request请求
  request(url, method, data, type) {
    let that = this
    let headers = {}
    let token = wx.getStorageSync('token')
    if (type === "json") {
      headers['content-type'] = 'application/json'
    } else if (type === 'form') {
      headers['content-type'] = 'application/x-www-form-urlencoded'
    }
    if (token != undefined || token != "") {
      headers['Authorization'] = token
    }
    // 返回一个promise对象，可以使用xxx.get().then(res={})方式拿到响应数据
    return new Promise(function (resolve, reject) {
      wx.request({
        header: headers,
        url: that.RICE_API + url,
        method: method,
        data,
        success(res) {
          if (res.statusCode == 200) {
            resolve(res.data);
          } else {
            reject(res.data);
          }
        },
        fail(err) {
          reject(err)
        }
      })
    })
  },
  //获取用户openid
  getOpenId() {
    return wx.getStorageSync('openid');
  },
  //获取图片前缀
  getPicAPI() {
    return this.PIC_API
  },
  //判断从wxwx.getStorageSync('key')拿到的数据是否为空
  isEmpty(o) {
    return o != ""
  },
  /**
   * 显示成功提示框
   */
  showSuccess(msg, callback) {
    wx.showToast({
      title: msg,
      icon: 'success',
      success() {
        callback && (setTimeout(() => {
          callback();
        }, 1500));
      }
    });
  },

  /**
   * 显示失败提示框
   */
  showError(msg, callback) {
    wx.showModal({
      title: '友情提示',
      content: msg,
      showCancel: false,
      success(res) {
        callback && callback();
      }
    });
  },

  // 方法定义 lat,lng 
  // 调用 return的距离单位为km
  // GetDistance(10.0, 113.0, 12.0, 114.0)
  getDistance(lat1, lng1, lat2, lng2) {
    var radLat1 = lat1 * Math.PI / 180.0;
    var radLat2 = lat2 * Math.PI / 180.0;
    var a = radLat1 - radLat2;
    var b = lng1 * Math.PI / 180.0 - lng2 * Math.PI / 180.0;
    var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) +
      Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
    s = s * 6378.137; // EARTH_RADIUS;
    s = Math.round(s * 10000) / 10000;
    // console.log(lat1 + "," + lng1 + "和" + lat2 + "," + lng2 + "之间的距离是：" + s)
    return s;
  },

})