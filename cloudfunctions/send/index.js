// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env: 'xtz-maxrich'
})

const db = cloud.database()
const { templateId } = 'pOwTOh7WrXA9ZNlGkmQtPEcZYzxk3SbdXkbVmQ0w03I' //从订阅消息那里选择对应模板就可以拿到。

exports.main = async (event, context) => { 
  try {
        const xtz_reminder_message = await db.collection('xtz_messages')
        .where({
          done: false,
        }).get();
        var arr_xtz_messages = xtz_reminder_message.data

        console.log(arr_xtz_messages)
      
        const current_cycle_info = await db.collection('xtz_current_cycle').where({
          indexing: "current",
        }).get();
      
        const current_cycle = current_cycle_info.data[0]['current_cycle']
        console.log(current_cycle)
        var str_thing4 = null

        const result = await cloud.openapi.subscribeMessage.send({
          touser: 'okS_W5ORy536lzwG-nhqYlQvCwxA',
          templateId: 'pOwTOh7WrXA9ZNlGkmQtPEcZYzxk3SbdXkbVmQ0w03I',
          miniprogram_state: 'developer',
          page: 'pages/index/index',
          // 此处字段应修改为所申请模板所要求的字段
          data: {
            thing1: {
              value:'等等',
            },
            time2: {
              value:'2020-01-01 00:00',
            },
            thing4: {
              value:'哈哈',
            },
          }
        });

        return result
      
        //for (var k = 0; k < arr_xtz_messages.length; k++){
        //  for (var j = 0; j < arr_xtz_messages[k]["arr_content"][0].length; j++){
        //      var {open_id} = arr_xtz_messages[k]['open_id']
        //      str_thing4 = current_cycle + ' Cycle 应收到来自' + arr_xtz_messages[k]["arr_content"][1][j] + "的奖励tezos约 //"      +    arr_xtz_messages[k]["arr_content"][2][j].toFixed(2)
        //      console.log(arr_xtz_messages[k]["open_id"])
        //      await cloud.openapi.subscribeMessage.send({
        //        touser: 'okS_W5ORy536lzwG-nhqYlQvCwxA',
        //        templateId: templateId,
        //        miniprogram_state: 'developer',
        //        page: 'pages/index/index',
        //        // 此处字段应修改为所申请模板所要求的字段
        //        data: {
        //          thing1: {
        //            value: '等等',
        //          },
        //          time2: {
        //            value: '2020-01-01 00:00',
        //          },
        //          thing4: {
        //            value: '哈哈',
        //          },
        //        }
        //      });
        //      console.log("hahahhahaha")
        //    
        //  } 
        //  await db.collection('xtz_messages').where({
        //    open_id: xtz_reminder_message.data[k]["open_id"],
        //  }).update({
        //    data: {
        //      done: true,
        //    },
        //  });
        //}
  } catch (err)
  {
    return err
  }

}
