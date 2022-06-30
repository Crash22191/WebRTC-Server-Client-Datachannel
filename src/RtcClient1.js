const { getOffer, onCandidate, Rtcpc } = require("./common");
const {
    RTCIceCandidate,
    RTCSessionDescription,
    RTCPeerConnection
  } = require('wrtc'); 
async function ClientRecieveOffer(pc, ws) {
    try {
        console.log("waiting for offer");
        const offer = await getOffer(ws);
        console.log("recieved offer");
        await pc.setRemoteDescription(offer);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        await ws.send(JSON.stringify(answer));
        console.log("sendt reply");
    } catch (error) {
        console.error(error.stack || error.message || error);
        ws.close();
    }
}

/**
 * Creates the client side.
 */
module.exports.RTCClient1 = class RTCClient1 {
    /**
     * Creates the client side.
     * @param {RTCConfiguration} config
     * @param {[config]} datachannels
     */
    constructor(url, config, datachannels, capId) { 
        console.log("rtc client 1 constructor start")
        this.capId = capId;
        this.serverUrl = url;
        this.config = config; 
        this.datachannels = datachannels; 
        this.queuedCandidates = [];
        this.pc = new RTCPeerConnection(this.config);
        this.openPromises = [];
        this.datachannels.forEach(element => {
            id++;
            element.config.id=id;
            element.config.negotiated=true;
            element.onOpenResolve = () => { };
            element.onOpenReject = () => { };
            element.onOpenPromise = new Promise((resolve, reject) => {
              element.onOpenResolve = resolve;
              element.onOpenReject = reject;
            });
            this.openPromises.push(element.onOpenPromise);
            this[element.label] = this.pc.createDataChannel(element.label, element.config);
            this[element.label].onopen = element.onOpenResolve;
          });
          console.log("rtc client 1 constructor end")
    }

    /**
     * Waits for server to send candidate, handshakes, and awaits all datachannels to become active.
     */
    async  sendQuery( url, body ) {
        let bodyJson = JSON.stringify( body )
        return await $.ajax({
          url: url,
          type: 'POST',
          dataType: 'json',
          data: bodyJson
        });
      };
      
      async openChannel() { 
        console.log("open channel call")
        const offer = await initializePeerConnection();   
        console.log("generated offer ")
        console.log(offer)
        let rsp = null;
        try { 
            console.log("make connect request")
            rsp = await sendQuery( serverUrl + '/connect&stream='+ this.capId, offer );
            console.log( rsp );  
        } catch( error ) {
            console.log( error );
        }   
          if(rsp !== null && rsp.code == 200 && rsp.answer){ 
            try { 
                await this.pc.setLocalDescription(offer); 
                await this.pc.setRemoteDescription(rsp.answer);
            }
            catch( error ) { 
                console.log(error)
            }            
        }
        else{
            console.log()
        }
        return
      }
      async initializePeerConnection() {
        console.log("initializePeerConnection()")

        // const config = { iceServers: [{ urls: [ 'stun:stun1.l.google.com:19302' ] } ] };
      
        const options = {
          offerToReceiveAudio: 0,
          offerToReceiveVideo: 0,
          iceRestart: 0,
          voiceActivityDetection: 0
        };
        const offer = await this.pc.createOffer( options );
      
        this.pc.onicecandidate = ({ candidate }) => {  
            console.log(this.pc.onicecandidate)
            //fired after description has been set 
            if (candidate) {  
                try{
                   sendQuery( serverUrl + '/ice?stream='+ this.capId, offer ).then((rsp)=>{

                    if(rsp !== null && rsp.code == 200 && rsp.candidate){  
                        console.log("got a candidate");
                        if (!this.pc.remoteDescription) {
                            this.queuedCandidates.push(candidate);
                            return;
                        }
                        this.pc.addIceCandidate(candidate);               
                    }
                    }).catch((e)=>{ 
                        console.log('error sending query')
                        console.log(e)
                    })

                }catch(error){
                    console.log('error setting ice candidate')
                    console.log(error)
                }
            }else{
                console.log("onicecandidate empty")
            }
          };
      
        this.pc.oniceconnectionstatechange = () => {
          console.log('peerConnection::iceconnectionstatechange newState=', this.pc.iceConnectionState);
          // If ICE state is disconnected stop
          if (peerConnection.iceConnectionState === 'disconnected') {
            //alert('Connection has been closed stopping...');
            console.log('connection disconnected')
          }
        };
        return offer;
      };
}