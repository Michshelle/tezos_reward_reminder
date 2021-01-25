var app = getApp();

Component({
  data: {
    selected: false,
    color: "#7A7E83",
    selectedColor: "#3cc51f",
    "list":[
      {
        "current": 0,
        "pagePath": "index",
      },
      {
        "current": 1,
        "pagePath": "index",
      },
      {
        "current": 2,
        "pagePath": "index",
      },
      {
        "current": 3,
        "pagePath": "index",
      }
    ]
  },
  attached() {
  },
  methods: {
    switchTab(e) {
      const data = e.currentTarget.dataset
      var url = data.path
      wx.switchTab({url})
      this.setData({
        selected: data.index,
      })
    },
    onCustomerServiceButtonClick(e) {
      console.log(e)
    },

    clientSendMsg() {
      var curPage = getCurrentPages()[0]
      curPage.methods.clientSendMessage();   
    },
    addAddress() {
      //允许订阅
      const templateId = 'pOwTOh7WrXA9ZNlGkmQtPEcZYzxk3SbdXkbVmQ0w03I'
      console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")
      wx.requestSubscribeMessage({
        tmplIds: [templateId],
        success: (res) => {
          if (res[templateId] === 'accept') {
            console.log("bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb")
          } else {
          }
        },
        fail: (err) => {
            console.log(err)
        },
      })
      var curPage = getCurrentPages()[0]
      curPage.setData({
        inputIsShowDel: false,
        inputIsShowAdd: true
      })
    },
    delAddress() {
      var curPage = getCurrentPages()[0]
      curPage.setData({
        inputIsShowDel: true,
        inputIsShowAdd: false
      })
    },

   
  }

})