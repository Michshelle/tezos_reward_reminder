const app = getApp();
var inputVal = '';
var msgList = [];
var windowWidth = wx.getSystemInfoSync().windowWidth;
var windowHeight = wx.getSystemInfoSync().windowHeight;
var keyHeight = 0;

/**
 * 初始化数据
 */
function initData(that) {
  inputVal = '';

  msgList = [{
      speaker: 'server',
      contentType: 'text',
      content: '感谢使用tezos烘焙奖励提醒！'
    },
    {
      speaker: 'server',
      contentType: 'text',
      content: '请使用底部菜单进行操作'
    }
    
  ]
  that.setData({
    msgList,
    inputVal
  })
}

/**
 * 计算msg总高度
 */
 function calScrollHeight(that, keyHeight) {
   var query = wx.createSelectorQuery();
   query.select('.scrollMsg').boundingClientRect(function(rect) {
   }).exec();
 }



Page({

  /**
   * 页面的初始数据
   */
  data: {
    scrollHeight: '100vh',
    inputBottom: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
   if (!wx.cloud) {
     wx.redirectTo({
       url: '../chooseLib/chooseLib',
     })
   return
   }
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              this.setData({
                avatarUrl: res.userInfo.avatarUrl,
                userInfo: res.userInfo
              })
            }
          })
        }
      }
    })
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        //console.log('[云函数] [login] user openid: ', res.result.openid)
        app.globalData.openid = res.result.openid
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
      }
    })
    initData(this);
    this.setData({

    });

    //console.log('a');


  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 获取聚焦
   */
  focus: function(e) {
    keyHeight = e.detail.height;
    this.setData({
      scrollHeight: (windowHeight - keyHeight) + 'px'
    });
    this.setData({
      toView: 'msg-' + (msgList.length - 1),
      inputBottom: keyHeight + 'px'
    })
    //计算msg高度
    calScrollHeight(this, keyHeight);

  },

  //失去聚焦(软键盘消失)
  blur: function(e) {
    this.setData({
      scrollHeight: '100vh',
      inputBottom: 0
    })
    this.setData({
      toView: 'msg-' + (msgList.length - 1)
    })

  },
  /**
   * 点击符号发送
   */
  getInputVal: function(e){
    if(e.detail.value){
      this.setData({
        keyWord: e.detail.value
      })
    }
  },
  sendSymbol: function() {
    if(this.data.keyWord){
      msgList.push({
        speaker: 'customer',
        contentType: 'text',
        content: this.data.keyWord
      })
      inputVal = '';
      this.setData({
        msgList,
        inputVal
      });

    }
    this.methods.dbExecute(this.data.inputIsShowAdd,this.data.inputIsShowDel,this.data.keyWord)

  },

  /**
   * 发送点击监听
   */
  sendClick: function(e) {
    msgList.push({
      speaker: 'customer',
      contentType: 'text',
      content: e.detail.value
    })
    inputVal = '';
    this.setData({
      msgList,
      inputVal
    });
    this.methods.dbExecute(this.data.inputIsShowAdd,this.data.inputIsShowDel,e.detail.value)
  },
  clickDisappear: function() {
    this.setData({
      inputIsShowAdd: false,
      inputIsShowDel: false,
    })
  },

  /**
   * 退回上一页
   */
  toBackClick: function() {
    wx.navigateBack({})
  },
  
  methods: {
    clientSendMessage() {
      msgList.push({
        speaker: 'customer',
        contentType: 'text',
        content: "已订阅的tezos地址"
      })
      inputVal = '';
      var other = getCurrentPages()[0]
      other.setData({
        msgList,
        inputVal
      }); 
     const db = wx.cloud.database()
     db.collection('xtz_subscription').where({
       open_id: app.globalData.openid
     }).get({
       success: res => {
        var beautify_str_res = "您没有订阅的地址"
        if (res.data.length == 1){
          var str_res = JSON.stringify(res.data,["subscribed_addresses"],2)
          beautify_str_res = str_res.split(":")[1].split("}")[0]
          beautify_str_res = beautify_str_res.split("\"")[1].replace(/,/g,"\n|\n");
        }
        msgList.push({
          speaker: 'server',
          contentType: 'text',
          content: beautify_str_res
        })
        inputVal = '';
         other.setData({
          msgList,
          inputVal
         })
         console.log('[数据库] [查询记录] 成功: ', res)
       },
       fail: err => {
         wx.showToast({
           icon: 'none',
           title: '查询记录失败'
         })
         console.error('[数据库] [查询记录] 失败：', err)
       }
     })
    },

    dbExecute(add_bool, del_bool,str_content) {

      const db = wx.cloud.database()

      if(add_bool==true && del_bool==false){
        db.collection('xtz_subscription').where({
          open_id: app.globalData.openid
        }).update({
          data: {
            subscribed_addresses: str_content
          },
          success: res => {
            msgList.push({
              speaker: 'server',
              contentType: 'text',
              content: "添加成功！"
            })
            inputVal = '';
            var other = getCurrentPages()[0]
            other.setData({
             msgList,
             inputVal
            })
          },
          fail: err => {
            wx.showToast({
              icon: 'none',
              title: '查询记录失败'
            })
            console.error('[数据库] [查询记录] 失败：', err)
          }
        })
        
      }

      if(add_bool==false && del_bool==true){

      }


    },
  }

})

function sendingMessage() {
  msgList.push({
    speaker: 'customer',
    contentType: 'text',
    content: "已订阅地址"
  })
  inputVal = '';
  Page.setData({
    msgList,
    inputVal
  });

}