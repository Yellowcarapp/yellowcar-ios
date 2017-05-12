var SNS_accessKeyId='AKIAIN2URYXXX6SN6OKA',
SNS_secretAccessKey='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',
ANDROID_ARN ='arn:aws:sns:us-west-2:554374353835:app/GCM/AiroCabPassenger',
IOS_ARN='arn:aws:sns:us-west-2:554374353835:app/APNS/AiroCabPassenger',
TOPICARN='arn:aws:sns:us-west-2:554374353835:AiroCabPassenger_'+Domain;

var SNS = new AWS.SNS({
    platform: 'SUPPORTED_PLATFORMS.ANDROID',
    region: 'us-west-2',
    apiVersion: '2010-03-31',
    accessKeyId: SNS_accessKeyId,
    secretAccessKey: SNS_secretAccessKey,
    platformApplicationArn: ANDROID_ARN,
});

function DeleteUser(EndpointArn,successFunc)
{
    var params = {
      EndpointArn: EndpointArn
    };
    SNS.deleteEndpoint(params, function(err, data) {
      if (err) console.log(err, err.stack); // an error occurred
      else     successFunc(data);           // successful response
    });
}
function AddUser(Android_ios,Token,successFunc)
{
    var params = {
        PlatformApplicationArn: (Android_ios =='Android' ) ? ANDROID_ARN : IOS_ARN  , /* required */
        Token: Token,
        CustomUserData: localStorage.uuid
    };
    SNS.createPlatformEndpoint(params, function(err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else     {  successFunc(data.EndpointArn); subToTopic(TOPICARN,data.EndpointArn,function(ss){});   }       // successful response
    });
}
function createTopic(topicName,successFunc)
{
    SNS.createTopic({Name:topicName},function(err,TopicARN){
        if(err)throw "Topic Create Erro::"+err;
        successFunc(TopicARN.TopicArn) ;
    });
}
function subToTopic(topicArn,endpointArn,successFunc)
{
    SNS.subscribe({Protocol: 'application',TopicArn: topicArn,Endpoint: endpointArn}, function(err, data) {
        if (err) console.log(err, err.stack);
        else     successFunc(data.SubscriptionArn);
    });
}
function subToTopic1(topicArn,endpointArn,i_index,successFunc,errorFunc)
{
    SNS.subscribe({Protocol: 'application',TopicArn: topicArn,Endpoint: endpointArn}, function(err, data) {
        if (err) errorFunc(err,i_index);
        else     successFunc(data.SubscriptionArn,i_index);
    });
}
function unsubFromTopic(subscriptionArn)
{
    SNS.unsubscribe({SubscriptionArn:subscriptionArn}, function(err, data) {
        if (err) console.log(err, err.stack);
        else     console.log(data);
    });
}
function pupToTopic(topicArn,mesBody,mesTitle,id,date)
{
    var container = {};   
    container['GCM'] = JSON.stringify({
        data: {title: mesTitle,message: mesBody,id:id,date:date}
    });
    container['default'] = JSON.stringify({data: {title: mesTitle,message: mesBody,id:id,date:date}});
    container['APNS'] = JSON.stringify({
        aps : { alert : {title : mesTitle,body : mesBody,id:id,date:date},badge : 0,sound: "default"}
    });
    SNS.publish({Message: JSON.stringify(container),TopicArn: topicArn,MessageStructure: 'json',/*TargetArn : topicArn1,*/},function(err, data){
        if (err)console.log(err, err.stack);
        else console.log(data);
    });
}
function pupToUser(){}