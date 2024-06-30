import React, { useEffect, useState } from 'react';
import axios from 'axios';
import arrowback from '../images/arrow_back.png';
import menu from '../images/menu.png';
import copy from '../images/copiar.png';

interface Invite {
  invite_code: string;
  status: string;
}

interface FrensModalProps {
  userId: string;
  onClose: () => void;
}

const FrensModal: React.FC<FrensModalProps> = ({ userId, onClose }) => {
  const [friendsCount, setFriendsCount] = useState<number>(0);
  const [invites, setInvites] = useState<Invite[]>([]);

  useEffect(() => {
    const fetchFriendsCount = async () => {
      try {
        const response = await axios.get<{ friends: number }>(`https://tictacticcat.fun/backend/friends.php?userId=${userId}`);
        setFriendsCount(response.data.friends);
      } catch (error) {
        console.error('Error fetching friends count:', error);
      }
    };

    fetchFriendsCount();
  }, [userId]);

  useEffect(() => {
    const fetchInvites = async () => {
      try {
        const response = await axios.get<{ invites: Invite[] }>(`https://tictacticcat.fun/backend/invites.php?userId=${userId}`);
        setInvites(response.data.invites);
      } catch (error) {
        console.error('Error fetching invites:', error);
      }
    };

    fetchInvites();
    
  }, [userId]);



  const handleCopyToClipboardYour = (inviteCode: string) => {
    const inviteUrl = `https://t.me/tatatatapbot?start=${inviteCode}`;

    const inviteText = `Seu código de convite é: ${inviteUrl}`;

    navigator.clipboard.writeText(inviteText).then(() => {
      alert('Texto copiado para a área de transferência!');
    }).catch((err) => {
      console.error('Erro ao copiar texto para a área de transferência: ', err);
    });


  }

  const handleCopyToClipboard = () => {
    const inviteCode = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const inviteUrl = `https://t.me/tatatatapbot?start=${inviteCode}`;
    const inviteText = `Seu código de convite é: ${inviteUrl}`;

    axios.post('https://tictacticcat.fun/backend/invites.php', {
      userId: userId,
      invite_code: inviteCode
    })
    .then(response => {
      if (response.data.success) {
        navigator.clipboard.writeText(inviteText).then(() => {
          alert('Texto copiado para a área de transferência!');
        }).catch((err) => {
          console.error('Erro ao copiar texto para a área de transferência: ', err);
        });
      } else {
        console.error('Failed to insert invite code:', response.data.error);
      }
    })
    .catch((err) => console.error('Failed to send invite code:', err));
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
          <h2 className="text-2xl font-bold text-white text-center">{friendsCount} Friends</h2>
          <h2 className="text-sm text-white text-center">Invite a friend and get bonuses</h2>
          <div className=" mt-4">
            <button className="bg-white text-black font-bold py-2 px-12 w-full rounded-2xl mr-4 mt-4" onClick={handleCopyToClipboard}>
              Invite a Friend
            </button>
           
          </div>
          {/* Lista de convites */}
          <div className="mt-4">
            <h2 className="text-sm font-bold text-white text-center">Your Invites</h2>
            {invites.length === 0 ? (
              <p className="text-center text-white">No invites available</p>
            ) : (
              invites.map((invite, index) => (
                <div key={index} className="bg-gray-800 rounded-lg p-4 my-2">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-white font-bold">Invite Code: {invite.invite_code}</p>
                      <p className="text-white">Status: {invite.status}</p>
                    </div>
                    {invite.status === 'Disponivel' && (
                      <button className="bg-white text-black rounded-2xl py-1 px-2" onClick={() => handleCopyToClipboardYour(invite.invite_code)}>
                        <img src={copy} className="w-4 h-4 mr-2" alt="Copy" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FrensModal;
