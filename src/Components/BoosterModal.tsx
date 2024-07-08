import React, { useEffect, useState } from 'react';
import axios from 'axios';
import arrowback from '../images/arrow_back.png';
import menu from '../images/menu.png';

interface BoosterModalProps {
  userId: string;
  onClose: () => void;
}

interface BoosterLevels {
  booster_1: number;
  booster_2: number;
  booster_3: number;
}

const BoosterModal: React.FC<BoosterModalProps> = ({ userId, onClose }) => {
  const [boosterLevels, setBoosterLevels] = useState<BoosterLevels>({
    booster_1: 0,
    booster_2: 0,
    booster_3: 0
  });

  const [points, setPoints] = useState<number>(0);

  const fetchBoosters = async () => {
    try {
      const response = await axios.get<{ booster_1: number, booster_2: number, booster_3: number, points: number }>(`https://tictacticcat.fun/backend/booster.php?userId=${userId}`);
      setBoosterLevels({
        booster_1: response.data.booster_1,
        booster_2: response.data.booster_2,
        booster_3: response.data.booster_3
      });
      setPoints(response.data.points);
    } catch (error) {
      console.error('Error fetching boosters:', error);
    }
  };

  useEffect(() => {
    fetchBoosters();
  }, [userId]);

  const handleUpgrade = async (booster: keyof BoosterLevels, nextLevel: number, cost: number) => {
    if (points < cost) {
      alert('Pontos insuficientes para o upgrade');
      return;
    }
  
    let factor = 0;
    switch (booster) {
      case 'booster_1':
        factor = calculatePointsIncrease(nextLevel);
        break;
      case 'booster_2':
        factor = calculateMaxEnergyIncrease(nextLevel);
        break;
      case 'booster_3':
        factor = calculateCooldownTime(nextLevel);
        break;
      default:
        console.error('Invalid booster type:', booster);
        return;
    }
  
    try {
      const response = await axios.post(`https://tictacticcat.fun/backend/booster.php`, {
        userId: userId,
        booster: booster,
        level: nextLevel,
        cost: cost,
        factor: factor
      });
      if (response.data.success) {
        fetchBoosters();
      } else {
        console.error('Upgrade failed:', response.data.message);
      }
    } catch (error) {
      console.error('Error upgrading booster:', error);
    }
  };
  


  const calculatePointsIncrease = (level: number): number => {
    switch (level) {
      case 1:
        return 1; // +1 ponto por click
      case 2:
        return 5; // +5 pontos por click
      case 3:
        return 20; // +20 pontos por click
      default:
        return 0;
    }
  };
  
  const calculateMaxEnergyIncrease = (level: number): number => {
    switch (level) {
      case 1:
        return 3000; // +3000 energia máxima
      case 2:
        return 5000; // +5000 energia máxima
      case 3:
        return 10000; // +10000 energia máxima
      default:
        return 0;
    }
  };
  
  const calculateCooldownTime = (level: number): number => {
    switch (level) {
      case 1:
        return 10; // Diminui a velocidade de ganho de energia para 10 segundos
      case 2:
        return 5; // Diminui a velocidade de ganho de energia para 5 segundos
      case 3:
        return 2; // Diminui a velocidade de ganho de energia para 2 segundos
      default:
        return 0;
    }
  };
  

  const getBoosterDescription = (boosterId: keyof BoosterLevels) => {
    switch (boosterId) {
      case 'booster_1':
        return [
          '+1 ponto por click',
          '+5 pontos por click',
          '+20 pontos por click'
        ];
      case 'booster_2':
        return [
          '+3000 energia máxima',
          '+5000 energia máxima',
          '+10000 energia máxima'
        ];
      case 'booster_3':
        return [
          'Diminui a velocidade de ganho de energia para 10 segundos',
          'Diminui a velocidade de ganho de energia para 5 segundos',
          'Diminui a velocidade de ganho de energia para 2 segundos'
        ];
      default:
        return [];
    }
  };

  const getUpgradeCost = (boosterId: keyof BoosterLevels) => {
    switch (boosterId) {
      case 'booster_1':
        return [100, 500, 2000];
      case 'booster_2':
        return [300, 800, 1500];
      case 'booster_3':
        return [200, 700, 1200];
      default:
        return [];
    }
  };

  const renderBooster = (boosterId: keyof BoosterLevels) => {
    const level = boosterLevels[boosterId];
    const descriptions = getBoosterDescription(boosterId);
    const costs = getUpgradeCost(boosterId);
    const nextCost = costs[level];
    const canUpgrade = level < descriptions.length - 1 && points >= nextCost;
    const nextLevel = level + 1;

    return (
      <div className="mb-4" key={boosterId}>
        <h3 className="text-lg font-bold">{boosterId.replace('_', ' ').toUpperCase()}</h3>
        <p className="text-sm">{descriptions[level]}</p>
        {canUpgrade ? (
          <button
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
            onClick={() => handleUpgrade(boosterId, nextLevel, nextCost)}
          >
            Upgrade (Custo: {nextCost} pontos)
          </button>
        ) : (
          <p className="mt-2 text-red-500">
            {level < descriptions.length - 1 ? `Custo do próximo upgrade: ${nextCost} pontos` : 'Máximo nível alcançado'}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black opacity-80"></div>
      <div className="bg-black p-4 rounded-lg z-50 relative max-h-full w-80 overflow-auto">
        {/* Cabeçalho do Modal */}
        <div className="flex items-center justify-between mb-4 bg-black">
          {/* Botão Voltar */}
          <button className="p-2 flex items-center" onClick={onClose}>
            <img src={arrowback} className="w-4 h-4 text-white" alt="Voltar" />
          </button>
          {/* Nome do Aplicativo */}
          <h2 className="text-sm font-bold text-white">Tap-Telegram</h2>
          {/* Ícone de Menu Hambúrguer */}
          <button className="p-2">
            <img src={menu} className="w-6 h-6 text-white" alt="Menu" />
          </button>
        </div>
        {/* Conteúdo do Modal */}
        <div className="text-white">
          {renderBooster('booster_1')}
          {renderBooster('booster_2')}
          {renderBooster('booster_3')}
        </div>
      </div>
    </div>
  );
};

export default BoosterModal;
