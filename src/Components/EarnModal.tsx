import React, { useState, useEffect } from 'react';
import ReactPaginate from 'react-paginate';
import arrowback from '../images/arrow_back.png';
import menu from '../images/menu.png';
import axios from 'axios';


interface EarnModalProps {
  userId: string;
  points: number;
  onClose: () => void;
}

const itemsPerPage = 3;

interface CardProps {
    image: string;
    name: string;
    cost: number;
    gainpersecond : number;
    description: string;
    status: string;
    id: number;
    userId: string; 
    points: number;
    onBonusActivated: () => void; // Callback para recarregar os bônus após ativação bem-sucedida
  }
  
  const Card: React.FC<CardProps> = ({ image, name, cost, description, status, id, userId, gainpersecond,  onBonusActivated , points }) => {
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
  
    const handleActivateBonus = (bonusId: number) => {
      const apiUrl = `https://tictacticcat.fun/backend/bonuses.php`;
      const data = {
        userId: userId,
        bonusId: bonusId,
        cost: cost
      };
  
      axios.post(apiUrl, data)
        .then(response => {
          console.log('Bonus ativado com sucesso:', response.data);
          setShowSuccessModal(true);
          onBonusActivated(); // Recarrega os bônus após ativação bem-sucedida
        })
        .catch(error => {
          console.error('Erro ao ativar o bônus:', error);
          setShowErrorModal(true);
        });
    };
  
    return (
      <div className="border rounded-lg p-4 m-2 shadow-md">
        <img src={image} alt={name} className="w-16 h-16 mx-auto" />
        <h3 className="text-lg font-bold mt-2">{name}</h3>
        <p className="text-sm text-gray-600">Cost: {cost}</p>
        <p className="text-sm text-gray-600">Gain/Secord: {gainpersecond}</p>
        <p className="text-sm text-gray-600">{description}</p>
  
        {status === 'disponivel' && points >= cost && (
          <button
            className="bg-blue-500 w-full hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-2"
            onClick={() => handleActivateBonus(id)}
          >
            Ativar Bônus
          </button>
        )}
        {status === 'usado' && (
          <button className="bg-gray-500 w-full hover:bg-gray-500 text-white font-bold py-2 px-4 rounded mt-2">
            Usado
          </button>
        )}
  
        {/* Modal de Sucesso */}
        {showSuccessModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <p className="text-lg font-bold text-green-600">Bônus ativado com sucesso!</p>
              <button className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => setShowSuccessModal(false)}>
                Fechar
              </button>
            </div>
          </div>
        )}
  
        {/* Modal de Erro */}
        {showErrorModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <p className="text-lg font-bold text-red-600">Erro ao ativar o bônus. Tente novamente mais tarde.</p>
              <button className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => setShowErrorModal(false)}>
                Fechar
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };
  

  const EarnModal: React.FC<EarnModalProps> = ({ userId, onClose, points }) => {
    const [currentPage, setCurrentPage] = useState(0);
    const [cardsData, setCardsData] = useState<CardProps[]>([]);
  
    useEffect(() => {
      const apiUrl = `https://tictacticcat.fun/backend/bonuses.php?userId=${userId}`;
  
      axios.get(apiUrl)
        .then(response => {
          if (Array.isArray(response.data['bonuses'])) {
            setCardsData(response.data['bonuses']);
          } else {
            console.error('Expected an array from API, received:', response.data['bonuses']);
          }
        })
        .catch(error => {
          console.error('Error fetching data:', error);
          // Handle error state if needed
        });
    }, [userId]);
  
    const handlePageClick = (data: { selected: number }) => {
      setCurrentPage(data.selected);
    };
  
    const pageCount = Math.ceil(cardsData.length / itemsPerPage);
    const offset = currentPage * itemsPerPage;
    const currentItems = cardsData.slice(offset, offset + itemsPerPage);
  
    const reloadBonuses = () => {
      const apiUrl = `https://tictacticcat.fun/backend/bonuses.php?userId=${userId}`;
  
      axios.get(apiUrl)
        .then(response => {
          if (Array.isArray(response.data['bonuses'])) {
            setCardsData(response.data['bonuses']);
          } else {
            console.error('Expected an array from API, received:', response.data['bonuses']);
          }
        })
        .catch(error => {
          console.error('Error fetching data:', error);
          // Handle error state if needed
        });
    };
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-black p-6 rounded-lg shadow-lg w-full max-w-3xl">
          <div className="flex items-center justify-between mb-4 bg-black">
            <button className="p-2 flex items-center" onClick={onClose}>
              <img src={arrowback} className="w-4 h-4 text-white" alt="Voltar" />
            </button>
            <h2 className="text-sm font-bold text-white">Tap-Telegram</h2>
            <button className="p-2">
              <img src={menu} className="w-6 h-6 text-white" alt="Menu" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {currentItems.map((card, index) => (
              <Card
                key={index}
                points={points}
                image={card.image}
                name={card.name}
                cost={card.cost}
                status={card.status}
                id={card.id}
                gainpersecond = {card.gainpersecond}
                description={card.description}
                userId={userId} // Passando userId para o Card
                onBonusActivated={reloadBonuses} // Passando a função de recarregar os bônus
              />
            ))}
          </div>
          <ReactPaginate
            previousLabel={'← Anterior'}
            nextLabel={'Próximo →'}
            pageCount={pageCount}
            onPageChange={handlePageClick}
            containerClassName={'flex justify-center mt-4'}
            previousLinkClassName={'mr-2'}
            nextLinkClassName={'ml-2'}
            disabledClassName={'opacity-50 cursor-not-allowed'}
            activeClassName={'font-bold'}
          />
        </div>
      </div>
    );
  };
  
export default EarnModal;
