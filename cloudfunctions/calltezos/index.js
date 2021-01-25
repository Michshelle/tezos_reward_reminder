// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
    // API 调用都保持和云函数当前所在环境一致
    env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()
const rp = require('request-promise');
const baseCycleUri = 'https://api.tzstats.com/explorer/cycle/head' //目前的cycle
const baseRewardUri = 'https://api.baking-bad.org/v2/rewards' //加上{baker_address}?cycle={cycle}
const baseFindBakerUri = 'https://api.tzkt.io/v1/rewards/delegators' //加上 /delegator_address/cycle
var find_baker_info = null
var find_rewards_info = null
var current_cycle_info = null
var beautify_openid = null
var beautify_addresses = null
var str_baker_url = null
var db_current_cycle_info = null
var db_current_cycle = null
var current_cycle = null
var current_reward_cycle = null
var find_baker_data = null
var find_rewards_info = null
var find_rewards_url = null
var arr_payouts = []
var JSONitem = {}


// 云函数入口函数
exports.main = async(event, context) => {
  console.log(event)
  try {
    var dict_addr = {}
    var dict_final_info = {}
    var arr_final_content=[] //0: for input addresses, 1: for baker addresses, 2: for reward amount
    var  pattern =  /^[0-9a-zA-Z]+$/ 
    let obj_tezosInputAddresses = await this.fetch_subscriptionDB()
    var arr_formatted_addresses = [] 
    var arr_formatted_input = []
    var arr_formatted_bakers = []
    var arr_formatted_rewards = []
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
      arr_formatted_addresses = []

    }
    db_current_cycle_info = await this.fetch_cycleDB()
    db_current_cycle = db_current_cycle_info.data[0].current_cycle
    current_cycle_info = await rp(baseCycleUri)
    .then(function (res) {
      return JSON.parse(res)
    })
    .catch(function (err) {
      return '请求cycle失败'
    });
    current_cycle = current_cycle_info['cycle']
    current_reward_cycle = current_cycle - 6

    if (current_cycle > db_current_cycle) {
      for (var key in dict_addr){
        for (var s = 0;  s < dict_addr[key].length; s++){     
          arr_payouts = []   
          find_baker_url = baseFindBakerUri + "/" + dict_addr[key][s] + "/" + current_reward_cycle
          find_baker_info = await rp(find_baker_url)  //set timeout to 20s
          .then(function(res) {
            return JSON.parse(res)
          })
          .catch(function (err){
            return err
          });
          find_baker_data = find_baker_info['baker']['address']
          find_rewards_url = baseRewardUri + "/" + find_baker_data + "?" + "cycle=" + current_reward_cycle
          arr_formatted_bakers.push(find_baker_data)
          find_rewards_info = await rp(find_rewards_url)  
          .then(function(res){
            return JSON.parse(res)
          })
          .catch(function(err){
            return err
          });
          arr_payouts = find_rewards_info.payouts
          find_rewards_data = 0
          for (var t = 0; t < arr_payouts.length; t++){
            if (arr_payouts[t].address == dict_addr[key][s]){
              find_rewards_data = arr_payouts[t].amount
              break
            }else{         
              continue
            }
          }
          arr_formatted_rewards.push(find_rewards_data)
        }
        arr_formatted_input = dict_addr[key]
        arr_final_content.push(arr_formatted_input)
        arr_final_content.push(arr_formatted_bakers)
        arr_final_content.push(arr_formatted_rewards)
        dict_final_info[key] = arr_final_content
        arr_final_content = []
        arr_formatted_input = []
        arr_formatted_bakers = []
        arr_formatted_rewards = []
        
      }

      for (var ind in dict_final_info){
        await this.write_to_messageQueueDB(current_cycle,current_reward_cycle,ind, dict_final_info[ind])
      }

      await this.write_to_currentCycleDB(current_cycle,current_reward_cycle)
      console.log("tezos data crawl and db udpate done")

    }else{
      return 0
    }
  } catch(e){
    console.error(e)
  }
}

exports.fetch_subscriptionDB = async() => {
  try {
    return await db.collection('xtz_subscription').get()
  } catch (e) {
    console.error(e)
  }
}

exports.fetch_cycleDB = async() => {
  try {
    return await db.collection('xtz_current_cycle').where({
      indexing: "current"
    }).get()
  } catch (e) {
    console.error(e)
  }
}



exports.write_to_currentCycleDB = async(current_cycle,current_reward_cycle) => {
  try {
    return await db.collection('xtz_current_cycle').where({
      indexing: "current"
    }).update({
      data: {
        current_cycle: current_cycle,
        current_reward_cycle: current_reward_cycle,
        update_time: db.serverDate(),
      },
      success: res => {
        console.log('[xtz_current_cycle数据库] [修改记录] 成功: ', res)
      },
      fail: err => {

        console.error('[数据库] [xtz_current_cycle修改记录] 失败：', err)
      }
    }) 
  } catch (e) {
    console.error(e)
  }
}

exports.write_to_messageQueueDB = async(current_cycle,current_reward_cycle,key,dict_final_info) => {
  try {
    return await db.collection('xtz_messages').add({
      data: {
        current_cycle: current_cycle,
        current_reward_cycle: current_reward_cycle,
        update_time: db.serverDate(),
        open_id: key,
        arr_content: dict_final_info,
        done: false
      },
      success: res => {
        console.log('[xtz_current_cycle数据库] [修改记录] 成功: ', res)
      },
      fail: err => {
        console.error('[数据库] [xtz_current_cycle修改记录] 失败：', err)
      }
    }) 
  } catch (e) {
    console.error(e)
  }
}
