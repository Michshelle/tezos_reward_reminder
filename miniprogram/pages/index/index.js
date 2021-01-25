const app = getApp();
var inputVal = '';
var msgList = [];
var too_long_array = 0;
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
    inputBottom: 0,
    isEmail: true,
    inputIsShowAdd: false,
    inputIsShowAdd: false
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

        app.globalData.openid = res.result.openid
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
      }
    })
    initData(this);
    this.setData({

    });
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
 /**
  * 对话框的弹出确定
  */
 confirmOn: function(){
   if(this.methods.validateEmail(this.data.keyWord)){
     this.methods.dbExecuteEmail(this.data.keyWord)
   }else{
     console.log(app.globalData.openid + " WRONG email: " + this.data.keyWord)
   }
 },

  /**
  * 对话框的弹出取消
  */
  cancelOn: function(){
    console.log(app.globalData.openid + " 取消了email输入")
  },

  /**
   * 导航栏的send
   */
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
    if (this.methods.validateInput(this.data.keyWord) == true){
      this.methods.dbExecute(this.data.inputIsShowAdd,this.data.inputIsShowDel,this.data.keyWord)
    }else{
      msgList.push({
        speaker: 'server',
        contentType: 'text',
        content: "非法输入，添加不成功"
      })
      inputVal = '';
       this.setData({
        msgList,
        inputVal
       })
    }
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
    if(this.methods.validateInput(e.detail.value) == true){
      this.methods.dbExecute(this.data.inputIsShowAdd,this.data.inputIsShowDel,e.detail.value)
    }else{
      msgList.push({
        speaker: 'server',
        contentType: 'text',
        content: "非法输入，添加不成功"
      })
      inputVal = '';
       this.setData({
        msgList,
        inputVal
       })
    }
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
    validateEmail(str_email){
      const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      if  (re.test(str_email)) { 
        return  true 
      }  else  { 
        return  false 
      } 
    },
    validateInput(str_val) { 
      var  pattern =  /^[0-9a-zA-Z,]+$/ 
      if  (pattern.test(str_val) && str_val.length < 190) { 
        return  true 
      }  else  { 
        return  false 
      } 
   }, 
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
     var beautify_str_res = "您没有订阅邮件服务"
     db.collection('xtz_email_addr').where({
      open_id: app.globalData.openid
     }).get({
       success: res => {
         if (res.data.length == 0) {
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

         }else {
          db.collection('xtz_subscription').where({
            open_id: app.globalData.openid
          }).get({
            success: res => {   
             if (res.data.length == 1){
               beautify_str_res = JSON.stringify(res.data,["subscribed_addresses"],2)
               //beautify_str_res = str_res.split(":")[1].split("}")[0]
               //beautify_str_res = beautify_str_res.split("\"")[1].replace(/,/g,"\n|\n");
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
             }
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
         }


       },
       fail: err => {

       }
     })

    },

    dbExecuteEmail(str_email) {
      const db = wx.cloud.database()
      var other = getCurrentPages()[0]
      db.collection('xtz_email_addr').add({
        data: {
          open_id: app.globalData.openid,
          email_addr: str_email,
        },
        success: res => {

          msgList.push({
            speaker: 'server',
            contentType: 'text',
            content: "邮箱订阅成功，请添加"
          })
          inputVal = '';
           other.setData({
            msgList,
            inputVal,
            isEmail: true
           })
         },
         fail: err => {
           wx.showToast({
             icon: 'none',
             title: 'email存储失败'
           })
         }
      })


    },
    

    dbExecute(add_bool, del_bool,str_content) {
      const db = wx.cloud.database()
      var other = getCurrentPages()[0]
      var input_arr = str_content.split(",")

      if (input_arr.length < 6) {      
        db.collection('xtz_subscription').where({
        open_id: app.globalData.openid
      }).get({
        success: res => {
          if (res.data.length == 0 && add_bool==true && del_bool==false){
            db.collection('xtz_subscription').add({
              data: {
                open_id: app.globalData.openid,
                subscribed_addresses: str_content.split(","),
              },
              success: res => {
                msgList.push({
                  speaker: 'server',
                  contentType: 'text',
                  content: "添加新记录成功"
                })
                inputVal = '';
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
               }
            })

          }
          if (res.data.length == 1 && add_bool==true && del_bool==false){
            var orig_arr = res.data[0].subscribed_addresses
            for (var k=0; k<input_arr.length; k++){
                if (input_arr[k] != orig_arr){
                  if (orig_arr.length < 5) {
                    orig_arr.push(
                      input_arr[k],
                    ) 
                  } else { //数组添加大于了5个

                    too_long_array = 1;


                  }

                }

              } 
              if (too_long_array==0){
                db.collection('xtz_subscription').where({
                  open_id: app.globalData.openid
                }).update({
                  data: {
                    subscribed_addresses: orig_arr
                  },
                  success: res => {
                    msgList.push({
                      speaker: 'server',
                      contentType: 'text',
                      content: "添加成功！"
                    })
                    inputVal = '';
                    other.setData({
                     msgList,
                     inputVal
                    })
                    console.log('[数据库] [修改记录] 成功: ', res)
                  },
                  fail: err => {
                    wx.showToast({
                      icon: 'none',
                      title: '查询记录失败'
                    })
                    console.error('[数据库] [修改记录] 失败：', err)
                  }
                }) 
              } else {

                    too_long_array = 0
                    msgList.push({
                      speaker: 'server',
                      contentType: 'text',
                      content: "对不起，您最多只能添加五个不同地址"
                    })
                    inputVal = '';
                    other.setData({
                     msgList,
                     inputVal
                    })
              }             

          }

          if(res.data.length == 0 && add_bool==false && del_bool==true){
            msgList.push({
              speaker: 'server',
              contentType: 'text',
              content: "无法删除，您没有订阅地址！"
            })
            inputVal = '';
             other.setData({
              msgList,
              inputVal
             })
          }

          if(res.data.length == 1 && add_bool==false && del_bool==true){
            var orig_arr = res.data[0].subscribed_addresses
            var del_all = 0;
            var address_to_del = 0
            for (var k=0; k<input_arr.length; k++){
              if(orig_arr.indexOf(input_arr[k]) > -1){
                del_all = del_all + 1 
                address_to_del = 1
              }
            }
            if(del_all==orig_arr.length){
              db.collection("xtz_subscription").where({open_id: app.globalData.openid}).remove({
                success: res => {
                  msgList.push({
                    speaker: 'server',
                    contentType: 'text',
                    content: "已全部删除，目前已无订阅"
                  })
                  inputVal = '';
                   other.setData({
                    msgList,
                    inputVal
                   })
                 },
                 fail: err => {
                   wx.showToast({
                     icon: 'none',
                     title: '删除记录失败'
                   })
                 }
                })
            }

            if (address_to_del == 1 ){

              for (var k=0; k<input_arr.length; k++){
                if(orig_arr.indexOf(input_arr[k]) > -1){
                  orig_arr.splice(orig_arr.indexOf(input_arr[k]),1)
                }
              }
              db.collection('xtz_subscription').where({
                open_id: app.globalData.openid
              }).update({
                data: {
                  subscribed_addresses: orig_arr
                },
                success: res => {
                  msgList.push({
                    speaker: 'server',
                    contentType: 'text',
                    content: "删除地址成功！"
                  })
                  inputVal = '';
                  other.setData({
                   msgList,
                   inputVal
                  })
                  console.log('[数据库] [修改记录] 成功: ', res)
                },
                fail: err => {
                  wx.showToast({
                    icon: 'none',
                    title: '更新删除失败'
                  })
                  console.error('[数据库] [修改记录] 失败：', err)
                }
              }) 
              
              address_to_del = 0

            } else {

              msgList.push({
                speaker: 'server',
                contentType: 'text',
                content: "没有任何地址存在于已有列表"
              })
              inputVal = '';
              other.setData({
               msgList,
               inputVal
              })
            }
          }
          
        },
        fail: err => {
          wx.showToast({
            icon: 'none',
            title: '查询记录失败'
          })
          console.error('[数据库] [查询记录] 失败：', err)
        }
      })  

      } else {
        msgList.push({
          speaker: 'server',
          contentType: 'text',
          content: "对不起，您最多只能添加五个不同地址"
        })
        inputVal = '';
        other.setData({
         msgList,
         inputVal
        })
      }     
    }
 }

}) 
