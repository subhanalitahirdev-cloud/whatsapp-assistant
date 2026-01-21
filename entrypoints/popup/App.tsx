import { useState } from 'react';
import reactLogo from '@/assets/react.svg';
import wxtLogo from '/wxt.svg';
import './App.css';
import { AIAssistantInterface } from '../../src/components/ui/ai-assistant-interface';

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
    <div className='w-[50rem]'>
      <AIAssistantInterface/>
    </div>
    </>
  );
}

export default App;
