import React, {Component} from 'react';
import {Terminal} from 'xterm';
import {FitAddon} from 'xterm-addon-fit';
import './App.css';
import './xterm.css';

interface IProps {

}

interface IState {
}

class App extends Component<IProps, IState> {

  websocket: WebSocket;
  terminal: Terminal;
  fitAddon: FitAddon;

  constructor(props) {
    super(props);
    this.state = {
      submit: true,
    }
  }

  componentDidMount() {
    this.resize()
    window.addEventListener('resize', this.resize);
    this._init();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resize);
    this.websocket.close();
    this.fitAddon.dispose();
    this.terminal.dispose();
  }

  resize() {
    document.getElementById('terminal').style.height = window.innerHeight + 'px';
    document.getElementById('terminal').style.width = window.innerWidth + 'px';
  }

  _init() {
    this.initWS({usrID: this.state.value, proID: 1, exec: "start1"})
      .then(data => {
        this._initTerminal();
        this.websocket = data.websocket;
        const msg = data.event.data;
        if (msg) {
          this.terminal.write(msg);
        }
        this.websocket.addEventListener("message", (event) => {
          console.log('on ws received msg', event);
          const msg = event.data;
          if (msg) {
            this.terminal.write(msg);
          }
        })
      })
  }

  //初始化websocket连接
  initWS(param: { usrID: string, proID: number, exec: string }): Promise<{ websocket: WebSocket, event: MessageEvent }> {
    return fetch(
      'http://192.168.130.134:80/open', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(param)
      })
      .then(res => res.json())
      .then(data => new Promise((resolve, reject) => {
        console.log('response', data);
        const websocket = new WebSocket("ws://192.168.130.134:80/websocket")
        websocket.onopen = () => {
          console.log('on ws open');
          websocket.send(data['token']);
        }
        websocket.onclose = (event) => {
          reject(event);
        }
        websocket.onmessage = (event) => {
          websocket.onopen = null;
          websocket.onclose = null;
          websocket.onmessage = null;
          resolve({websocket, event});
        }
      }))
      .catch(error => {
        console.log("websocket init", error);
        throw error;
      })
  }

  _initTerminal() {
    this.terminal = new Terminal();
    this.fitAddon = new FitAddon();
    this.terminal.loadAddon(this.fitAddon)
    this.terminal.open(document.getElementById('terminal'));
    this.terminal.onKey(this._onKeyboardListener)
    this.fitAddon.fit();
  }

  _onKeyboardListener = (event) => {
    if (!this.websocket) {
      return;
    }
    this.websocket.send(event.key);
  }

  handleChange(e){
    this.setState({
      value: e.target.value
    })
    console.log("ssssss",this.state.value)
  }

  submit(){
    this._init();
    this.setState({
      submit:false,
    })
  }

  exit(){
    return fetch(
      'http://192.168.130.134:80/exit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({usrID:this.state.value,proID:1,exec: "exit2"})
      })
  }

  render() {
    return (
      <div>

        {
          this.state.submit &&
          <div style={{
            zIndex: 30,
            position: 'absolute',
            backgroundColor: 'rgba(0,0,0,0.6)',
            height: window.innerHeight,
            width: window.innerWidth,
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{
              backgroundColor: 'white',
              display: 'flex',
              flexDirection: 'column',
              alignSelf: 'center',
              marginTop: (window.innerHeight - 500) / 2
            }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 400,
                height: 200,
                backgroundColor: 'rgb(177,184,198)',
                flexDirection:'column'
              }}>
                <div style={{flex:1,padding:20}}>请输入登录信息</div>
                <div style={{
                }}>
                  <input style={{}} type = "text" onChange={this.handleChange.bind(this)} />
                </div>
                <div style={{height:30}}></div>
                <button style={{
                  cursor: 'pointer',
                  backgroundColor: 'rgb(106,139,198)',
                  borderRadius: 4,
                  border: 'none',
                  color: 'white',
                  padding: 4,
                  fontSize: 12,
                  width: 64
                }} onClick={this.submit.bind(this)}>提交
                </button>
                <div style={{height:50}}></div>
              </div>
            </div>
          </div>
        }

        {/*最上面的栏目*/}
        <div style={{
          height: 50,
          width: '100%',
          backgroundColor: 'rgb(106,139,198)',
          display: 'flex',
          flexDirection: 'row'
        }}>
          <div
            style={{color: 'white', fontSize: 25, marginTop: 8, marginBottom: 8, marginLeft: 40}}>张瑞微信: zr478508633
          </div>
          <div style={{flex: 1}}/>
          <button style={{
            cursor: 'pointer',
            marginRight: 40,
            marginTop: 8,
            marginBottom: 8,
            width: 64,
            border: 'none',
            borderRadius: 4,
            color: 'rgb(106,139,198)'
          }} onClick={this.exit.bind(this)}>退 出
          </button>
        </div>

        <div id="terminal" />
      </div>
    );
  }
}

export default App;

