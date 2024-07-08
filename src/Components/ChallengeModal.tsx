import React, { useEffect, useState } from 'react';
import axios from 'axios';
import arrowback from '../images/arrow_back.png';
import menu from '../images/menu.png';

interface ChallengeModalProps {
  userId: string;
  onClose: () => void;
}

interface Challenge {
  id: number;
  task: string;
  link_external: string;
  points_received: number;
  completed_in: string | null;
  colected: number | null;
}

const ChallengeModal: React.FC<ChallengeModalProps> = ({ userId, onClose }) => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);

  const fetchChallenges = async () => {
    try {
      const response = await axios.get<{ challenges: Challenge[] }>(`https://tictacticcat.fun/backend/challenges.php?userId=${userId}`);
      setChallenges(response.data.challenges);
    } catch (error) {
      console.error('Error fetching invites:', error);
    }
  };

  useEffect(() => {
  fetchChallenges();
  }, [userId]);

  const handleChallengeClick = (challengeId: number, points_received : number ) => {

    axios.post('https://tictacticcat.fun/backend/challenges.php', {
        userId: userId,
        challenge_id: challengeId,
        action: "colect",
        points_add: points_received
      })
      .then(async response => {
        if (response.data.success) {
            console.log("Missão completada com sucesso");

            await fetchChallenges();
        }});
    
  };


  const handleChallengeClickLink = (link: string | null, challengeId: number) => {
    if (link) {
      window.open(link, '_blank');
      setTimeout(() => {
        handleDelayedAction(challengeId);
      }, 2000);
    }
  };

  const handleDelayedAction = (challengeId: number) => {
    
    console.log('Ação executada após 2 segundos');

    axios.post('https://tictacticcat.fun/backend/challenges.php', {
        userId: userId,
        challenge_id: challengeId,
        action: "complete"
      })
      .then(async response => {
        if (response.data.success) {
            console.log("Missão completada com sucesso");

            await fetchChallenges();
        }});
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
          {/* Lista de Desafios */}
          <ul className="divide-y divide-gray-600">
            {challenges.map((challenge) => (
              <li key={challenge.id} className="py-2">
                <div className="flex items-center justify-between">
                  {/* Nome da Tarefa */}
                  {challenge.colected === null || challenge.completed_in === null ? (
                    <a
                        href={challenge.link_external}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => handleChallengeClickLink(challenge.link_external, challenge.id)} >
                            <span className="text-sm underline cursor-pointer">{challenge.task}</span>
                    </a>
                  ) : (
                    <span className="text-sm">{challenge.task}</span>
                  )}
                  {/* Condição para Botão "Coletar" ou Imagem de Confirmado */}
                  {challenge.colected === 0 && challenge.completed_in !== null ? (
                    <button className="bg-blue-500 text-white py-1 px-2 rounded-lg" onClick={() => handleChallengeClick(challenge.id, challenge.points_received)}>
                      Coletar
                    </button>
                  ) : challenge.colected === 1 && challenge.completed_in !== null ? (
                   <span>Completo</span>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ChallengeModal;
