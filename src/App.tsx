import { useEffect } from 'react';
import { Background } from './components/Background';
import { Day } from './components/Day';
import { GameUI } from './components/ui/GameUI';
import { Ending } from './components/Ending';
import { AudioControl } from './components/ui/AudioControl';
import { useGameStore } from './store/gameStore';
import { audioManager } from './utils/audio';

function App() {
  const isComplete = useGameStore((state) => state.isComplete);
  const ending = useGameStore((state) => state.ending);
  const currentDay = useGameStore((state) => state.currentDay);

  // Manage BGM based on current act
  useEffect(() => {
    if (currentDay <= 5) {
      audioManager.playBGM('act1', true);
    } else if (currentDay <= 20) {
      audioManager.playBGM('act2', true);
    } else if (currentDay <= 30) {
      audioManager.playBGM('act3', true);
    }
  }, [currentDay]);

  return (
    <div className="w-screen min-h-dvh flex items-center justify-center bg-[#0f0f1e]">
      {/* Full screen container */}
      <div className="relative w-full h-dvh overflow-y-auto overflow-x-hidden crt-screen">
        <Background />
        {!isComplete && <GameUI />}
        {isComplete && ending ? <Ending ending={ending} /> : <Day />}
        <AudioControl />

        {/* CRT Scanlines */}
        <div className="crt-scanlines"></div>
      </div>
    </div>
  );
}

export default App;
