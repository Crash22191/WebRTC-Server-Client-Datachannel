const {
    RTCIceCandidate,
    RTCSessionDescription,
    RTCPeerConnection
  } = require('wrtc'); 
  const axios = require('axios').default;

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
        this.capId = capId;
        this.serverUrl = url;
        this.config = config; 
        this.datachannels = datachannels; 
        this.queuedCandidates = []; 
        this.pc = new RTCPeerConnection(this.config);
        this.openPromises = []; 
        let id=0;
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
    }

    /**
     * Waits for server to send candidate, handshakes, and awaits all datachannels to become active.
     */
    async sendQuery( url, body ) {
        let bodyJson = JSON.stringify( body )
        return await axios({
            url: url,
            type: 'POST',
            dataType: 'json',
            data: bodyJson
        })
      };
      
      async openChannel() { 
        console.log("open channel call")
        const offer = await this.initializePeerConnection();    
        // console.log("set description 1 ")
        // await this.pc.setLocalDescription(new RTCSessionDescription(offer)); 
        // console.log(this.pc.localDescription) 
        // console.log("set description 2 ")
        await this.pc.setLocalDescription(offer); 
        console.log(this.pc.localDescription)
        // console.log("generated offer ")
        // console.log(offer)
        // let rsp = null;
        // try { 
        //     console.log("make connect request")
        //     rsp = await this.sendQuery(( this.serverUrl + '/connect&stream='+ this.capId), offer );
        //     console.log( rsp );  
        // } catch( error ) {
        //     console.log( error );
        // }   
        //   if(rsp !== null && rsp.code == 200 && rsp.answer){ 
        //     try { 
        //         await this.pc.setRemoteDescription(rsp.answer);
        //     }
        //     catch( error ) { 
        //         console.log(error)
        //     }            
        // }
        // else{
        //     console.log()
        // }
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
        // const offer = await this.pc.createOffer( options );
       
        this.pc.createOffer(options).then(sdp => this.pc.setLocalDescription(sdp)).then(() => {
      
            console.log("set local description done sdp var")
            let sdpVariable = this.pc.localDescription.sdp;
            console.log(sdpVariable) 
        });

        this.pc.onicecandidate = ({ candidate }) => {   
            console.log("received ice candidate")
            console.log(candidate)
            console.log("sdp ice candidate")
            console.log(this.pc.localDescription.sdp)
            //fired after description has been set 
            // if (candidate) {  
            //     try{
            //        this.sendQuery( this.serverUrl + '/ice?stream='+ this.capId, offer ).then((rsp)=>{

            //         if(rsp !== null && rsp.code == 200 && rsp.candidate){  
            //             console.log("got a candidate");
            //             if (!this.pc.remoteDescription) {
            //                 this.queuedCandidates.push(candidate);
            //                 return;
            //             }
            //             this.pc.addIceCandidate(candidate);               
            //         }
            //         }).catch((e)=>{ 
            //             console.log('error sending query')
            //             console.log(e)
            //         })

            //     }catch(error){
            //         console.log('error setting ice candidate')
            //         console.log(error)
            //     }
            // }else{
            //     console.log("onicecandidate empty")
            // }
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