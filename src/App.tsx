import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import './index.css';
import Arrow from './icons/Arrow';
import { bear, coin, highVoltage, notcoin, rocket, trophy } from './images';

import FrensModal from './Components/FrensModal';
import EarnModal from './Components/EarnModal';
import ChallengeModal from './Components/ChallengeModal';
import BoosterModal from './Components/BoosterModal';

interface Click {
  id: number;
  x: number;
  y: number;
}

interface BonusData {
  userId: number;
  pointsGained: number;
  elapsedTime: string;
}

const App: React.FC = () => {
  const location = useLocation();
  const [userId, setUserId] = useState<string>('');
  const [inviteCode, setInviteCode] = useState<string>('');
  const [maxEnergy, setMaxEnergy] = useState<number>(0);

  const [points, setPoints] = useState<number>(0);
  const [energy, setEnergy] = useState<number>(0);
  const [energyLoaded, setEnergyLoaded] = useState<boolean>(false);
  const [clicks, setClicks] = useState<Click[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showEarnModal, setShowEarnModal] = useState<boolean>(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [bonusData, setBonusData] = useState<BonusData | null>(null);
  const [showModalBonus, setShowModalBonus] = useState(false);
  const [showModalChallenge, setShowModalChallenge] = useState(false);
  const [showModalBooster, setShowModalBooster] = useState(false);
  const [pointsToAdd, setPointsToAdd] = useState<number>(0);
  const [cooldown, setCooldown] = useState<number>(0);
  const energyToReduce = 12;

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const userIdParam = searchParams.get('userId');
    const inviteCodeParam = searchParams.get('invite');
    if (userIdParam) {
      setUserId(userIdParam);
      console.log(`userId set to: ${userIdParam}`);
    }
    if (inviteCodeParam) {
      setInviteCode(inviteCodeParam);
      console.log("Codigo de Convite: " + inviteCodeParam);
    }
  }, [location.search]);

  const openModal = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    fetchPoints();
    setShowModal(false);
  };

  const openModalBooster = () => {
    setShowModalBooster(true);
  };

  const closeModalBooster = () => {
    fetchPoints();
    setShowModalBooster(false);
  };

  const openModalChallenge = () => {
    setShowModalChallenge(true);
  };

  const closeModalChallenge = () => {
    fetchPoints();
    setShowModalChallenge(false);
  };

  const openEarnModal = () => {
    setShowEarnModal(true);
  };

  const closeEarnModal = () => {
    fetchPoints();
    setShowEarnModal(false);
  };

  const fetchPoints = async () => {
    try {
      if (userId) {
        console.log('Fetching points for userId:', userId);
        const response = await axios.get<{ points: number, points_factor: number, energy: number, max_energy: number, cooldown: number }>(`https://tictacticcat.fun/backend/index.php?userId=${userId}`);
        
        setPoints(response.data.points);
        setPointsToAdd(response.data.points_factor);
        setEnergy(response.data.energy);
        setEnergyLoaded(true);
        setMaxEnergy(response.data.max_energy);
        setCooldown(response.data.cooldown);
      } else {
        console.log('userId not defined for fetchPoints');
      }
    } catch (error) {
      console.error('Error fetching points:', error);
    }
  };

  const fetchReference = async () => {
    try {
      if (userId && inviteCode) {
        console.log("INVITE = " + inviteCode);
        const response = await axios.post('https://tictacticcat.fun/backend/points_invite_code.php', {
          userId: userId,
          invite: inviteCode
        });

        if (response.data.message) {
          console.log('Success: ' + response.data.message);
        } else {
          console.error('Failed to reference:', response.data.error);
          setErrorMessage(response.data.error);
          setErrorModalVisible(true);
        }
      } else {
        console.log('userId or inviteCode not defined for fetchReference');
      }
    } catch (error) {
      console.error('Error referencing invite code:', error);
    }
  };

  const fetchBonus = async () => {
    try {
      if (userId) {
        console.log('Fetching bonus data for userId:', userId);
        const response = await axios.get<BonusData>(`https://tictacticcat.fun/backend/service_add_points_bonus.php?userId=${userId}`);
        console.log(`DATA: ${JSON.stringify(response.data)}`);
  
        if ('userId' in response.data && 'pointsGained' in response.data && 'elapsedTime' in response.data) {
          fetchPoints();
          setBonusData(response.data as BonusData);
          setShowModalBonus(true);
          console.log("MODAL BONUS : " + showModalBonus);
        } else {
          console.log("Erro");
          console.log(response.data);
        }
      } else {
        console.log('userId not defined for fetchBonus');
      }
    } catch (error) {
      console.error('Error fetching bonus data:', error);
    }
  };

  const closeModalBonus = () => {
    fetchPoints();
    setShowModalBonus(false);
  };

  const closeModalError = () => {
    setErrorModalVisible(false);
  };

  useEffect(() => {
    setTimeout(() => {
      if (userId) {
        fetchPoints();
        fetchBonus();
        fetchReference();
      } else {
        console.log('userId not defined for useEffect');
      }
    }, 2000);
  }, [userId, inviteCode]);

  useEffect(() => {
    const savePoints = async () => {
      try {
        if (userId && points > 0) {
          await axios.post('https://tictacticcat.fun/backend/index.php', { userId, points });
        }
      } catch (error) {
        console.error('Error saving points:', error);
      }
    };

    savePoints();
  }, [points, userId]);

  const handleClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (energy - energyToReduce < 0) {
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setPoints(prevPoints => prevPoints + pointsToAdd);
    setEnergy(prevEnergy => Math.max(prevEnergy - energyToReduce, 0));
    setClicks(prevClicks => [...prevClicks, { id: Date.now(), x, y }]);
  };

  const handleAnimationEnd = (id: number) => {
    setClicks(prevClicks => prevClicks.filter(click => click.id !== id));
  };

  useEffect(() => {
    if (energyLoaded && cooldown > 0) {
      const interval = setInterval(() => {
        setEnergy(prevEnergy => Math.min(prevEnergy + 1, maxEnergy));
      }, (cooldown * 1000));

      return () => clearInterval(interval);
    }
  }, [energyLoaded, maxEnergy, cooldown]);

  useEffect(() => {
    const saveEnergy = async () => {
      try {
        if (userId && energy > 0) {
          await axios.post('https://tictacticcat.fun/backend/save_energy.php', { userId, energy });
        }
      } catch (error) {
        console.error('Error saving energy:', error);
      }
    };

    if (energyLoaded) {
      saveEnergy();
    }
  }, [energy, userId, energyLoaded]);

  return (
    <div className="bg-gradient-main min-h-screen px-4 flex flex-col items-center text-white font-medium">
      <div className="absolute inset-0 h-1/2 bg-gradient-overlay z-0"></div>
      <div className="absolute inset-0 flex items-center justify-center z-0">
        <div className="radial-gradient-overlay"></div>
      </div>

      <div className="w-full z-10 min-h-screen flex flex-col items-center text-white">
        <div className="fixed top-0 left-0 w-full px-4 pt-8 z-10 flex flex-col items-center text-white">
          <div className="w-full cursor-pointer">
            <div className="bg-[#1f1f1f] text-center py-2 rounded-xl">
              <p className="text-lg">Join squad <Arrow size={18} className="ml-0 mb-1 inline-block" /></p>
            </div>
          </div>
          <div className="mt-12 text-5xl font-bold flex items-center">
            <img src={coin} width={44} height={44} alt="coin" />
            <span className="ml-2">{points.toLocaleString()}</span>
          </div>
          <div className="text-base mt-2 flex items-center">
            <img src={trophy} width={24} height={24} alt="trophy" />
            <span className="ml-1">Gold <Arrow size={18} className="ml-0 mb-1 inline-block" /></span>
          </div>
        </div>

        <div className="fixed bottom-0 left-0 w-full px-4 pb-4 z-10">
          <div className="w-full flex justify-between gap-2">
            <div className="w-1/3 flex items-center justify-start max-w-32">
              <div className="flex items-center justify-center">
                <img src={highVoltage} width={44} height={44} alt="High Voltage" />
                <div className="ml-2 text-left">
                  <span className="text-white text-2xl font-bold block">{energy}</span>
                  <span className="text-white text-large opacity-75">/ {maxEnergy}</span>
                </div>
              </div>
            </div>
            <div className="flex-grow flex items-center max-w-60 text-sm">
              <div className="w-full bg-[#fad258] py-4 rounded-2xl flex justify-around">
                <button className="flex flex-col items-center gap-1" onClick={openModal}>
                  <img src={bear} width={24} height={24} alt="bear" />
                  <span>Frens</span>
                </button>
                <div className="h-[48px] w-[2px] bg-[#fddb6d]"></div>
                <button className="flex flex-col items-center gap-1" onClick={openEarnModal}>
                  <img src={coin} width={24} height={24} alt="coin" />
                  <span>Earn</span>
                </button>
                <div className="h-[48px] w-[2px] bg-[#fddb6d]"></div>
                <button className="flex flex-col items-center gap-1"  onClick={openModalBooster}>
                  <img src={rocket} width={24} height={24} alt="rocket" />
                  <span>Boosts</span>
                </button>
                <button className="flex flex-col items-center gap-1" onClick={openModalChallenge} >
                  <img src={rocket} width={24} height={24} alt="rocket" />
                  <span>Challenges</span>
                </button>
              </div>
            </div>
          </div>
          <div className="w-full bg-[#f9c035] rounded-full mt-4">
            <div className="bg-gradient-to-r from-[#f3c45a] to-[#fffad0] h-4 rounded-full" style={{ width: `${(energy / maxEnergy) * 100}%` }}></div>
          </div>
        </div>

        <div className="flex-grow flex items-center justify-center">
          <div className="relative mt-4" onClick={handleClick}>
            <img src={notcoin} width={256} height={256} alt="notcoin" />
            {clicks.map(click => (
              <div
                key={click.id}
                className="absolute text-5xl font-bold opacity-0"
                style={{
                  top: `${click.y - 42}px`,
                  left: `${click.x - 28}px`,
                  animation: `float 1s ease-out`
                }}
                onAnimationEnd={() => handleAnimationEnd(click.id)}
              >
                {pointsToAdd}
              </div>
            ))}
          </div>
        </div>
      </div>

      {showModal && <FrensModal userId={userId} onClose={closeModal} />}

      {showEarnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="bg-black bg-opacity-70 text-white px-6 py-4 rounded-lg max-w-md">
            <EarnModal userId={userId} points={5000} onClose={closeEarnModal} />
          </div>
        </div>
      )}

  {showModalBooster && <BoosterModal userId={userId} onClose={closeModalBooster} />}  

      {showModalChallenge && <ChallengeModal userId={userId} onClose={closeModalChallenge} />}

      {errorModalVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="bg-red-500 bg-opacity-90 text-white px-6 py-4 rounded-lg max-w-md">
            <h2 className="text-2xl font-semibold mb-4">Erro</h2>
            <p className="text-lg">{errorMessage}</p>
            <button className="mt-4 bg-white text-red-500 px-4 py-2 rounded-md" onClick={closeModalError}>Fechar</button>
          </div>
        </div>
      )}

      {bonusData && showModalBonus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="bg-green-900 text-white px-6 py-4 rounded-lg max-w-md">
            <h2 className="text-2xl font-semibold mb-4">MODAL BONUS</h2>
            <p className="text-lg">Você ganhou {bonusData.pointsGained / 1000}k de pontos nas últimas {bonusData.elapsedTime}</p>
            <button className="mt-4 bg-white text-red-500 px-4 py-2 rounded-md" onClick={closeModalBonus}>Fechar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
