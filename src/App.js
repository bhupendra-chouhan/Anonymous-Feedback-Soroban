import './App.css';
import Header from './components/Header';
import { GetFeedback } from './components/GetFeedback';
import { useState, createContext } from 'react';
import { SendFeedback } from './components/SendFeedback';

const pubKeyData = createContext();

function App() {
  const [pubkey, _setPubKey] = useState("");
  
  return (
    <div className="App">
      <Header setPubKey={_setPubKey} />
      <pubKeyData.Provider value={pubkey}>
        <div className="flex gap-10 flex-wrap justify-center">
          <div>
            <SendFeedback />
          </div>
          <div>
            <GetFeedback />
          </div>
        </div>
      </pubKeyData.Provider>
    </div>
  );
}

export default App;
export { pubKeyData };
