export default function Home() {
  return (
    <main>
      <div className="title-section">
        <h1>Message Cross Chain Demo</h1>
        <button>Connect Wallet</button>
      </div>
      <div className="content-section">
        <div className="chain-section">
          <div className="chain-box">
            <h4>Source Chain</h4>
            <select>
              <option value="option1">选项1</option>
              <option value="option2">选项2</option>
              <option value="option3">选项3</option>
            </select>
            <p>GateWay SC: 0x1234...</p>
          </div>
          <div className="chain-arrow">→</div>
          <div className="chain-box">
            <h4>Destination Chain</h4>
            <select>
              <option value="option1">选项1</option>
              <option value="option2">选项2</option>
              <option value="option3">选项3</option>
            </select>
            <p>GateWay SC: 0x1234...</p>
          </div>
        </div>
        <h2>Demo of Message Delivery</h2>
        <div className="message-section">
          <div className="message-box">
            <p>MockApp SC: 0x1234...</p>
            <input placeholder="Message Content in Hex" />
            <button>Send</button>
            <p>MessageId: </p>
          </div>
          <div className="message-arrow">→</div>
          <div className="message-box">
            <p>MockApp SC: 0x1234...</p>
            <input placeholder="MessageId" />
            <button>Read</button>
            <p>Content: </p>
          </div>
        </div>
        <h2>Demo of Custom Token Cross Chain</h2>
        <p>* Auto update every 20 seconds.</p>
        <div className="token-section">
          <div className="token-box">
            <p>Token SC: 0x1234...</p>
            <p>Cross Chain Pool SC: 0x1234...</p>
            <p>Balance: 0 <button>Faucet</button></p>
            <input placeholder="Amount" />
            <button>Send</button>
          </div>
          <div className="token-arrow">→</div>
          <div className="token-box">
            <p>Token SC: 0x1234...</p>
            <p>Cross Chain Pool SC: 0x1234...</p>
            <p>Balance: 0 </p>
          </div>
        </div>
      </div>
    </main>
  )
}
