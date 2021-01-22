// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
    // API 调用都保持和云函数当前所在环境一致
    env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()
const rp = require('request-promise');
const baseRewardUri = 'https://api.baking-bad.org/v2/rewards' //加上{baker_address}?cycle={cycle}
const baseFindBakerUri = 'https://api.tzkt.io/v1/rewards/delegators/' //加上 /delegator_address/cycle
var dict_data = null
var beautify_openid = null
var beautify_addresses = null

// 云函数入口函数
exports.main = async(event, context) => {
  try {
    var dict_addr = {}
    var  pattern =  /^[0-9a-z]+$/ 
    let obj_tezosInputAddresses = await this.fetchdb()
    var arr_formatted_addresses = []
    var tezosInputAddresses = obj_tezosInputAddresses.data
    for(var k = 0; k < tezosInputAddresses.length; k++){

      arr_formatted_addresses = []
      beautify_openid = JSON.stringify(tezosInputAddresses[k],["open_id"],2)
      beautify_openid = beautify_openid.split(":")[1].split("}")[0]
      beautify_openid = beautify_openid.split("\"")[1].replace(/,/g,"\n|\n");

      beautify_addresses = JSON.stringify(tezosInputAddresses[k],["subscribed_addresses"],2)
      beautify_addresses = beautify_addresses.split(":")[1].split("}")[0]
      beautify_addresses= beautify_addresses.match(/([^"\s]+)/g) //get rid of "\n"
      for(var i = 0; i < beautify_addresses.length; i++){
        if  (pattern.test(beautify_addresses[i])) { 
            arr_formatted_addresses.push(beautify_addresses[i]) 
        }
      }

      dict_addr[beautify_openid] = arr_formatted_addresses
      
    }
    return dict_addr

  } catch(e){
    console.error(e)
  }
}

exports.fetchdb = async() => {
  try {
    return await db.collection('xtz_subscription').get()
  } catch (e) {
    console.error(e)
  }
}

exports.writetodb = async() => {

}

