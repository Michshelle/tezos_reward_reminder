// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
    // API 调用都保持和云函数当前所在环境一致
    env: "xtz-maxrich"
})
const db = cloud.database()
//引入发送邮件的类库
var nodemailer = require('nodemailer')
// 创建一个SMTP客户端配置
const email_configuration = require('email_config.json');
// 创建一个SMTP客户端对象
var transporter = nodemailer.createTransport(email_configuration.email_config);
// 云函数入口函数
exports.main = async(event, context) => {
  let obj_emailContent = await this.fetch_messageDB()
  var email_str = ''
  var content_str = ''
  var arr_email = obj_emailContent.data
    // 创建一个邮件对象
    var mail = {
      // 发件人
      from: '"Tezzz" <michshell@michshell.net>',
      // 主题
      subject: '来自Tezos烘焙提醒',
      // 收件人
      to: '',
      // 邮件内容，text或者html格式
      text: '' 
    }

  for (var k=0; k<arr_email.length; k++){
    email_str = JSON.stringify(arr_email[k],["email_addr"],2)
    email_str = email_str.split(":")[1].split("}")[0]
    email_str= email_str.match(/([^"\s]+)/g) //get rid of "\n"
    mail['to'] = email_str
    console.log(mail['to'])

    content_str = JSON.stringify(arr_email[k],["arr_content"],2)
    mail['text'] = content_str.split(":")[1].split("}")[0]
    console.log(mail['to'])
    console.log(mail['text'])

    try{
      await transporter.sendMail(mail);
      await db.collection('xtz_subscription').where({
        email_addr: email_str,
        done: false
      }).update({
        done: true
      })
      mail['to'] = ''
      mail['text'] = ''
    }catch(e){
      return e
    }
  }

}

exports.fetch_messageDB = async() => {
  try {
    return await db.collection('xtz_messages').get()
  } catch (e) {
    console.error(e)
  }
}
