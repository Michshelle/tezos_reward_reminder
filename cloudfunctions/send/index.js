// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const { templateId } = 'pOwTOh7WrXA9ZNlGkmQtPEcZYzxk3SbdXkbVmQ0w03I' //从订阅消息那里选择对应模板就可以拿到。
// 云函数入口函数
exports.main = async (event, context) => {

  const db = cloud.database();

  try {
    // 从云开发数据库中查询等待发送的消息列表
    const _ = db.command
    const xtz_reminder_message = await db
      .collection('xtz_reminder_messages')
      // 查询条件这里做了简化，只查找了状态为未发送的消息
      // 在真正的生产环境，可以根据开课日期等条件筛选应该发送哪些消息
      .where({
       is_done: false,
        entry_time: _.lt(Date.parse(new Date()))
      })
      .get();
    console.log(xtz_reminder_message, Date.parse(new Date()))
    // 循环消息列表
    const sendPromises = xtz_reminder_message.data.map(async message => {
      try {
        // 发送订阅消息
        await cloud.openapi.subscribeMessage.send({
          touser: message.user_open_id,
          page: "pages/reminderTemplate/reminderTemplate",
          templateId: templateId,
          data: message.data     
        });
        // 发送成功后将消息的状态改为已发送
        console.log(" 发送成功后将消息的状态改为已发送")
        return db
          .collection('xtz_reminder_messages')
          .doc(message._id)
          .update({
            data: {
              done: true,
            },
          });
      } catch (e) {
        return e;
      }
    });

    return Promise.all(sendPromises);
  } catch (err) {
    console.log(err);
    return err;
  }
};